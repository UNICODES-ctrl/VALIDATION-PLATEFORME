"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react"
import Link from "next/link"

function OtpContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) return setError("Le code doit contenir 6 chiffres")
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) throw new Error(data.error || "Code invalide")
      router.push("/login?registered=1")
    } catch (err) {
      if (err instanceof Error) setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    setError("")
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, resend: true }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) throw new Error(data.error)
      setResent(true)
      setTimeout(() => setResent(false), 5000)
    } catch (err) {
      if (err instanceof Error) setError(err.message)
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-2">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/95 shadow-2xl shadow-blue-600/20 hover:shadow-blue-700/30 transition-all duration-700 p-6 sm:p-8">

        {/* Icône */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 text-center">Vérifiez votre email</h1>
          <p className="text-sm text-slate-500 text-center mt-2">
            Un code à 6 chiffres a été envoyé à
          </p>
          <p className="text-indigo-600 font-semibold text-sm text-center">{email}</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <Input
            type="text"
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            required
            className="h-16 text-center text-3xl font-bold tracking-[0.5em] focus:ring-1 focus:ring-blue-400"
          />

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {resent && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
              <CheckCircle2 className="w-4 h-4" /> Nouveau code envoyé !
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full h-11 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 font-semibold transition-all hover:scale-[1.02] active:scale-95"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Vérification..." : "Confirmer mon compte"}
          </Button>
        </form>

        <div className="mt-4 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-sm text-indigo-600 hover:underline disabled:opacity-50"
          >
            {resending ? <><Loader2 className="inline w-3 h-3 animate-spin mr-1" />Envoi...</> : "Renvoyer le code"}
          </button>
          <Link href="/register" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Retour à l&apos;inscription
          </Link>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          Le code expire dans 10 minutes.
        </p>
      </div>
    </div>
  )
}

export default function OtpPage() {
  return (
    <Suspense>
      <OtpContent />
    </Suspense>
  )
}