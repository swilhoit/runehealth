import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function NavBar() {
  return (
    <nav className="absolute top-0 left-0 right-0 z-50 mt-8">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-6xl">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/rune-logo-white-WFrkJeL8QUkCCDN2pUAkDJi4VgvSwZ.png"
            alt="Rune Logo"
            width={100}
            height={40}
            className="h-8 w-auto"
          />
        </Link>
        <div className="flex items-center space-x-6">
          <Link href="/about" className="text-white hover:text-sand-200 transition-colors font-light">
            About
          </Link>
          <Link href="/dashboard" className="text-white hover:text-sand-200 transition-colors font-light">
            Dashboard
          </Link>
          <Button asChild variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
            <Link href="/auth">Login</Link>
          </Button>
          <Button asChild className="bg-terra-600 hover:bg-terra-700 text-white px-4 py-2 rounded-md transition-colors">
            <Link href="/get-started">Get Started</Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}

