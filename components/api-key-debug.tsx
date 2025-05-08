"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export function ApiKeyDebug() {
  const [apiKey, setApiKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const testApiKey = async () => {
    if (!apiKey) {
      setResult({
        success: false,
        message: "Please enter an API key to test",
      })
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      // Test the API connection with the provided key
      const response = await fetch(
        `https://api.apillon.io/storage/buckets/${process.env.NEXT_PUBLIC_APILLON_BUCKET_UUID}/content`,
        {
          method: "GET",
          headers: {
            Authorization: `Basic ${apiKey}`,
            Accept: "application/json",
          },
        },
      )

      if (response.ok) {
        const data = await response.json()
        setResult({
          success: true,
          message: `Connection successful with provided API key! Found ${data.data.items.length} items in bucket.`,
        })
      } else {
        let errorMessage = `Error ${response.status}: ${response.statusText}`
        try {
          const errorData = await response.json()
          errorMessage += ` - ${errorData.message || JSON.stringify(errorData)}`
        } catch (e) {
          // If not JSON, try to get text
          try {
            const errorText = await response.text()
            errorMessage += ` - ${errorText}`
          } catch (textError) {
            // If we can't get text either, just use the status
          }
        }
        setResult({
          success: false,
          message: errorMessage,
        })
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || "An unknown error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Key Debug</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Test a specific API key format to help debug authentication issues.
        </p>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter API key to test"
            />
            <p className="text-xs text-muted-foreground">
              Enter the API key exactly as you want to test it (with any encoding or formatting)
            </p>
          </div>
          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={testApiKey} disabled={isLoading} className="w-full">
          {isLoading ? "Testing..." : "Test API Key"}
        </Button>
      </CardFooter>
    </Card>
  )
}
