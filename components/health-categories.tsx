"use client"

import type React from "react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface SymptomProps {
  children: React.ReactNode
  className?: string
}

function Symptom({ children, className }: SymptomProps) {
  return (
    <Badge
      variant="outline"
      className={cn("bg-[#E4D9CB] text-[#725556] border-[#ECE8E6] hover:bg-[#E4D9CB]/80 hover:text-[#725556]", className)}
    >
      {children}
    </Badge>
  )
}

function Biomarker({ children, className }: SymptomProps) {
  return (
    <Badge
      variant="outline"
      className={cn("bg-[#e5e7e4] text-[#4b524a] border-[#c5c8c4] hover:bg-[#e5e7e4] hover:text-[#4b524a]", className)}
    >
      {children}
    </Badge>
  )
}

export function HealthCategories() {
  return (
    <section className="py-24 bg-[#f5f3f0]">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-6">
            <AccordionItem value="hormones" className="border-b border-gray-200">
              <AccordionTrigger className="text-4xl font-light text-gray-900 hover:no-underline">
                Hormones
              </AccordionTrigger>
              <AccordionContent className="pt-6">
                <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
                  Hormones are your body's messengers, carrying signals through the blood to activate organs, skin,
                  muscles, and other tissues. For men, key hormone levels like testosterone decline steadily from your
                  mid-30s. For women, hormone levels drop precipitously during menopause, typically occurring in your
                  40s and 50s.
                </p>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 tracking-wider">COMMON SYMPTOMS</h3>
                    <div className="flex flex-wrap gap-2">
                      <Symptom>Low Energy</Symptom>
                      <Symptom>Low Libido</Symptom>
                      <Symptom>Poor Sleep</Symptom>
                      <Symptom>Weight Changes</Symptom>
                      <Symptom>Hair Loss</Symptom>
                      <Symptom>Heat or Cold Intolerance</Symptom>
                      <Symptom>Difficulty Concentrating</Symptom>
                      <Symptom>Brain Fog</Symptom>
                      <Symptom>Mood Changes</Symptom>
                      <Symptom>Hot Flashes</Symptom>
                      <Symptom>Worsening PMS</Symptom>
                      <Symptom>Food Cravings</Symptom>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 tracking-wider">BIOMARKERS TESTED</h3>
                    <div className="flex flex-wrap gap-2">
                      <Biomarker>Total Testosterone</Biomarker>
                      <Biomarker>Free Testosterone</Biomarker>
                      <Biomarker>Sex Hormone Binding Globulin</Biomarker>
                      <Biomarker>Dehydroepiandrosterone Sulfate</Biomarker>
                      <Biomarker>Estradiol</Biomarker>
                      <Biomarker>Progesterone</Biomarker>
                      <Biomarker>Insulin-Like Growth Factor 1</Biomarker>
                      <Biomarker>Follicle-Stimulating Hormone</Biomarker>
                      <Biomarker>Luteinizing Hormone</Biomarker>
                      <Biomarker>Thyroid Stimulating Hormone</Biomarker>
                      <Biomarker>*Insulin</Biomarker>
                      <Biomarker>*Adiponectin</Biomarker>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">* Only included in add-on advanced biomarker panels.</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="vitality" className="border-b border-gray-200">
              <AccordionTrigger className="text-4xl font-light text-gray-900 hover:no-underline">
                Vitality
              </AccordionTrigger>
              <AccordionContent className="pt-6">
                <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
                  Vitality reflects your body's energy systems and overall metabolic health. These biomarkers help
                  identify factors that may be draining your energy or affecting your daily performance. Understanding
                  these markers can help optimize your energy levels, sleep quality, and overall well-being.
                </p>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 tracking-wider">COMMON SYMPTOMS</h3>
                    <div className="flex flex-wrap gap-2">
                      <Symptom>Fatigue</Symptom>
                      <Symptom>Afternoon Crashes</Symptom>
                      <Symptom>Poor Recovery</Symptom>
                      <Symptom>Sleep Issues</Symptom>
                      <Symptom>Digestive Problems</Symptom>
                      <Symptom>Frequent Illness</Symptom>
                      <Symptom>Low Stress Tolerance</Symptom>
                      <Symptom>Reduced Exercise Capacity</Symptom>
                      <Symptom>Slow Wound Healing</Symptom>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 tracking-wider">BIOMARKERS TESTED</h3>
                    <div className="flex flex-wrap gap-2">
                      <Biomarker>Vitamin B12</Biomarker>
                      <Biomarker>Vitamin D</Biomarker>
                      <Biomarker>Iron</Biomarker>
                      <Biomarker>Ferritin</Biomarker>
                      <Biomarker>Magnesium</Biomarker>
                      <Biomarker>Zinc</Biomarker>
                      <Biomarker>Cortisol</Biomarker>
                      <Biomarker>DHEA</Biomarker>
                      <Biomarker>*Melatonin</Biomarker>
                      <Biomarker>*CoQ10</Biomarker>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">* Only included in add-on advanced biomarker panels.</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="cardiac-risk" className="border-b border-gray-200">
              <AccordionTrigger className="text-4xl font-light text-gray-900 hover:no-underline">
                Cardiac Risk
              </AccordionTrigger>
              <AccordionContent className="pt-6">
                <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
                  Cardiovascular health is crucial for longevity and quality of life. Our comprehensive cardiac risk
                  assessment looks beyond traditional cholesterol tests to evaluate inflammation, blood vessel health,
                  and other key indicators of heart disease risk.
                </p>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 tracking-wider">COMMON SYMPTOMS</h3>
                    <div className="flex flex-wrap gap-2">
                      <Symptom>High Blood Pressure</Symptom>
                      <Symptom>Chest Discomfort</Symptom>
                      <Symptom>Shortness of Breath</Symptom>
                      <Symptom>Irregular Heartbeat</Symptom>
                      <Symptom>Swelling in Legs</Symptom>
                      <Symptom>Fatigue</Symptom>
                      <Symptom>Dizziness</Symptom>
                      <Symptom>Family History</Symptom>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 tracking-wider">BIOMARKERS TESTED</h3>
                    <div className="flex flex-wrap gap-2">
                      <Biomarker>Total Cholesterol</Biomarker>
                      <Biomarker>LDL Cholesterol</Biomarker>
                      <Biomarker>HDL Cholesterol</Biomarker>
                      <Biomarker>Triglycerides</Biomarker>
                      <Biomarker>hsCRP</Biomarker>
                      <Biomarker>Homocysteine</Biomarker>
                      <Biomarker>Apolipoprotein B</Biomarker>
                      <Biomarker>Lipoprotein(a)</Biomarker>
                      <Biomarker>*NT-proBNP</Biomarker>
                      <Biomarker>*Oxidized LDL</Biomarker>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">* Only included in add-on advanced biomarker panels.</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="weight-loss" className="border-b border-gray-200">
              <AccordionTrigger className="text-4xl font-light text-gray-900 hover:no-underline">
                Weight Loss
              </AccordionTrigger>
              <AccordionContent className="pt-6">
                <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
                  Weight management is complex and influenced by multiple metabolic factors. Our analysis identifies
                  hormonal imbalances, inflammation markers, and metabolic factors that might be making it harder for
                  you to reach your weight goals.
                </p>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 tracking-wider">COMMON SYMPTOMS</h3>
                    <div className="flex flex-wrap gap-2">
                      <Symptom>Weight Gain</Symptom>
                      <Symptom>Difficulty Losing Weight</Symptom>
                      <Symptom>Sugar Cravings</Symptom>
                      <Symptom>Increased Appetite</Symptom>
                      <Symptom>Belly Fat</Symptom>
                      <Symptom>Energy Crashes</Symptom>
                      <Symptom>Water Retention</Symptom>
                      <Symptom>Mood Changes</Symptom>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 tracking-wider">BIOMARKERS TESTED</h3>
                    <div className="flex flex-wrap gap-2">
                      <Biomarker>Insulin</Biomarker>
                      <Biomarker>Glucose</Biomarker>
                      <Biomarker>HbA1c</Biomarker>
                      <Biomarker>Leptin</Biomarker>
                      <Biomarker>Cortisol</Biomarker>
                      <Biomarker>Thyroid Panel</Biomarker>
                      <Biomarker>*Ghrelin</Biomarker>
                      <Biomarker>*GLP-1</Biomarker>
                      <Biomarker>*Adiponectin</Biomarker>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">* Only included in add-on advanced biomarker panels.</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="strength" className="border-b border-gray-200">
              <AccordionTrigger className="text-4xl font-light text-gray-900 hover:no-underline">
                Strength
              </AccordionTrigger>
              <AccordionContent className="pt-6">
                <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
                  Muscle strength and recovery are influenced by various hormones, nutrients, and metabolic factors.
                  Understanding these biomarkers can help optimize your training, recovery, and muscle-building
                  potential while preventing overtraining and injury.
                </p>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 tracking-wider">COMMON SYMPTOMS</h3>
                    <div className="flex flex-wrap gap-2">
                      <Symptom>Muscle Weakness</Symptom>
                      <Symptom>Poor Recovery</Symptom>
                      <Symptom>Decreased Performance</Symptom>
                      <Symptom>Joint Pain</Symptom>
                      <Symptom>Muscle Loss</Symptom>
                      <Symptom>Fatigue</Symptom>
                      <Symptom>Slow Progress</Symptom>
                      <Symptom>Frequent Injuries</Symptom>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 tracking-wider">BIOMARKERS TESTED</h3>
                    <div className="flex flex-wrap gap-2">
                      <Biomarker>Testosterone</Biomarker>
                      <Biomarker>Growth Hormone</Biomarker>
                      <Biomarker>IGF-1</Biomarker>
                      <Biomarker>Creatine Kinase</Biomarker>
                      <Biomarker>Vitamin D</Biomarker>
                      <Biomarker>Magnesium</Biomarker>
                      <Biomarker>*Myostatin</Biomarker>
                      <Biomarker>*IL-6</Biomarker>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">* Only included in add-on advanced biomarker panels.</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="brain-health" className="border-b border-gray-200">
              <AccordionTrigger className="text-4xl font-light text-gray-900 hover:no-underline">
                Brain Health
              </AccordionTrigger>
              <AccordionContent className="pt-6">
                <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
                  Cognitive function and mental clarity are affected by numerous biochemical factors. Our brain health
                  panel examines key markers that influence memory, focus, mood, and long-term cognitive health, helping
                  you optimize your mental performance.
                </p>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 tracking-wider">COMMON SYMPTOMS</h3>
                    <div className="flex flex-wrap gap-2">
                      <Symptom>Brain Fog</Symptom>
                      <Symptom>Poor Memory</Symptom>
                      <Symptom>Difficulty Focusing</Symptom>
                      <Symptom>Mood Changes</Symptom>
                      <Symptom>Anxiety</Symptom>
                      <Symptom>Depression</Symptom>
                      <Symptom>Sleep Issues</Symptom>
                      <Symptom>Mental Fatigue</Symptom>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 tracking-wider">BIOMARKERS TESTED</h3>
                    <div className="flex flex-wrap gap-2">
                      <Biomarker>Omega-3 Index</Biomarker>
                      <Biomarker>Homocysteine</Biomarker>
                      <Biomarker>Vitamin B12</Biomarker>
                      <Biomarker>Folate</Biomarker>
                      <Biomarker>Vitamin D</Biomarker>
                      <Biomarker>Thyroid Panel</Biomarker>
                      <Biomarker>*BDNF</Biomarker>
                      <Biomarker>*Beta-Amyloid</Biomarker>
                      <Biomarker>*Neuroinflammation Panel</Biomarker>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">* Only included in add-on advanced biomarker panels.</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </section>
  )
}

