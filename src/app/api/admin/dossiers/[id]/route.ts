import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  const { statut } = await req.json()
  const dossier = await prisma.dossier.update({
    where: { id },
    data: { statut },
  })
  return NextResponse.json({ dossier })
}