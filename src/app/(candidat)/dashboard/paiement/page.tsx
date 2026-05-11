"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, CreditCard, Smartphone, Loader2, Receipt, Clock } from "lucide-react"

const MONTANT_VAE = 25000 // en FCFA

interface Paiement {
  id: string
  statut: "SUCCES" | "ECHEC" | "EN_ATTENTE"
  operateur: string
  telephone: string
  montant: number
  createdAt: string
}

const OPERATEURS = [
  { id: "TMONEY", label: "T-Money", color: "bg-red-50 border-red-200 text-red-700", activeColor: "border-red-500 bg-red-50" },
  { id: "FLOOZ", label: "Flooz (Moov)", color: "bg-blue-50 border-blue-200 text-blue-700", activeColor: "border-blue-500 bg-blue-50" },
]

export default function PaiementPage() {
  const [operateur, setOperateur] = useState<string>("")
  const [telephone, setTelephone] = useState("")
  const [loading, setLoading] = useState(false)
  const [paiements, setPaiements] = useState<Paiement[]>([])
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/paiement")
      .then(r => r.json())
      .then(data => {
        if (data.paiements) setPaiements(data.paiements)
      })
  }, [])

  const paiementSucces = paiements.find(p => p.statut === "SUCCES")

  const handlePaiement = async () => {
    if (!operateur) return setError("Choisissez un opérateur")
    if (!telephone || telephone.length < 8) return setError("Numéro de téléphone invalide")

    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/paiement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operateur, telephone, montant: MONTANT_VAE }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      setPaiements(prev => [data.paiement, ...prev])
      setSuccess(true)
      setTelephone("")
      setOperateur("")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors du paiement"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-0">

      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Paiement VAE</h1>
        <p className="text-gray-500 mt-1">Réglez les frais de traitement de votre dossier</p>
      </div>

      {/* Statut paiement */}
      {paiementSucces ? (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-800">Paiement effectué ✓</p>
            <p className="text-sm text-green-600">Votre dossier est en cours de traitement</p>
          </div>
        </div>
      ) : (
        <>
          {/* Montant */}
          <Card className="mb-6 border-indigo-100 bg-gradient-to-br from-indigo-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Frais de dossier VAE</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {MONTANT_VAE.toLocaleString()} <span className="text-lg font-medium text-gray-500">FCFA</span>
                  </p>
                </div>
                <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center">
                  <CreditCard className="w-7 h-7 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formulaire paiement */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-indigo-600" />
                Paiement Mobile Money
              </CardTitle>
              <CardDescription>Choisissez votre opérateur et entrez votre numéro</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Choix opérateur */}
              <div className="space-y-2">
                <Label>Opérateur</Label>
                <div className="grid grid-cols-2 gap-3">
                  {OPERATEURS.map(op => (
                    <button
                      key={op.id}
                      onClick={() => setOperateur(op.id)}
                      className={`p-4 rounded-xl border-2 text-sm font-semibold transition-all ${operateur === op.id
                        ? op.activeColor + " shadow-sm"
                        : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200"
                        }`}
                    >
                      {op.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Numéro téléphone */}
              <div className="space-y-2">
                <Label htmlFor="telephone">Numéro Mobile Money</Label>
                <Input
                  id="telephone"
                  type="tel"
                  placeholder="+228 90 00 00 00"
                  value={telephone}
                  onChange={e => setTelephone(e.target.value)}
                  className="h-11"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              {success && (
                <p className="text-sm text-green-600 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                  ✓ Paiement initié avec succès ! Vous recevrez une confirmation par SMS.
                </p>
              )}

              <Button
                onClick={handlePaiement}
                disabled={loading || !operateur || !telephone}
                className="w-full h-11 font-semibold"
                style={{ background: "linear-gradient(135deg, #4f46e5, #6366f1)" }}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Traitement en cours..." : `Payer ${MONTANT_VAE.toLocaleString()} FCFA`}
              </Button>

              <p className="text-xs text-center text-gray-400">
                Paiement sécurisé via PAYgate · TMoney & Flooz
              </p>
            </CardContent>
          </Card>
        </>
      )}

      {/* Historique */}
      {paiements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="w-4 h-4 text-gray-500" />
              Historique des paiements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {paiements.map((p: Paiement) => (
              <div key={p.id} className="flex items-start sm:items-center justify-between p-3 bg-gray-50 rounded-lg text-sm gap-2">

                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${p.statut === "SUCCES" ? "bg-green-100" :
                    p.statut === "ECHEC" ? "bg-red-100" : "bg-yellow-100"
                    }`}>
                    {p.statut === "SUCCES" ? <CheckCircle2 className="w-4 h-4 text-green-600" /> :
                      p.statut === "ECHEC" ? <span className="text-red-500 text-xs">✗</span> :
                        <Clock className="w-4 h-4 text-yellow-600" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 text-xs sm:text-sm truncate">{p.operateur} · {p.telephone}</p>
                    <p className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString("fr-FR")}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-gray-900 text-xs sm:text-sm">{p.montant.toLocaleString()} FCFA</p>

                  <Badge className={`text-xs ${p.statut === "SUCCES" ? "bg-green-100 text-green-700" :
                    p.statut === "ECHEC" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                    {p.statut === "SUCCES" ? "Succès" : p.statut === "ECHEC" ? "Échec" : "En attente"}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}