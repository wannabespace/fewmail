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

import { authClient, signOut } from '~/lib/auth'
import { useT } from '~/lib/i18n'
import { useMe } from '~/lib/me'

const DeleteAccount = () => {
  const t = useT()
  const [isDeleting, setIsDeleting] = useState(false)

  const deleteAccount = async () => {
    setIsDeleting(true)
    const { error } = await authClient.deleteUser()
    if (error) {
      setIsDeleting(false)
      toast.error(t.errors.failed)
      return
    }
    location.assign('/login')
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={<Button size="sm" variant="ghost-destructive" />}
      >
        {t.settings.deleteAccount}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.settings.deleteTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.settings.deleteDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t.settings.cancel}</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isDeleting}
            onClick={deleteAccount}
          >
            {t.settings.deleteConfirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export const AccountSettings = () => {
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
        <DeleteAccount />
      </SettingsRow>
    </SettingsGroup>
  )
}
