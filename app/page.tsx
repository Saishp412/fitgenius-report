import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Target, TrendingUp, Calendar, Shield, Mail, Phone, MapPin } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold font-display text-emerald-600">
            FitGenius
          </div>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-700 hover:text-emerald-600 font-medium">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="btn-primary">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="w-24 h-24 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Target className="h-12 w-12 text-emerald-600" />
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold font-display mb-6 text-slate-900">
            Your Personal
            <br />
            <span className="text-emerald-600">Fitness AI</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Get personalized diet and workout recommendations powered by AI. Track your progress, 
            achieve your goals, and transform your health journey with intelligent insights.
          </p>
          <Link href="/register">
            <Button size="lg" className="btn-primary text-lg px-8 py-4">
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold font-display text-slate-900 mb-4">Why Choose FitGenius?</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Experience the future of personalized fitness with our comprehensive platform
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="card-professional group">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-emerald-200 transition-colors">
                <Target className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold font-display mb-3 text-slate-900">Smart Goals</h3>
              <p className="text-slate-600 leading-relaxed">AI-powered recommendations for weight loss, muscle gain, or maintenance based on your profile</p>
            </CardContent>
          </Card>

          <Card className="card-professional group">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold font-display mb-3 text-slate-900">Progress Tracking</h3>
              <p className="text-slate-600 leading-relaxed">Monitor calories, protein intake, and workout performance with detailed analytics</p>
            </CardContent>
          </Card>

          <Card className="card-professional group">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-200 transition-colors">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold font-display mb-3 text-slate-900">Indian Meal Planning</h3>
              <p className="text-slate-600 leading-relaxed">Personalized Indian meal plans with dal, roti, rice, and regional dishes tailored to your preferences</p>
            </CardContent>
          </Card>

          <Card className="card-professional group">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-200 transition-colors">
                <Shield className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold font-display mb-3 text-slate-900">Secure Platform</h3>
              <p className="text-slate-600 leading-relaxed">Enterprise-grade security with encrypted data and secure authentication system</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* About Us Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold font-display text-slate-900 mb-6">About FitGenius</h2>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              FitGenius is India's leading AI-powered fitness platform, designed specifically for Indian lifestyles and dietary preferences. 
              We understand the unique challenges of maintaining health in our fast-paced lives while staying connected to our cultural food traditions.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold font-display mb-2 text-slate-900">Our Mission</h3>
                <p className="text-slate-600">To make fitness accessible and culturally relevant for every Indian, combining traditional wisdom with modern AI technology.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold font-display mb-2 text-slate-900">Our Vision</h3>
                <p className="text-slate-600">To create a healthier India where fitness is seamlessly integrated into daily life through personalized, AI-driven solutions.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold font-display mb-2 text-slate-900">Our Values</h3>
                <p className="text-slate-600">Privacy, authenticity, and cultural sensitivity guide everything we do, ensuring your health journey respects your lifestyle.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold font-display text-slate-900 mb-4">Get in Touch</h2>
            <p className="text-xl text-slate-600">Have questions? We're here to help you on your fitness journey.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card-professional text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Mail className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold font-display mb-3 text-slate-900">Email Us</h3>
                <p className="text-slate-600 mb-4">Get support or ask questions</p>
                <a href="mailto:support@fitgenius.in" className="text-emerald-600 hover:text-emerald-700 font-medium">
                  support@fitgenius.in
                </a>
              </CardContent>
            </Card>

            <Card className="card-professional text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Phone className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold font-display mb-3 text-slate-900">Call Us</h3>
                <p className="text-slate-600 mb-4">Speak with our support team</p>
                <a href="Phn:022 4078932" className="text-blue-600 hover:text-blue-700 font-medium">
                  +91 12345 67890
                </a>
              </CardContent>
            </Card>

            <Card className="card-professional text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <MapPin className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold font-display mb-3 text-slate-900">Visit Us</h3>
                <p className="text-slate-600 mb-4">Our headquarters</p>
                <p className="text-purple-600 font-medium">
                  Bangalore, Karnataka<br />
                  India
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-emerald-600 to-emerald-700 border-0 text-white">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Target className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold font-display mb-4">Ready to Transform Your Health?</h2>
            <p className="text-xl mb-8 text-emerald-100 max-w-2xl mx-auto">
              Join thousands of users who have achieved their fitness goals with FitGenius
            </p>
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4 bg-white text-emerald-600 hover:bg-slate-50">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="text-2xl font-bold font-display text-emerald-400 mb-4">FitGenius</div>
            <p className="text-slate-400 mb-6">Your intelligent fitness companion for Indian lifestyles</p>
            <div className="flex justify-center gap-6 text-sm text-slate-400 mb-6">
              <a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</a>
              <a href="mailto:support@fitgenius.in" className="hover:text-emerald-400 transition-colors">Contact</a>
            </div>
            <p className="text-xs text-slate-500">© 2024 FitGenius. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
