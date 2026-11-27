import { createResourceServerChallenge } from '@better-auth/oauth-provider'
import { oauthProviderResourceClient } from '@better-auth/oauth-provider/resource-client'
import { SKILLS } from '@fewmail/shared/agent'
import type { ConsentToolName } from '@fewmail/shared/agent'
import { messages } from '@fewmail/shared/i18n'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'
import { APIError, isAPIError } from 'better-auth/api'
import { createAuthClient } from 'better-auth/client'
import { Result } from 'better-result'
import { z } from 'zod'

import { deliverHomeLink } from './delivery'
import { auth, AUTH_ISSUER, MCP_RESOURCE } from './lib/auth'
import { logError } from './lib/log'
import { capture } from './lib/posthog'
import { UNTRUSTED_MAIL } from './services/agent-run'
import { agentTools, toolAccess } from './services/agent-tools'
import { proposeConsent } from './services/consent-run'
import { findConnectedApp } from './services/integrations'
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

/** Free reads mail without the LLM; `get_person` writes a note with it and promises are the agent's own, so both stay with it. */
const LLM_READS = new Set(['get_person', 'list_promises'])

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
  const settings = await getSettings(userId)
  const t = messages[settings?.language ?? 'en']
  const from = t.agent.mcpAsks(
    server.server.getClientVersion()?.name ?? t.settings.mcp.defaultName
  )
  const { isNew, question } = await proposeConsent(userId, {
    from,
    input: input as Record<string, unknown>,
    name,
  })
  if (isNew) {
    await deliverHomeLink(userId, { headline: from, text: question })
  }
  return {
    note: 'Nothing happened yet. The user answers this in Fewmail (Home and a notification); the yes carries it out there. Tell them so, and do not call it again.',
    status: 'waiting_for_approval',
  }
}

const createServer = (userId: string, app: string, withAgent: boolean) => {
  const server = new McpServer(
    {
      name: 'fewmail',
      title: 'Fewmail',
      version: '0.1.0',
      websiteUrl: 'https://fewmail.app',
    },
    {
      instructions: `${UNTRUSTED_MAIL} Sending, archiving, unsubscribing and every other change to the mail waits for the user's yes in Fewmail.`,
    }
  )
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
      async (input: unknown) => {
        capture(userId, 'mcp_tool_called', { access, tool: name })
        const started = performance.now()
        const result = await Result.tryPromise(async () =>
          toolAccess(name, input) === 'consent'
            ? await waitForYes(userId, server, name as ConsentToolName, input)
            : await tool.run(input as never)
        )
        const call = `mcp ${app} ${name} ${access} user=${userId} ${Math.round(performance.now() - started)}ms`
        if (result.isErr()) {
          logError(call, result.error.cause)
          throw result.error.cause
        }
        console.info(call)
        return json(result.value)
      }
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
  const clientId = String(token.azp)
  const app = token.sub && (await findConnectedApp(token.sub, clientId))
  if (!token.sub || !app) {
    throw new APIError('UNAUTHORIZED', { error: 'invalid_token' })
  }
  return { app: JSON.stringify(app.name ?? clientId), userId: token.sub }
}

export const handleMcp = async (request: Request) => {
  const caller = await verifyCaller(request).catch((error: unknown) => {
    if (!isAPIError(error)) {
      throw error
    }
    return createResourceServerChallenge(error, MCP_RESOURCE)
  })
  if (!caller || !('userId' in caller)) {
    return Response.json(
      { error: 'Connect Fewmail from your MCP client and allow access.' },
      { headers: caller?.headers, status: caller?.statusCode ?? 401 }
    )
  }
  const { app, userId } = caller
  const transport = new WebStandardStreamableHTTPServerTransport({
    enableJsonResponse: true,
    sessionIdGenerator: undefined,
  })
  await createServer(userId, app, hasAgent(await getPlanInfo(userId))).connect(
    transport
  )
  return transport.handleRequest(request)
}
