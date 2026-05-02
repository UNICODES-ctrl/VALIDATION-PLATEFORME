import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import type { ParcourAcademique, ParcourProfessionnel } from "@/Utils/VAE.type"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

    const url = new URL(req.url)
    const dossierId = url.searchParams.get("id")

    if (dossierId) {
      const dossier = await prisma.dossier.findFirst({
        where: { id: dossierId, userId: session.user.id },
        include: { parcoursAcad: true, parcoursPro: true },
      })

      if (!dossier) return NextResponse.json({ error: "Dossier non trouvé" }, { status: 404 })
      return NextResponse.json({ dossier })
    }

    const dossiers = await prisma.dossier.findMany({
      where: { userId: session.user.id },
      include: { parcoursAcad: true, parcoursPro: true },
      orderBy: { updatedAt: "desc" }
    })

    return NextResponse.json({ dossiers })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

    const { dossierId, dateNaissance, lieuNaissance, adresse, ville, situationPro,
      domaine, niveauSouhaite, description, titre, parcoursAcad, parcoursPro } = await req.json()

    let dossier

    if (dossierId) {
      // Mise à jour d'un dossier existant
      dossier = await prisma.dossier.update({
        where: { id: dossierId },
        data: {
          dateNaissance: new Date(dateNaissance), lieuNaissance, adresse, ville,
          situationPro, domaine, niveauSouhaite, description, titre, statut: "SOUMIS"
        },
      })
    } else {
      // Création d'un nouveau dossier
      dossier = await prisma.dossier.create({
        data: {
          userId: session.user.id,
          dateNaissance: new Date(dateNaissance),
          lieuNaissance, adresse, ville, situationPro,
          domaine, niveauSouhaite, description, titre, statut: "SOUMIS",
        },
      })
    }

    await prisma.parcourAcademique.deleteMany({ where: { dossierId: dossier.id } })
    await prisma.parcourProfessionnel.deleteMany({ where: { dossierId: dossier.id } })

    if (parcoursAcad?.length) {
      await prisma.parcourAcademique.createMany({
        data: parcoursAcad.filter((p: ParcourAcademique) => p.diplome).map((p: ParcourAcademique) => ({
          dossierId: dossier.id,
          diplome: p.diplome,
          etablissement: p.etablissement,
          dateDebut: new Date(p.dateDebut),
          dateFin: p.dateFin ? new Date(p.dateFin) : null,
          mention: p.mention || null,
        }))
      })
    }

    if (parcoursPro?.length) {
      await prisma.parcourProfessionnel.createMany({
        data: parcoursPro.filter((p: ParcourProfessionnel) => p.poste).map((p: ParcourProfessionnel) => ({
          dossierId: dossier.id,
          poste: p.poste,
          entreprise: p.entreprise,
          dateDebut: new Date(p.dateDebut),
          dateFin: p.enPoste ? null : (p.dateFin ? new Date(p.dateFin) : null),
          enPoste: p.enPoste,
          missions: p.missions,
          competences: p.competences || null,
        }))
      })
    }

    return NextResponse.json({ success: true, dossierId: dossier.id })
  } catch (error) {
    console.error("DOSSIER ERROR:", error)
    return NextResponse.json({ error: "Erreur serveur: " + String(error) }, { status: 500 })
  }
}