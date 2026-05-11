import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json()

    const otp = await prisma.otpCode.findFirst({
      where: {
        email,
        code,
        used: false,
        expiresAt: { gt: new Date() }
      }
    })

    if (!otp) {
      return NextResponse.json({ error: "Code invalide ou expiré" }, { status: 400 })
    }

    // Marque l'OTP comme utilisé
    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { used: true }
    })

    return NextResponse.json({ success: true })
    
  } catch (error) {
    return NextResponse.json({ error: "Erreur de vérification" }, { status: 500 })
  }
}