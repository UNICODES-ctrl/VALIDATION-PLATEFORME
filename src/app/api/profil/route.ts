import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { UserProfil } from "@/Utils/VAE.type"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

 const user = await prisma.user.findUnique({
  where: { id: session.user.id },
  select: { id: true, nom: true, prenom: true, email: true, telephone: true, pays: true, photoProfil: true, role: true }
})

  return NextResponse.json({ user })
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { nom, prenom, telephone, pays, image, motDePasseActuel, nouveauMotDePasse } = await req.json()

  const updateData : { id: string, nom: string, prenom: string, email: string, telephone: string, pays: string, photoProfil: null, role:  "CANDIDAT" | "ADMIN" ,password :string }   = { id: session.user.id, nom: "", prenom: "", email: "", telephone: "", pays: "", photoProfil: null, role: "CANDIDAT", password: "" } 
  if (nom) updateData.nom = nom
  if (prenom) updateData.prenom = prenom
  if (telephone) updateData.telephone = telephone
  if (pays) updateData.pays = pays
  if (image) updateData.photoProfil = image

  // Changement de mot de passe
  if (motDePasseActuel && nouveauMotDePasse) {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user?.password) return NextResponse.json({ error: "Impossible de changer le mot de passe" }, { status: 400 })

    const valid = await bcrypt.compare(motDePasseActuel, user.password)
    if (!valid) return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 400 })

    updateData.password = await bcrypt.hash(nouveauMotDePasse, 12)
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data  : updateData,
    select: { id: true, nom: true, prenom: true, email: true, telephone: true, pays: true, photoProfil: true }
  })

  return NextResponse.json({ user })
}