export interface Document {
    id: string
    type: string
    nom: string
    url: string
    taille: number
    dossierId: string
    createdAt?: string
}

export interface DocumentsByType {
    [type: string]: Document[]
}

export interface UploadResponse {
    url: string
    name: string
    size: number
}

export async function fetchDocuments(dossierId: string): Promise<DocumentsByType> {
    const res = await fetch(`/api/documents?dossierId=${dossierId}`)
    const data = await res.json()

    if (!data.documents) {
        return {}
    }

    const grouped: DocumentsByType = {}
    data.documents.forEach((d: Document) => {
        if (!grouped[d.type]) grouped[d.type] = []
        grouped[d.type].push(d)
    })

    return grouped
}

export async function uploadDocument(
    type: string,
    url: string,
    nom: string,
    taille: number,
    dossierId: string
): Promise<Document> {
    const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, url, nom, taille, dossierId }),
    })

    if (!res.ok) {
        throw new Error("Erreur lors de l'enregistrement du document")
    }

    const data = await res.json()
    return data.document
}

export async function deleteDocument(id: string): Promise<void> {
    const res = await fetch(`/api/documents/${id}`, { method: "DELETE" })

    if (!res.ok) {
        throw new Error("Erreur lors de la suppression")
    }
}

export async function uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch("/api/upload", { method: "POST", body: formData })
    const data = await res.json()

    if (!res.ok) {
        throw new Error(data.error || "Erreur lors du dépôt du fichier")
    }

    return {
        url: data.url,
        name: data.name,
        size: data.size,
    }
}
