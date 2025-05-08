"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save, Upload, X, FileText, ImageIcon, File, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getContractInstance } from "@/lib/contract"
import { uploadFile, type UploadedFile, generateIpfsLink } from "@/lib/storage"
import { v4 as uuidv4 } from "uuid"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Contract address
const CONTRACT_ADDRESS = "0x5219015234d02F59B21A501fb52062f8bDF74E1A"

export function NewNotePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated, isRegistered } = useAuth()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [attachments, setAttachments] = useState<UploadedFile[]>([])
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Redirect if not authenticated or not registered
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
    } else if (isAuthenticated && !isRegistered) {
      router.push("/")
    }
  }, [isAuthenticated, isRegistered, router])

  // Check if environment variables are available
  const areEnvVarsAvailable =
    !!process.env.NEXT_PUBLIC_APILLON_BUCKET_UUID &&
    !!process.env.NEXT_PUBLIC_APILLON_API_KEY &&
    !!process.env.NEXT_PUBLIC_APILLON_API_SECRET

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your note",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)
      const noteId = uuidv4()
      const contract = getContractInstance(CONTRACT_ADDRESS)

      // Create the note
      await contract.createNote(noteId, title, content)

      // Add attachments if any
      for (const attachment of attachments) {
        if (attachment.cid) {
          await contract.addAttachmentToNote(noteId, attachment.cid)
        }
      }

      toast({
        title: "Note saved",
        description: "Your note has been saved successfully",
      })

      router.push("/dashboard/notes")
    } catch (error: any) {
      console.error("Error saving note:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save note. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    setUploadError(null)
    setUploadProgress(0)

    // Check if environment variables are available
    if (!areEnvVarsAvailable) {
      setUploadError("Storage configuration is missing. File uploads are not available.")
      event.target.value = ""
      return
    }

    // Check file type
    const fileType = file.type
    if (!fileType.startsWith("image/") && fileType !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Only images and PDFs are allowed",
        variant: "destructive",
      })
      event.target.value = ""
      return
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "File size must be less than 10MB",
        variant: "destructive",
      })
      event.target.value = ""
      return
    }

    try {
      setIsUploading(true)

      // Log environment variables (without exposing sensitive data)
      console.log("Environment variables check:")
      console.log("- BUCKET_UUID available:", !!process.env.NEXT_PUBLIC_APILLON_BUCKET_UUID)
      console.log("- API_KEY available:", !!process.env.NEXT_PUBLIC_APILLON_API_KEY)
      console.log("- API_SECRET available:", !!process.env.NEXT_PUBLIC_APILLON_API_SECRET)

      console.log(`Uploading file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev === null) return 10
          return Math.min(prev + 10, 90) // Max at 90% until complete
        })
      }, 500)

      const uploadedFile = await uploadFile(file)
      clearInterval(progressInterval)
      setUploadProgress(100)

      console.log("Upload completed, file data:", uploadedFile)

      // If the file has a CID, try to generate an IPFS link
      if (uploadedFile.cid) {
        try {
          console.log(`Generating IPFS link for CID: ${uploadedFile.cid}`)
          const ipfsLink = await generateIpfsLink(uploadedFile.cid)
          uploadedFile.url = ipfsLink
          console.log(`IPFS link generated: ${ipfsLink}`)
        } catch (linkError) {
          console.error("Error generating IPFS link:", linkError)
          // Continue even if generating the link fails
        }
      }

      // Add the uploaded file to attachments
      setAttachments((prev) => [...prev, uploadedFile])

      toast({
        title: "File uploaded",
        description: "Your file has been uploaded successfully",
      })
    } catch (error: any) {
      console.error("Error uploading file:", error)

      // Format error message for display
      let errorMessage = "Failed to upload file. Please try again."

      if (error.message) {
        // If it's a JSON string, try to parse it
        if (error.message.startsWith("{") && error.message.endsWith("}")) {
          try {
            const errorObj = JSON.parse(error.message)
            errorMessage = errorObj.message || errorMessage
          } catch (e) {
            errorMessage = error.message
          }
        } else {
          errorMessage = error.message
        }
      }

      setUploadError(errorMessage)
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(null)
      // Reset the input
      event.target.value = ""
    }
  }

  const removeAttachment = (fileUuid: string) => {
    setAttachments(attachments.filter((attachment) => attachment.fileUuid !== fileUuid))
  }

  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith("image/")) {
      return <ImageIcon className="h-4 w-4" />
    } else if (contentType === "application/pdf") {
      return <FileText className="h-4 w-4" />
    } else {
      return <File className="h-4 w-4" />
    }
  }

  if (!isAuthenticated || !isRegistered) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push("/dashboard/notes")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Notes
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Note
            </>
          )}
        </Button>
      </div>

      {!areEnvVarsAvailable && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Storage Configuration Missing</AlertTitle>
          <AlertDescription>
            The required environment variables for file storage are not configured. File uploads will not work.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>New Note</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Note title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Write your note here..."
              className="min-h-[200px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {attachments.length > 0 && (
            <div className="space-y-2">
              <Label>Attachments</Label>
              <div className="space-y-2">
                {attachments.map((attachment) => (
                  <div key={attachment.fileUuid} className="flex items-center justify-between p-2 border rounded-md">
                    <div className="flex items-center">
                      {getFileIcon(attachment.contentType)}
                      <span className="ml-2 text-sm truncate max-w-[200px]">{attachment.fileName}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeAttachment(attachment.fileUuid)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploadError && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Upload Error</AlertTitle>
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <div className="w-full space-y-2">
            {uploadProgress !== null && (
              <div className="w-full">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300 ease-in-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-center mt-1">{uploadProgress}% uploaded</p>
              </div>
            )}

            <Label
              htmlFor="file-upload"
              className={`cursor-pointer ${!areEnvVarsAvailable || isUploading ? "opacity-50 pointer-events-none" : ""}`}
            >
              <div className="flex items-center justify-center w-full p-2 border border-dashed rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
                <Upload className="mr-2 h-4 w-4" />
                <span>{isUploading ? "Uploading..." : "Upload Attachment"}</span>
              </div>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                disabled={isUploading || !areEnvVarsAvailable}
              />
            </Label>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
