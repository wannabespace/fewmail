import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@fewmail/ui/components/alert-dialog'
import { Button } from '@fewmail/ui/components/button'
import {
  SettingsGroup,
  SettingsRow,
} from '@fewmail/ui/components/custom/settings-group'
import { useState } from 'react'
import { toast } from 'sonner'

import {
  authClient,
  signedInStore,
  signInWithGoogle,
  signOut,
} from '~/lib/auth'
import { useT } from '~/lib/i18n'
import { useMe } from '~/lib/me'
import { posthog } from '~/lib/posthog'
import { currentPushSubscription, pushSupported } from '~/lib/push'

const DeleteAccount = ({ isConfirming }: { isConfirming: boolean }) => {
  const t = useT()
  const { user } = useMe()
  const [isDeleting, setIsDeleting] = useState(false)
  const [needsSignIn, setNeedsSignIn] = useState(false)

  const deleteAccount = async () => {
    setIsDeleting(true)
    const { error } = await authClient.deleteUser()
    posthog.capture('account_deleted', {
      error: error?.code ?? null,
      success: !error,
    })
    if (error) {
      setIsDeleting(false)
      // Better Auth deletes only from a session younger than a day; a Google user proves it is them by signing in again.
      if (error.code === 'SESSION_EXPIRED') {
        setNeedsSignIn(true)
      } else {
        toast.error(t.settings.deleteFailed)
      }
      return
    }
    signedInStore.set(false)
    void posthog.reset()
    // The server dropped the account's devices with it; only the browser's own subscription is left.
    void (pushSupported ? currentPushSubscription() : Promise.resolve(null))
      .then((subscription) => subscription?.unsubscribe())
      .finally(() => location.assign('/login'))
  }

  return (
    <AlertDialog defaultOpen={isConfirming}>
      <AlertDialogTrigger
        render={<Button size="sm" variant="ghost-destructive" />}
      >
        {t.settings.deleteAccount}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.settings.deleteTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {needsSignIn
              ? t.settings.deleteSignIn
              : t.settings.deleteDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t.settings.cancel}</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isDeleting}
            onClick={
              needsSignIn
                ? () =>
                    signInWithGoogle(
                      '/settings?deleteAccount=confirm',
                      user.email
                    )
                : deleteAccount
            }
          >
            {needsSignIn ? t.notices.signInAgain : t.settings.deleteConfirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export const AccountSettings = ({
  isConfirmingDelete,
}: {
  isConfirmingDelete: boolean
}) => {
  const t = useT()
  const { user } = useMe()

  return (
    <SettingsGroup title={t.settings.account}>
      <SettingsRow
        title={<span data-mask>{user.email}</span>}
        description={t.settings.signedInWithGoogle}
      >
        <Button size="sm" variant="outline" onClick={signOut}>
          {t.settings.signOut}
        </Button>
      </SettingsRow>
      <SettingsRow
        title={t.settings.deleteAccount}
        description={t.settings.deleteDescription}
      >
        <DeleteAccount isConfirming={isConfirmingDelete} />
      </SettingsRow>
    </SettingsGroup>
  )
}
