"use client"

import { UploadForm } from "@/components/upload-form"
import { NavBar } from "@/components/nav-bar"
import { Zap, FileSearch, Sparkles, ShieldCheck, ArrowRight, Upload, Brain, Heart, Activity } from "lucide-react"
import { HealthCategories } from "@/components/health-categories"
import { PatientSurvey } from "@/components/patient-survey"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section
          className="relative min-h-screen flex items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              'url("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/rune-gradient-bNgBh8P2KFaqyIxeykBR6iX0wNRccx.png")',
          }}
        >
          <div className="container mx-auto px-4 relative z-10 max-w-6xl text-center">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-6xl font-thin text-white mb-6 drop-shadow-lg"
            >
              Understand Your Health with AI-Powered Insights
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-white mb-8 font-light drop-shadow max-w-2xl mx-auto"
            >
              Upload your lab results or take our health survey to get personalized recommendations and insights.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex justify-center space-x-4"
            >
              <Button
                asChild
                className="bg-white text-terra-600 hover:bg-terra-50 px-6 py-3 rounded-md transition-colors text-lg flex items-center"
              >
                <Link href="#upload-section">
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Labs
                </Link>
              </Button>
              <PatientSurvey />
            </motion.div>
          </div>
        </section>

        {/* New Survey Promotion Section */}
        <section className="py-20 bg-gradient-to-r from-sage-100 to-sand-100">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl font-light text-sand-900 mb-6 font-serif"
              >
                Get Personalized AI Health Recommendations
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl text-sand-800 mb-8 font-light"
              >
                Take our comprehensive health survey and receive tailored advice powered by advanced AI algorithms.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="grid md:grid-cols-3 gap-8 mb-12"
              >
                <motion.div whileHover={{ scale: 1.05 }} className="flex flex-col items-center">
                  <Brain className="h-12 w-12 text-terra-600 mb-4" />
                  <h3 className="text-xl font-serif text-sand-900 mb-2">Cognitive Health</h3>
                  <p className="text-sand-700 font-light">Optimize your mental clarity and focus</p>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} className="flex flex-col items-center">
                  <Heart className="h-12 w-12 text-terra-600 mb-4" />
                  <h3 className="text-xl font-serif text-sand-900 mb-2">Heart Health</h3>
                  <p className="text-sand-700 font-light">Improve your cardiovascular well-being</p>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} className="flex flex-col items-center">
                  <Activity className="h-12 w-12 text-terra-600 mb-4" />
                  <h3 className="text-xl font-serif text-sand-900 mb-2">Overall Wellness</h3>
                  <p className="text-sand-700 font-light">Enhance your energy and vitality</p>
                </motion.div>
              </motion.div>
              <PatientSurvey />
            </div>
          </div>
        </section>

        {/* Upload Section */}
        <section id="upload-section" className="py-20 bg-sand-50">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-light text-sand-900 text-center mb-12 font-serif">Upload Your Lab Results</h2>
            <p className="text-xl text-sand-700 text-center mb-8 font-light max-w-2xl mx-auto">
              Get instant, personalized insights powered by artificial intelligence.
            </p>
            <div className="max-w-md mx-auto">
              <UploadForm />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-light text-sand-900 text-center mb-12 font-serif">Why Choose Rune</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Zap,
                  title: "Instant Analysis",
                  description: "Get immediate insights about your blood test results using advanced AI.",
                },
                {
                  icon: FileSearch,
                  title: "Easy to Understand",
                  description: "Complex medical data translated into clear, actionable insights.",
                },
                {
                  icon: Sparkles,
                  title: "AI-Powered Insights",
                  description: "Advanced machine learning algorithms analyze your results for patterns.",
                },
                {
                  icon: ShieldCheck,
                  title: "Secure & Private",
                  description: "Your health data is encrypted and protected with industry standards.",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="p-6 rounded-lg border border-sand-200 bg-white shadow-md hover:shadow-lg transition-shadow"
                >
                  <feature.icon className="h-12 w-12 text-sand-600 mb-4" />
                  <h3 className="text-xl font-serif text-sand-900 mb-2">{feature.title}</h3>
                  <p className="text-sand-700 font-light">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Health Categories Section */}
        <HealthCategories />

        {/* How It Works Section */}
        <section className="py-20 bg-gradient-to-b from-sand-50 to-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-serif text-center text-sand-900 mb-12">How It Works</h2>
            <div className="max-w-3xl mx-auto">
              <div className="space-y-12">
                {[
                  {
                    step: 1,
                    title: "Upload Your Results",
                    description: "Simply upload your PDF blood test results to get started.",
                  },
                  {
                    step: 2,
                    title: "AI Analysis",
                    description: "Our AI analyzes your results and generates personalized insights.",
                  },
                  {
                    step: 3,
                    title: "Get Insights",
                    description: "Review easy-to-understand visualizations and recommendations for your health.",
                  },
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-sand-600 text-white flex items-center justify-center text-xl font-bold">
                      {item.step}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-serif text-sand-900 mb-2">{item.title}</h3>
                      <p className="text-sand-700 font-light">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-sand-100">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-serif text-sand-900 mb-6">
              Ready to Understand Your Health Better?
            </h2>
            <p className="text-xl text-sand-700 mb-8 font-light max-w-2xl mx-auto">
              Join thousands of users who are taking control of their health with AI-powered insights.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                className="bg-terra-600 hover:bg-terra-700 text-white px-6 py-3 rounded-md transition-colors"
              >
                <Link href="/get-started">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="px-6 py-3">
                <Link href="/auth">Already have an account? Login</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

