import { Storage, LogLevel, FileStatus } from "@apillon/sdk"

export type UploadedFile = {
  fileUuid: string
  fileName: string
  contentType: string
  url: string
  cid?: string
}

export type BucketItem = {
  uuid: string
  type: number
  name: string
  CID: string | null
  contentType: string | null
  size: number | null
  link: string | null
  fileStatus: number | null
}

// Initialize the Apillon Storage SDK
function getStorageClient() {
  if (typeof window === "undefined") return null

  const apiKey = process.env.NEXT_PUBLIC_APILLON_API_KEY
  const apiSecret = process.env.NEXT_PUBLIC_APILLON_API_SECRET

  if (!apiKey || !apiSecret) {
    throw new Error(
      "Missing required environment variables: NEXT_PUBLIC_APILLON_API_KEY and NEXT_PUBLIC_APILLON_API_SECRET",
    )
  }

  return new Storage({
    key: apiKey,
    secret: apiSecret,
    logLevel: LogLevel.INFO,
  })
}

// Get bucket instance
function getBucket() {
  const storage = getStorageClient()
  if (!storage) return null

  const bucketUuid = process.env.NEXT_PUBLIC_APILLON_BUCKET_UUID
  if (!bucketUuid) {
    throw new Error("Missing required environment variable: NEXT_PUBLIC_APILLON_BUCKET_UUID")
  }

  return storage.bucket(bucketUuid)
}

// Manual implementation of file upload using fetch instead of SDK
export async function uploadFile(file: File): Promise<UploadedFile> {
  try {
    console.log("Starting manual file upload process")

    // Get credentials for API calls
    const apiKey = process.env.NEXT_PUBLIC_APILLON_API_KEY
    const apiSecret = process.env.NEXT_PUBLIC_APILLON_API_SECRET
    const bucketUuid = process.env.NEXT_PUBLIC_APILLON_BUCKET_UUID

    if (!apiKey || !apiSecret || !bucketUuid) {
      throw new Error("Missing required environment variables for file upload")
    }

    // Create Basic auth credentials
    const credentials = btoa(`${apiKey}:${apiSecret}`)

    // Step 1: Start upload session
    console.log("Step 1: Starting upload session")
    const startSessionResponse = await fetch(`https://api.apillon.io/storage/buckets/${bucketUuid}/upload`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        files: [
          {
            fileName: file.name,
            contentType: file.type || "application/octet-stream",
          },
        ],
      }),
    })

    if (!startSessionResponse.ok) {
      const errorData = await startSessionResponse.json()
      console.error("Error starting upload session:", errorData)
      throw new Error(JSON.stringify(errorData))
    }

    const sessionData = await startSessionResponse.json()
    console.log("Session started:", sessionData)

    if (!sessionData.data || !sessionData.data.files || !sessionData.data.files.length) {
      throw new Error("Invalid response from upload session start")
    }

    const sessionUuid = sessionData.data.sessionUuid
    const fileData = sessionData.data.files[0]
    const uploadUrl = fileData.url

    if (!uploadUrl) {
      throw new Error("No upload URL provided in the response")
    }

    // Step 2: Upload file to the provided URL
    console.log("Step 2: Uploading file to provided URL:", uploadUrl)
    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
      body: file,
    })

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload file: ${uploadResponse.status} ${uploadResponse.statusText}`)
    }

    console.log("File uploaded successfully")

    // Step 3: End upload session
    console.log("Step 3: Ending upload session:", sessionUuid)
    const endSessionResponse = await fetch(
      `https://api.apillon.io/storage/buckets/${bucketUuid}/upload/${sessionUuid}/end`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    )

    if (!endSessionResponse.ok) {
      const errorData = await endSessionResponse.json()
      console.error("Error ending upload session:", errorData)

      // If the session is already ended, this is actually fine
      if (errorData.code === 40006001) {
        console.log("Session was already ended, continuing with file data")
      } else {
        throw new Error(JSON.stringify(errorData))
      }
    } else {
      console.log("Session ended successfully")
    }

    // Return the file data
    return {
      fileUuid: fileData.fileUuid,
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      url: fileData.url || "",
      cid: fileData.CID,
    }
  } catch (error) {
    console.error("Error in manual file upload:", error)
    throw error
  }
}

export async function listBucketContent(): Promise<BucketItem[]> {
  try {
    const bucket = getBucket()
    if (!bucket) {
      throw new Error("Failed to initialize storage bucket")
    }

    // List objects in the bucket
    const result = await bucket.listObjects({
      limit: 100,
      markedForDeletion: false,
    })

    if (!result || !result.data || !result.data.items) {
      return []
    }

    return result.data.items
  } catch (error) {
    console.error("Error listing bucket content:", error)
    throw error
  }
}

export async function listFiles(): Promise<any[]> {
  try {
    const bucket = getBucket()
    if (!bucket) {
      throw new Error("Failed to initialize storage bucket")
    }

    // List all files in the bucket
    const result = await bucket.listFiles({
      fileStatus: FileStatus.UPLOADED,
      limit: 100,
    })

    if (!result || !result.data || !result.data.items) {
      return []
    }

    return result.data.items
  } catch (error) {
    console.error("Error listing files:", error)
    throw error
  }
}

export async function deleteFile(fileUuid: string): Promise<boolean> {
  try {
    const bucket = getBucket()
    if (!bucket) {
      throw new Error("Failed to initialize storage bucket")
    }

    // Delete the file
    const result = await bucket.file(fileUuid).delete()
    return result.status === 200
  } catch (error) {
    console.error("Error deleting file:", error)
    throw error
  }
}

export async function generateIpfsLink(cid: string): Promise<string> {
  try {
    const storage = getStorageClient()
    if (!storage) {
      throw new Error("Failed to initialize storage client")
    }

    // Generate IPFS link
    const result = await storage.generateIpfsLink(cid)
    return result.data.link
  } catch (error) {
    console.error("Error generating IPFS link:", error)
    throw error
  }
}
