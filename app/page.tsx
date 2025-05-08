import { LoginForm } from "@/components/login-form"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container flex flex-col items-center justify-center gap-6 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-[5rem]">
          <span className="text-purple-500">Spark</span>
        </h1>
        <p className="text-center text-lg text-gray-600 dark:text-gray-400">
          A decentralized note-taking and task management app
        </p>
        <LoginForm />
      </div>
    </div>
  )
}
