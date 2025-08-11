"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Search, Apple, Utensils, Clock, Trash2, Edit } from 'lucide-react'
import { authService } from '@/lib/auth'

interface FoodItem {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  serving: string
}

interface LoggedFood extends FoodItem {
  quantity: number
  mealType: string
  timestamp: string
}

const SAMPLE_FOODS: FoodItem[] = [
  { id: "1", name: "Roti (Whole Wheat)", calories: 71, protein: 3, carbs: 15, fat: 0.4, serving: "1 medium" },
  { id: "2", name: "Brown Rice", calories: 111, protein: 2.6, carbs: 23, fat: 0.9, serving: "100g" },
  { id: "3", name: "Dal (Moong)", calories: 347, protein: 24, carbs: 59, fat: 1.2, serving: "100g" },
  { id: "4", name: "Paneer", calories: 265, protein: 18, carbs: 1.2, fat: 20, serving: "100g" },
  { id: "5", name: "Curd (Greek Style)", calories: 59, protein: 10, carbs: 3.6, fat: 0.4, serving: "100g" },
  { id: "6", name: "Almonds", calories: 579, protein: 21, carbs: 22, fat: 50, serving: "100g" },
  { id: "7", name: "Chicken Breast", calories: 165, protein: 31, carbs: 0, fat: 3.6, serving: "100g" },
  { id: "8", name: "Sweet Potato", calories: 86, protein: 1.6, carbs: 20, fat: 0.1, serving: "100g" },
  { id: "9", name: "Rajma (Kidney Beans)", calories: 127, protein: 8.7, carbs: 23, fat: 0.5, serving: "100g" },
  { id: "10", name: "Quinoa", calories: 368, protein: 14, carbs: 64, fat: 6, serving: "100g" },
  { id: "11", name: "Spinach (Palak)", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, serving: "100g" },
  { id: "12", name: "Banana", calories: 89, protein: 1.1, carbs: 23, fat: 0.3, serving: "1 medium" },
  { id: "13", name: "Oats", calories: 389, protein: 17, carbs: 66, fat: 7, serving: "100g" },
  { id: "14", name: "Egg (Boiled)", calories: 155, protein: 13, carbs: 1.1, fat: 11, serving: "1 large" },
  { id: "15", name: "Fish (Rohu)", calories: 97, protein: 16, carbs: 0, fat: 3, serving: "100g" },
  { id: "16", name: "Chapati", calories: 104, protein: 3.1, carbs: 18, fat: 2.5, serving: "1 medium" },
  { id: "17", name: "Basmati Rice", calories: 121, protein: 2.2, carbs: 25, fat: 0.4, serving: "100g" },
  { id: "18", name: "Chana Dal", calories: 335, protein: 20, carbs: 57, fat: 1.5, serving: "100g" },
  { id: "19", name: "Ghee", calories: 900, protein: 0, carbs: 0, fat: 100, serving: "1 tbsp" },
  { id: "20", name: "Idli", calories: 39, protein: 2, carbs: 8, fat: 0.1, serving: "1 piece" }
]

