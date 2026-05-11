import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Upload, CreditCard, ArrowRight, Plus } from "lucide-react"
import Link from "next/link"

const STATUT_CONFIG = {
  BROUILLON: { label: "Brouillon", color: "bg-gray-100 text-gray-600" },
  SOUMIS: { label: "Soumis", color: "bg-blue-100 text-blue-700" },
  EN_ETUDE: { label: "En étude", color: "bg-yellow-100 text-yellow-700" },
  VALIDE: { label: "Validé", color: "bg-green-100 text-green-700" },
  REJETE: { label: "Rejeté", color: "bg-red-100 text-red-700" },
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const dossiers = await prisma.dossier.findMany({
    where: { userId: session.user.id },
    include: { documents: true, paiements: true },
    orderBy: { updatedAt: "desc" }
  })

  return (
    <div className="text-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Bonjour, {session.user?.name?.split(" ")[0]}
          </h1>
          <p className="text-blue-500 mt-1 font-extralight">Gérez vos candidatures VAE</p>
        </div>
        <Link href="/dashboard/dossier/nouveau">
          <Button className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 transition-transform duration-300 cursor-pointer">
            <Plus className="" /> Nouvelle candidature
          </Button>
        </Link>
      </div>

      {/* Stats */}
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-8">

        {/* Carte Candidatures */}
        <Card className="drop-shadow-xl shadow-indigo-200 ring-1 ring-blue-100 overflow-hidden">
          <CardHeader className="p-3 md:p-6 pb-1 md:pb-2">
            <CardTitle className="text-[11px] md:text-sm font-medium flex items-center gap-1.5 md:gap-2 text-gray-600">
              <FileText className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-600" />
              <span className="truncate">Candidatures</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
            <p className="text-xl md:text-2xl font-bold text-gray-900">{dossiers.length}</p>
            <p className="text-[9px] md:text-xs text-gray-400 mt-0.5 md:mt-1 uppercase tracking-wider">Au total</p>
          </CardContent>
        </Card>

        {/* Carte Documents */}
        <Card className="drop-shadow-xl shadow-indigo-200 ring-1 ring-blue-100 overflow-hidden">
          <CardHeader className="p-3 md:p-6 pb-1 md:pb-2">
            <CardTitle className="text-[11px] md:text-sm font-medium flex items-center gap-1.5 md:gap-2 text-gray-600">
              <Upload className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-600" />
              <span className="truncate">Documents</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
            <p className="text-xl md:text-2xl font-bold text-gray-900">
              {dossiers.reduce((acc, d) => acc + d.documents.length, 0)}
            </p>
            <p className="text-[9px] md:text-xs text-gray-400 mt-0.5 md:mt-1 uppercase tracking-wider">Déposés</p>
          </CardContent>
        </Card>

        {/* Carte Validées - Prend toute la largeur sur mobile si on est en grid-cols-2 ? 
      On peut la laisser ainsi ou la forcer sur une ligne avec 'col-span-2 md:col-span-1' */}
        <Card className="col-span-2 md:col-span-1 drop-shadow-xl shadow-indigo-200 ring-1 ring-blue-100 overflow-hidden">
          <CardHeader className="p-3 md:p-6 pb-1 md:pb-2">
            <CardTitle className="text-[11px] md:text-sm font-medium flex items-center gap-1.5 md:gap-2 text-gray-600">
              <CreditCard className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-600" />
              <span className="truncate">Validées</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0 md:pt-0 flex md:block items-baseline gap-2">
            <p className="text-xl md:text-2xl font-bold text-gray-900">
              {dossiers.filter(d => d.statut === "VALIDE").length}
            </p>
            <p className="text-[9px] md:text-xs text-gray-400 mt-0.5 md:mt-1 uppercase tracking-wider">Confirmées</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des candidatures */}
      <Card className="drop-shadow-2xl shadow-indigo-300 ring-1 ring-blue-200">
        <CardHeader>
          <CardTitle className="text-base">Mes candidatures</CardTitle>
        </CardHeader>
        <CardContent>
          {dossiers.length === 0 ? (
            <div className="text-center py-10">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-200" />
              <p className="text-gray-400 mb-4">Aucune candidature pour l&apos;instant</p>
              <Link href="/dashboard/dossier/nouveau">
                <Button variant="outline" className="mx-auto bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 transition-transform duration-300 cursor-pointer">
                  <Plus className="w-4 h-4 mr-2" /> Créer ma première candidature
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {dossiers.map(d => {
                const statut = STATUT_CONFIG[d.statut]
                const paye = d.paiements.some(p => p.statut === "SUCCES")
                return (
                  <Link key={d.id} href={`/dashboard/dossier/${d.id}`}>
                    <div className="flex items-center gap-4 p-3 m-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100">
                      <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {d.titre || d.domaine || "Candidature sans titre"}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mt-0.5">
                          <span className="hidden sm:inline">{d.niveauSouhaite || "Niveau non défini"}</span>
                          <span>{d.documents.length} doc(s)</span>
                          <span className={paye ? "bg-green-200 py-1 px-3 text-center text-green-700 rounded-full" : "bg-red-200 py-1 px-3 rounded-full text-red-700"}>
                            {paye ? "Payé" : "Non payé"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statut.color}`}>
                          {statut.label}
                        </span>
                        <ArrowRight className="w-4 h-4 text-gray-300" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}