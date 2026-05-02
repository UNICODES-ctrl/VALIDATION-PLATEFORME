import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { nom, prenom, email, telephone, pays, password } = await req.json()

    if (!nom || !prenom || !email || !password) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: { nom, prenom, email, telephone, pays, password: hashedPassword }
    })

    return NextResponse.json({ message: "Compte créé", userId: user.id }, { status: 201 })
  } catch (error) {
  console.error("REGISTER ERROR:", error)
  return NextResponse.json({ error: "Erreur serveur: " + String(error) }, { status: 500 })
}  
}
