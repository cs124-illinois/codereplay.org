declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SECRET: string
      GOOGLE_CLIENT_ID: string
      GOOGLE_CLIENT_SECRET: string
      NEXT_PUBLIC_API_URL: string
    }
  }
}
export {}
