'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

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
        setError('Invalid username or password')
      } else {
        router.push('/')
        router.refresh()
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black'>
      <main className='w-full max-w-sm rounded-lg bg-white p-8 shadow-md dark:bg-zinc-900'>
        <h1 className='mb-6 text-center text-2xl font-semibold text-black dark:text-zinc-50'>Sign In</h1>

        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <div className='flex flex-col gap-2'>
            <label htmlFor='username' className='text-sm font-medium text-zinc-700 dark:text-zinc-300'>
              Username
            </label>
            <input
              id='username'
              type='text'
              value={username}
              onChange={e => setUsername(e.target.value)}
              className='rounded-md border border-zinc-300 px-3 py-2 text-black focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white'
              required
            />
          </div>

          <div className='flex flex-col gap-2'>
            <label htmlFor='password' className='text-sm font-medium text-zinc-700 dark:text-zinc-300'>
              Password
            </label>
            <input
              id='password'
              type='password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              className='rounded-md border border-zinc-300 px-3 py-2 text-black focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white'
              required
            />
          </div>

          {error && <p className='text-sm text-red-500'>{error}</p>}

          <Button type='submit' disabled={isLoading} className='mt-2 w-full'>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </main>
    </div>
  )
}
