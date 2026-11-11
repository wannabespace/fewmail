import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'

import { agentTools } from './services/agent-tools'
import { userIdForApiKey } from './services/integrations'
import { getPlanInfo, hasAgent } from './services/plan'

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
