import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FolderOpen, User, ChevronRight } from "lucide-react"
import Link from "next/link"

const STATUT_CONFIG: Record<string, { label: string; color: string }> = {
  BROUILLON: { label: "Brouillon", color: "bg-gray-100 text-gray-600" },
  SOUMIS: { label: "Soumis", color: "bg-blue-100 text-blue-700" },
  EN_ETUDE: { label: "En étude", color: "bg-yellow-100 text-yellow-700" },
  VALIDE: { label: "Validé", color: "bg-green-100 text-green-700" },
  REJETE: { label: "Rejeté", color: "bg-red-100 text-red-700" },
}

export default async function AdminDossiers({ searchParams }: { searchParams: { statut?: string } }) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard")

  const statut = searchParams.statut

  const dossiers = await prisma.dossier.findMany({
    where: statut ? { statut: statut as any } : {},
    include: { user: true, documents: true, paiements: true },
    orderBy: { updatedAt: "desc" },
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dossiers VAE</h1>
        <p className="text-gray-500 mt-1">{dossiers.length} dossier(s) trouvé(s)</p>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { value: "", label: "Tous" },
          { value: "SOUMIS", label: "Soumis" },
          { value: "EN_ETUDE", label: "En étude" },
          { value: "VALIDE", label: "Validés" },
          { value: "REJETE", label: "Rejetés" },
          { value: "BROUILLON", label: "Brouillons" },
        ].map(f => (
          <Link key={f.value} href={f.value ? `/admin/dossiers?statut=${f.value}` : "/admin/dossiers"}>
            <button className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              statut === f.value || (!statut && !f.value)
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
            }`}>
              {f.label}
            </button>
          </Link>
        ))}
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {dossiers.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Aucun dossier trouvé</p>
          </div>
        ) : (
          dossiers.map(d => (
            <Link key={d.id} href={`/admin/dossiers/${d.id}`}>
              <Card className="shadow-sm hover:shadow-md transition-all cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-sm font-bold text-indigo-600 flex-shrink-0">
                      {d.user.prenom[0]}{d.user.nom[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-gray-900 text-sm">{d.user.prenom} {d.user.nom}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUT_CONFIG[d.statut].color}`}>
                          {STATUT_CONFIG[d.statut].label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>{d.domaine || "Domaine non renseigné"}</span>
                        <span>{d.niveauSouhaite || ""}</span>
                        <span>{d.documents.length} doc(s)</span>
                        <span>{d.paiements.filter(p => p.statut === "SUCCES").length > 0 ? "💳 Payé" : "⏳ Non payé"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{new Date(d.updatedAt).toLocaleDateString("fr-FR")}</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}