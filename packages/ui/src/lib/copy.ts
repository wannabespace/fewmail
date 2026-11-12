import { Result } from 'better-result'
import { toast } from 'sonner'

export const copy = async (text: string, successText?: string) => {
  const copied = await Result.tryPromise(() =>
    navigator.clipboard.writeText(text)
  )
  if (copied.isErr()) {
    toast.error('Could not copy to clipboard')
    return
  }
  if (successText) {
    toast.success(successText, {
      duration: 1500,
    })
  }
}
