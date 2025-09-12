import { RegisterForm } from "@/components/auth/register-form"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function RegisterPage() {
  const user = await getCurrentUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">OCR Invoice</h1>
          <p className="mt-2 text-gray-600">Service de reconnaissance de factures</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
