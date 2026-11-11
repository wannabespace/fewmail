import { SKILLS } from '@fewmail/shared/agent'
import { messages } from '@fewmail/shared/i18n'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'
import { z } from 'zod'

import { agentTools } from './services/agent-tools'
import { userIdForApiKey } from './services/integrations'
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
        annotations: ANNOTATIONS[tool.access],
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

export const handleMcp = async (request: Request) => {
  const key = request.headers.get('authorization')?.replace(/^Bearer\s+/iu, '')
  const userId = key ? await userIdForApiKey(key) : null
  if (!userId) {
    return Response.json(
      {
        error:
          'Create an API key in Fewmail → Settings → Integrations and send it as a Bearer token.',
      },
      { status: 401 }
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
