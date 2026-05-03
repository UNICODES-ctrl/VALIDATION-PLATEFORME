"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, ChevronRight, ChevronLeft, Loader2, Plus, Trash2 } from "lucide-react"
import Link from "next/link"

const STEPS = [
    { id: 1, label: "Informations personnelles" },
    { id: 2, label: "Parcours académique" },
    { id: 3, label: "Parcours professionnel" },
    { id: 4, label: "Choix du diplôme" },
]

const DOMAINES = [
    "Informatique et numérique", "Santé et social", "Commerce et gestion",
    "Droit et sciences politiques", "Éducation et formation", "Ingénierie et industrie",
    "Arts et culture", "Agriculture et environnement", "Autre",
]

const NIVEAUX = ["Bac+2 (BTS, DUT)", "Bac+3 (Licence)", "Bac+4 (Master 1)", "Bac+5 (Master 2)", "Doctorat"]

const step1Schema = z.object({
    dateNaissance: z.string().min(1, "Requis"),
    lieuNaissance: z.string().min(1, "Requis"),
    adresse: z.string().min(1, "Requis"),
    ville: z.string().min(1, "Requis"),
    situationPro: z.string().min(1, "Requis"),
})

const step4Schema = z.object({
    titre: z.string().min(1, "Requis"),
    domaine: z.string().min(1, "Requis"),
    niveauSouhaite: z.string().min(1, "Requis"),
    description: z.string().min(10, "Minimum 10 caractères"),
})

type Step1Data = z.infer<typeof step1Schema>
type Step4Data = z.infer<typeof step4Schema>

