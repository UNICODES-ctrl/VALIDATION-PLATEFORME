import { z } from "zod"

export const step1Schema = z.object({
  dateNaissance: z.string().min(1, "Requis"),
  lieuNaissance: z.string().min(1, "Requis"),
  adresse: z.string().min(1, "Requis"),
  ville: z.string().min(1, "Requis"),
  situationPro: z.string().min(1, "Requis"),
})

export const step4Schema = z.object({
  domaine: z.string().min(1, "Requis"),
  niveauSouhaite: z.string().min(1, "Requis"),
  description: z.string().min(10, "Minimum 10 caractères"),
})

export const step5Schema = z.object({
  titre: z.string().min(1, "Requis"),
  domaine: z.string().min(1, "Requis"),
  niveauSouhaite: z.string().min(1, "Requis"),
  description: z.string().min(10, "Minimum 10 caractères"),
}

)

export type Step1Data = z.infer<typeof step1Schema>
export type Step4Data = z.infer<typeof step4Schema>
export type Step5Data = z.infer<typeof step5Schema>
