import { AuthForm } from "@/components/auth-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sage-50 via-sand-50 to-terra-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create an Account</CardTitle>
          <CardDescription>Sign up to start tracking your health journey</CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm type="signup" />
        </CardContent>
      </Card>
    </div>
  )
}

