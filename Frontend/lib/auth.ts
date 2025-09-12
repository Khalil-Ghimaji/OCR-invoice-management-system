import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

const secretKey = process.env.NEXTAUTH_SECRET || "fallback-secret-key"
const key = new TextEncoder().encode(secretKey)

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key)
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  })
  return payload
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { abonnement: true },
  })

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return null
  }

  return user
}

export async function getSession() {
  const session = (await cookies()).get("session")?.value
  if (!session) return null
  return await decrypt(session)
}

export async function getCurrentUser() {
  const session = await getSession()
  if (!session?.userId) return null

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { abonnement: true },
  })

  return user
}

export const getUser = getCurrentUser

export async function logout() {
  ;(await cookies()).set("session", "", { expires: new Date(0) })
}

export async function createSession(userId: number) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
  const session = await encrypt({ userId, expiresAt })
  ;(await cookies()).set("session", session, {
    expires: expiresAt,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  })
}
