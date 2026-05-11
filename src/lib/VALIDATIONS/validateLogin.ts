import { signIn } from "next-auth/react"
import { loginSchema, type LoginFormData } from "./loginSchema"

export async function validateAndLogin(data: LoginFormData) {
    // Validation Zod
    const validated = loginSchema.parse(data)

    // Appel à NextAuth signIn
    const result = await signIn("credentials", {
        email: validated.email,
        password: validated.password,
        redirect: false,
    })

    if (result?.error) {
        throw new Error("Email ou mot de passe incorrect")
    }

    return result
}