export default function TrackingPage() {
  const [user, setUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMealType, setSelectedMealType] = useState("breakfast")
  const [todayLogs, setTodayLogs] = useState<LoggedFood[]>([])
  const [filteredFoods, setFilteredFoods] = useState<FoodItem[]>(SAMPLE_FOODS)
  const [customFood, setCustomFood] = useState({
    name: "",
    calories: "",
    protein: "",
    serving: ""
  })
  const [showCustomForm, setShowCustomForm] = useState(false)
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
    
    // Load today's logs
    const today = new Date().toDateString()
    const logs = parsedUser.dailyLogs || []
    const todayData = logs.find((log: any) => log.date === today)
    if (todayData && todayData.foods) {
      setTodayLogs(todayData.foods)
    }
  }, [router])

  useEffect(() => {
    const filtered = SAMPLE_FOODS.filter(food =>
      food.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredFoods(filtered)
  }, [searchTerm])

  const addFood = (food: FoodItem, quantity: number = 1) => {
    const loggedFood: LoggedFood = {
      ...food,
      quantity,
      mealType: selectedMealType,
      timestamp: new Date().toISOString()
    }
    
    const newLogs = [...todayLogs, loggedFood]
    setTodayLogs(newLogs)
    
    // Update user data
    updateUserLogs(newLogs)
  }

  const addCustomFood = () => {
    if (!customFood.name || !customFood.calories || !customFood.protein || !customFood.serving) {
      alert("Please fill all fields")
      return
    }

    const newFood: FoodItem = {
      id: Date.now().toString(),
      name: customFood.name,
      calories: parseFloat(customFood.calories),
      protein: parseFloat(customFood.protein),
      carbs: 0, // User can add this later if needed
      fat: 0, // User can add this later if needed
      serving: customFood.serving
    }

    addFood(newFood, 1)
    setCustomFood({ name: "", calories: "", protein: "", serving: "" })
    setShowCustomForm(false)
  }

  const removeFood = (index: number) => {
    const newLogs = todayLogs.filter((_, i) => i !== index)
    setTodayLogs(newLogs)
    updateUserLogs(newLogs)
  }

  const updateUserLogs = (logs: LoggedFood[]) => {
    if (!user) return

    const today = new Date().toDateString()
    const totalCalories = logs.reduce((sum, food) => sum + (food.calories * food.quantity), 0)
    const totalProtein = logs.reduce((sum, food) => sum + (food.protein * food.quantity), 0)
    
    const dailyLogs = user.dailyLogs || []
    const existingLogIndex = dailyLogs.findIndex((log: any) => log.date === today)
    
    const todayLog = {
      date: today,
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein),
      workouts: existingLogIndex >= 0 ? dailyLogs[existingLogIndex].workouts : 0,
      foods: logs
    }
    
    if (existingLogIndex >= 0) {
      dailyLogs[existingLogIndex] = todayLog
    } else {
      dailyLogs.push(todayLog)
    }
    
    const updatedUser = { ...user, dailyLogs }
    const result = authService.updateUser(user.id, updatedUser)
    
    if (result.success) {
      localStorage.setItem("currentUser", JSON.stringify(result.user))
      setUser(result.user)
    }
  }

  const getTotalNutrition = () => {
    return todayLogs.reduce(
      (totals, food) => ({
        calories: totals.calories + (food.calories * food.quantity),
        protein: totals.protein + (food.protein * food.quantity),
        carbs: totals.carbs + (food.carbs * food.quantity),
        fat: totals.fat + (food.fat * food.quantity)
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )
  }

  const getMealLogs = (mealType: string) => {
    return todayLogs.filter(food => food.mealType === mealType)
  }

  if (!user) return null

  const totalNutrition = getTotalNutrition()
  const recommendations = user.recommendations
  const calorieProgress = recommendations ? (totalNutrition.calories / recommendations.calorieGoal) * 100 : 0
  const proteinProgress = recommendations ? (totalNutrition.protein / recommendations.proteinGoal) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-emerald-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 hover:scale-105 transition-all duration-200">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Food Tracking
          </h1>
          <div className="w-24"></div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Progress Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                  <Apple className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-slate-800">{Math.round(totalNutrition.calories)}</span>
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Calories</h3>
              <Progress value={calorieProgress} className="mb-2" />
              <p className="text-sm text-slate-600">
                {recommendations ? `${recommendations.calorieGoal - Math.round(totalNutrition.calories)} remaining` : "Set goals in profile"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <Utensils className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-slate-800">{Math.round(totalNutrition.protein)}g</span>
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Protein</h3>
              <Progress value={proteinProgress} className="mb-2" />
              <p className="text-sm text-slate-600">
                {recommendations ? `${recommendations.proteinGoal - Math.round(totalNutrition.protein)}g remaining` : "Set goals in profile"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">C</span>
                </div>
                <span className="text-2xl font-bold text-slate-800">{Math.round(totalNutrition.carbs)}g</span>
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Carbs</h3>
              <p className="text-sm text-slate-600">Complex carbs preferred</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">F</span>
                </div>
                <span className="text-2xl font-bold text-slate-800">{Math.round(totalNutrition.fat)}g</span>
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Fat</h3>
              <p className="text-sm text-slate-600">Healthy fats essential</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Food Search & Add */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-emerald-600" />
                  Add Indian Food
                </CardTitle>
                <CardDescription>Search and add Indian foods to your daily log</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search Indian foods..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="transition-all duration-200 focus:scale-105"
                    />
                  </div>
                  <div className="flex gap-2">
                    {["breakfast", "lunch", "dinner", "snack"].map((meal) => (
                      <Button
                        key={meal}
                        variant={selectedMealType === meal ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedMealType(meal)}
                        className="hover:scale-105 transition-all duration-200"
                      >
                        {meal.charAt(0).toUpperCase() + meal.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 max-h-96 overflow-y-auto">
                  {filteredFoods.map((food) => (
                    <div key={food.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-100 hover:scale-105 transition-transform duration-300">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <span className="text-emerald-600 font-semibold">{food.name.charAt(0)}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800">{food.name}</h4>
                          <p className="text-sm text-slate-600">
                            {food.calories} cal • {food.protein}g protein • {food.serving}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addFood(food)}
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:scale-110 transition-all duration-200"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Custom Food Entry */}
                <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-slate-800">Add Custom Food</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowCustomForm(!showCustomForm)}
                    >
                      {showCustomForm ? "Cancel" : "Add Custom"}
                    </Button>
                  </div>
                  
                  {showCustomForm && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Input
                          placeholder="Food name"
                          value={customFood.name}
                          onChange={(e) => setCustomFood({...customFood, name: e.target.value})}
                          className="text-sm"
                        />
                        <Input
                          placeholder="Calories"
                          type="number"
                          value={customFood.calories}
                          onChange={(e) => setCustomFood({...customFood, calories: e.target.value})}
                          className="text-sm"
                        />
                        <Input
                          placeholder="Protein (g)"
                          type="number"
                          value={customFood.protein}
                          onChange={(e) => setCustomFood({...customFood, protein: e.target.value})}
                          className="text-sm"
                        />
                        <Input
                          placeholder="Serving size"
                          value={customFood.serving}
                          onChange={(e) => setCustomFood({...customFood, serving: e.target.value})}
                          className="text-sm"
                        />
                      </div>
                      <Button
                        size="sm"
                        onClick={addCustomFood}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Custom Food
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Today's Log */}
          <div className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-emerald-600" />
                  Today's Log
                </CardTitle>
                <CardDescription>
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {["breakfast", "lunch", "dinner", "snack"].map((mealType) => {
                  const mealLogs = getMealLogs(mealType)
                  const mealCalories = mealLogs.reduce((sum, food) => sum + (food.calories * food.quantity), 0)
                  
                  return (
                    <div key={mealType} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-slate-800 capitalize">{mealType}</h4>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(mealCalories)} cal
                        </Badge>
                      </div>
                      
                      {mealLogs.length === 0 ? (
                        <p className="text-sm text-slate-500 italic">No foods logged</p>
                      ) : (
                        <div className="space-y-2">
                          {mealLogs.map((food, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gradient-to-r from-slate-50 to-gray-50 rounded border hover:scale-105 transition-transform duration-200">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                                  <span className="text-emerald-600 text-xs font-semibold">{food.name.charAt(0)}</span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-slate-800">{food.name}</p>
                                  <p className="text-xs text-slate-600">
                                    {Math.round(food.calories * food.quantity)} cal
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeFood(todayLogs.findIndex(log => log === food))}
                                className="text-red-600 hover:text-red-700 hover:scale-110 transition-all duration-200"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
