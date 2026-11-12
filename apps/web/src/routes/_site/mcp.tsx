import { CodeBlock } from '@fewmail/ui/components/custom/code-block'
import { CopyIconButton } from '@fewmail/ui/components/custom/copy-button'
import { createFileRoute } from '@tanstack/react-router'

import { Closing, CONTAINER } from '~/components/site'
import { useT } from '~/lib/i18n'

const MCP_URL = `${import.meta.env.API_URL}/mcp`

const CLIENTS = [
  { key: 'claude', name: 'Claude' },
  { key: 'chatgpt', name: 'ChatGPT' },
  {
    code: `claude mcp add --transport http fewmail ${MCP_URL}`,
    key: 'code',
    language: 'bash',
    name: 'Claude Code',
  },
  {
    code: JSON.stringify(
      { mcpServers: { fewmail: { url: MCP_URL } } },
      null,
      2
    ),
    key: 'cursor',
    language: 'json',
    name: 'Cursor',
  },
] as const

/** Where a Claude or ChatGPT directory listing sends people: the URL and how each client takes it. */
const McpPage = () => {
  const t = useT().site.mcpPage

  return (
    <>
      <section className={`${CONTAINER} flex flex-col gap-10 pt-16 sm:pt-24`}>
        <header className="flex flex-col gap-6">
          <h1 className="text-display sm:text-hero font-serif tracking-tight text-balance">
            {t.title}
          </h1>
          <p className="text-brief text-foreground/75 max-w-2xl font-serif text-pretty">
            {t.lead}
          </p>
        </header>
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground font-mono text-sm">
            {MCP_URL}
          </span>
          <CopyIconButton label={t.copy} text={MCP_URL} />
        </div>
        <div className="grid gap-8 sm:grid-cols-2">
          {CLIENTS.map((client) => (
            <section key={client.key} className="flex flex-col gap-3">
              <h2 className="font-serif text-xl">{client.name}</h2>
              <p className="text-foreground/75 text-sm">
                {t.steps[client.key]}
              </p>
              {'code' in client && (
                <CodeBlock code={client.code} language={client.language} />
              )}
            </section>
          ))}
        </div>
        <p className="text-muted-foreground max-w-2xl text-sm">{t.safety}</p>
      </section>
      <Closing />
    </>
  )
}

export const Route = createFileRoute('/_site/mcp')({
  component: McpPage,
})
