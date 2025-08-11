"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, ArrowLeft, LogIn, XCircle } from 'lucide-react'
import { authService } from '@/lib/auth'

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!email || !password) {
      setError("Please enter both email and password")
      setLoading(false)
      return
    }

    try {
      const result = await authService.login(email, password)
      
      if (!result.success) {
        setError(result.message)
        setLoading(false)
        return
      }

      // Store user session
      localStorage.setItem("currentUser", JSON.stringify(result.user))
      
      // Redirect based on onboarding status
      if (result.user?.onboardingCompleted) {
        router.push("/dashboard")
      } else {
        router.push("/onboarding")
      }
    } catch (error) {
      console.error('Login failed:', error)
      setError("Login failed. Please try again.")
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-6 font-medium">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        
        <Card className="card-professional">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LogIn className="h-8 w-8 text-emerald-600" />
            </div>
            <CardTitle className="text-3xl font-bold font-display text-slate-900">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-slate-600">
              Sign in to your FitGenius account
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 text-slate-500" /> : <Eye className="h-4 w-4 text-slate-500" />}
                  </Button>
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-slate-600">
                {"Don't have an account? "}
                <Link href="/register" className="text-emerald-600 hover:text-emerald-700 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
