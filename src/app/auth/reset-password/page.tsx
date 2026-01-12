'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Lock, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [isValidToken, setIsValidToken] = useState(false)

  // Password strength checker
  useEffect(() => {
    const password = formData.password
    let strength = 0
    
    if (password.length >= 8) strength++
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++
    if (password.match(/[0-9]/)) strength++
    if (password.match(/[^a-zA-Z0-9]/)) strength++
    
    setPasswordStrength(strength)
  }, [formData.password])

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0: return { text: 'Very Weak', color: 'text-red-500' }
      case 1: return { text: 'Weak', color: 'text-red-400' }
      case 2: return { text: 'Fair', color: 'text-yellow-500' }
      case 3: return { text: 'Good', color: 'text-green-500' }
      case 4: return { text: 'Strong', color: 'text-green-600' }
      default: return { text: 'Very Weak', color: 'text-red-500' }
    }
  }

  // Check if we have a valid reset token
  useEffect(() => {
    const checkResetToken = async () => {
      const token = searchParams.get('token')
      
      if (!token) {
        setError('Invalid reset token. Please request a new password reset.')
        return
      }

      try {
        // Verify the token by attempting to get the user
        const { data, error } = await supabase.auth.getUser(token)
        
        if (error || !data.user) {
          setError('Invalid or expired reset token. Please request a new password reset.')
        } else {
          setIsValidToken(true)
        }
      } catch (error) {
        setError('Invalid reset token. Please request a new password reset.')
      }
    }

    checkResetToken()
  }, [searchParams])

  const validateForm = () => {
    const errors = []

    if (!formData.password) errors.push('Password is required')
    if (formData.password !== formData.confirmPassword) errors.push('Passwords do not match')
    if (formData.password.length < 8) errors.push('Password must be at least 8 characters')

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isValidToken) {
      setError('Invalid reset token. Please request a new password reset.')
      return
    }

    setLoading(true)
    setError('')

    const errors = validateForm()
    if (errors.length > 0) {
      setError(errors.join('. '))
      setLoading(false)
      return
    }

    try {
      const token = searchParams.get('token')
      
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage('Password reset successfully! You can now sign in with your new password.')
        setTimeout(() => {
          router.push('/auth/signin?message=Password reset successful! Please sign in.')
        }, 2000)
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!isValidToken && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Verifying reset token...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Siscora Connect
            </h1>
          </Link>
          <p className="text-gray-600 mt-2">Set your new password</p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-center text-gray-900">Reset Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Success Message */}
            {message && (
              <Alert className="bg-green-50 border-green-200 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {/* Error Message */}
            {error && (
              <Alert className="bg-red-50 border-red-200 text-red-800">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isValidToken && (
              <>
                {/* Instructions */}
                <div className="text-center text-gray-600">
                  <p>
                    Enter your new password below. Make sure it's strong and secure.
                  </p>
                </div>

                {/* Reset Password Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your new password"
                        value={formData.password}
                        onChange={(e) => updateField('password', e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {formData.password && (
                      <div className="mt-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500">Password strength:</span>
                          <span className={`text-xs font-medium ${getPasswordStrengthText().color}`}>
                            {getPasswordStrengthText().text}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              passwordStrength === 0 ? 'bg-red-500' :
                              passwordStrength === 1 ? 'bg-red-400' :
                              passwordStrength === 2 ? 'bg-yellow-500' :
                              passwordStrength === 3 ? 'bg-green-500' :
                              'bg-green-600'
                            }`}
                            style={{ width: `${(passwordStrength / 4) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your new password"
                        value={formData.confirmPassword}
                        onChange={(e) => updateField('confirmPassword', e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    disabled={loading}
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </>
            )}

            {/* Back to Sign In */}
            <div className="text-center">
              <Link
                href="/auth/signin"
                className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
