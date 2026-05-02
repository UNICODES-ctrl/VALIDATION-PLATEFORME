"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Clock, Loader2, CreditCard } from "lucide-react"
import { useRouter } from "next/navigation"

interface Props {
  dossierId: string
  currentStatut: string
  paiementEnAttente?: { id: string; bordereauUrl: string | null } | null
}

export default function AdminDossierActions({ dossierId, currentStatut, paiementEnAttente }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [motif, setMotif] = useState("")
  const [showRejetPaiement, setShowRejetPaiement] = useState(false)

  const updateStatut = async (statut: string) => {
    setLoading(statut)
    await fetch(`/api/admin/dossiers/${dossierId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut }),
    })
    setLoading(null)
    router.refresh()
  }

  const confirmerPaiement = async () => {
    if (!paiementEnAttente) return
    setLoading("paiement_ok")
    await fetch(`/api/admin/paiements/${paiementEnAttente.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut: "SUCCES" }),
    })
    setLoading(null)
    router.refresh()
  }

  const rejeterPaiement = async () => {
    if (!paiementEnAttente) return
    setLoading("paiement_ko")
    await fetch(`/api/admin/paiements/${paiementEnAttente.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut: "ECHEC", commentaire: motif }),
    })
    setLoading(null)
    setShowRejetPaiement(false)
    setMotif("")
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-3 items-end">
      {/* Actions dossier */}
      <div className="flex gap-2">
        {currentStatut === "SOUMIS" && (
          <Button size="sm" variant="outline" onClick={() => updateStatut("EN_ETUDE")}
            disabled={!!loading} className="border-yellow-200 text-yellow-700 hover:bg-yellow-50">
            {loading === "EN_ETUDE" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4 mr-1" />}
            Prendre en charge
          </Button>
        )}
        {["SOUMIS", "EN_ETUDE"].includes(currentStatut) && (
          <>
            <Button size="sm" onClick={() => updateStatut("VALIDE")}
              disabled={!!loading} className="bg-green-600 hover:bg-green-700 text-white">
              {loading === "VALIDE" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1" />}
              Valider
            </Button>
            <Button size="sm" variant="outline" onClick={() => updateStatut("REJETE")}
              disabled={!!loading} className="border-red-200 text-red-600 hover:bg-red-50">
              {loading === "REJETE" ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-1" />}
              Rejeter
            </Button>
          </>
        )}
      </div>

      {/* Actions paiement */}
      {paiementEnAttente && (
        <div className="flex flex-col gap-2 items-end">
          <div className="flex gap-2">
            {paiementEnAttente.bordereauUrl && (
              <a href={paiementEnAttente.bordereauUrl} target="_blank" rel="noreferrer">
                <Button size="sm" variant="outline" className="border-indigo-200 text-indigo-600">
                  Voir bordereau
                </Button>
              </a>
            )}
            <Button size="sm" onClick={confirmerPaiement}
              disabled={!!loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {loading === "paiement_ok" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4 mr-1" />}
              Confirmer paiement
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowRejetPaiement(true)}
              disabled={!!loading} className="border-red-200 text-red-600 hover:bg-red-50">
              Rejeter paiement
            </Button>
          </div>

          {showRejetPaiement && (
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Motif du rejet..."
                value={motif}
                onChange={e => setMotif(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 w-64 focus:outline-none focus:ring-2 focus:ring-red-300"
              />
              <Button size="sm" onClick={rejeterPaiement} disabled={!!loading || !motif}
                className="bg-red-600 hover:bg-red-700 text-white">
                {loading === "paiement_ko" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmer rejet"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowRejetPaiement(false)}>
                Annuler
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}