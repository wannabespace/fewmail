import { createResourceServerChallenge } from '@better-auth/oauth-provider'
import { oauthProviderResourceClient } from '@better-auth/oauth-provider/resource-client'
import { SKILLS } from '@fewmail/shared/agent'
import type { ConsentToolName } from '@fewmail/shared/agent'
import { messages } from '@fewmail/shared/i18n'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'
import { APIError, isAPIError } from 'better-auth/api'
import { createAuthClient } from 'better-auth/client'
import { z } from 'zod'

import { deliverChatLink } from './chat-link'
import { auth, AUTH_ISSUER, MCP_RESOURCE } from './lib/auth'
import { agentTools, toolAccess } from './services/agent-tools'
import { requestConsent } from './services/chat'
import { isAppConnected } from './services/integrations'
import { getPlanInfo, hasAgent } from './services/plan'
import { getSettings } from './services/settings'
import { skillPrompt } from './services/skills'

const json = (value: unknown) => ({
  content: [{ text: JSON.stringify(value, null, 2), type: 'text' as const }],
})

/** Directories (Claude, ChatGPT) list a tool only with both hints set. */
const ANNOTATIONS = {
  consent: { destructiveHint: true, readOnlyHint: false },
  read: { destructiveHint: false, readOnlyHint: true },
  write: { destructiveHint: false, readOnlyHint: false },
}

/** Free reads mail without the LLM; `get_person` writes a note with it, so it stays with the agent. */
const LLM_READS = new Set(['get_person'])

const titleOf = (name: string) => {
  const words = name.replaceAll('_', ' ')
  return `${words.charAt(0).toUpperCase()}${words.slice(1)}`
}

/** The client's own approval is not the user's yes: nothing happens until they answer in Fewmail. */
const waitForYes = async (
  userId: string,
  server: McpServer,
  name: ConsentToolName,
  input: unknown
) => {
  const request = await requestConsent(userId, {
    client: server.server.getClientVersion()?.name,
    input: input as Record<string, unknown>,
    name,
  })
  const settings = await getSettings(userId)
  await deliverChatLink(userId, messages[settings?.language ?? 'en'], {
    chatId: request.chatId,
    headline: request.title,
    text: request.question,
  })
  return {
    note: 'Nothing happened yet. The user answers this in Fewmail (Home and a notification); the yes carries it out there. Tell them so, and do not call it again.',
    status: 'waiting_for_approval',
  }
}

const createServer = (userId: string, withAgent: boolean) => {
  const server = new McpServer({
    name: 'fewmail',
    title: 'Fewmail',
    version: '0.1.0',
    websiteUrl: 'https://fewmail.app',
  })
  for (const [name, tool] of Object.entries(agentTools(userId))) {
    const access = toolAccess(name)
    if (!withAgent && (access !== 'read' || LLM_READS.has(name))) {
      continue
    }
    server.registerTool(
      name,
      {
        annotations: ANNOTATIONS[access],
        description: tool.description,
        inputSchema: tool.input,
        title: titleOf(name),
      },
      async (input: unknown) =>
        json(
          access === 'consent'
            ? await waitForYes(userId, server, name as ConsentToolName, input)
            : await tool.run(input as never)
        )
    )
  }
  if (!withAgent) {
    return server
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
  const transport = new WebStandardStreamableHTTPServerTransport({
    enableJsonResponse: true,
    sessionIdGenerator: undefined,
  })
  await createServer(userId, hasAgent(await getPlanInfo(userId))).connect(
    transport
  )
  return transport.handleRequest(request)
}