export default function ModifierDossierPage() {
    const params = useParams()
    const dossierId = params.id as string
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(true)
    const [parcoursAcad, setParcoursAcad] = useState([
        { diplome: "", etablissement: "", dateDebut: "", dateFin: "", mention: "" }
    ])
    const [parcoursPro, setParcoursPro] = useState([
        { poste: "", entreprise: "", dateDebut: "", dateFin: "", enPoste: false, missions: "", competences: "" }
    ])

    const form1 = useForm<Step1Data>({
        resolver: zodResolver(step1Schema),
        defaultValues: { dateNaissance: "", lieuNaissance: "", adresse: "", ville: "", situationPro: "" }
    })

    const form4 = useForm<Step4Data>({
        resolver: zodResolver(step4Schema),
        defaultValues: { titre: "", domaine: "", niveauSouhaite: "", description: "" }
    })

    useEffect(() => {
        fetch("/api/dossier?id=" + dossierId)
            .then(r => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`)
                return r.json()
            })
            .then(data => {
                console.log("Données reçues :", data)
                if (data.dossier) {
                    const d = data.dossier

                    form1.reset({
                        dateNaissance: d.dateNaissance ? new Date(d.dateNaissance).toISOString().split("T")[0] : "",
                        lieuNaissance: d.lieuNaissance || "",
                        adresse: d.adresse || "",
                        ville: d.ville || "",
                        situationPro: d.situationPro || "",
                    }, { keepDefaultValues: false })

                    form4.reset({
                        titre: d.titre || "",
                        domaine: d.domaine || "",
                        niveauSouhaite: d.niveauSouhaite || "",
                        description: d.description || "",
                    }, { keepDefaultValues: false })

                    if (d.parcoursAcad?.length) {
                        setParcoursAcad(d.parcoursAcad.map((p: any) => ({
                            diplome: p.diplome,
                            etablissement: p.etablissement,
                            dateDebut: p.dateDebut ? new Date(p.dateDebut).toISOString().split("T")[0] : "",
                            dateFin: p.dateFin ? new Date(p.dateFin).toISOString().split("T")[0] : "",
                            mention: p.mention || "",
                        })))
                    }
                    if (d.parcoursPro?.length) {
                        setParcoursPro(d.parcoursPro.map((p: any) => ({
                            poste: p.poste,
                            entreprise: p.entreprise,
                            dateDebut: p.dateDebut ? new Date(p.dateDebut).toISOString().split("T")[0] : "",
                            dateFin: p.dateFin ? new Date(p.dateFin).toISOString().split("T")[0] : "",
                            enPoste: p.enPoste,
                            missions: p.missions,
                            competences: p.competences || "",
                        })))
                    }
                }
                setLoadingData(false)
            })
    }, [dossierId])

    const handleNext = async () => {
        if (currentStep === 1) {
            const valid = await form1.trigger()
            if (!valid) return
        }
        setCurrentStep(s => s + 1)
    }

    const handleSubmit = async () => {
        const valid = await form4.trigger()
        if (!valid) return
        setLoading(true)
        try {
            const res = await fetch("/api/dossier", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    dossierId,
                    ...form1.getValues(),
                    ...form4.getValues(),
                    parcoursAcad,
                    parcoursPro,
                }),
            })
            if (res.ok) {
                router.push(`/dashboard/dossier/${dossierId}`)
                router.refresh()
            }
        } finally {
            setLoading(false)
        }
    }

    const addAcad = () => setParcoursAcad(p => [...p, { diplome: "", etablissement: "", dateDebut: "", dateFin: "", mention: "" }])
    const removeAcad = (i: number) => setParcoursAcad(p => p.filter((_, idx) => idx !== i))
    const updateAcad = (i: number, field: string, value: string) => {
        setParcoursAcad(p => p.map((item, idx) => {
            if (idx !== i) return item
            const updated = { ...item, [field]: value }
            if (field === "dateDebut" && updated.dateFin && updated.dateFin < value) updated.dateFin = ""
            return updated
        }))
    }

    const addPro = () => setParcoursPro(p => [...p, { poste: "", entreprise: "", dateDebut: "", dateFin: "", enPoste: false, missions: "", competences: "" }])
    const removePro = (i: number) => setParcoursPro(p => p.filter((_, idx) => idx !== i))
    const updatePro = (i: number, field: string, value: any) => {
        setParcoursPro(p => p.map((item, idx) => {
            if (idx !== i) return item
            const updated = { ...item, [field]: value }
            if (field === "enPoste" && value === true) updated.dateFin = ""
            if (field === "dateDebut" && updated.dateFin && updated.dateFin < value) updated.dateFin = ""
            return updated
        }))
    }

    if (loadingData) return (
        <div className="flex items-center justify-center min-h-64">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
    )

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <Link href={`/dashboard/dossier/${dossierId}`} className="text-sm text-indigo-600 hover:underline mb-2 block">
                    ← Retour à la candidature
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Modifier la candidature</h1>
                <p className="text-gray-500 mt-1">Mettez à jour les informations de votre dossier</p>
            </div>

            {/* Stepper */}
            <div className="flex items-center mb-8 gap-0">
                {STEPS.map((step, idx) => (
                    <div key={step.id} className="flex items-center flex-1">
                        <button onClick={() => setCurrentStep(step.id)} className="flex flex-col items-center gap-1">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${currentStep === step.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-green-500 text-white"
                                }`}>
                                {currentStep === step.id ? step.id : <CheckCircle2 className="w-5 h-5" />}
                            </div>
                            <span className={`text-xs font-medium hidden sm:block ${currentStep === step.id ? "text-indigo-600" : "text-gray-400"}`}>
                                {step.label}
                            </span>
                        </button>
                        {idx < STEPS.length - 1 && <div className="flex-1 h-0.5 mx-2 mb-5 bg-green-400" />}
                    </div>
                ))}
            </div>

            <Card className="shadow-sm">
                {currentStep === 1 && (
                    <>
                        <CardHeader><CardTitle className="text-lg">Informations personnelles</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Date de naissance</Label>
                                    <Input type="date" max={new Date().toISOString().split("T")[0]} {...form1.register("dateNaissance")} className="h-11" />
                                    {form1.formState.errors.dateNaissance && <p className="text-xs text-red-500">{form1.formState.errors.dateNaissance.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Lieu de naissance</Label>
                                    <Input {...form1.register("lieuNaissance")} className="h-11" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Adresse</Label>
                                <Input {...form1.register("adresse")} className="h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label>Ville</Label>
                                <Input {...form1.register("ville")} className="h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label>Situation professionnelle actuelle</Label>
                                <Input {...form1.register("situationPro")} className="h-11" />
                            </div>
                        </CardContent>
                    </>
                )}

                {currentStep === 2 && (
                    <>
                        <CardHeader><CardTitle className="text-lg">Parcours académique</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            {parcoursAcad.map((item, i) => (
                                <div key={i} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50">Diplôme {i + 1}</Badge>
                                        {i > 0 && <Button variant="ghost" size="sm" onClick={() => removeAcad(i)} className="text-red-400 h-7"><Trash2 className="w-4 h-4" /></Button>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs">Diplôme</Label>
                                            <Input value={item.diplome} onChange={e => updateAcad(i, "diplome", e.target.value)} className="h-10" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Établissement</Label>
                                            <Input value={item.etablissement} onChange={e => updateAcad(i, "etablissement", e.target.value)} className="h-10" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Date début</Label>
                                            <Input type="date" max={new Date().toISOString().split("T")[0]} value={item.dateDebut} onChange={e => updateAcad(i, "dateDebut", e.target.value)} className="h-10" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Date fin</Label>
                                            <Input type="date" min={item.dateDebut} max={new Date().toISOString().split("T")[0]} value={item.dateFin} disabled={!item.dateDebut} onChange={e => updateAcad(i, "dateFin", e.target.value)} className="h-10 disabled:opacity-40" />
                                        </div>
                                        <div className="col-span-2 space-y-1">
                                            <Label className="text-xs">Mention</Label>
                                            <Input value={item.mention} onChange={e => updateAcad(i, "mention", e.target.value)} className="h-10" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" onClick={addAcad} className="w-full border-dashed border-indigo-200 text-indigo-600">
                                <Plus className="w-4 h-4 mr-2" /> Ajouter un diplôme
                            </Button>
                        </CardContent>
                    </>
                )}

                {currentStep === 3 && (
                    <>
                        <CardHeader><CardTitle className="text-lg">Parcours professionnel</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            {parcoursPro.map((item, i) => (
                                <div key={i} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50">Expérience {i + 1}</Badge>
                                        {i > 0 && <Button variant="ghost" size="sm" onClick={() => removePro(i)} className="text-red-400 h-7"><Trash2 className="w-4 h-4" /></Button>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs">Poste</Label>
                                            <Input value={item.poste} onChange={e => updatePro(i, "poste", e.target.value)} className="h-10" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Entreprise</Label>
                                            <Input value={item.entreprise} onChange={e => updatePro(i, "entreprise", e.target.value)} className="h-10" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Date début</Label>
                                            <Input type="date" max={new Date().toISOString().split("T")[0]} value={item.dateDebut} onChange={e => updatePro(i, "dateDebut", e.target.value)} className="h-10" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Date fin</Label>
                                            <Input type="date" min={item.dateDebut} max={new Date().toISOString().split("T")[0]} value={item.dateFin} disabled={item.enPoste || !item.dateDebut} onChange={e => updatePro(i, "dateFin", e.target.value)} className="h-10 disabled:opacity-40" />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id={`enPoste-${i}`} checked={item.enPoste} onChange={e => updatePro(i, "enPoste", e.target.checked)} />
                                        <Label htmlFor={`enPoste-${i}`} className="text-xs cursor-pointer">Poste actuel</Label>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Missions</Label>
                                        <Textarea value={item.missions} onChange={e => updatePro(i, "missions", e.target.value)} className="min-h-[80px]" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Compétences</Label>
                                        <Textarea value={item.competences} onChange={e => updatePro(i, "competences", e.target.value)} className="min-h-[60px]" />
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" onClick={addPro} className="w-full border-dashed border-indigo-200 text-indigo-600">
                                <Plus className="w-4 h-4 mr-2" /> Ajouter une expérience
                            </Button>
                        </CardContent>
                    </>
                )}

                {currentStep === 4 && (
                    <>
                        <CardHeader><CardTitle className="text-lg">Choix du diplôme VAE</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Titre de la candidature</Label>
                                <Input {...form4.register("titre")} className="h-11" />
                                {form4.formState.errors.titre && <p className="text-xs text-red-500">{form4.formState.errors.titre.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Domaine</Label>
                                <Select value={form4.watch("domaine")} onValueChange={v => form4.setValue("domaine", v)}>
                                    <SelectTrigger className="h-11"><SelectValue placeholder="Choisir un domaine" /></SelectTrigger>
                                    <SelectContent>{DOMAINES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Niveau souhaité</Label>
                                <Select value={form4.watch("niveauSouhaite")} onValueChange={v => form4.setValue("niveauSouhaite", v)}>
                                    <SelectTrigger className="h-11"><SelectValue placeholder="Choisir un niveau" /></SelectTrigger>
                                    <SelectContent>{NIVEAUX.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Motivation et description</Label>
                                <Textarea {...form4.register("description")} className="min-h-[120px]" />
                            </div>
                        </CardContent>
                    </>
                )}

                <div className="flex items-center justify-between px-6 pb-6 pt-2">
                    <Button variant="ghost" onClick={() => setCurrentStep(s => s - 1)} disabled={currentStep === 1} className="gap-2">
                        <ChevronLeft className="w-4 h-4" /> Précédent
                    </Button>
                    {currentStep < 4 ? (
                        <Button onClick={handleNext} className="gap-2" style={{ background: "linear-gradient(135deg, #4f46e5, #6366f1)" }}>
                            Suivant <ChevronRight className="w-4 h-4" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={loading} className="gap-2" style={{ background: "linear-gradient(135deg, #4f46e5, #6366f1)" }}>
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {loading ? "Mise à jour..." : "Enregistrer les modifications"}
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    )
}