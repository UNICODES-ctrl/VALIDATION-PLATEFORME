import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const dossierId = searchParams.get("dossierId")

  if (dossierId) {
    const paiements = await prisma.paiement.findMany({
      where: { dossierId },
      orderBy: { createdAt: "desc" }
    })
    return NextResponse.json({ paiements })
  }

  const dossiers = await prisma.dossier.findMany({ where: { userId: session.user.id } })
  const paiements = await prisma.paiement.findMany({
    where: { dossierId: { in: dossiers.map(d => d.id) } },
    orderBy: { createdAt: "desc" }
  })
  return NextResponse.json({ paiements })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { dossierId, montant, modePaiement, bordereauUrl } = await req.json()

  const referenceExt = `VAE-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

  const paiement = await prisma.paiement.create({
    data: {
      dossierId,
      montant,
      modePaiement: modePaiement || "VIREMENT",
      bordereauUrl: bordereauUrl || null,
      statut: "EN_ATTENTE",
      referenceExt,
    }
  })

  return NextResponse.json({ paiement })
}