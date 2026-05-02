"use client"

import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Mail , Phone, LockKeyhole, CircleUserRound, Globe} from "lucide-react"

const PAYS = ["Togo", "Bénin", "Côte d'Ivoire", "Sénégal", "Mali", "Burkina Faso", "Cameroun", "Autre"]

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [pays, setPays] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const form = new FormData(e.currentTarget)

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nom: form.get("nom"),
        prenom: form.get("prenom"),
        email: form.get("email"),
        telephone: form.get("telephone"),
        pays,
        password: form.get("password"),
      }),
    })

    const json = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(json.error || "Une erreur est survenue")
    } else {
      router.push("/login?registered=1")
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-2 ">
      <div className="w-full max-w-2xl rounded-[32px] border border-slate-200 bg-white/95 shadow-2xl shadow-slate-200/60 backdrop-blur-xl drop-shadow-lg shadow-blue-600 hover:shadow-blue-700 transition-all duration-700 hover:scale-105">
        <div className="grid gap-6 lg:grid-cols-1">
          {/* <div className="relative overflow-hidden rounded-t-[32px] rounded-bl-[32px] bg-gradient-to-br from-indigo-600 via-sky-600 to-cyan-500 p-8 text-white sm:p-10">
            <div className="relative h-24 w-24 overflow-hidden rounded-3xl border border-white/30 bg-white/10 p-3 shadow-lg shadow-slate-900/10">
              <Image src="/logo.svg" alt="Logo UNICODES" fill className="object-contain" />
            </div>
            <div className="mt-8 space-y-4">
              <p className="text-lg font-semibold">Bienvenue chez UNICODES VAE</p>
              <p className="text-sm leading-6 text-slate-100/90">
                Créez votre compte pour commencer votre dossier VAE. Tout est prêt pour vous accompagner pas à pas.
              </p>
            </div>
            <div className="mt-8 grid gap-3 text-sm text-slate-100/90">
              <div className="rounded-3xl bg-white/10 p-4">Sécurité renforcée</div>
              <div className="rounded-3xl bg-white/10 p-4">Interface simple et claire</div>
            </div>
          </div> */}

          <div className="p-3 sm:p-3 w-full ">
            <CardHeader className="space-y-3 pb-4 ">
              <CardTitle className="text-3xl font-semibold text-center text-slate-900 sm:mb-3">Créer un compte</CardTitle>
              <CardDescription>Commencez votre démarche VAE dès maintenant.</CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit} className="sm:mt-2">
              <CardContent className="space-y-4">

                <div className="space-y-2">
                    <Label htmlFor="nom"></Label>
                    <div className="relative ">
                    <CircleUserRound className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} strokeWidth={0.9}/>
                    <Input id="nom" name="nom" required placeholder="Nom" className=" h-10 py-3 focus:ring-1 focus:ring-blue-400 pl-15 "/>
                    </div>
                    
                  </div>

                <div className="space-y-2">
                  <Label className="text-foreground"></Label>
                  <div className="relative">
                    <CircleUserRound className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} strokeWidth={0.9}/>                    
                    <Input id="prenom" name="prenom" required placeholder="Prénom" className=" h-10 py-3 focus:ring-1 focus:ring-blue-400 pl-15" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email"></Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} strokeWidth={0.9}/>
                    <Input id="email" name="email" type="email" required placeholder="votre@email.com" className=" h-10 py-3 focus:ring-1 focus:ring-blue-400 pl-15"/>
                  </div>
                  
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telephone"></Label>
                  <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} strokeWidth={0.9}/>
                  <Input id="telephone" name="telephone" type="tel" placeholder="+228 90 00 00 00" className="h-10 focus:ring-1 focus:ring-blue-400 pl-15"/>
                  </div>
                  
                </div>

                 <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative"> 
                    <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} strokeWidth={0.9}/>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    placeholder="8 caractères minimum"
                    className="py-3 focus:ring-1 focus:ring-blue-400 pl-15 h-10"
                  />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label></Label>
                  <Select onValueChange={setPays}>
                    <SelectTrigger className="bg-white z-10 w-full py-3 pl-15 relative focus:ring-1 focus:ring-blue-400 h-10">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} strokeWidth={0.9}/>
                      <SelectValue placeholder="Sélectionner un pays" />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-10">
                      {PAYS.map(p => (
                        <SelectItem className="hover:bg-blue-300/50" key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

               

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>

              <CardFooter className="flex flex-col gap-4 mt-2 bg-gradient-to-r  from-indigo-300 to-cyan-900 ">
                <Button type="submit" className="w-full bg-gradient-to-r h-10 from-indigo-600 to-sky-600 text-white hover:from-indigo-700 hover:to-sky-700 border-transparent py-3" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? "Création..." : "Créer mon compte"}
                </Button>

                <p className="text-sm text-slate-500 text-center">
                  Déjà un compte ?{' '}
                  <Link href="/login" className="text-indigo-600 font-medium hover:underline">
                    Se connecter
                  </Link>
                </p>
              </CardFooter>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}
