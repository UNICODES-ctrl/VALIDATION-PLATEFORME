import nodemailer from "nodemailer"

export async function sendOtpEmail(email: string, code: string) {
  console.log(`\n============================`)
  console.log(`[OTP] Email: ${email}`)
  console.log(`[OTP] Code: ${code}`)
  console.log(`============================\n`)

  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASSWORD) {
    console.log("[OTP] Gmail non configuré — mode dev uniquement")
    return { success: true }
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD,
    },
  })

  try {
    await transporter.sendMail({
      from: `"UNICODES VAE" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Votre code de vérification UNICODES VAE",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <div style="background: linear-gradient(135deg, #4f46e5, #6366f1); border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 24px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">UNICODES VAE</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">Vérification de votre email</p>
          </div>
          <p style="color: #374151; font-size: 16px;">Bonjour,</p>
          <p style="color: #374151;">Voici votre code de vérification :</p>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
            <span style="font-size: 40px; font-weight: bold; letter-spacing: 12px; color: #4f46e5;">${code}</span>
          </div>
          <p style="color: #6b7280; font-size: 14px;">Ce code expire dans <strong>10 minutes</strong>.</p>
          <p style="color: #6b7280; font-size: 14px;">Si vous n'avez pas demandé ce code, ignorez cet email.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">UNICODES — Plateforme VAE</p>
        </div>
      `
    })
    console.log("[OTP] Email envoyé avec succès via Gmail")
  } catch (err) {
    console.error("[OTP] Erreur Gmail:", err)
    throw new Error("Erreur lors de l'envoi de l'email")
  }

  return { success: true }
}