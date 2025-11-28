'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const { login, error, clearError } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      return // error will be set in AuthContext → will show below
    }

    setLoading(true)
    clearError() // clear any previous error

    try {
      await login(email, password)
      router.push('/')
    } catch {
      // Error is already set inside AuthProvider → just let it display
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF6F1] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#2C1810] mb-2">Welcome Back</h1>
          <p className="text-[#3E2723]">Sign in to your account</p>
        </div>

        {/* Inline Error - Only change to your original design */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-medium text-red-800">{error}</p>
            <button
              onClick={clearError}
              className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#2C1810] mb-2">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#2C1810] mb-2">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full"
              disabled={loading}
            />
          </div>

          {/* <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-[#C1502E] focus:ring-[#C1502E]"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-[#3E2723]">
                Remember me
              </label>
            </div>

            <Link
              href="/forgot-password"
              className="text-sm text-[#C1502E] hover:text-[#A0421F] font-medium"
            >
              Forgot password?
            </Link>
          </div> */}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
            size="lg"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-[#3E2723]">
            Don't have an account?{' '}
            <Link
              href="/register"
              className="font-medium text-[#C1502E] hover:text-[#A0421F]"
            >
              Sign up
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}