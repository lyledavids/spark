declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_APILLON_API_KEY: string
      NEXT_PUBLIC_APILLON_BUCKET_UUID: string
    }
  }
}

export {}
