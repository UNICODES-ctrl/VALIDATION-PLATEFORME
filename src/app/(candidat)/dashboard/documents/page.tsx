"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useState, useEffect } from "react"
import { CheckCircle2, Upload, FileText, File, Trash2, Eye, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@supabase/supabase-js"
import { Document, TypeDocument } from "@/Utils/VAE.type"

const DOCUMENTS_REQUIS = [
  { type: "CV", label: "Curriculum Vitae", desc: "Votre CV à jour", required: true },
  { type: "DIPLOME", label: "Diplômes", desc: "Copies de vos diplômes obtenus", required: true },
  { type: "ATTESTATION", label: "Attestations de travail", desc: "Attestations de vos employeurs", required: true },
  { type: "CERTIFICAT", label: "Certificats", desc: "Certificats de formation", required: false },
  { type: "AUTRE", label: "Autres documents", desc: "Tout autre justificatif utile", required: false },
]

function UploadZone({ type, onUploaded }: {
  type: string
  onUploaded: (url: string, name: string, size: number) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError("")
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erreur upload")

      onUploaded(data.url, data.name, data.size)
    } catch (err: unknown) {
      const error = err as Error
      if (error.message?.includes("security")) {
        setError("Erreur de configuration — contactez l'admin")
      } else if (error.message?.includes("size")) {
        setError("Fichier trop volumineux (max 8MB)")
      } else {
        setError(error.message || "Erreur lors du dépôt")
      }
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  return (
    <div>
      <label className="cursor-pointer">
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={handleFile}
          disabled={uploading}
        />
        <Button
          size="sm"
          variant="outline"
          disabled={uploading}
          className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 pointer-events-none"
          asChild
        >
          <span>
            {uploading
              ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Upload...</>
              : <><Upload className="w-3.5 h-3.5 mr-1.5" />Déposer</>
            }
          </span>
        </Button>
      </label>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

function DocumentsContent() {
  const searchParams = useSearchParams()
  const fromDossier = searchParams.get("from") === "dossier"
  const [documents, setDocuments] = useState<Record<TypeDocument, Document[]>>({
    [TypeDocument.CV]: [],
    [TypeDocument.DIPLOME]: [],
    [TypeDocument.ATTESTATION]: [],
    [TypeDocument.CERTIFICAT]: [],
    [TypeDocument.AUTRE]: []
  })
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/documents").then(r => r.json()).then(data => {
      if (data.documents) {
        const grouped: Record<TypeDocument, Document[]> = {} as Record<TypeDocument, Document[]>
        data.documents.forEach((d: Document) => {
          if (!grouped[d.type]) grouped[d.type] = []
          grouped[d.type].push(d)
        })
        setDocuments(grouped)
      }
    })
  }, [])

  const handleUploaded = async (type: string, url: string, name: string, size: number) => {
    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, url, nom: name, taille: size }),
    })
    const data = await res.json()
    setDocuments(prev => ({
      ...prev,
      [type as TypeDocument]: [...(prev[type as TypeDocument] || []), data.document]
    }))
  }

  const handleDelete = async (type: string, id: string) => {
    setDeleting(id)
    await fetch(`/api/documents/${id}`, { method: "DELETE" })
    setDocuments(prev => ({
      ...prev,
      [type]: prev[type as TypeDocument]?.filter((d: Document) => d.id !== id) || []
    }))
    setDeleting(null)
  }

  const totalUploaded = Object.values(documents).flat().length
  const requiredDone = DOCUMENTS_REQUIS.filter(d => d.required && (documents[d.type as TypeDocument]?.length ?? 0) > 0).length
  const totalRequired = DOCUMENTS_REQUIS.filter(d => d.required).length

  return (
    <div className="max-w-3xl mx-auto">
      {fromDossier && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-800">Dossier soumis avec succès !</p>
            <p className="text-sm text-green-600">Déposez maintenant vos documents justificatifs.</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents justificatifs</h1>
          <p className="text-gray-500 mt-1">Déposez les pièces nécessaires à votre dossier</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-indigo-600">{requiredDone}/{totalRequired}</p>
          <p className="text-xs text-gray-400">documents requis</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
            style={{ width: `${(requiredDone / totalRequired) * 100}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">{totalUploaded} fichier(s) déposé(s) au total</p>
      </div>

      <div className="space-y-3 mb-8">
        {DOCUMENTS_REQUIS.map((doc) => {
          const uploaded = documents[doc.type as TypeDocument] || []
          const isDone = uploaded.length > 0

          return (
            <Card key={doc.type} className={`shadow-sm transition-all ${isDone ? "border-green-200 bg-green-50/30" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isDone ? "bg-green-100" : "bg-indigo-50"}`}>
                    {isDone
                      ? <CheckCircle2 className="w-5 h-5 text-green-600" />
                      : <FileText className="w-5 h-5 text-indigo-600" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-medium text-gray-900 text-sm">{doc.label}</p>
                      {doc.required
                        ? <Badge className="text-xs bg-red-50 text-red-600 border-red-200 hover:bg-red-50">Requis</Badge>
                        : <Badge variant="outline" className="text-xs text-gray-400">Optionnel</Badge>
                      }
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{doc.desc}</p>

                    {uploaded.map((f: Document) => (
                      <div key={f.id} className="flex items-center gap-2 mb-1 p-2 bg-white rounded-lg border border-gray-100 text-xs">
                        <File className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="flex-1 truncate text-gray-600">{f.nom}</span>
                        <span className="text-gray-300">{Math.round(f.taille / 1024)} Ko</span>
                        <a href={f.url} target="_blank" rel="noreferrer">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-indigo-600">
                            <Eye className="w-3 h-3" />
                          </Button>
                        </a>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                          onClick={() => handleDelete(doc.type, f.id)}
                          disabled={deleting === f.id}
                        >
                          {deleting === f.id
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <Trash2 className="w-3 h-3" />
                          }
                        </Button>
                      </div>
                    ))}
                  </div>
                  <UploadZone
                    type={doc.type}
                    onUploaded={(url, name, size) => handleUploaded(doc.type, url, name, size)}
                  />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-500">
        <p className="font-medium text-gray-700 mb-1">Formats acceptés</p>
        <p>PDF, JPG, PNG · Taille maximale : 8 MB par fichier</p>
      </div>
    </div>
  )
}

export default function DocumentsPage() {
  return (
    <Suspense>
      <DocumentsContent />
    </Suspense>
  )
}