"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Camera, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import { UserProfil } from "@/Utils/VAE.type"

const PAYS = ["Togo", "Bénin", "Côte d'Ivoire", "Sénégal", "Mali", "Burkina Faso", "Cameroun", "Autre"]

export default function ParametresPage() {
  const [loading, setLoading] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [user, setUser] = useState<UserProfil | null>(null)
  const [pays, setPays] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch("/api/profil")
      .then(r => r.json())
      .then((data: { user: UserProfil }) => {
        if (data.user) {
          setUser(data.user)
          setPays(data.user.pays || "")
        }
      })
  }, [])

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPhoto(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json() as { url: string; error?: string }
      if (!res.ok) throw new Error(data.error || "Erreur upload")

      await fetch("/api/profil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoProfil: data.url }),
      })
      setUser(prev => prev ? { ...prev, photoProfil: data.url } : null)
    } catch (err) {
      if (err instanceof Error) setError(err.message)
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const res = await fetch("/api/profil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nom: form.get("nom") as string,
        prenom: form.get("prenom") as string,
        telephone: form.get("telephone") as string,
        pays,
        motDePasseActuel: form.get("motDePasseActuel") as string,
        nouveauMotDePasse: form.get("nouveauMotDePasse") as string,
      }),
    })

    const data = await res.json() as { user?: UserProfil; error?: string }
    setLoading(false)

    if (!res.ok) {
      setError(data.error || "Erreur lors de la mise à jour")
    } else {
      if (data.user) setUser(data.user)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  if (!user) return (
    <div className="flex items-center justify-center min-h-64">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-500 mt-1">Gérez votre profil et vos informations personnelles</p>
      </div>

      {/* Photo de profil */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Photo de profil</CardTitle>
          <CardDescription>Personnalisez votre avatar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative">
              {user.photoProfil ? (
                <Image
                  src={user.photoProfil}
                  alt="avatar"
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                />
              ) : (
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center border-4 border-white shadow-md">
                  <span className="text-2xl font-bold text-indigo-600">
                    {user.prenom?.[0]}{user.nom?.[0]}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-white hover:bg-indigo-700 transition-colors"
              >
                {uploadingPhoto
                  ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                  : <Camera className="w-3.5 h-3.5 text-white" />
                }
              </button>
            </div>
            <div>
              <p className="font-medium text-gray-900">{user.prenom} {user.nom}</p>
              <p className="text-sm text-gray-400">{user.email}</p>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="text-xs text-indigo-600 hover:underline mt-1"
              >
                Changer la photo
              </button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".jpg,.jpeg,.png"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Infos personnelles */}
      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prénom</Label>
                <Input name="prenom" defaultValue={user.prenom} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input name="nom" defaultValue={user.nom} className="h-11" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user.email} disabled className="h-11 opacity-60" />
              <p className="text-xs text-gray-400">L&apos;email ne peut pas être modifié</p>
            </div>
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input
                name="telephone"
                defaultValue={user.telephone || ""}
                placeholder="+228 90 00 00 00"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>Pays</Label>
              <Select value={pays} onValueChange={setPays}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Sélectionner un pays" />
                </SelectTrigger>
                <SelectContent>
                  {PAYS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Mot de passe */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Changer le mot de passe</CardTitle>
            <CardDescription>Laissez vide si vous ne voulez pas changer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Mot de passe actuel</Label>
              <Input name="motDePasseActuel" type="password" placeholder="••••••••" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label>Nouveau mot de passe</Label>
              <Input name="nouveauMotDePasse" type="password" placeholder="8 caractères minimum" className="h-11" />
            </div>
          </CardContent>
        </Card>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
            {error}
          </p>
        )}
        {success && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-100 rounded-lg px-3 py-2 mb-4">
            <CheckCircle2 className="w-4 h-4" /> Profil mis à jour avec succès !
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11"
          style={{ background: "linear-gradient(135deg, #4f46e5, #6366f1)" }}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "Mise à jour..." : "Enregistrer les modifications"}
        </Button>
      </form>
    </div>
  )
}