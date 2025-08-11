"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Play, Pause, RotateCcw, CheckCircle, Timer, Dumbbell, Target } from 'lucide-react'
import { authService } from '@/lib/auth'

interface Exercise {
  name: string
  sets: number
  reps: string
  rest: string
  completed: boolean
}

interface Workout {
  id: string
  name: string
  type: string
  duration: string
  difficulty: string
  exercises: Exercise[]
}

const SAMPLE_WORKOUTS: Workout[] = [
  {
    id: "1",
    name: "Full Body Strength",
    type: "Strength",
    duration: "45 min",
    difficulty: "Intermediate",
    exercises: [
      { name: "Push-ups", sets: 3, reps: "10-15", rest: "60s", completed: false },
      { name: "Squats", sets: 3, reps: "15-20", rest: "60s", completed: false },
      { name: "Plank", sets: 3, reps: "30-60s", rest: "45s", completed: false },
      { name: "Lunges", sets: 3, reps: "10 each leg", rest: "60s", completed: false }
    ]
  },
  {
    id: "2",
    name: "HIIT Fat Burner",
    type: "Cardio",
    duration: "30 min",
    difficulty: "Advanced",
    exercises: [
      { name: "Jumping Jacks", sets: 4, reps: "30s", rest: "30s", completed: false },
      { name: "Burpees", sets: 4, reps: "10", rest: "45s", completed: false },
      { name: "Mountain Climbers", sets: 4, reps: "20", rest: "30s", completed: false },
      { name: "High Knees", sets: 4, reps: "30s", rest: "30s", completed: false }
    ]
  },
  {
    id: "3",
    name: "Upper Body Focus",
    type: "Strength",
    duration: "40 min",
    difficulty: "Beginner",
    exercises: [
      { name: "Wall Push-ups", sets: 3, reps: "8-12", rest: "60s", completed: false },
      { name: "Arm Circles", sets: 3, reps: "15 each direction", rest: "30s", completed: false },
      { name: "Pike Push-ups", sets: 3, reps: "5-8", rest: "60s", completed: false },
      { name: "Tricep Dips", sets: 3, reps: "8-12", rest: "60s", completed: false }
    ]
  }
]

