import { nouveauDossierStep1Schema, nouveauDossierStep4Schema, type NouveauDossierStep1Data, type NouveauDossierStep4Data } from "./nouveauDossierSchema"

interface ParcoursAcad {
    diplome: string
    etablissement: string
    dateDebut: string
    dateFin: string
    mention: string
}

interface ParcoursPro {
    poste: string
    entreprise: string
    dateDebut: string
    dateFin: string
    enPoste: boolean
    missions: string
    competences: string
}

export async function validateAndSubmitDossier(
    step1Data: NouveauDossierStep1Data,
    step4Data: NouveauDossierStep4Data,
    parcoursAcad: ParcoursAcad[],
    parcoursPro: ParcoursPro[]
) {
    // Validation Zod
    nouveauDossierStep1Schema.parse(step1Data)
    nouveauDossierStep4Schema.parse(step4Data)

    // Appel à l'API
    const res = await fetch("/api/dossier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ...step1Data,
            ...step4Data,
            parcoursAcad,
            parcoursPro,
        }),
    })

    const data = await res.json()

    if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la soumission")
    }

    return data
}
