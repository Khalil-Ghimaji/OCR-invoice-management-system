"use server"

import { redirect } from "next/navigation"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { createSession, login, logout, getSession } from "@/lib/auth"

const LoginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
})

const RegisterSchema = z
  .object({
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().email("Email invalide"),
    password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    confirmPassword: z.string(),
    companyName: z.string().min(2, "Le nom de l'entreprise doit contenir au moins 2 caractères"),
    companyType: z.enum(["CLIENT", "SUPPLIER", "BOTH"]).default("BOTH"),
    companyAddress: z.string().optional(),
    companyEmail: z.string().email("Email entreprise invalide").optional().or(z.literal("")),
    companyPhone: z.string().optional(),
    fiscalIdentifiers: z.string().optional(),
    website: z.string().url("URL invalide").optional().or(z.literal("")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  })

export async function loginAction(prevState: any, formData: FormData) {
  const validatedFields = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validatedFields.data

  try {
    const user = await login(email, password)

    if (!user) {
      return {
        errors: {
          email: ["Email ou mot de passe incorrect"],
        },
      }
    }

    if (!user.isEmailVerified) {
      return {
        errors: {
          email: ["Veuillez vérifier votre email avant de vous connecter"],
        },
      }
    }

    await createSession(user.id)

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "USER_LOGIN",
        details: `User ${user.email} logged in`,
      },
    })
  } catch (error) {
    return {
      errors: {
        email: ["Une erreur est survenue lors de la connexion"],
      },
    }
  }

  redirect("/dashboard")
}

export async function registerAction(prevState: any, formData: FormData) {
  const validatedFields = RegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    companyName: formData.get("companyName"),
    companyType: formData.get("companyType"),
    companyAddress: formData.get("companyAddress"),
    companyEmail: formData.get("companyEmail"),
    companyPhone: formData.get("companyPhone"),
    fiscalIdentifiers: formData.get("fiscalIdentifiers"),
    website: formData.get("website"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const {
    name,
    email,
    password,
    companyName,
    companyType,
    companyAddress,
    companyEmail,
    companyPhone,
    fiscalIdentifiers,
    website,
  } = validatedFields.data

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return {
        errors: {
          email: ["Un compte avec cet email existe déjà"],
        },
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    const company = await prisma.company.create({
      data: {
        name: companyName,
        type: companyType as any,
        address: companyAddress || null,
        email: companyEmail || null,
        phone: companyPhone || null,
        fiscalIdentifiers: fiscalIdentifiers || null,
        website: website || null,
      },
    })

    // Create user with company relation
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isEmailVerified: false,
        companyId: company.id,
      },
    })

    const defaultPlan = await prisma.subscriptionPlan.findFirst({
      where: { name: "Basic" },
    })

    if (!defaultPlan) {
      throw new Error("Default subscription plan not found")
    }

    // Create subscription with plan relation
    await prisma.abonnement.create({
      data: {
        userId: user.id,
        planId: defaultPlan.id,
        type: "BASIC",
        tokensRestants: defaultPlan.tokens,
        dateDebut: new Date(),
        dateFin: new Date(Date.now() + defaultPlan.duration * 24 * 60 * 60 * 1000),
      },
    })

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "USER_REGISTER",
        details: `New user registered: ${email} with company: ${companyName}`,
      },
    })

    return {
      success: true,
      message: "Compte et entreprise créés avec succès. Vous pouvez maintenant vous connecter.",
    }
  } catch (error) {
    console.error("Registration error:", error)
    return {
      errors: {
        email: ["Une erreur est survenue lors de la création du compte"],
      },
    }
  }
}

export async function logoutAction() {
  await logout()
  redirect("/login")
}

const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mot de passe actuel requis"),
    newPassword: z.string().min(6, "Le nouveau mot de passe doit contenir au moins 6 caractères"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  })

export async function changePasswordAction(prevState: any, formData: FormData) {
  const validatedFields = ChangePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { currentPassword, newPassword } = validatedFields.data

  try {
    const session = await getSession()
    if (!session?.userId) {
      return {
        errors: {
          currentPassword: ["Session expirée"],
        },
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    })

    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
      return {
        errors: {
          currentPassword: ["Mot de passe actuel incorrect"],
        },
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "PASSWORD_CHANGE",
        details: "User changed password",
      },
    })

    return {
      success: true,
      message: "Mot de passe modifié avec succès",
    }
  } catch (error) {
    return {
      errors: {
        currentPassword: ["Une erreur est survenue"],
      },
    }
  }
}
