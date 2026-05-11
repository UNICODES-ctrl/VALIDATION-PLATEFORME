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

      {/* Stats : 2 colonnes sur mobile, 4 sur desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        {[
          { label: "Candidats", value: totalCandidats, icon: Users, color: "text-indigo-600 bg-indigo-50" },
          { label: "Dossiers", value: totalDossiers, icon: FolderOpen, color: "text-blue-600 bg-blue-50" },
          { label: "En attente", value: dossiersSoumis + dossiersEnEtude, icon: Clock, color: "text-yellow-600 bg-yellow-50" },
          { label: "Validés", value: dossiersValides, icon: CheckCircle, color: "text-green-600 bg-green-50" },
        ].map(stat => (
          <Card key={stat.label} className="shadow-sm border-0 overflow-hidden">
            <CardContent className="p-3 md:p-5">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <span className="text-[11px] md:text-sm text-gray-500 font-medium truncate">{stat.label}</span>
                <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center ${stat.color} flex-shrink-0`}>
                  <stat.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </div>
              </div>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenus : Plus compact sur mobile */}
      <Card className="mb-8 bg-gradient-to-l from-indigo-200 to-sky-200 border-0 drop-shadow-2xl shadow-indigo-300 transition-all duration-700">
        <CardContent className="p-4 md:p-5 border-0">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 text-black">
              <p className="text-[11px] md:text-sm text-gray-600 font-medium uppercase tracking-wider">Revenus validés</p>
              <div className="flex items-baseline gap-1 mt-1">
                <p className="text-xl md:text-3xl font-bold text-gray-900 truncate">
                  {(totalPaiements._sum.montant || 0).toLocaleString()}
                </p>
                <span className="text-xs md:text-lg font-semibold text-gray-700">FCFA</span>
              </div>
              <p className="text-[10px] md:text-xs text-indigo-700 font-medium mt-1">{totalPaiements._count} transaction(s)</p>
            </div>
            <div className="w-10 h-10 md:w-14 md:h-14 bg-white/50 backdrop-blur-sm rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5 md:w-7 md:h-7 text-indigo-700" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dossiers récents */}
      <Card className="drop-shadow-2xl shadow-indigo-300 ring-1 ring-blue-200">
        <CardHeader className="flex flex-row items-center justify-between p-4 md:p-6 pb-2 md:pb-4">
          <CardTitle className="text-sm md:text-base">Dossiers à traiter</CardTitle>
          <Link href="/admin/dossiers" className="text-xs md:text-sm text-indigo-600 font-semibold hover:underline">Voir tous</Link>
        </CardHeader>
        <CardContent className="p-2 md:p-6 pt-0 md:pt-0">
          {recentDossiers.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">Aucun dossier en attente</p>
          ) : (
            <div className="space-y-1">
              {recentDossiers.map(d => (
                <Link key={d.id} href={`/admin/dossiers/${d.id}`}>
                  <div className="flex items-center justify-between p-2.5 md:p-3 rounded-lg hover:bg-indigo-600 hover:text-white transition-all cursor-pointer group">
                    <div className="flex items-center gap-2 md:gap-3 min-w-0">
                      <div className="w-8 h-8 md:w-9 md:h-9 bg-indigo-500 rounded-full flex items-center justify-center text-[10px] md:text-sm font-semibold text-white flex-shrink-0">
                        {(d.user?.prenom?.[0] || "U")}{(d.user?.nom?.[0] || "")}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className="text-[11px] md:text-sm font-semibold text-gray-900 group-hover:text-white truncate">
                          {d.user?.prenom} {d.user?.nom}
                        </p>
                        <p className="text-[10px] md:text-xs text-gray-400 group-hover:text-indigo-100 truncate">{d.domaine}</p>
                      </div>
                    </div>
                    <span className={`text-[9px] md:text-xs px-2 py-0.5 md:py-1 rounded-full font-bold uppercase ${STATUT_CONFIG[d.statut].color} group-hover:bg-white group-hover:text-indigo-600 flex-shrink-0`}>
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