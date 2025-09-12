"use client"

import { useEffect, useState } from "react"

export function CSRFToken({ name = "csrfToken" }: { name?: string }) {
  const [token, setToken] = useState("")

  useEffect(() => {
    // Generate CSRF token on client side
    const csrfToken = crypto.randomUUID()
    setToken(csrfToken)

    // Store in session storage for validation
    sessionStorage.setItem("csrfToken", csrfToken)
  }, [])

  return <input type="hidden" name={name} value={token} />
}
