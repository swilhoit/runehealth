"use client"

import type React from "react"
import { motion } from "framer-motion"

export const AnimatedGradientBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            "linear-gradient(45deg, #f6e5f5, #e5f1ff, #fff0e5, #e5fff0)",
            "linear-gradient(45deg, #e5fff0, #f6e5f5, #e5f1ff, #fff0e5)",
            "linear-gradient(45deg, #fff0e5, #e5fff0, #f6e5f5, #e5f1ff)",
            "linear-gradient(45deg, #e5f1ff, #fff0e5, #e5fff0, #f6e5f5)",
          ],
        }}
        transition={{
          duration: 20,
          ease: "linear",
          repeat: Number.POSITIVE_INFINITY,
        }}
      />
      <motion.div
        className="absolute inset-0"
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 5,
          ease: "easeInOut",
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
        style={{
          backgroundImage:
            'url(\'data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M50 50 L0 0 L100 0 Z" fill="rgba(255,255,255,0.1)"%3E%3C/path%3E%3C/svg%3E\')',
          backgroundSize: "100px 100px",
        }}
      />
    </div>
  )
}

