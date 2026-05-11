import { z } from "zod"

export const registerSchema = z.object({
    nom: z
        .string()
        .min(2, "Le nom doit contenir au moins 2 caractères")
        .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Le nom ne peut contenir que des lettres"),
    prenom: z
        .string()
        .min(2, "Le prénom doit contenir au moins 2 caractères")
        .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Le prénom ne peut contenir que des lettres"),
    email: z
        .string()
        .email("Veuillez entrer une adresse email valide")
        .toLowerCase(),
    telephone: z
        .string()
        .regex(/^\+228\s?[0-9]{2}\s?[0-9]{2}\s?[0-9]{2}\s?[0-9]{2}$/, "Le numéro doit être au format +228 XX XX XX XX")
        .or(z.string().length(0)),
    pays: z
        .string()
        .min(1, "Veuillez sélectionner un pays"),
    password: z
        .string()
        .min(8, "Le mot de passe doit contenir au moins 8 caractères")
        .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
        .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
        .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
})

export type RegisterFormData = z.infer<typeof registerSchema>
