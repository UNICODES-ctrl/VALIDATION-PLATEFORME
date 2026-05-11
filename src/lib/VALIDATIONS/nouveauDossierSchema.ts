import { z } from "zod"

export const nouveauDossierStep1Schema = z.object({
    dateNaissance: z.string().min(1, "Requis"),
    lieuNaissance: z.string().min(1, "Requis"),
    adresse: z.string().min(1, "Requis"),
    ville: z.string().min(1, "Requis"),
    situationPro: z.string().min(1, "Requis"),
})

export const nouveauDossierStep4Schema = z.object({
    titre: z.string().min(1, "Requis"),
    domaine: z.string().min(1, "Requis"),
    niveauSouhaite: z.string().min(1, "Requis"),
    description: z.string().min(10, "Minimum 10 caractères"),
})

export type NouveauDossierStep1Data = z.infer<typeof nouveauDossierStep1Schema>
export type NouveauDossierStep4Data = z.infer<typeof nouveauDossierStep4Schema>
