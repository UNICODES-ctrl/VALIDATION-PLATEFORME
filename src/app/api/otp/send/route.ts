import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendOtpEmail } from "@/lib/mail"

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: Request) {
  try {
    const { email, resend } = await req.json()

    if (!email || !email.includes("@gmail.com")) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 })
    }

    // Vérifie si email déjà utilisé (sauf si c'est un renvoi)
    if (!resend) {
      const existingUser = await prisma.user.findUnique({ where: { email } })
      if (existingUser) {
        return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 })
      }
    }

    // Invalide les anciens OTP
    await prisma.otpCode.updateMany({
      where: { email, used: false },
      data: { used: true }
    })

    const code = generateOtp()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await prisma.otpCode.create({
      data: { email, code, expiresAt }
    })

    await sendOtpEmail(email, code)

    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error("OTP SEND ERROR:", error)
    return NextResponse.json({ error: "Erreur lors de l'envoi" }, { status: 500 })
  }
}