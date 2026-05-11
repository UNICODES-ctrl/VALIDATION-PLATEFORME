import { registerSchema, type RegisterFormData } from "./registerSchema"

export async function validateAndRegister(data: RegisterFormData) {
  const validated = registerSchema.parse(data)

  const res = await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validated),
  })

  const json = await res.json() as { error?: string; userId?: string; email?: string }
  if (!res.ok) throw new Error(json.error || "Une erreur est survenue")

  return { userId: json.userId, email: validated.email }
}