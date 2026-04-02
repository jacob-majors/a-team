import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-500 to-orange-700 px-4">
      <SignUp />
    </main>
  )
}
