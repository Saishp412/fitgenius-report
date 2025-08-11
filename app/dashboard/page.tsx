"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, TrendingUp, Calendar, Apple, Dumbbell, Clock, LogOut, Plus, AlertCircle } from 'lucide-react'

interface UserProfile {
  id: string
  name: string
  email: string
  onboardingCompleted: boolean
  profile?: any
  recommendations?: {
    calorieGoal: number
    proteinGoal: number
    bmi: number
    workoutFrequency: number
    sessionDuration: string
  }
  dailyLogs?: {
    date: string
    calories: number
    protein: number
    workouts: number
  }[]
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [todayLog, setTodayLog] = useState({ calories: 0, protein: 0, workouts: 0 })
  const [currentTime, setCurrentTime] = useState(new Date())
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
    
    // Load today's log
    const today = new Date().toDateString()
    const logs = parsedUser.dailyLogs || []
    const todayData = logs.find((log: any) => log.date === today)
    if (todayData) {
      setTodayLog(todayData)
    }

    // Update time every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/")
  }

  if (!user) return null

  const recommendations = user.recommendations
  const calorieProgress = recommendations ? (todayLog.calories / recommendations.calorieGoal) * 100 : 0
  const proteinProgress = recommendations ? (todayLog.protein / recommendations.proteinGoal) * 100 : 0

  const getGoalBadgeColor = (goal: string) => {
    switch (goal) {
      case "weight-loss": return "bg-red-100 text-red-800 border-red-200"
      case "muscle-gain": return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "maintenance": return "bg-blue-100 text-blue-800 border-blue-200"
      default: return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 17) return "Good Afternoon"
    return "Good Evening"
  }

  const generateMealPlan = () => {
    if (!user.profile || !recommendations) return []
    
    const goal = user.profile.primaryGoal
    const calorieGoal = recommendations.calorieGoal
    
    // Basic meal distribution
    const breakfastCals = Math.round(calorieGoal * 0.25)
    const lunchCals = Math.round(calorieGoal * 0.35)
    const snackCals = Math.round(calorieGoal * 0.15)
    const dinnerCals = Math.round(calorieGoal * 0.25)
    
    const proteinGoal = recommendations.proteinGoal
    const breakfastProtein = Math.round(proteinGoal * 0.2)
    const lunchProtein = Math.round(proteinGoal * 0.35)
    const snackProtein = Math.round(proteinGoal * 0.15)
    const dinnerProtein = Math.round(proteinGoal * 0.3)
    
    // Generate meal suggestions based on preferences
    const dietRestrictions = user.profile.dietaryRestrictions || []
    const isVegetarian = dietRestrictions.includes("Vegetarian")
    const isVegan = dietRestrictions.includes("Vegan")
    
    return [
      {
        time: "7:00 AM",
        meal: "Breakfast",
        suggestion: isVegan ? "Oats upma with vegetables and coconut" : 
                   isVegetarian ? "Paneer paratha with curd and pickle" :
                   goal === "muscle-gain" ? "Egg bhurji with whole wheat roti" : "Poha with peanuts and curry leaves",
        calories: breakfastCals,
        protein: breakfastProtein,
        color: "bg-orange-50 border-orange-200"
      },
      {
        time: "12:30 PM",
        meal: "Lunch",
        suggestion: isVegan ? "Quinoa pulao with mixed dal and sabzi" :
                   isVegetarian ? "Rajma chawal with cucumber raita" :
                   goal === "muscle-gain" ? "Chicken curry with brown rice and dal" : "Roti, sabzi, dal, and salad",
        calories: lunchCals,
        protein: lunchProtein,
        color: "bg-emerald-50 border-emerald-200"
      },
      {
        time: "3:30 PM",
        meal: "Snack",
        suggestion: isVegan ? "Roasted chana with green tea" :
                   isVegetarian ? "Paneer tikka with mint chutney" :
                   "Boiled eggs with masala and green tea",
        calories: snackCals,
        protein: snackProtein,
        color: "bg-blue-50 border-blue-200"
      },
      {
        time: "7:00 PM",
        meal: "Dinner",
        suggestion: isVegan ? "Moong dal khichdi with ghee and pickle" :
                   isVegetarian ? "Palak paneer with roti and raita" :
                   goal === "muscle-gain" ? "Grilled fish with quinoa and sautéed spinach" : "Mixed vegetable curry with roti",
        calories: dinnerCals,
        protein: dinnerProtein,
        color: "bg-purple-50 border-purple-200"
      }
    ]
  }

  const generateWorkoutPlan = () => {
    if (!user.profile) return null
    
    const goal = user.profile.primaryGoal
    const equipment = user.profile.availableEquipment || []
    const hasGym = user.profile.gymAccess !== "no-gym"
    const duration = user.profile.sessionDuration
    
    let workoutType = "Full Body Workout"
    let exercises = []
    
    if (goal === "weight-loss") {
      workoutType = "Fat Burning HIIT"
      exercises = equipment.includes("None (Bodyweight)") ? 
        ["Jumping Jacks - 3 sets × 30s", "Burpees - 3 sets × 10", "Mountain Climbers - 3 sets × 20", "Push-ups - 3 sets × 10"] :
        ["Treadmill Intervals - 20 min", "Kettlebell Swings - 3 sets × 15", "Jump Rope - 3 sets × 1 min"]
    } else if (goal === "muscle-gain") {
      workoutType = "Strength Training"
      exercises = hasGym ? 
        ["Bench Press - 4 sets × 8-10", "Squats - 4 sets × 8-10", "Deadlifts - 3 sets × 6-8", "Pull-ups - 3 sets × max"] :
        ["Push-ups - 4 sets × 12", "Bodyweight Squats - 4 sets × 15", "Pike Push-ups - 3 sets × 8"]
    } else {
      workoutType = "General Fitness"
      exercises = ["Push-ups - 3 sets × 10", "Squats - 3 sets × 15", "Plank - 3 sets × 30s", "Lunges - 3 sets × 10 each leg"]
    }
    
    return { workoutType, exercises }
  }

  const mealPlan = generateMealPlan()
  const workoutPlan = generateWorkoutPlan()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold font-display text-emerald-600">
            FitGenius
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/tracking">
              <Button variant="ghost" className="text-slate-700 hover:text-emerald-600">
                <Apple className="h-4 w-4 mr-2" />
                Track Food
              </Button>
            </Link>
            <Link href="/workouts">
              <Button variant="ghost" className="text-slate-700 hover:text-emerald-600">
                <Dumbbell className="h-4 w-4 mr-2" />
                Workouts
              </Button>
            </Link>
            <Link href="/reports">
              <Button variant="ghost" className="text-slate-700 hover:text-emerald-600">
                <TrendingUp className="h-4 w-4 mr-2" />
                Reports
              </Button>
            </Link>
            <Button variant="ghost" onClick={handleLogout} className="text-red-600 hover:text-red-700">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-display text-slate-900 mb-2">
            {getGreeting()}, {user.name}!
          </h1>
          <div className="flex items-center gap-4">
            <p className="text-slate-600">Ready to crush your fitness goals today?</p>
            {user.profile?.primaryGoal && (
              <Badge className={getGoalBadgeColor(user.profile.primaryGoal)}>
                {user.profile.primaryGoal.replace("-", " ").toUpperCase()}
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-2">
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Stats Grid */}
        {recommendations && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="card-professional">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Target className="h-6 w-6 text-emerald-600" />
                  </div>
                  <span className="text-2xl font-bold font-display text-slate-900">{todayLog.calories}</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Calories Today</h3>
                <Progress value={calorieProgress} className="mb-2" />
                <p className="text-sm text-slate-600">
                  {todayLog.calories === 0 ? `Goal: ${recommendations.calorieGoal} cal` : 
                   `${recommendations.calorieGoal - todayLog.calories} remaining`}
                </p>
              </CardContent>
            </Card>

            <Card className="card-professional">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Apple className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-2xl font-bold font-display text-slate-900">{todayLog.protein}g</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Protein</h3>
                <Progress value={proteinProgress} className="mb-2" />
                <p className="text-sm text-slate-600">
                  {todayLog.protein === 0 ? `Goal: ${recommendations.proteinGoal}g` : 
                   `${recommendations.proteinGoal - todayLog.protein}g remaining`}
                </p>
              </CardContent>
            </Card>

            <Card className="card-professional">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Dumbbell className="h-6 w-6 text-purple-600" />
                  </div>
                  <span className="text-2xl font-bold font-display text-slate-900">{todayLog.workouts}</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Workouts This Week</h3>
                <Progress value={(todayLog.workouts / recommendations.workoutFrequency) * 100} className="mb-2" />
                <p className="text-sm text-slate-600">
                  Goal: {recommendations.workoutFrequency}/week
                </p>
              </CardContent>
            </Card>

            <Card className="card-professional">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                  <span className="text-2xl font-bold font-display text-slate-900">BMI</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{recommendations.bmi}</h3>
                <p className="text-sm text-slate-600">Body Mass Index</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Today's Plan */}
          <div className="lg:col-span-2 space-y-6">
            {/* Meal Plan */}
            <Card className="card-professional">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 font-display">
                  <Calendar className="h-5 w-5 text-emerald-600" />
                  Your Personalized Meal Plan
                </CardTitle>
                <CardDescription>
                  Based on your {user.profile?.primaryGoal?.replace("-", " ")} goal and dietary preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mealPlan.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {mealPlan.map((meal, index) => (
                      <div key={index} className={`p-4 ${meal.color} rounded-lg border`}>
                        <h4 className="font-semibold text-slate-900 mb-2">
                          {meal.time} - {meal.meal}
                        </h4>
                        <p className="text-sm text-slate-700 mb-2">{meal.suggestion}</p>
                        <p className="text-xs text-slate-600">{meal.calories} cal • {meal.protein}g protein</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Complete your profile to get personalized meal recommendations</p>
                  </div>
                )}
                <Link href="/tracking">
                  <Button className="w-full btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Log Your Meals
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Workout Plan */}
            <Card className="card-professional">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 font-display">
                  <Dumbbell className="h-5 w-5 text-emerald-600" />
                  Today's Workout Plan
                </CardTitle>
                <CardDescription>
                  Customized for your {user.profile?.primaryGoal?.replace("-", " ")} goal
                </CardDescription>
              </CardHeader>
              <CardContent>
                {workoutPlan ? (
                  <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 mb-4">
                    <h4 className="font-semibold text-emerald-900 mb-3">{workoutPlan.workoutType}</h4>
                    <div className="space-y-2 text-sm text-emerald-800">
                      {workoutPlan.exercises.map((exercise, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{exercise}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 text-xs text-emerald-700">
                      Duration: {user.profile?.sessionDuration || "45-60 min"}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Complete your profile to get personalized workout plans</p>
                  </div>
                )}
                <Link href="/workouts">
                  <Button className="w-full btn-primary">
                    Start Workout
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations Sidebar */}
          <div className="space-y-6">
            <Card className="card-professional">
              <CardHeader>
                <CardTitle className="text-slate-900 font-display">AI Recommendations</CardTitle>
                <CardDescription>
                  {user.profile?.primaryGoal ? 
                    `Personalized for your ${user.profile.primaryGoal.replace("-", " ")} goal` :
                    "Complete your profile for personalized recommendations"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.profile?.primaryGoal ? (
                  <>
                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <h4 className="font-semibold text-slate-900 mb-2">Diet Focus</h4>
                      <p className="text-sm text-slate-700">
                        {user.profile.primaryGoal === "weight-loss" ? 
                          "Focus on dal, vegetables, and whole grains. Include plenty of fiber-rich foods like rajma and quinoa." :
                          user.profile.primaryGoal === "muscle-gain" ?
                          "Increase protein with paneer, dal, eggs, and lean meats. Include healthy fats from nuts and ghee." :
                          "Maintain balanced meals with proper portions of roti, rice, dal, and vegetables."
                        }
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-slate-900 mb-2">Workout Focus</h4>
                      <p className="text-sm text-slate-700">
                        {user.profile.primaryGoal === "weight-loss" ?
                          "Combine cardio with strength training. Try morning walks, yoga, and bodyweight exercises." :
                          user.profile.primaryGoal === "muscle-gain" ?
                          "Focus on progressive strength training with compound movements and adequate rest." :
                          "Mix of cardio, strength training, and flexibility work like yoga for overall wellness."
                        }
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4 text-slate-500">
                    <p className="text-sm">Complete your onboarding to see personalized recommendations</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="card-professional">
              <CardHeader>
                <CardTitle className="text-slate-900 font-display">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/tracking">
                  <Button variant="outline" className="w-full justify-start">
                    <Apple className="h-4 w-4 mr-2" />
                    Log Food
                  </Button>
                </Link>
                <Link href="/workouts">
                  <Button variant="outline" className="w-full justify-start">
                    <Dumbbell className="h-4 w-4 mr-2" />
                    Start Workout
                  </Button>
                </Link>
                <Link href="/reports">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Progress
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Motivational Card */}
            {todayLog.calories === 0 && todayLog.protein === 0 && (
              <Card className="bg-gradient-to-r from-emerald-600 to-emerald-700 border-0 text-white">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold font-display mb-2">Ready to Start?</h3>
                  <p className="mb-4 text-emerald-100">
                    Begin tracking your meals and workouts to see your progress grow!
                  </p>
                  <Link href="/tracking">
                    <Button size="sm" variant="secondary" className="bg-white text-emerald-600 hover:bg-slate-50">
                      Log Your First Meal
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
