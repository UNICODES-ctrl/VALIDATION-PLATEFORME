import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {  Upload, CreditCard, ArrowRight } from "lucide-react"
import Link from "next/link"

const STATUT_CONFIG: Record<string, { label: string; color: string }> = {
  BROUILLON:  { label: "Brouillon",  color: "bg-gray-100 text-gray-600" },
  SOUMIS:     { label: "Soumis",     color: "bg-blue-100 text-blue-700" },
  EN_ETUDE:   { label: "En étude",   color: "bg-yellow-100 text-yellow-700" },
  VALIDE:     { label: "Validé",     color: "bg-green-100 text-green-700" },
  REJETE:     { label: "Rejeté",     color: "bg-red-100 text-red-700" },
}

export default async function DossierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) redirect("/login")

  const dossier = await prisma.dossier.findUnique({
    where: { id, userId: session.user.id },
    include: { documents: true, paiements: true }
  })

  if (!dossier) notFound()

  const statut = STATUT_CONFIG[dossier.statut]
const paye = dossier.paiements.some(p => p.statut === "SUCCES")
const enAttente = dossier.paiements.some(p => p.statut === "EN_ATTENTE")
const isReadOnly = ["EN_ETUDE", "VALIDE", "REJETE"].includes(dossier.statut)

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <Link href="/dashboard" className="text-sm text-indigo-600 hover:underline mb-2 block">
          ← Retour aux candidatures
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {dossier.titre || dossier.domaine || "Candidature VAE"}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${statut.color}`}>
                {statut.label}
              </span>
              <span className="text-sm text-gray-400">{dossier.niveauSouhaite}</span>
            </div>
          </div>
          {!isReadOnly && (
            <Link href={`/dashboard/dossier/${id}/modifier`}>
              <Button variant="outline" size="sm">Modifier</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Bannière statut */}
      <div className={`mb-6 p-3 rounded-xl text-sm flex items-center gap-2 ${
        dossier.statut === "BROUILLON" ? "bg-gray-50 text-gray-600 border border-gray-200" :
        dossier.statut === "SOUMIS" ? "bg-blue-50 text-blue-700 border border-blue-200" :
        dossier.statut === "EN_ETUDE" ? "bg-yellow-50 text-yellow-700 border border-yellow-200" :
        dossier.statut === "VALIDE" ? "bg-green-50 text-green-700 border border-green-200" :
        "bg-red-50 text-red-700 border border-red-200"
      }`}>
        {dossier.statut === "BROUILLON" && "Brouillon — vous pouvez encore modifier"}
        {dossier.statut === "SOUMIS" && "Soumis — en attente de traitement"}
        {dossier.statut === "EN_ETUDE" && "En cours d'étude — modification impossible"}
        {dossier.statut === "VALIDE" && "Candidature validée — félicitations !"}
        {dossier.statut === "REJETE" && "Candidature rejetée — contactez l'administration"}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-400">Documents</p>
            <p className="text-xl font-bold text-gray-900">{dossier.documents.length}</p>
            <p className="text-xs text-gray-400">déposés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-400">Paiement</p>
            <p className="text-xl font-bold text-gray-900">{paye ? "25000 FCFA" : "0"}</p>
            <p className="text-xs text-gray-400">{paye ? "Effectué" : "En attente"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-400">Domaine</p>
            <p className="text-sm font-semibold text-gray-900 truncate">{dossier.domaine || "-"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Prochaines étapes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link href={`/dashboard/dossier/${id}/documents`} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors group border border-gray-100">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${dossier.documents.length > 0 ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
              {dossier.documents.length > 0 ? "✓" : <Upload className="w-4 h-4" />}
            </div>
            <span className="text-sm flex-1 text-gray-700">Gérer mes documents ({dossier.documents.length})</span>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500" />
          </Link>
          <Link href={`/dashboard/dossier/${id}/paiement`} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors group border border-gray-100">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                paye ? "bg-green-100 text-green-700" : 
                enAttente ? "bg-yellow-100 text-yellow-700" : 
                "bg-blue-100 text-blue-700"
              }`}>
                {paye ? "✓" : enAttente ? "⏳" : <CreditCard className="w-4 h-4" />}
              </div>
              <span className="text-sm flex-1 text-gray-700">
                {paye ? "Paiement confirmé" : enAttente ? "Bordereau en attente de vérification" : "Effectuer le paiement"}
              </span>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500" />
        </Link>
        </CardContent>
      </Card>
    </div>
  )
}