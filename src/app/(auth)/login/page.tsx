"use client"

import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Mail, Lock } from "lucide-react"
import { loginSchema, type LoginFormData } from "@/lib/VALIDATIONS/loginSchema"
import { validateAndLogin } from "@/lib/VALIDATIONS/validateLogin"

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginFormData) {
    setError("")
    setLoading(true)

    try {
      await validateAndLogin(data)
      router.push("/")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-[32px] border border-slate-200 bg-white/95 p-6 shadow-2xl shadow-slate-200/60 backdrop-blur-xl drop-shadow-lg shadow-blue-600 hover:shadow-blue-700 transition-all duration-300 hover:scale-105">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative h-20 w-20 overflow-hidden rounded-3xl border border-indigo-100 bg-indigo-50/70 p-3">
          <Image
              src="/logo.svg"
              alt="Logo UNICODES"
              width={100}
              height={100}
              className="object-contain"
            />
          </div>
          <div>
            {/* <h1 className="text-3xl font-semibold text-slate-900">Bon retour</h1> */}
            <h4 className="text-slcate-500">Connectez-vous à votre espace VAE en toute simplicité.</h4>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-slate-700">Adresse email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                className={`pl-10 h-11 bg-white border-slate-200 ${errors.email
                    ? "border-red-500 focus:ring-red-400"
                    : "focus:border-indigo-400"
                  }`}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">Mot de passe</Label>
              <Link href="/forgot-password" className="text-sm text-indigo-600 hover:underline">Mot de passe oublié ?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className={`pl-10 h-11 bg-white border-slate-200 ${errors.password
                    ? "border-red-500 focus:ring-red-400"
                    : "focus:border-indigo-400"
                  }`}
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>

          {error && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={loading} className="w-full h-11 text-base font-semibold bg-gradient-to-r from-indigo-600 to-sky-600 text-white hover:from-indigo-700 hover:to-sky-700 border-transparent">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Connexion..." : "Se connecter"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Pas encore de compte ?{' '}
          <Link href="/register" className="text-indigo-600 font-semibold hover:underline">Créer un compte</Link>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
          Plateforme sécurisée · Données chiffrées · Confidentiel
        </div>
      </div>
    </div>
  )
}
