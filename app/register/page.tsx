"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Eye, EyeOff, CheckCircle, XCircle, User } from 'lucide-react'
import { authService } from '@/lib/auth'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const router = useRouter()

  const checkPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 6) strength++
    if (password.match(/[a-z]/)) strength++
    if (password.match(/[A-Z]/)) strength++
    if (password.match(/[0-9]/)) strength++
    if (password.match(/[^a-zA-Z0-9]/)) strength++
    return strength
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Basic validation
    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all required fields")
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      setLoading(false)
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address")
      setLoading(false)
      return
    }

    try {
      const result = await authService.register(formData.name, formData.email, formData.password)
      
      if (!result.success) {
        setError(result.message)
        setLoading(false)
        return
      }

      // Store user session
      localStorage.setItem("currentUser", JSON.stringify(result.user))
      
      // Redirect to onboarding
      router.push("/onboarding")
    } catch (error) {
      console.error('Registration failed:', error)
      setError("Registration failed. Please try again.")
    }
    
    setLoading(false)
  }

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (field === 'password') {
      setPasswordStrength(checkPasswordStrength(value))
    }
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-500"
    if (passwordStrength <= 3) return "bg-yellow-500"
    return "bg-emerald-500"
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return "Weak"
    if (passwordStrength <= 3) return "Medium"
    return "Strong"
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
              <User className="h-8 w-8 text-emerald-600" />
            </div>
            <CardTitle className="text-3xl font-bold font-display text-slate-900">
              Join FitGenius
            </CardTitle>
            <CardDescription className="text-slate-600">
              Create your account to get started on your fitness journey
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700 font-medium">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-medium">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => updateFormData("password", e.target.value)}
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
                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Password Strength:</span>
                      <span className={passwordStrength >= 4 ? "text-emerald-600" : passwordStrength >= 3 ? "text-yellow-600" : "text-red-600"}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">Confirm Password *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                    className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4 text-slate-500" /> : <Eye className="h-4 w-4 text-slate-500" />}
                  </Button>
                </div>
                {formData.confirmPassword && (
                  <div className="flex items-center text-sm">
                    {formData.password === formData.confirmPassword ? (
                      <><CheckCircle className="h-4 w-4 text-emerald-500 mr-2" /> <span className="text-emerald-600">Passwords match</span></>
                    ) : (
                      <><XCircle className="h-4 w-4 text-red-500 mr-2" /> <span className="text-red-600">Passwords don't match</span></>
                    )}
                  </div>
                )}
              </div>
              
              <Button
                type="submit"
                className="w-full btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-slate-600">
                Already have an account?{" "}
                <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
