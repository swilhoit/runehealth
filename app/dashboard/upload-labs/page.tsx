"use client"

import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText } from "lucide-react"
import { motion } from "framer-motion"
import { UploadForm } from "@/components/upload-form"

export default function UploadLabsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-thin text-sand-900 mb-2">Upload Lab Results</h1>
        <p className="text-sand-600 font-light">Upload your blood test results for AI-powered analysis</p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <div className="grid gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="bg-white/80 backdrop-blur-sm border-sand-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-light">
                  <Upload className="h-5 w-5 text-terra-600" />
                  Upload New Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UploadForm />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-sand-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-light">
                  <FileText className="h-5 w-5 text-terra-600" />
                  Upload Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sand-700">
                  <p>To ensure the best analysis of your lab results:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Upload PDF files only</li>
                    <li>Ensure the file is clear and readable</li>
                    <li>Maximum file size is 10MB</li>
                    <li>Include complete lab report with reference ranges</li>
                    <li>Make sure personal information is clearly visible</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Suspense>
    </div>
  )
}