export default function WorkoutsPage() {
  const [user, setUser] = useState<any>(null)
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)
  const [currentExercise, setCurrentExercise] = useState(0)
  const [isWorkoutActive, setIsWorkoutActive] = useState(false)
  const [timer, setTimer] = useState(0)
  const [isResting, setIsResting] = useState(false)
  const [restTimer, setRestTimer] = useState(0)
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

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isWorkoutActive && !isResting) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isWorkoutActive, isResting])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => {
          if (prev <= 1) {
            setIsResting(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isResting, restTimer])

  const startWorkout = (workout: Workout) => {
    setSelectedWorkout({
      ...workout,
      exercises: workout.exercises.map(ex => ({ ...ex, completed: false }))
    })
    setCurrentExercise(0)
    setIsWorkoutActive(true)
    setTimer(0)
  }

  const completeExercise = () => {
    if (!selectedWorkout) return

    const updatedWorkout = { ...selectedWorkout }
    updatedWorkout.exercises[currentExercise].completed = true
    setSelectedWorkout(updatedWorkout)

    // Start rest timer
    const restTime = parseInt(updatedWorkout.exercises[currentExercise].rest)
    if (restTime > 0) {
      setRestTimer(restTime)
      setIsResting(true)
    }

    // Move to next exercise or complete workout
    if (currentExercise < updatedWorkout.exercises.length - 1) {
      setTimeout(() => {
        setCurrentExercise(prev => prev + 1)
      }, isResting ? restTime * 1000 : 1000)
    } else {
      // Workout completed
      completeWorkout()
    }
  }

  const completeWorkout = () => {
    if (!user || !selectedWorkout) return

    // Update user's workout count
    const today = new Date().toDateString()
    const dailyLogs = user.dailyLogs || []
    const existingLogIndex = dailyLogs.findIndex((log: any) => log.date === today)
    
    const todayLog = {
      date: today,
      calories: existingLogIndex >= 0 ? dailyLogs[existingLogIndex].calories : 0,
      protein: existingLogIndex >= 0 ? dailyLogs[existingLogIndex].protein : 0,
      workouts: existingLogIndex >= 0 ? dailyLogs[existingLogIndex].workouts + 1 : 1,
      foods: existingLogIndex >= 0 ? dailyLogs[existingLogIndex].foods : []
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

    // Reset workout state
    setIsWorkoutActive(false)
    setSelectedWorkout(null)
    setCurrentExercise(0)
    setTimer(0)
    setIsResting(false)
    setRestTimer(0)
  }

  const resetWorkout = () => {
    setIsWorkoutActive(false)
    setSelectedWorkout(null)
    setCurrentExercise(0)
    setTimer(0)
    setIsResting(false)
    setRestTimer(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getWorkoutProgress = () => {
    if (!selectedWorkout) return 0
    const completedExercises = selectedWorkout.exercises.filter(ex => ex.completed).length
    return (completedExercises / selectedWorkout.exercises.length) * 100
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner": return "bg-green-100 text-green-800"
      case "intermediate": return "bg-yellow-100 text-yellow-800"
      case "advanced": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "strength": return "bg-blue-100 text-blue-800"
      case "cardio": return "bg-orange-100 text-orange-800"
      case "flexibility": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (!user) return null

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
            Workouts
          </h1>
          <div className="w-24"></div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {!selectedWorkout ? (
          // Workout Selection
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Choose Your Workout</h2>
              <p className="text-slate-600">Select a workout that matches your goals and fitness level</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SAMPLE_WORKOUTS.map((workout) => (
                <Card key={workout.id} className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-xl text-slate-800">{workout.name}</CardTitle>
                      <div className="flex gap-2">
                        <Badge className={getDifficultyColor(workout.difficulty)}>
                          {workout.difficulty}
                        </Badge>
                        <Badge className={getTypeColor(workout.type)}>
                          {workout.type}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="flex items-center gap-4 text-slate-600">
                      <span className="flex items-center gap-1">
                        <Timer className="h-4 w-4" />
                        {workout.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        {workout.exercises.length} exercises
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <img 
                        src={`/placeholder.svg?height=150&width=250&text=${workout.type}+Workout`} 
                        alt={workout.name}
                        className="w-full h-32 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="space-y-2 mb-4">
                      <h4 className="font-semibold text-slate-800">Exercises:</h4>
                      <div className="text-sm text-slate-600 space-y-1">
                        {workout.exercises.slice(0, 3).map((exercise, index) => (
                          <div key={index} className="flex justify-between">
                            <span>{exercise.name}</span>
                            <span>{exercise.sets} sets</span>
                          </div>
                        ))}
                        {workout.exercises.length > 3 && (
                          <div className="text-xs text-slate-500">
                            +{workout.exercises.length - 3} more exercises
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => startWorkout(workout)}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Workout
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          // Active Workout
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Workout Header */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl text-slate-800 mb-2">{selectedWorkout.name}</CardTitle>
                    <div className="flex items-center gap-4 text-slate-600">
                      <span className="flex items-center gap-1">
                        <Timer className="h-4 w-4" />
                        {formatTime(timer)}
                      </span>
                      <Badge className={getDifficultyColor(selectedWorkout.difficulty)}>
                        {selectedWorkout.difficulty}
                      </Badge>
                      <Badge className={getTypeColor(selectedWorkout.type)}>
                        {selectedWorkout.type}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={resetWorkout}
                    className="hover:scale-105 transition-all duration-200"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
                <Progress value={getWorkoutProgress()} className="mt-4" />
                <p className="text-sm text-slate-600 mt-2">
                  Exercise {currentExercise + 1} of {selectedWorkout.exercises.length}
                </p>
              </CardHeader>
            </Card>

            {/* Current Exercise */}
            {isResting ? (
              <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 shadow-lg">
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-bold text-blue-800 mb-2">Rest Time</h3>
                  <div className="text-4xl font-bold text-blue-600 mb-4">
                    {formatTime(restTimer)}
                  </div>
                  <p className="text-blue-700">Get ready for the next exercise!</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <h3 className="text-3xl font-bold text-slate-800 mb-2">
                      {selectedWorkout.exercises[currentExercise].name}
                    </h3>
                    <div className="flex justify-center gap-6 text-slate-600">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-600">
                          {selectedWorkout.exercises[currentExercise].sets}
                        </div>
                        <div className="text-sm">Sets</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-teal-600">
                          {selectedWorkout.exercises[currentExercise].reps}
                        </div>
                        <div className="text-sm">Reps</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-cyan-600">
                          {selectedWorkout.exercises[currentExercise].rest}
                        </div>
                        <div className="text-sm">Rest</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      onClick={completeExercise}
                      size="lg"
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl px-8 py-4"
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Complete Exercise
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Exercise List */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="h-5 w-5 text-emerald-600" />
                  Exercise List
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedWorkout.exercises.map((exercise, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
                        index === currentExercise
                          ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 scale-105'
                          : exercise.completed
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                          : 'bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          exercise.completed
                            ? 'bg-green-500 text-white'
                            : index === currentExercise
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-300 text-slate-600'
                        }`}>
                          {exercise.completed ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <span className="text-sm font-bold">{index + 1}</span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800">{exercise.name}</h4>
                          <p className="text-sm text-slate-600">
                            {exercise.sets} sets × {exercise.reps} • Rest: {exercise.rest}
                          </p>
                        </div>
                      </div>
                      {index === currentExercise && (
                        <Badge className="bg-emerald-100 text-emerald-800 animate-pulse">
                          Current
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
