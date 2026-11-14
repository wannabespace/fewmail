/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly API_URL: string
  readonly POSTHOG_TOKEN?: string
  readonly RAILWAY_GIT_COMMIT_SHA?: string
}
