import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

// Get the base URL for the app
const APP_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://app.rune.health"
const WEBFLOW_URL = "https://rune.health"

export function Footer() {
  return (
    <footer className="bg-sand-100 text-sand-800 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About Rune</h3>
            <p className="text-sm">
              Rune is an AI-powered platform that helps you understand your health and make informed decisions.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href={WEBFLOW_URL} className="text-sm hover:text-terra-600">
                  Home
                </a>
              </li>
              <li>
                <a href={`${WEBFLOW_URL}/about`} className="text-sm hover:text-terra-600">
                  About
                </a>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm hover:text-terra-600">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/auth?register=true" className="text-sm hover:text-terra-600">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-sm hover:text-terra-600">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm hover:text-terra-600">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="text-sm hover:text-terra-600">
                  Medical Disclaimer
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-sand-800 hover:text-terra-600">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-sand-800 hover:text-terra-600">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-sand-800 hover:text-terra-600">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-sand-800 hover:text-terra-600">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-sand-200 text-center">
          <p className="text-sm">&copy; {new Date().getFullYear()} Rune. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

