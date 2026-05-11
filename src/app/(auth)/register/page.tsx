"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Mail, Phone, LockKeyhole, CircleUserRound, Globe, ArrowLeft } from "lucide-react"
import { registerSchema, type RegisterFormData } from "@/lib/VALIDATIONS/registerSchema"
import { validateAndRegister } from "@/lib/VALIDATIONS/validateRegister"

const PAYS = ["Togo", "Bénin", "Côte d'Ivoire", "Sénégal", "Mali", "Burkina Faso", "Cameroun", "Autre"]

type Step = "email" | "otp" | "infos"

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("email")
  const [emailValue, setEmailValue] = useState("")
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const paysValue = watch("pays")

  // Étape 1 — Envoi OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailValue || !emailValue.includes("@")) {
      setError("Veuillez entrer une adresse email valide")
      return
    }
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailValue }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) throw new Error(data.error)
      setValue("email", emailValue)
      setStep("otp")
    } catch (err) {
      if (err instanceof Error) setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Étape 2 — Vérification OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) {
      setError("Le code doit contenir 6 chiffres")
      return
    }
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailValue, code: otp }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) throw new Error(data.error)
      setStep("infos")
    } catch (err) {
      if (err instanceof Error) setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Étape 3 — Création compte
  async function onSubmit(data: RegisterFormData) {
  setError("")
  setLoading(true)
  try {
    await validateAndRegister(data)
    router.push("/login")  
  } catch (err) {
    setError(err instanceof Error ? err.message : "Une erreur est survenue")
  } finally {
    setLoading(false)
  }
}

  const handleTelephoneFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const input = e.currentTarget
    if (!input.value) input.value = "+228 "
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-2">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white/95 shadow-2xl shadow-blue-600/20 hover:shadow-blue-700/30 transition-all duration-700 hover:scale-[1.01]">

       

        <div className="p-3 sm:p-4 w-full">

          {/* ── ÉTAPE 1 — Email ── */}
          {step === "email" && (
            <>
              <CardHeader className="space-y-3 pb-4">
                <CardTitle className="text-3xl font-semibold text-center text-slate-900">Créer un compte</CardTitle>
                <CardDescription className="text-center">Commencez par renseigner votre email</CardDescription>
              </CardHeader>
              <form onSubmit={handleSendOtp}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} strokeWidth={0.9} />
                      <Input
                        type="email"
                        placeholder="votre@email.com"
                        value={emailValue}
                        onChange={e => setEmailValue(e.target.value)}
                        required
                        className="h-11 focus:ring-1 focus:ring-blue-400 pl-10"
                      />
                    </div>
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button type="submit" disabled={loading} className="w-full h-11 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 font-semibold">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? "Envoi en cours..." : "Recevoir le code de vérification"}
                  </Button>
                  <p className="text-sm text-slate-500 text-center">
                    Déjà un compte ?{" "}
                    <Link href="/login" className="text-indigo-600 font-medium hover:underline">Se connecter</Link>
                  </p>
                </CardFooter>
              </form>
            </>
          )}

          {/* ── ÉTAPE 2 — OTP ── */}
          {step === "otp" && (
            <>
              <CardHeader className="space-y-3 pb-4">
                <CardTitle className="text-2xl font-semibold text-center text-slate-900">Vérifiez votre email</CardTitle>
                <CardDescription className="text-center">
                  Un code à 6 chiffres a été envoyé à{" "}
                  <span className="text-indigo-600 font-semibold">{emailValue}</span>
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleVerifyOtp}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="text"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="123456"
                      maxLength={6}
                      required
                      className="h-14 text-center text-3xl font-bold tracking-widest focus:ring-1 focus:ring-blue-400"
                    />
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                  <Button type="submit" disabled={loading || otp.length !== 6} className="w-full h-11 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 font-semibold">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? "Vérification..." : "Vérifier le code"}
                  </Button>
                  <button
                    type="button"
                    onClick={() => { setStep("email"); setOtp(""); setError("") }}
                    className="flex items-center justify-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Changer d&apos;email
                  </button>
                </CardFooter>
              </form>
            </>
          )}

          {/* ── ÉTAPE 3 — Infos compte (ton design original) ── */}
          {step === "infos" && (
            <>
              <CardHeader className="space-y-3 pb-4">
                <CardTitle className="text-3xl font-semibold text-center text-slate-900 sm:mb-3">Finalisez votre compte</CardTitle>
                <CardDescription className="text-center">Email vérifié — complétez vos informations</CardDescription>
              </CardHeader>

              <form onSubmit={handleSubmit(onSubmit)} className="sm:mt-2">
                <CardContent className="space-y-4">

                  {/* Email affiché (non modifiable) */}
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} strokeWidth={0.9} />
                    <Input value={emailValue} disabled className="h-10 pl-10 opacity-60 bg-gray-50" />
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <CircleUserRound className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} strokeWidth={0.9} />
                      <Input
                        id="nom"
                        placeholder="Nom"
                        className={`h-10 py-3 focus:ring-1 pl-10 ${errors.nom ? "border-red-500 focus:ring-red-400" : "focus:ring-blue-400"}`}
                        {...register("nom")}
                      />
                    </div>
                    {errors.nom && <p className="text-sm text-red-500">{errors.nom.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <CircleUserRound className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} strokeWidth={0.9} />
                      <Input
                        id="prenom"
                        placeholder="Prénom"
                        className={`h-10 py-3 focus:ring-1 pl-10 ${errors.prenom ? "border-red-500 focus:ring-red-400" : "focus:ring-blue-400"}`}
                        {...register("prenom")}
                      />
                    </div>
                    {errors.prenom && <p className="text-sm text-red-500">{errors.prenom.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} strokeWidth={0.9} />
                      <Input
                        id="telephone"
                        type="tel"
                        placeholder="+228 90 00 00 00"
                        onFocus={handleTelephoneFocus}
                        className={`h-10 focus:ring-1 pl-10 ${errors.telephone ? "border-red-500 focus:ring-red-400" : "focus:ring-blue-400"}`}
                        {...register("telephone")}
                      />
                    </div>
                    {errors.telephone && <p className="text-sm text-red-500">{errors.telephone.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} strokeWidth={0.9} />
                      <Input
                        id="password"
                        type="password"
                        placeholder="8 caractères minimum"
                        className={`py-3 focus:ring-1 pl-10 h-10 ${errors.password ? "border-red-500 focus:ring-red-400" : "focus:ring-blue-400"}`}
                        {...register("password")}
                      />
                    </div>
                    {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Select onValueChange={(value) => setValue("pays", value)} value={paysValue}>
                      <SelectTrigger className={`bg-white z-10 w-full h-10 pl-10 relative ${errors.pays ? "border-red-500" : ""}`}>
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} strokeWidth={0.9} />
                        <SelectValue placeholder="Sélectionner un pays" />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-10">
                        {PAYS.map(p => <SelectItem className="hover:bg-blue-300/50" key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {errors.pays && <p className="text-sm text-red-500">{errors.pays.message}</p>}
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>

                <CardFooter className="flex flex-col gap-4 mt-2">
                  <Button type="submit" className="w-full bg-gradient-to-r h-10 from-indigo-600 to-sky-600 text-white hover:from-indigo-700 hover:to-sky-700 font-semibold" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? "Création..." : "Créer mon compte"}
                  </Button>
                  <p className="text-sm text-slate-500 text-center">
                    Déjà un compte ?{" "}
                    <Link href="/login" className="text-indigo-600 font-medium hover:underline">Se connecter</Link>
                  </p>
                </CardFooter>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  )
}