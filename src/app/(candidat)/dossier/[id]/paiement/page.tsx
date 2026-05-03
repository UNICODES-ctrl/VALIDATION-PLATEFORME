"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, CreditCard, Upload, Loader2, Receipt, Clock, XCircle, Eye } from "lucide-react"
import Link from "next/link"

const MONTANT_VAE = 25000

const RIB_INFO = {
  banque: "Ecobank Togo",
  titulaire: "UNICODES",
  rib: "TG53 TG007 01000 12345678901 45",
  reference: "VAE-DOSSIER-[VOTRE-ID]",
}

interface Paiement {
  id: string
  montant: number
  modePaiement: string
  statut: "EN_ATTENTE" | "SUCCES" | "ECHEC"
  bordereauUrl: string | null
  commentaire: string | null
  referenceExt: string | null
  createdAt: string
}

export default function PaiementDossierPage() {
  const params = useParams()
  const dossierId = params.id as string
  const [uploading, setUploading] = useState(false)
  const [paiements, setPaiements] = useState<Paiement[]>([])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch(`/api/paiement?dossierId=${dossierId}`)
      .then(r => r.json())
      .then(data => { if (data.paiements) setPaiements(data.paiements) })
  }, [dossierId])

  const paiementSucces = paiements.find(p => p.statut === "SUCCES")
  const paiementEnAttente = paiements.find(p => p.statut === "EN_ATTENTE")

  const handleBordereauUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError("")
    setUploading(true)

    try {
      // Upload du fichier
      const formData = new FormData()
      formData.append("file", file)
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
      const uploadData = await uploadRes.json() as { url: string; error?: string }
      if (!uploadRes.ok) throw new Error(uploadData.error || "Erreur upload")

      // Création du paiement avec le bordereau
      const res = await fetch("/api/paiement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dossierId,
          montant: MONTANT_VAE,
          modePaiement: "VIREMENT",
          bordereauUrl: uploadData.url,
        }),
      })
      const data = await res.json() as { paiement?: Paiement; error?: string }
      if (!res.ok) throw new Error(data.error || "Erreur")

      if (data.paiement) {
        setPaiements(prev => [data.paiement!, ...prev])
        setSuccess(true)
      }
    } catch (err) {
      if (err instanceof Error) setError(err.message)
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href={`/dashboard/dossier/${dossierId}`} className="text-sm text-indigo-600 hover:underline mb-6 block">
        ← Retour à la candidature
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Paiement VAE</h1>
        <p className="text-gray-500 mt-1">Réglez les frais de traitement par virement bancaire</p>
      </div>

      {/* Statut paiement validé */}
      {paiementSucces && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-800">Paiement confirmé par l&apos;administration</p>
            <p className="text-sm text-green-600">Votre dossier est en cours de traitement</p>
          </div>
        </div>
      )}

      {/* Statut en attente */}
      {paiementEnAttente && !paiementSucces && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-3">
          <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-yellow-800">Bordereau soumis — en attente de vérification</p>
            <p className="text-sm text-yellow-600">L&apos;administration vérifiera votre virement sous 24-48h</p>
          </div>
        </div>
      )}

      {/* Paiement rejeté */}
      {paiements.find(p => p.statut === "ECHEC") && !paiementSucces && !paiementEnAttente && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="font-semibold text-red-800">Paiement rejeté</p>
          </div>
          {paiements.find(p => p.statut === "ECHEC")?.commentaire && (
            <p className="text-sm text-red-600 ml-8">
              Motif : {paiements.find(p => p.statut === "ECHEC")?.commentaire}
            </p>
          )}
          <p className="text-sm text-red-500 ml-8 mt-1">Veuillez soumettre un nouveau bordereau.</p>
        </div>
      )}

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

      {/* Coordonnées bancaires */}
      {!paiementSucces && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Coordonnées bancaires</CardTitle>
            <CardDescription>Effectuez votre virement vers ce compte</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Banque", value: RIB_INFO.banque },
              { label: "Titulaire", value: RIB_INFO.titulaire },
              { label: "RIB / IBAN", value: RIB_INFO.rib },
              { label: "Référence à indiquer", value: `VAE-${dossierId.slice(0, 8).toUpperCase()}` },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-500">{item.label}</span>
                <span className="text-sm font-semibold text-gray-900 font-mono">{item.value}</span>
              </div>
            ))}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-700 font-medium">Important : mentionnez obligatoirement la référence lors de votre virement pour que nous puissions identifier votre paiement.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload bordereau */}
      {!paiementSucces && !paiementEnAttente && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Upload className="w-4 h-4 text-indigo-600" /> Soumettre le bordereau
            </CardTitle>
            <CardDescription>Après votre virement, scannez et déposez le bordereau ici</CardDescription>
          </CardHeader>
          <CardContent>
            <label className="cursor-pointer block">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={handleBordereauUpload}
                disabled={uploading}
              />
              <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                uploading ? "border-indigo-300 bg-indigo-50" : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50"
              }`}>
                {uploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    <p className="text-sm text-indigo-600 font-medium">Envoi en cours...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Upload className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Cliquez pour déposer votre bordereau</p>
                      <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG — max 8 MB</p>
                    </div>
                  </div>
                )}
              </div>
            </label>

            {error && <p className="text-sm text-red-500 mt-3 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
            {success && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-100 rounded-lg px-3 py-2 mt-3">
                <CheckCircle2 className="w-4 h-4" /> Bordereau soumis ! En attente de vérification.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Historique */}
      {paiements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="w-4 h-4 text-gray-500" /> Historique
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {paiements.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    p.statut === "SUCCES" ? "bg-green-100" :
                    p.statut === "ECHEC" ? "bg-red-100" : "bg-yellow-100"
                  }`}>
                    {p.statut === "SUCCES" ? <CheckCircle2 className="w-4 h-4 text-green-600" /> :
                     p.statut === "ECHEC" ? <XCircle className="w-4 h-4 text-red-500" /> :
                     <Clock className="w-4 h-4 text-yellow-600" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Virement bancaire</p>
                    <p className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString("fr-FR")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {p.bordereauUrl && (
                    <a href={p.bordereauUrl} target="_blank" rel="noreferrer">
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-indigo-600">
                        <Eye className="w-3 h-3 mr-1" /> Bordereau
                      </Button>
                    </a>
                  )}
                  <div className="text-right">
                    <p className="font-semibold">{p.montant.toLocaleString()} FCFA</p>
                    <Badge className={`text-xs ${
                      p.statut === "SUCCES" ? "bg-green-100 text-green-700" :
                      p.statut === "ECHEC" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {p.statut === "SUCCES" ? "Confirmé" : p.statut === "ECHEC" ? "Rejeté" : "En attente"}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}