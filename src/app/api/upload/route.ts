import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const MAX_SIZE = 8 * 1024 * 1024 // 8MB

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get("file") as File
    if (!file) return NextResponse.json({ error: "Fichier manquant" }, { status: 400 })

    // Vérif taille
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Fichier trop volumineux (max 8MB)" }, { status: 400 })
    }

    // Vérif format
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Format non accepté (PDF, JPG, PNG uniquement)" }, { status: 400 })
    }

    const fileName = `${session.user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
    const buffer = await file.arrayBuffer()

    const { error } = await supabaseAdmin.storage
      .from("Documents")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const { data } = supabaseAdmin.storage
      .from("Documents")
      .getPublicUrl(fileName)

    return NextResponse.json({ url: data.publicUrl, name: file.name, size: file.size })
  } catch (error) {
    console.error("UPLOAD ERROR:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}