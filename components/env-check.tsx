"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function EnvCheck() {
  const [missingVars, setMissingVars] = useState<string[]>([])

  useEffect(() => {
    const requiredVars = [
      { name: "NEXT_PUBLIC_APILLON_BUCKET_UUID", value: process.env.NEXT_PUBLIC_APILLON_BUCKET_UUID },
      { name: "NEXT_PUBLIC_APILLON_API_KEY", value: process.env.NEXT_PUBLIC_APILLON_API_KEY },
    ]

    const missing = requiredVars.filter((v) => !v.value).map((v) => v.name)
    setMissingVars(missing)
  }, [])

  if (missingVars.length === 0) return null

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Missing Environment Variables</AlertTitle>
      <AlertDescription>
        The following environment variables are missing:
        <ul className="list-disc pl-5 mt-2">
          {missingVars.map((v) => (
            <li key={v}>{v}</li>
          ))}
        </ul>
        Some features may not work correctly without these variables.
      </AlertDescription>
    </Alert>
  )
}
