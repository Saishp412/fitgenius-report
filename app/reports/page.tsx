"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TrendingUp, Calendar, Download, Mail, Target, Award, Zap } from 'lucide-react'
import jsPDF from 'jspdf'

export default function ReportsPage() {
  const [user, setUser] = useState<any>(null)
  const [selectedPeriod, setSelectedPeriod] = useState("week")
  const router = useRouter()
  useEffect(() => {
    const userData = localStorage.getItem("currentUser")
    if (!userData) {
      router.push("/login")
      return
    }
    const parsedUser = JSON.parse(userData)
    if (!parsedUser.onboardingCompleted) {
      router.push("/onboarding")
      return
    }
    setUser(parsedUser)
  }, [router])

  const generateReport = () => {
    if (!user) return null

    const dailyLogs = user.dailyLogs || []
    const now = new Date()
    const periodDays = selectedPeriod === "week" ? 7 : selectedPeriod === "month" ? 30 : 90
    
    const periodStart = new Date(now.getTime() - (periodDays * 24 * 60 * 60 * 1000))
    const relevantLogs = dailyLogs.filter((log: any) => {
      const logDate = new Date(log.date)
      return logDate >= periodStart && logDate <= now
    })

    const totalCalories = relevantLogs.reduce((sum: number, log: any) => sum + (log.calories || 0), 0)
    const totalProtein = relevantLogs.reduce((sum: number, log: any) => sum + (log.protein || 0), 0)
    const totalWorkouts = relevantLogs.reduce((sum: number, log: any) => sum + (log.workouts || 0), 0)
    const activeDays = relevantLogs.filter((log: any) => log.calories > 0 || log.workouts > 0).length

    const avgCalories = relevantLogs.length > 0 ? Math.round(totalCalories / relevantLogs.length) : 0
    const avgProtein = relevantLogs.length > 0 ? Math.round(totalProtein / relevantLogs.length) : 0
    const workoutFrequency = Math.round((totalWorkouts / periodDays) * 7) // workouts per week

    return {
      period: selectedPeriod,
      periodDays,
      totalCalories,
      totalProtein,
      totalWorkouts,
      activeDays,
      avgCalories,
      avgProtein,
      workoutFrequency,
      consistency: Math.round((activeDays / periodDays) * 100)
    }
  }

  const getAchievements = () => {
    if (!user) return []

    const dailyLogs = user.dailyLogs || []
    const achievements = []

    // Streak achievements
    let currentStreak = 0
    let maxStreak = 0
    let tempStreak = 0

    const sortedLogs = dailyLogs.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    for (let i = 0; i < sortedLogs.length; i++) {
      const log = sortedLogs[i]
      if (log.calories > 0 || log.workouts > 0) {
        tempStreak++
        maxStreak = Math.max(maxStreak, tempStreak)
      } else {
        tempStreak = 0
      }
    }

    // Check current streak
    const today = new Date().toDateString()
    const recentLogs = dailyLogs.slice(-7) // Last 7 days
    for (let i = recentLogs.length - 1; i >= 0; i--) {
      const log = recentLogs[i]
      if (log.calories > 0 || log.workouts > 0) {
        currentStreak++
      } else {
        break
      }
    }

    if (maxStreak >= 7) achievements.push({ name: "Week Warrior", description: "7 day streak!", icon: "🔥" })
    if (maxStreak >= 30) achievements.push({ name: "Month Master", description: "30 day streak!", icon: "💪" })
    if (dailyLogs.length >= 30) achievements.push({ name: "Consistency King", description: "30 days of tracking!", icon: "👑" })
    
    const totalWorkouts = dailyLogs.reduce((sum: number, log: any) => sum + (log.workouts || 0), 0)
    if (totalWorkouts >= 10) achievements.push({ name: "Workout Warrior", description: "10 workouts completed!", icon: "🏋️" })
    if (totalWorkouts >= 50) achievements.push({ name: "Fitness Fanatic", description: "50 workouts completed!", icon: "🎯" })

    return achievements
  }

  const downloadReport = () => {
    const report = generateReport()
    if (!report) return

    const doc = new jsPDF()
    const achievements = getAchievements()
    let yPos = 85 // Initialize yPos at the top
    
    // Header
    doc.setFontSize(20)
    doc.setTextColor(16, 185, 129) // emerald-600
    doc.text('FitGenius - Progress Report', 20, 30)
    
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text(`User: ${user.name}`, 20, 45)
    doc.text(`Period: ${report.period.charAt(0).toUpperCase() + report.period.slice(1)}`, 20, 55)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 65)
    
    // Summary Stats
    doc.setFontSize(16)
    doc.text('Summary Statistics', 20, yPos)
    yPos += 15
    
    doc.setFontSize(11)
    doc.text(`Average Daily Calories: ${report.avgCalories}`, 25, yPos)
    yPos += 10
    doc.text(`Total Workouts: ${report.totalWorkouts}`, 25, yPos)
    yPos += 10
    doc.text(`Active Days: ${report.activeDays}/${report.periodDays}`, 25, yPos)
    yPos += 10
    doc.text(`Consistency: ${report.consistency}%`, 25, yPos)
    yPos += 20
    
    // Goals Progress
    if (recommendations) {
      doc.setFontSize(16)
      doc.text('Goal Progress', 20, yPos)
      yPos += 15
      
      doc.setFontSize(11)
      doc.text(`Calorie Goal: ${recommendations.calorieGoal} cal/day`, 25, yPos)
      yPos += 10
      doc.text(`Protein Goal: ${recommendations.proteinGoal}g/day`, 25, yPos)
      yPos += 10
      doc.text(`Workout Frequency: ${recommendations.workoutFrequency}/week`, 25, yPos)
      yPos += 20
    }
    
    // Achievements
    if (achievements.length > 0) {
      doc.setFontSize(16)
      doc.text('Achievements', 20, yPos)
      yPos += 15
      
      doc.setFontSize(11)
      achievements.forEach((achievement) => {
        doc.text(`${achievement.icon} ${achievement.name}: ${achievement.description}`, 25, yPos)
        yPos += 10
      })
      yPos += 10
    }
    
    // Recommendations
    doc.setFontSize(16)
    doc.text('AI Recommendations', 20, yPos)
    yPos += 15
    
    doc.setFontSize(11)
    if (user.profile?.primaryGoal === "weight-loss") {
      doc.text('• Focus on dal, vegetables, and whole grains', 25, yPos)
      yPos += 10
      doc.text('• Include fiber-rich foods like rajma and quinoa', 25, yPos)
      yPos += 10
      doc.text('• Combine cardio with strength training', 25, yPos)
    } else if (user.profile?.primaryGoal === "muscle-gain") {
      doc.text('• Increase protein with paneer, dal, eggs, and lean meats', 25, yPos)
      yPos += 10
      doc.text('• Include healthy fats from nuts and ghee', 25, yPos)
      yPos += 10
      doc.text('• Focus on progressive strength training', 25, yPos)
    } else {
      doc.text('• Maintain balanced meals with proper portions', 25, yPos)
      yPos += 10
      doc.text('• Mix of cardio, strength training, and flexibility', 25, yPos)
    }
    
    // Save the PDF
    doc.save(`fitness-report-${report.period}-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  if (!user) return null

  const report = generateReport()
  const achievements = getAchievements()
  const recommendations = user.recommendations

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-16 h-16 bg-emerald-200/20 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute top-60 right-20 w-12 h-12 bg-teal-200/20 rounded-full animate-pulse delay-500"></div>
        <div className="absolute bottom-40 left-20 w-20 h-20 bg-cyan-200/20 rounded-full animate-bounce delay-700"></div>
      </div>

      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-emerald-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 hover:scale-105 transition-all duration-200">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Progress Reports
          </h1>
          <div className="w-24"></div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Your Progress Report</h2>
          <p className="text-slate-600">Track your fitness journey and celebrate your achievements</p>
        </div>

        {/* Period Selection */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-2 p-1 bg-white/70 backdrop-blur-sm rounded-lg border border-emerald-100">
            {["week", "month", "quarter"].map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
                className="hover:scale-105 transition-all duration-200"
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {report && (
          <div className="space-y-8">
            {/* Summary Stats */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-slate-800">{report.avgCalories}</span>
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-2">Avg Daily Calories</h3>
                  <p className="text-sm text-slate-600">
                    {recommendations ? 
                      `Target: ${recommendations.calorieGoal} cal/day` : 
                      "Set goals in profile"
                    }
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-slate-800">{report.totalWorkouts}</span>
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-2">Total Workouts</h3>
                  <p className="text-sm text-slate-600">
                    {report.workoutFrequency} per week average
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-slate-800">{report.activeDays}</span>
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-2">Active Days</h3>
                  <p className="text-sm text-slate-600">
                    Out of {report.periodDays} days
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-slate-800">{report.consistency}%</span>
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-2">Consistency</h3>
                  <Progress value={report.consistency} className="mb-2" />
                  <p className="text-sm text-slate-600">
                    {report.consistency >= 80 ? "Excellent!" : report.consistency >= 60 ? "Good!" : "Keep going!"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Achievements */}
            {achievements.length > 0 && (
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-emerald-600" />
                    Your Achievements
                  </CardTitle>
                  <CardDescription>Celebrate your fitness milestones!</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-100 hover:scale-105 transition-transform duration-300">
                        <div className="text-3xl">{achievement.icon}</div>
                        <div>
                          <h4 className="font-semibold text-slate-800">{achievement.name}</h4>
                          <p className="text-sm text-slate-600">{achievement.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Detailed Breakdown */}
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Nutrition Summary</CardTitle>
                  <CardDescription>Your {selectedPeriod}ly nutrition overview</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg">
                    <span className="font-medium text-slate-800">Total Calories</span>
                    <span className="text-lg font-bold text-emerald-600">{report.totalCalories.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg">
                    <span className="font-medium text-slate-800">Total Protein</span>
                    <span className="text-lg font-bold text-teal-600">{report.totalProtein}g</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg">
                    <span className="font-medium text-slate-800">Daily Average</span>
                    <span className="text-lg font-bold text-cyan-600">{report.avgCalories} cal</span>
                  </div>
                  {recommendations && (
                    <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                      <h4 className="font-semibold text-purple-800 mb-2">Goal Progress</h4>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Calorie Goal</span>
                            <span>{Math.round((report.avgCalories / recommendations.calorieGoal) * 100)}%</span>
                          </div>
                          <Progress value={(report.avgCalories / recommendations.calorieGoal) * 100} />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Protein Goal</span>
                            <span>{Math.round((report.avgProtein / recommendations.proteinGoal) * 100)}%</span>
                          </div>
                          <Progress value={(report.avgProtein / recommendations.proteinGoal) * 100} />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Workout Summary</CardTitle>
                  <CardDescription>Your {selectedPeriod}ly workout overview</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg">
                    <span className="font-medium text-slate-800">Total Workouts</span>
                    <span className="text-lg font-bold text-emerald-600">{report.totalWorkouts}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg">
                    <span className="font-medium text-slate-800">Weekly Average</span>
                    <span className="text-lg font-bold text-teal-600">{report.workoutFrequency}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg">
                    <span className="font-medium text-slate-800">Active Days</span>
                    <span className="text-lg font-bold text-cyan-600">{report.activeDays}/{report.periodDays}</span>
                  </div>
                  {recommendations && (
                    <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                      <h4 className="font-semibold text-purple-800 mb-2">Workout Goal Progress</h4>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Weekly Target: {recommendations.workoutFrequency}</span>
                          <span>{Math.round((report.workoutFrequency / recommendations.workoutFrequency) * 100)}%</span>
                        </div>
                        <Progress value={(report.workoutFrequency / recommendations.workoutFrequency) * 100} />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Actions */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Export Your Report</CardTitle>
                <CardDescription>Download or share your progress report</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button
                    onClick={downloadReport}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                  <Button
                    variant="outline"
                    className="hover:scale-105 transition-all duration-200"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
