import { createResourceServerChallenge } from '@better-auth/oauth-provider'
import { oauthProviderResourceClient } from '@better-auth/oauth-provider/resource-client'
import { SKILLS } from '@fewmail/shared/agent'
import { messages } from '@fewmail/shared/i18n'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'
import { APIError, isAPIError } from 'better-auth/api'
import { createAuthClient } from 'better-auth/client'
import { z } from 'zod'

import { auth, AUTH_ISSUER, MCP_RESOURCE } from './lib/auth'
import { agentTools, toolAccess } from './services/agent-tools'
import { isAppConnected } from './services/integrations'
import { getPlanInfo, hasAgent } from './services/plan'
import { skillPrompt } from './services/skills'

const json = (value: unknown) => ({
  content: [{ text: JSON.stringify(value, null, 2), type: 'text' as const }],
})

const ANNOTATIONS = {
  consent: { destructiveHint: true },
  read: { readOnlyHint: true },
  write: undefined,
}

const createServer = (userId: string) => {
  const server = new McpServer({ name: 'fewmail', version: '0.1.0' })
  for (const [name, tool] of Object.entries(agentTools(userId))) {
    server.registerTool(
      name,
      {
        annotations: ANNOTATIONS[toolAccess(name)],
        description: tool.description,
        inputSchema: tool.input,
      },
      async (input: unknown) => json(await tool.run(input as never))
    )
  }
  for (const skill of SKILLS) {
    server.registerPrompt(
      skill,
      {
        argsSchema: { details: z.string().optional() },
        description: messages.en.skills[skill],
      },
      ({ details }) => ({
        messages: [
          {
            content: {
              text: skillPrompt(`/${skill} ${details ?? ''}`) ?? '',
              type: 'text' as const,
            },
            role: 'user' as const,
          },
        ],
      })
    )
  }
  return server
}

const resourceServer = createAuthClient({
  plugins: [oauthProviderResourceClient(auth)],
})

export const mcpResourceMetadata = () =>
  resourceServer.getProtectedResourceMetadata({
    authorization_servers: [AUTH_ISSUER],
    resource: MCP_RESOURCE,
  })

/** Access tokens are JWTs that outlive a disconnect, so the consent is checked on every call. */
const verifyCaller = async (request: Request) => {
  const token = await resourceServer.verifyAccessTokenRequest(request, {
    verifyOptions: {
      audience: MCP_RESOURCE,
      issuer: AUTH_ISSUER,
      requiredClaims: ['azp'],
      typ: 'at+jwt',
    },
  })
  if (!token.sub || !(await isAppConnected(token.sub, String(token.azp)))) {
    throw new APIError('UNAUTHORIZED', { error: 'invalid_token' })
  }
  return token.sub
}

export const handleMcp = async (request: Request) => {
  const userId = await verifyCaller(request).catch((error: unknown) => {
    if (!isAPIError(error)) {
      throw error
    }
    return createResourceServerChallenge(error, MCP_RESOURCE)
  })
  if (typeof userId !== 'string') {
    return Response.json(
      { error: 'Connect Fewmail from your MCP client and allow access.' },
      { headers: userId?.headers, status: userId?.statusCode ?? 401 }
    )
  }
  if (!hasAgent(await getPlanInfo(userId))) {
    return Response.json(
      { error: 'MCP is part of Fewmail Pro. Upgrade in Settings → Plan.' },
      { status: 403 }
    )
  }

  const transport = new WebStandardStreamableHTTPServerTransport({
    enableJsonResponse: true,
    sessionIdGenerator: undefined,
  })
  await createServer(userId).connect(transport)
  return transport.handleRequest(request)
}
