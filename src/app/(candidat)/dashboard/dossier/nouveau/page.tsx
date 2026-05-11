"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, ChevronRight, ChevronLeft, Loader2, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { nouveauDossierStep1Schema, nouveauDossierStep4Schema, type NouveauDossierStep1Data, type NouveauDossierStep4Data } from "@/lib/VALIDATIONS/nouveauDossierSchema"
import { validateAndSubmitDossier } from "@/lib/VALIDATIONS/validateNouveauDossier"

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

export default function NouveauDossierPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [savedStep, setSavedStep] = useState(0)
  const [step1Data, setStep1Data] = useState<NouveauDossierStep1Data | null>(null)
  const [parcoursAcad, setParcoursAcad] = useState([
    { diplome: "", etablissement: "", dateDebut: "", dateFin: "", mention: "" }
  ])
  const [parcoursPro, setParcoursPro] = useState([
    { poste: "", entreprise: "", dateDebut: "", dateFin: "", enPoste: false, missions: "", competences: "" }
  ])

  const form1 = useForm<NouveauDossierStep1Data>({ resolver: zodResolver(nouveauDossierStep1Schema) })
  const form4 = useForm<NouveauDossierStep4Data>({ resolver: zodResolver(nouveauDossierStep4Schema) })

  const handleNext = async () => {
    if (currentStep === 1) {
      const valid = await form1.trigger()
      if (!valid) return
      setStep1Data(form1.getValues())
      setSavedStep(Math.max(savedStep, 1))
    }
    if (currentStep === 2) setSavedStep(Math.max(savedStep, 2))
    if (currentStep === 3) setSavedStep(Math.max(savedStep, 3))
    setCurrentStep(s => s + 1)
  }

  const handleSubmit = async () => {
    const valid = await form4.trigger()
    if (!valid) return
    setLoading(true)
    try {
      if (!step1Data) {
        throw new Error("Données étape 1 manquantes")
      }
      const data = await validateAndSubmitDossier(
        step1Data,
        form4.getValues(),
        parcoursAcad,
        parcoursPro
      )
      router.push(`/dashboard/dossier/${data.dossierId}/documents?from=nouveau`)
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors de la soumission")
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
  const updatePro = (i: number, field: string, value: string | boolean | Date) => {
    setParcoursPro(p => p.map((item, idx) => {
      if (idx !== i) return item
      const updated = { ...item, [field]: value }
      if (field === "enPoste" && value === true) updated.dateFin = ""
      if (field === "dateDebut" && updated.dateFin && updated.dateFin < value) updated.dateFin = ""
      return updated
    }))
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-0">
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Nouvelle candidature VAE</h1>
        <p className="text-gray-500 mt-1">Complétez votre dossier étape par étape</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center mb-8 gap-0">
        {STEPS.map((step, idx) => (
          <div key={step.id} className="flex items-center flex-1">
            <button onClick={() => step.id <= savedStep + 1 && setCurrentStep(step.id)} className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${currentStep === step.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" :
                savedStep >= step.id ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400"
                }`}>
                {savedStep >= step.id && currentStep !== step.id ? <CheckCircle2 className="w-5 h-5" /> : step.id}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${currentStep === step.id ? "text-indigo-600" : "text-gray-400"}`}>
                {step.label}
              </span>
            </button>
            {idx < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-5 transition-all ${savedStep >= step.id ? "bg-green-400" : "bg-gray-100"}`} />
            )}
          </div>
        ))}
      </div>

      <Card className="col-span-2 md:col-span-1 drop-shadow-xl shadow-indigo-200 ring-1 ring-blue-100 overflow-hidden">
        {/* ÉTAPE 1 */}
        {currentStep === 1 && (
          <>
            <CardHeader>
              <CardTitle className="text-lg">Informations personnelles</CardTitle>
              <CardDescription>Vos données d&apos;état civil et situation actuelle</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date de naissance</Label>
                  <Input type="date" max={new Date().toISOString().split("T")[0]} {...form1.register("dateNaissance")} className="h-11" />
                  {form1.formState.errors.dateNaissance && <p className="text-xs text-red-500">{form1.formState.errors.dateNaissance.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Lieu de naissance</Label>
                  <Input placeholder="Lomé" {...form1.register("lieuNaissance")} className="h-11" />
                  {form1.formState.errors.lieuNaissance && <p className="text-xs text-red-500">{form1.formState.errors.lieuNaissance.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Adresse</Label>
                <Input placeholder="123 rue exemple" {...form1.register("adresse")} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label>Ville</Label>
                <Input placeholder="Lomé" {...form1.register("ville")} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label>Situation professionnelle actuelle</Label>
                <Input placeholder="Ex: Infirmier depuis 5 ans..." {...form1.register("situationPro")} className="h-11" />
              </div>
            </CardContent>
          </>
        )}

        {/* ÉTAPE 2 */}
        {currentStep === 2 && (
          <>
            <CardHeader>
              <CardTitle className="text-lg">Parcours académique</CardTitle>
              <CardDescription>Vos diplômes et formations obtenus</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {parcoursAcad.map((item, i) => (
                <div key={i} className="p-3 sm:p-4 border border-gray-100 rounded-xl bg-gray-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50">Diplôme {i + 1}</Badge>
                    {i > 0 && <Button variant="ghost" size="sm" onClick={() => removeAcad(i)} className="text-red-400 hover:text-red-600 h-7"><Trash2 className="w-4 h-4" /></Button>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Diplôme obtenu</Label>
                      <Input placeholder="Licence en informatique" value={item.diplome} onChange={e => updateAcad(i, "diplome", e.target.value)} className="h-10" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Établissement</Label>
                      <Input placeholder="Université de Lomé" value={item.etablissement} onChange={e => updateAcad(i, "etablissement", e.target.value)} className="h-10" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Date début</Label>
                      <Input type="date" max={new Date().toISOString().split("T")[0]} value={item.dateDebut} onChange={e => updateAcad(i, "dateDebut", e.target.value)} className="h-10" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Date fin</Label>
                      <Input type="date" min={item.dateDebut || undefined} max={new Date().toISOString().split("T")[0]} value={item.dateFin} disabled={!item.dateDebut} onChange={e => updateAcad(i, "dateFin", e.target.value)} className="h-10 disabled:opacity-40" />
                      {item.dateDebut && !item.dateFin && <p className="text-xs text-amber-500">Laissez vide si en cours</p>}
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs">Mention (optionnel)</Label>
                      <Input placeholder="Bien, Très bien..." value={item.mention} onChange={e => updateAcad(i, "mention", e.target.value)} className="h-10" />
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={addAcad} className="w-full border-dashed border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                <Plus className="w-4 h-4 mr-2" /> Ajouter un diplôme
              </Button>
            </CardContent>
          </>
        )}

        {/* ÉTAPE 3 */}
        {currentStep === 3 && (
          <>
            <CardHeader>
              <CardTitle className="text-lg">Parcours professionnel</CardTitle>
              <CardDescription>Vos expériences professionnelles significatives</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {parcoursPro.map((item, i) => (
                <div key={i} className="p-3 sm:p-4 border border-gray-100 rounded-xl bg-gray-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50">Expérience {i + 1}</Badge>
                    {i > 0 && <Button variant="ghost" size="sm" onClick={() => removePro(i)} className="text-red-400 hover:text-red-600 h-7"><Trash2 className="w-4 h-4" /></Button>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Poste occupé</Label>
                      <Input placeholder="Développeur senior" value={item.poste} onChange={e => updatePro(i, "poste", e.target.value)} className="h-10" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Entreprise</Label>
                      <Input placeholder="Nom de l'entreprise" value={item.entreprise} onChange={e => updatePro(i, "entreprise", e.target.value)} className="h-10" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Date début</Label>
                      <Input type="date" max={new Date().toISOString().split("T")[0]} value={item.dateDebut} onChange={e => updatePro(i, "dateDebut", e.target.value)} className="h-10" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Date fin</Label>
                      <Input type="date" min={item.dateDebut || undefined} max={new Date().toISOString().split("T")[0]} value={item.dateFin} disabled={item.enPoste || !item.dateDebut} onChange={e => updatePro(i, "dateFin", e.target.value)} className="h-10 disabled:opacity-40" />
                      {item.enPoste && <p className="text-xs text-green-500">Poste actuel</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id={`enPoste-${i}`} checked={item.enPoste} onChange={e => updatePro(i, "enPoste", e.target.checked)} className="rounded" />
                    <Label htmlFor={`enPoste-${i}`} className="text-xs cursor-pointer">Poste actuel</Label>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Missions réalisées</Label>
                    <Textarea placeholder="Décrivez vos principales missions..." value={item.missions} onChange={e => updatePro(i, "missions", e.target.value)} className="min-h-[80px]" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Compétences développées</Label>
                    <Textarea placeholder="Listez vos compétences clés..." value={item.competences} onChange={e => updatePro(i, "competences", e.target.value)} className="min-h-[60px]" />
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={addPro} className="w-full border-dashed border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                <Plus className="w-4 h-4 mr-2" /> Ajouter une expérience
              </Button>
            </CardContent>
          </>
        )}

        {/* ÉTAPE 4 */}
        {currentStep === 4 && (
          <>
            <CardHeader>
              <CardTitle className="text-lg">Choix du diplôme VAE</CardTitle>
              <CardDescription>Le diplôme que vous souhaitez obtenir</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Titre de la candidature</Label>
                <Input placeholder="Ex: Validation compétences en développement web" {...form4.register("titre")} className="h-11" />
                {form4.formState.errors.titre && <p className="text-xs text-red-500">{form4.formState.errors.titre.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Domaine</Label>
                <Select value={form4.watch("domaine")} onValueChange={v => form4.setValue("domaine", v)}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Choisir un domaine" /></SelectTrigger>
                  <SelectContent>{DOMAINES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
                {form4.formState.errors.domaine && <p className="text-xs text-red-500">{form4.formState.errors.domaine.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Niveau souhaité</Label>
                <Select value={form4.watch("niveauSouhaite")} onValueChange={v => form4.setValue("niveauSouhaite", v)}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Choisir un niveau" /></SelectTrigger>
                  <SelectContent>{NIVEAUX.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                </Select>
                {form4.formState.errors.niveauSouhaite && <p className="text-xs text-red-500">{form4.formState.errors.niveauSouhaite.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Motivation et description</Label>
                <Textarea placeholder="Décrivez votre projet VAE..." {...form4.register("description")} className="min-h-[120px]" />
                {form4.formState.errors.description && <p className="text-xs text-red-500">{form4.formState.errors.description.message}</p>}
              </div>
            </CardContent>
          </>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between px-3 sm:px-6 pb-6 pt-2">
          <Button variant="ghost" onClick={() => setCurrentStep(s => s - 1)} disabled={currentStep === 1} className="gap-2">
            <ChevronLeft className="w-4 h-4" /> <span className="hidden sm:inline">Précédent</span>
          </Button>
          {currentStep < 4 ? (
            <Button onClick={handleNext} className="gap-2" style={{ background: "linear-gradient(135deg, #4f46e5, #6366f1)" }}>
              <span className="hidden sm:inline">Suivant</span> <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading} className="gap-2" style={{ background: "linear-gradient(135deg, #4f46e5, #6366f1)" }}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Envoi..." : "Soumettre ma candidature ✓"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}