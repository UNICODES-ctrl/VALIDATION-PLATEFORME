import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const MAX_SIZE = 3 * 1024 * 1024 // 3MB pour les avatars

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get("file") as File
    if (!file) return NextResponse.json({ error: "Fichier manquant" }, { status: 400 })

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Fichier trop volumineux (max 3MB)" }, { status: 400 })
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Format non accepté (JPG, PNG, WEBP)" }, { status: 400 })
    }

    // Nom du fichier basé sur userId — remplace l'ancien avatar automatiquement
    const ext = file.name.split(".").pop()
    const fileName = `${session.user.id}/avatar.${ext}`
    const buffer = await file.arrayBuffer()

    const { error } = await supabaseAdmin.storage
      .from("Avatars")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true, // ← remplace l'ancien avatar
      })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const { data } = supabaseAdmin.storage
      .from("Avatars")
      .getPublicUrl(fileName)

    // Ajoute un timestamp pour forcer le rechargement du cache
    const url = `${data.publicUrl}?t=${Date.now()}`

    return NextResponse.json({ url, name: file.name, size: file.size })
  } catch (error) {
    console.error("AVATAR UPLOAD ERROR:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}