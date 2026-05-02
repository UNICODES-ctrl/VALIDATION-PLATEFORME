import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Upload, CreditCard, ArrowRight, Clock, Plus } from "lucide-react"
import Link from "next/link"

const STATUT_CONFIG = {
  BROUILLON:  { label: "Brouillon",  color: "bg-gray-100 text-gray-600" },
  SOUMIS:     { label: "Soumis",     color: "bg-blue-100 text-blue-700" },
  EN_ETUDE:   { label: "En étude",   color: "bg-yellow-100 text-yellow-700" },
  VALIDE:     { label: "Validé",     color: "bg-green-100 text-green-700" },
  REJETE:     { label: "Rejeté",     color: "bg-red-100 text-red-700" },
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
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Bonjour, {session.user?.name?.split(" ")[0]} 
          </h1>
          <p className="text-gray-500 mt-1">Gérez vos candidatures VAE</p>
        </div>
        <Link href="/dashboard/dossier/nouveau">
          <Button style={{ background: "linear-gradient(135deg, #4f46e5, #6366f1)" }}>
            <Plus className="w-4 h-4 mr-2" /> Nouvelle candidature
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Candidatures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{dossiers.length}</p>
            <p className="text-xs text-gray-400 mt-1">Au total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Upload className="w-4 h-4" /> Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{dossiers.reduce((acc, d) => acc + d.documents.length, 0)}</p>
            <p className="text-xs text-gray-400 mt-1">Fichiers déposés</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Validées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{dossiers.filter(d => d.statut === "VALIDE").length}</p>
            <p className="text-xs text-gray-400 mt-1">Candidatures validées</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des candidatures */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mes candidatures</CardTitle>
        </CardHeader>
        <CardContent>
          {dossiers.length === 0 ? (
            <div className="text-center py-10">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-200" />
              <p className="text-gray-400 mb-4">Aucune candidature pour l&apos;instant</p>
              <Link href="/dashboard/dossier/nouveau">
                <Button variant="outline">
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
                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                          <span>{d.niveauSouhaite || "Niveau non défini"}</span>
                          <span>{d.documents.length} doc(s)</span>
                          <span className={paye ? "bg-green-200 py-2 w-24 text-center  text-green-700 px-5 rounded-full" : "bg-red-200 py-2 px-5 rounded-full text-red-700" } >{paye ? "Payé" : "Non payé"}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
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