"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function LoginForm() {
  const { connect, isAuthenticated, isLoading, error, isRegistered, isRegistering, registerUser } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [registrationError, setRegistrationError] = useState<string | null>(null)

  // Redirect to dashboard if already authenticated and registered
  useEffect(() => {
    if (isAuthenticated && isRegistered) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, isRegistered, router])

  const handleConnect = async () => {
    try {
      await connect()
    } catch (error: any) {
      console.error("Failed to connect:", error)
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect to wallet",
        variant: "destructive",
      })
    }
  }

  const handleRegister = async () => {
    setRegistrationError(null)
    try {
      await registerUser()
    } catch (error: any) {
      console.error("Failed to register:", error)
      setRegistrationError(error.message || "Registration failed. Please try again.")
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Connect to Spark</CardTitle>
        <CardDescription>Connect your wallet to access your decentralized notes and tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          {!isAuthenticated ? (
            <Button onClick={handleConnect} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect with MetaMask"
              )}
            </Button>
          ) : !isRegistered ? (
            <Button onClick={handleRegister} disabled={isRegistering} className="w-full">
              {isRegistering ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register with Spark"
              )}
            </Button>
          ) : (
            <Button onClick={() => router.push("/dashboard")} className="w-full">
              Go to Dashboard
            </Button>
          )}

          {error && <div className="text-sm text-red-500 mt-2">{error}</div>}
          {registrationError && <div className="text-sm text-red-500 mt-2">{registrationError}</div>}

          {isAuthenticated && !isRegistered && (
            <div className="text-sm text-amber-500 mt-2">
              You need to register before using Spark. This is a one-time process that will create your account on the
              blockchain.
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-500">You need MetaMask installed to use this app</p>
      </CardFooter>
    </Card>
  )
}
