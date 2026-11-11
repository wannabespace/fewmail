import { useRouteContext } from '@tanstack/react-router'

export const useMe = () => useRouteContext({ from: '/_app' }).me

/** Free accounts never see an AI control: no brief, analysis, drafts, Telegram or MCP. */
export const useHasAgent = () => useMe().plan.kind !== 'free'

export const gmailThreadUrl = (email: string, threadId: string) =>
  `https://mail.google.com/mail/?authuser=${encodeURIComponent(email)}#all/${threadId}`
