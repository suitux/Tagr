'use client'

import { AlertTriangleIcon, CheckCircle2Icon, Loader2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'
import { useSaveScrobbleAccount, useScrobbleAccounts } from '@/features/scrobbling/hooks/use-scrobble-accounts'
import { scrobbleSettingsFormSchema, type ScrobbleSettingsFormData } from '@/features/scrobbling/settings-schema'
import { zodResolver } from '@hookform/resolvers/zod'

const TOKEN_SETTINGS_URL = 'https://listenbrainz.org/settings/'

export function ListenBrainzSettings() {
  const t = useTranslations('scrobbling')
  const { data: accounts, isLoading } = useScrobbleAccounts()
  const saveAccount = useSaveScrobbleAccount()

  const account = accounts?.find(item => item.provider === 'listenbrainz') ?? null

  const form = useForm<ScrobbleSettingsFormData>({
    resolver: zodResolver(scrobbleSettingsFormSchema),
    mode: 'onChange',
    defaultValues: { enabled: true, token: '', apiRoot: '' }
  })

  useEffect(() => {
    form.reset({ enabled: account?.enabled ?? true, token: '', apiRoot: account?.apiRoot ?? '' })
  }, [account, form])

  const onSubmit = (data: ScrobbleSettingsFormData) => {
    saveAccount.mutate(
      {
        provider: 'listenbrainz',
        enabled: data.enabled,
        apiRoot: data.apiRoot || null,
        token: data.token || undefined
      },
      {
        onSuccess: saved => {
          toast.success(saved?.username ? t('connectedAs', { username: saved.username }) : t('saved'))
          form.resetField('token')
        },
        onError: error => toast.error(error.message)
      }
    )
  }

  const handleDisconnect = () => {
    saveAccount.mutate(
      { provider: 'listenbrainz', enabled: false, token: null },
      {
        onSuccess: () => toast.success(t('disconnected')),
        onError: error => toast.error(error.message)
      }
    )
  }

  if (isLoading) {
    return (
      <div className='flex justify-center py-8'>
        <Loader2Icon className='h-5 w-5 animate-spin text-muted-foreground' />
      </div>
    )
  }

  return (
    <form className='flex flex-col gap-4' onSubmit={form.handleSubmit(onSubmit)}>
      <div>
        <h3 className='text-sm font-semibold'>{t('listenbrainz')}</h3>
        <p className='text-xs text-muted-foreground'>{t('description')}</p>
      </div>

      {account?.username && (
        <p className='flex items-center gap-2 text-xs text-muted-foreground'>
          <CheckCircle2Icon className='h-4 w-4 text-primary' />
          {t('connectedAs', { username: account.username })}
        </p>
      )}

      {account?.lastError && (
        <p className='flex items-start gap-2 text-xs text-destructive'>
          <AlertTriangleIcon className='h-4 w-4 shrink-0' />
          {account.lastError}
        </p>
      )}

      {!!account?.pendingCount && (
        <p className='text-xs text-muted-foreground'>{t('pending', { count: account.pendingCount })}</p>
      )}

      <div className='flex items-center gap-2'>
        <Controller
          control={form.control}
          name='enabled'
          render={({ field }) => (
            <Checkbox
              id='scrobbling-enabled'
              checked={field.value}
              onCheckedChange={value => field.onChange(!!value)}
            />
          )}
        />
        <Label htmlFor='scrobbling-enabled'>{t('enable')}</Label>
      </div>

      <div className='flex flex-col gap-1.5'>
        <Label htmlFor='scrobbling-token'>{t('token')}</Label>
        <PasswordInput
          id='scrobbling-token'
          autoComplete='off'
          placeholder={account?.tokenSet ? t('tokenStored') : t('tokenPlaceholder')}
          {...form.register('token')}
        />
        <p className='text-xs text-muted-foreground'>
          {t.rich('tokenHelp', {
            link: chunks => (
              <Link href={TOKEN_SETTINGS_URL} target='_blank' rel='noopener noreferrer' className='underline'>
                {chunks}
              </Link>
            )
          })}
        </p>
      </div>

      <div className='flex flex-col gap-1.5'>
        <Label htmlFor='scrobbling-api-root'>{t('apiRoot')}</Label>
        <Input id='scrobbling-api-root' placeholder='https://api.listenbrainz.org' {...form.register('apiRoot')} />
        {form.formState.errors.apiRoot && (
          <p className='text-xs text-destructive'>{form.formState.errors.apiRoot.message}</p>
        )}
      </div>

      <div className='flex items-center gap-2'>
        <Button type='submit' size='sm' disabled={saveAccount.isPending || !form.formState.isValid}>
          {saveAccount.isPending && <Loader2Icon className='h-4 w-4 animate-spin' />}
          {t('save')}
        </Button>
        {account?.tokenSet && (
          <Button type='button' size='sm' variant='outline' onClick={handleDisconnect} disabled={saveAccount.isPending}>
            {t('disconnect')}
          </Button>
        )}
      </div>
    </form>
  )
}
