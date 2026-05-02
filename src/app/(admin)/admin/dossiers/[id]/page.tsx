import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Eye, CheckCircle, XCircle, Clock, User, GraduationCap, Briefcase } from "lucide-react"
import Link from "next/link"
import AdminDossierActions from "./actions"

const STATUT_CONFIG: Record<string, { label: string; color: string }> = {
  BROUILLON: { label: "Brouillon", color: "bg-gray-100 text-gray-600" },
  SOUMIS: { label: "Soumis", color: "bg-blue-100 text-blue-700" },
  EN_ETUDE: { label: "En étude", color: "bg-yellow-100 text-yellow-700" },
  VALIDE: { label: "Validé", color: "bg-green-100 text-green-700" },
  REJETE: { label: "Rejeté", color: "bg-red-100 text-red-700" },
}

export default async function AdminDossierDetail({ params }: { params: Promise<{ id: string }> }) {
  
  const { id } = await params

  const session = await auth()
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard")

  const dossier = await prisma.dossier.findUnique({
    where: { id },
    include: {
      user: true,
      parcoursAcad: true,
      parcoursPro: true,
      documents: true,
      paiements: true,
    }
  })

  if (!dossier) notFound()
  const paiementEnAttente = dossier.paiements.find(p => p.statut === "EN_ATTENTE") || null


  const statut = STATUT_CONFIG[dossier.statut]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin/dossiers" className="text-sm text-indigo-600 hover:underline mb-2 block">← Retour aux dossiers</Link>
          <h1 className="text-2xl font-bold text-gray-900">{dossier.user.prenom} {dossier.user.nom}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${statut.color}`}>{statut.label}</span>
            <span className="text-sm text-gray-400">{dossier.user.email}</span>
          </div>
        </div>
        <AdminDossierActions 
          dossierId={dossier.id} 
          currentStatut={dossier.statut}
          paiementEnAttente={paiementEnAttente ? { id: paiementEnAttente.id, bordereauUrl: paiementEnAttente.bordereauUrl } : null}
        />      
        </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* Infos personnelles */}
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="w-4 h-4" />Informations personnelles</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: "Téléphone", value: dossier.user.telephone },
                { label: "Pays", value: dossier.user.pays },
                { label: "Ville", value: dossier.ville },
                { label: "Date de naissance", value: dossier.dateNaissance ? new Date(dossier.dateNaissance).toLocaleDateString("fr-FR") : "-" },
                { label: "Situation pro", value: dossier.situationPro },
                { label: "Adresse", value: dossier.adresse },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-xs text-gray-400">{item.label}</p>
                  <p className="font-medium text-gray-700">{item.value || "-"}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Diplôme visé */}
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><GraduationCap className="w-4 h-4" />Diplôme VAE souhaité</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-gray-400">Domaine</p><p className="font-medium">{dossier.domaine || "-"}</p></div>
                <div><p className="text-xs text-gray-400">Niveau</p><p className="font-medium">{dossier.niveauSouhaite || "-"}</p></div>
              </div>
              <div><p className="text-xs text-gray-400">Motivation</p><p className="text-gray-600 mt-1">{dossier.description || "-"}</p></div>
            </CardContent>
          </Card>

          {/* Parcours académique */}
          {dossier.parcoursAcad.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><GraduationCap className="w-4 h-4" />Parcours académique</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {dossier.parcoursAcad.map(p => (
                  <div key={p.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                    <p className="font-medium">{p.diplome}</p>
                    <p className="text-gray-500">{p.etablissement}</p>
                    <p className="text-xs text-gray-400">{new Date(p.dateDebut).getFullYear()} - {p.dateFin ? new Date(p.dateFin).getFullYear() : "en cours"}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Parcours pro */}
          {dossier.parcoursPro.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Briefcase className="w-4 h-4" />Parcours professionnel</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {dossier.parcoursPro.map(p => (
                  <div key={p.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                    <p className="font-medium">{p.poste} — {p.entreprise}</p>
                    <p className="text-xs text-gray-400">{new Date(p.dateDebut).getFullYear()} - {p.enPoste ? "présent" : p.dateFin ? new Date(p.dateFin).getFullYear() : "-"}</p>
                    <p className="text-gray-500 mt-1">{p.missions}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Colonne droite */}
        <div className="space-y-4">
          {/* Documents */}
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><FileText className="w-4 h-4" />Documents ({dossier.documents.length})</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {dossier.documents.length === 0 ? (
                <p className="text-xs text-gray-400">Aucun document</p>
              ) : dossier.documents.map(doc => (
                <a key={doc.id} href={doc.url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-xs group">
                  <FileText className="w-3.5 h-3.5 text-gray-400" />
                  <span className="flex-1 truncate text-gray-600">{doc.nom}</span>
                  <Eye className="w-3 h-3 text-gray-300 group-hover:text-indigo-500" />
                </a>
              ))}
            </CardContent>
          </Card>

          {/* Paiements */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Paiements</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {dossier.paiements.length === 0 ? (
                <p className="text-xs text-gray-400">Aucun paiement</p>
              ) : dossier.paiements.map(p => (
                <div key={p.id} className="p-2 bg-gray-50 rounded-lg text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{p.montant.toLocaleString()} FCFA</span>
                    <span className={`px-2 py-0.5 rounded-full ${
                      p.statut === "SUCCES" ? "bg-green-100 text-green-700" :
                      p.statut === "ECHEC" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>{p.statut}</span>
                  </div>
                  <p className="text-gray-400 mt-0.5">{p.modePaiement} · {p.telephone}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}