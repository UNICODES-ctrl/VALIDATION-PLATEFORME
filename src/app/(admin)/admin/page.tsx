import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FolderOpen, CheckCircle, CreditCard, Clock, XCircle } from "lucide-react"
import Link from "next/link"

export default async function AdminDashboard() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard")

  const [totalCandidats, totalDossiers, dossiersSoumis, dossiersEnEtude, dossiersValides, dossiersRejetes, totalPaiements] = await Promise.all([
    prisma.user.count({ where: { role: "CANDIDAT" } }),
    prisma.dossier.count(),
    prisma.dossier.count({ where: { statut: "SOUMIS" } }),
    prisma.dossier.count({ where: { statut: "EN_ETUDE" } }),
    prisma.dossier.count({ where: { statut: "VALIDE" } }),
    prisma.dossier.count({ where: { statut: "REJETE" } }),
    prisma.paiement.aggregate({
      where: { statut: "SUCCES" },
      _sum: { montant: true },
      _count: true,
    }),
  ])

  const recentDossiers = await prisma.dossier.findMany({
    where: { statut: { in: ["SOUMIS", "EN_ETUDE"] } },
    include: { user: true },
    orderBy: { updatedAt: "desc" },
    take: 5,
  })

console.log("Premier dossier:", JSON.stringify(recentDossiers[0]?.user))

  const STATUT_CONFIG: Record<string, { label: string; color: string }> = {
    BROUILLON: { label: "Brouillon", color: "bg-gray-100 text-gray-600" },
    SOUMIS: { label: "Soumis", color: "bg-blue-100 text-blue-700" },
    EN_ETUDE: { label: "En étude", color: "bg-yellow-100 text-yellow-700" },
    VALIDE: { label: "Validé", color: "bg-green-100 text-green-700" },
    REJETE: { label: "Rejeté", color: "bg-red-100 text-red-700" },
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 mt-1">Vue d&apos;ensemble de la plateforme VAE</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Candidats", value: totalCandidats, icon: Users, color: "text-indigo-600 bg-indigo-50" },
          { label: "Dossiers total", value: totalDossiers, icon: FolderOpen, color: "text-blue-600 bg-blue-50" },
          { label: "En attente", value: dossiersSoumis + dossiersEnEtude, icon: Clock, color: "text-yellow-600 bg-yellow-50" },
          { label: "Validés", value: dossiersValides, icon: CheckCircle, color: "text-green-600 bg-green-50" },
        ].map(stat => (
          <Card key={stat.label} className="shadow-sm border-0">
            <CardContent className="p-5 border-0">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">{stat.label}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenus */}
      <Card className="mb-8  bg-gradient-to-l from-indigo-200 to-sky-200 border-0 drop-shadow-2xl shadow-indigo-300 transition-all duration-700 ">
        <CardContent className="p-5 border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Revenus total (paiements validés)</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {(totalPaiements._sum.montant || 0).toLocaleString()} <span className="text-lg font-medium text-gray-500">FCFA</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">{totalPaiements._count} transaction(s)</p>
            </div>
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
              <CreditCard className="w-7 h-7 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dossiers récents */}
      <Card className="drop-shadow-2xl shadow-indigo-300 ring-1 ring-blue-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Dossiers à traiter</CardTitle>
          <Link href="/admin/dossiers" className="text-sm text-indigo-600 hover:underline">Voir tous</Link>
        </CardHeader>
        <CardContent>
          {recentDossiers.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Aucun dossier en attente</p>
          ) : (
            <div className="space-y-2">
              {recentDossiers.map(d => (
                <Link key={d.id} href={`/admin/dossiers/${d.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-indigo-400 hover:text-white transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-indigo-500 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0">
                      {(d.user?.prenom?.[0] || "U")}{(d.user?.nom?.[0] || "")}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-semibold text-gray-900">
                        {d.user?.prenom || "Prénom non renseigné"} {d.user?.nom || "Nom non renseigné"}
                      </p>
                      <p className="text-xs text-gray-400">{d.domaine || "Domaine non renseigné"}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUT_CONFIG[d.statut].color}`}>
                    {STATUT_CONFIG[d.statut].label}
                  </span>
                </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}