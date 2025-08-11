"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'
import { authService } from '@/lib/auth'

const TOTAL_STEPS = 8

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    // Step 1: How did you find us?
    referralSource: "",
    
    // Step 2: Fitness Experience
    fitnessExperience: "",
    
    // Step 3: Personal Details
    age: "",
    gender: "",
    height: "",
    weight: "",
    
    // Step 4: Goals
    primaryGoal: "",
    targetWeight: "",
    timeline: "",
    
    // Step 5: Lifestyle
    activityLevel: "",
    sleepHours: "",
    stressLevel: "",
    
    // Step 6: Diet Preferences
    dietaryRestrictions: [] as string[],
    allergies: "",
    mealsPerDay: "",
    
    // Step 7: Equipment & Access
    gymAccess: "",
    availableEquipment: [] as string[],
    workoutDays: "",
    sessionDuration: "",
    
    // Step 8: Health & Preferences
    healthConditions: "",
    medications: "",
    preferredWorkoutTime: "",
    motivationFactors: [] as string[]
  })
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("currentUser")
    if (!userData) {
      router.push("/login")
      return
    }
    const parsedUser = JSON.parse(userData)
    if (parsedUser.onboardingCompleted) {
      router.push("/dashboard")
      return
    }
    setUser(parsedUser)
  }, [router])

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleArrayUpdate = (field: string, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field as keyof typeof prev] as string[]), value]
        : (prev[field as keyof typeof prev] as string[]).filter(item => item !== value)
    }))
  }

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const calculateRecommendations = () => {
    const age = parseInt(formData.age)
    const weight = parseFloat(formData.weight)
    const height = parseFloat(formData.height)
    const heightInMeters = height / 100
    
    // Calculate BMI
    const bmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1))
    
    // Calculate BMR (Basal Metabolic Rate)
    let bmr = 0
    if (formData.gender === "male") {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
    } else {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
    }
    
    // Activity multiplier
    const activityMultipliers = {
      "sedentary": 1.2,
      "lightly-active": 1.375,
      "moderately-active": 1.55,
      "very-active": 1.725,
      "extremely-active": 1.9
    }
    
    const activityMultiplier = activityMultipliers[formData.activityLevel as keyof typeof activityMultipliers] || 1.2
    const tdee = bmr * activityMultiplier
    
    // Adjust calories based on goal
    let calorieGoal = tdee
    if (formData.primaryGoal === "weight-loss") {
      calorieGoal = tdee - 500 // 500 calorie deficit
    } else if (formData.primaryGoal === "muscle-gain") {
      calorieGoal = tdee + 300 // 300 calorie surplus
    }
    
    // Protein goal (1.6-2.2g per kg body weight)
    const proteinGoal = Math.round(weight * 1.8)
    
    // Workout frequency
    const workoutFrequency = parseInt(formData.workoutDays) || 3
    
    return {
      calorieGoal: Math.round(calorieGoal),
      proteinGoal,
      bmi,
      workoutFrequency,
      sessionDuration: formData.sessionDuration
    }
  }

  const completeOnboarding = async () => {
    if (!user) return

    const recommendations = calculateRecommendations()
    
    const updatedUser = {
      ...user,
      onboardingCompleted: true,
      profile: formData,
      recommendations,
      dailyLogs: []
    }

    // Update user in auth service
    const result = authService.updateUser(user.id, updatedUser)
    
    if (result.success) {
      localStorage.setItem("currentUser", JSON.stringify(result.user))
      router.push("/dashboard")
    }
  }

  const progress = (currentStep / TOTAL_STEPS) * 100

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome to FitGenius!</h2>
              <p className="text-slate-600">Let's personalize your fitness journey</p>
            </div>
            <div>
              <Label htmlFor="referralSource">How did you find us? *</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {["Google Search", "Social Media", "Friend Referral", "Advertisement", "App Store", "Other"].map((source) => (
                  <Button
                    key={source}
                    type="button"
                    variant={formData.referralSource === source ? "default" : "outline"}
                    className="justify-start hover:scale-105 transition-all duration-200"
                    onClick={() => updateFormData("referralSource", source)}
                  >
                    {source}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Your Fitness Experience</h2>
              <p className="text-slate-600">Help us understand your current fitness level</p>
            </div>
            <div>
              <Label htmlFor="fitnessExperience">What's your fitness experience? *</Label>
              <div className="grid grid-cols-1 gap-3 mt-2">
                {[
                  "Beginner (Just starting out)",
                  "Intermediate (6 months - 2 years)",
                  "Advanced (2+ years)",
                  "Expert (5+ years, competitive)"
                ].map((level) => (
                  <Button
                    key={level}
                    type="button"
                    variant={formData.fitnessExperience === level ? "default" : "outline"}
                    className="justify-start hover:scale-105 transition-all duration-200"
                    onClick={() => updateFormData("fitnessExperience", level)}
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Personal Details</h2>
              <p className="text-slate-600">We need these to calculate your personalized plan</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="25"
                  value={formData.age}
                  onChange={(e) => updateFormData("age", e.target.value)}
                  className="transition-all duration-200 focus:scale-105"
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender *</Label>
                <div className="flex gap-2 mt-2">
                  {["male", "female", "other"].map((gender) => (
                    <Button
                      key={gender}
                      type="button"
                      variant={formData.gender === gender ? "default" : "outline"}
                      className="flex-1 hover:scale-105 transition-all duration-200"
                      onClick={() => updateFormData("gender", gender)}
                    >
                      {gender.charAt(0).toUpperCase() + gender.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="height">Height (cm) *</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="170"
                  value={formData.height}
                  onChange={(e) => updateFormData("height", e.target.value)}
                  className="transition-all duration-200 focus:scale-105"
                />
              </div>
              <div>
                <Label htmlFor="weight">Weight (kg) *</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="70"
                  value={formData.weight}
                  onChange={(e) => updateFormData("weight", e.target.value)}
                  className="transition-all duration-200 focus:scale-105"
                />
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Your Goals</h2>
              <p className="text-slate-600">What do you want to achieve?</p>
            </div>
            <div>
              <Label htmlFor="primaryGoal">Primary Goal *</Label>
              <div className="grid grid-cols-1 gap-3 mt-2">
                {[
                  { value: "weight-loss", label: "Weight Loss", desc: "Lose fat and get leaner" },
                  { value: "muscle-gain", label: "Muscle Gain", desc: "Build muscle and strength" },
                  { value: "maintenance", label: "Maintenance", desc: "Stay healthy and fit" }
                ].map((goal) => (
                  <Button
                    key={goal.value}
                    type="button"
                    variant={formData.primaryGoal === goal.value ? "default" : "outline"}
                    className="justify-start h-auto p-4 hover:scale-105 transition-all duration-200"
                    onClick={() => updateFormData("primaryGoal", goal.value)}
                  >
                    <div className="text-left">
                      <div className="font-semibold">{goal.label}</div>
                      <div className="text-sm opacity-70">{goal.desc}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="targetWeight">Target Weight (kg)</Label>
                <Input
                  id="targetWeight"
                  type="number"
                  placeholder="65"
                  value={formData.targetWeight}
                  onChange={(e) => updateFormData("targetWeight", e.target.value)}
                  className="transition-all duration-200 focus:scale-105"
                />
              </div>
              <div>
                <Label htmlFor="timeline">Timeline *</Label>
                <div className="flex gap-2 mt-2">
                  {["3 months", "6 months", "1 year"].map((time) => (
                    <Button
                      key={time}
                      type="button"
                      variant={formData.timeline === time ? "default" : "outline"}
                      className="flex-1 hover:scale-105 transition-all duration-200"
                      onClick={() => updateFormData("timeline", time)}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Your Lifestyle</h2>
              <p className="text-slate-600">Tell us about your daily routine</p>
            </div>
            <div>
              <Label htmlFor="activityLevel">Activity Level *</Label>
              <div className="grid grid-cols-1 gap-3 mt-2">
                {[
                  { value: "sedentary", label: "Sedentary", desc: "Desk job, little exercise" },
                  { value: "lightly-active", label: "Lightly Active", desc: "Light exercise 1-3 days/week" },
                  { value: "moderately-active", label: "Moderately Active", desc: "Moderate exercise 3-5 days/week" },
                  { value: "very-active", label: "Very Active", desc: "Hard exercise 6-7 days/week" },
                  { value: "extremely-active", label: "Extremely Active", desc: "Physical job + exercise" }
                ].map((level) => (
                  <Button
                    key={level.value}
                    type="button"
                    variant={formData.activityLevel === level.value ? "default" : "outline"}
                    className="justify-start h-auto p-4 hover:scale-105 transition-all duration-200"
                    onClick={() => updateFormData("activityLevel", level.value)}
                  >
                    <div className="text-left">
                      <div className="font-semibold">{level.label}</div>
                      <div className="text-sm opacity-70">{level.desc}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sleepHours">Sleep Hours/Night *</Label>
                <Input
                  id="sleepHours"
                  type="number"
                  placeholder="7"
                  value={formData.sleepHours}
                  onChange={(e) => updateFormData("sleepHours", e.target.value)}
                  className="transition-all duration-200 focus:scale-105"
                />
              </div>
              <div>
                <Label htmlFor="stressLevel">Stress Level (1-10) *</Label>
                <Input
                  id="stressLevel"
                  type="number"
                  min="1"
                  max="10"
                  placeholder="5"
                  value={formData.stressLevel}
                  onChange={(e) => updateFormData("stressLevel", e.target.value)}
                  className="transition-all duration-200 focus:scale-105"
                />
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Diet Preferences</h2>
              <p className="text-slate-600">Help us customize your meal plans</p>
            </div>
            <div>
              <Label>Dietary Restrictions (select all that apply)</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {["Vegetarian", "Vegan", "Keto", "Paleo", "Gluten-Free", "Dairy-Free"].map((restriction) => (
                  <div key={restriction} className="flex items-center space-x-2">
                    <Checkbox
                      id={restriction}
                      checked={formData.dietaryRestrictions.includes(restriction)}
                      onCheckedChange={(checked) => handleArrayUpdate("dietaryRestrictions", restriction, checked as boolean)}
                    />
                    <Label htmlFor={restriction} className="text-sm">{restriction}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="allergies">Food Allergies</Label>
              <Textarea
                id="allergies"
                placeholder="List any food allergies or intolerances..."
                value={formData.allergies}
                onChange={(e) => updateFormData("allergies", e.target.value)}
                className="transition-all duration-200 focus:scale-105"
              />
            </div>
            <div>
              <Label htmlFor="mealsPerDay">Meals Per Day *</Label>
              <div className="flex gap-2 mt-2">
                {["3", "4", "5", "6"].map((meals) => (
                  <Button
                    key={meals}
                    type="button"
                    variant={formData.mealsPerDay === meals ? "default" : "outline"}
                    className="flex-1 hover:scale-105 transition-all duration-200"
                    onClick={() => updateFormData("mealsPerDay", meals)}
                  >
                    {meals} meals
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Equipment & Access</h2>
              <p className="text-slate-600">What do you have access to?</p>
            </div>
            <div>
              <Label htmlFor="gymAccess">Gym Access *</Label>
              <div className="grid grid-cols-1 gap-3 mt-2">
                {[
                  { value: "full-gym", label: "Full Gym Access", desc: "Commercial gym with all equipment" },
                  { value: "home-gym", label: "Home Gym", desc: "Personal equipment at home" },
                  { value: "basic-equipment", label: "Basic Equipment", desc: "Dumbbells, resistance bands" },
                  { value: "no-gym", label: "No Equipment", desc: "Bodyweight exercises only" }
                ].map((access) => (
                  <Button
                    key={access.value}
                    type="button"
                    variant={formData.gymAccess === access.value ? "default" : "outline"}
                    className="justify-start h-auto p-4 hover:scale-105 transition-all duration-200"
                    onClick={() => updateFormData("gymAccess", access.value)}
                  >
                    <div className="text-left">
                      <div className="font-semibold">{access.label}</div>
                      <div className="text-sm opacity-70">{access.desc}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label>Available Equipment (select all that apply)</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {["Dumbbells", "Barbell", "Resistance Bands", "Pull-up Bar", "Treadmill", "None (Bodyweight)"].map((equipment) => (
                  <div key={equipment} className="flex items-center space-x-2">
                    <Checkbox
                      id={equipment}
                      checked={formData.availableEquipment.includes(equipment)}
                      onCheckedChange={(checked) => handleArrayUpdate("availableEquipment", equipment, checked as boolean)}
                    />
                    <Label htmlFor={equipment} className="text-sm">{equipment}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="workoutDays">Workout Days/Week *</Label>
                <Input
                  id="workoutDays"
                  type="number"
                  min="1"
                  max="7"
                  placeholder="3"
                  value={formData.workoutDays}
                  onChange={(e) => updateFormData("workoutDays", e.target.value)}
                  className="transition-all duration-200 focus:scale-105"
                />
              </div>
              <div>
                <Label htmlFor="sessionDuration">Session Duration *</Label>
                <div className="flex gap-2 mt-2">
                  {["30 min", "45 min", "60 min", "90 min"].map((duration) => (
                    <Button
                      key={duration}
                      type="button"
                      variant={formData.sessionDuration === duration ? "default" : "outline"}
                      className="flex-1 text-xs hover:scale-105 transition-all duration-200"
                      onClick={() => updateFormData("sessionDuration", duration)}
                    >
                      {duration}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 8:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Health & Preferences</h2>
              <p className="text-slate-600">Final details to personalize your experience</p>
            </div>
            <div>
              <Label htmlFor="healthConditions">Health Conditions</Label>
              <Textarea
                id="healthConditions"
                placeholder="Any health conditions we should know about..."
                value={formData.healthConditions}
                onChange={(e) => updateFormData("healthConditions", e.target.value)}
                className="transition-all duration-200 focus:scale-105"
              />
            </div>
            <div>
              <Label htmlFor="medications">Current Medications</Label>
              <Textarea
                id="medications"
                placeholder="List any medications you're taking..."
                value={formData.medications}
                onChange={(e) => updateFormData("medications", e.target.value)}
                className="transition-all duration-200 focus:scale-105"
              />
            </div>
            <div>
              <Label htmlFor="preferredWorkoutTime">Preferred Workout Time *</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {["Early Morning", "Morning", "Afternoon", "Evening"].map((time) => (
                  <Button
                    key={time}
                    type="button"
                    variant={formData.preferredWorkoutTime === time ? "default" : "outline"}
                    className="hover:scale-105 transition-all duration-200"
                    onClick={() => updateFormData("preferredWorkoutTime", time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label>What motivates you? (select all that apply)</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {["Health", "Appearance", "Strength", "Energy", "Confidence", "Competition"].map((factor) => (
                  <div key={factor} className="flex items-center space-x-2">
                    <Checkbox
                      id={factor}
                      checked={formData.motivationFactors.includes(factor)}
                      onCheckedChange={(checked) => handleArrayUpdate("motivationFactors", factor, checked as boolean)}
                    />
                    <Label htmlFor={factor} className="text-sm">{factor}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return formData.referralSource !== ""
      case 2: return formData.fitnessExperience !== ""
      case 3: return formData.age !== "" && formData.gender !== "" && formData.height !== "" && formData.weight !== ""
      case 4: return formData.primaryGoal !== "" && formData.timeline !== ""
      case 5: return formData.activityLevel !== "" && formData.sleepHours !== "" && formData.stressLevel !== ""
      case 6: return formData.mealsPerDay !== ""
      case 7: return formData.gymAccess !== "" && formData.workoutDays !== "" && formData.sessionDuration !== ""
      case 8: return formData.preferredWorkoutTime !== ""
      default: return false
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-16 h-16 bg-emerald-200/20 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute top-60 right-20 w-12 h-12 bg-teal-200/20 rounded-full animate-pulse delay-500"></div>
        <div className="absolute bottom-40 left-20 w-20 h-20 bg-cyan-200/20 rounded-full animate-bounce delay-700"></div>
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Setup Your Profile
            </h1>
            <span className="text-sm text-slate-600">
              Step {currentStep} of {TOTAL_STEPS}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Main Card */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-500">
          <CardContent className="p-8">
            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="hover:scale-105 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          {currentStep === TOTAL_STEPS ? (
            <Button
              onClick={completeOnboarding}
              disabled={!isStepValid()}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Setup
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!isStepValid()}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
