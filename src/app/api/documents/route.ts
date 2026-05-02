import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const dossierId = searchParams.get("dossierId")

  if (dossierId) {
    // Documents d'un dossier spécifique
    const documents = await prisma.document.findMany({
      where: { dossierId },
      orderBy: { createdAt: "desc" }
    })
    return NextResponse.json({ documents })
  }

  // Tous les documents du candidat
  const dossiers = await prisma.dossier.findMany({ where: { userId: session.user.id } })
  const dossierIds = dossiers.map(d => d.id)
  const documents = await prisma.document.findMany({
    where: { dossierId: { in: dossierIds } },
    orderBy: { createdAt: "desc" }
  })
  return NextResponse.json({ documents })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { type, url, nom, taille, dossierId } = await req.json()

  const doc = await prisma.document.create({
    data: { dossierId, type, url, nom, taille }
  })

  return NextResponse.json({ document: doc })
}