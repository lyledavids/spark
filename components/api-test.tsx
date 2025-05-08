"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle } from "lucide-react"
import { listBucketContent } from "@/lib/storage"

export function ApiTest() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const testApiConnection = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      // Check if environment variables are available
      if (
        !process.env.NEXT_PUBLIC_APILLON_BUCKET_UUID ||
        !process.env.NEXT_PUBLIC_APILLON_API_KEY ||
        !process.env.NEXT_PUBLIC_APILLON_API_SECRET
      ) {
        throw new Error("Missing required environment variables for API connection")
      }

      // Test connection by listing bucket content
      const items = await listBucketContent()

      setResult({
        success: true,
        message: `Connection successful! Found ${items.length} items in bucket.`,
      })
    } catch (error: any) {
      console.error("API connection test failed:", error)
      setResult({
        success: false,
        message: error.message || "Failed to connect to the API",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Connection Test</CardTitle>
        <CardDescription>Test the connection to the Apillon Storage API</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm font-medium">Bucket UUID:</p>
              <p className="text-sm text-muted-foreground">
                {process.env.NEXT_PUBLIC_APILLON_BUCKET_UUID
                  ? `${process.env.NEXT_PUBLIC_APILLON_BUCKET_UUID.substring(0, 8)}...`
                  : "Not configured"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">API Credentials:</p>
              <p className="text-sm text-muted-foreground">
                {process.env.NEXT_PUBLIC_APILLON_API_KEY && process.env.NEXT_PUBLIC_APILLON_API_SECRET
                  ? "Configured"
                  : "Not configured"}
              </p>
            </div>
          </div>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={testApiConnection} disabled={isLoading}>
          {isLoading ? "Testing..." : "Test Connection"}
        </Button>
      </CardFooter>
    </Card>
  )
}
