'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import NextImage from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const t = useTranslations('login')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false
      })

      if (result?.error) {
        setError(t('invalidCredentials'))
      } else {
        router.push('/')
        router.refresh()
      }
    } catch {
      setError(t('genericError'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-background font-sans'>
      <Card className='w-full max-w-sm'>
        <CardHeader className='text-center'>
          <NextImage src='/icons/tagr-logo.webp' alt='Tagr' width={48} height={48} className='mx-auto rounded-xl mb-2' unoptimized />
          <CardTitle className='text-2xl'>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='username'>{t('username')}</Label>
              <Input
                id='username'
                type='text'
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder={t('usernamePlaceholder')}
                required
              />
            </div>

            <div className='flex flex-col gap-2'>
              <Label htmlFor='password'>{t('password')}</Label>
              <Input
                id='password'
                type='password'
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={t('passwordPlaceholder')}
                required
              />
            </div>

            {error && <p className='text-sm text-destructive'>{error}</p>}

            <Button type='submit' disabled={isLoading} className='mt-2 w-full'>
              {isLoading ? t('submitting') : t('submit')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
