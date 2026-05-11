
enum Role {
  CANDIDAT = "CANDIDAT",
  ADMIN = "ADMIN"
}
enum StatutDossier {
  BROUILLON = "BROUILLON",
  SOUMIS = "SOUMIS",
  EN_ETUDE = "EN_ETUDE",
  VALIDE = "VALIDE",
  REJETE = "REJETE"
}
interface Account {
  id: string
  userId: string
  type: string
  provider: string
  providerAccountId: string
  refresh_token?: string
  access_token?: string
  expires_at?: number
  token_type?: string
  scope?: string
  id_token?: string
  session_state?: string
  user: User

}

interface Session {
  id: string
  sessionToken: string
  userId: string
  expires: Date
  user: User

}

interface Dossier {
  id: string
  titre?: string      // titre de la candidature
  statut: StatutDossier
  dateNaissance?: Date
  lieuNaissance?: string
  adresse?: string
  ville?: string
  situationPro?: string
  domaine?: string
  niveauSouhaite?: string
  description?: string
  createdAt: Date
  updatedAt: Date
  user: User
  parcoursAcad: ParcourAcademique[]
  parcoursPro: ParcourProfessionnel[]
  documents: Document[]
  paiements: Paiement[]
}


interface User {
  id: string
  nom: string
  prenom: string
  email: string
  emailVerified?: Date
  telephone: string
  pays?: string
  photoProfil?: string
  password?: string
  role: Role
  createdAt: Date
  updatedAt: Date
  accounts: Account[]
  sessions: Session[]
  dossiers: Dossier[]
}


interface ParcourAcademique {
  id: string
  dossierId: string
  diplome: string
  etablissement: string
  dateDebut: Date
  dateFin?: Date
  mention?: string
  createdAt: Date
  dossier: Dossier
}

interface ParcourProfessionnel {
  id: string
  dossierId: string
  poste: string
  entreprise: string
  dateDebut: Date
  dateFin?: Date
  enPoste: boolean
  missions: string
  competences?: string
  createdAt: Date
  dossier: Dossier
}

interface Document {

  id: string
  dossierId: string
  nom: string
  type: TypeDocument
  url: string
  taille: number
  createdAt: Date
  dossier: Dossier
}

enum TypeDocument {
  CV = "CV",
  DIPLOME = "DIPLOME",
  ATTESTATION = "ATTESTATION",
  CERTIFICAT = "CERTIFICAT",
  AUTRE = "AUTRE"
}
interface Paiement {
  id: string
  dossierId: string
  montant: number
  devise: string
  operateur: Operateur
  telephone: string
  statut: StatutPaiement
  referenceExt: string
  referencePay?: string
  recu?: string
  createdAt: Date
  updatedAt: Date
  dossier: Dossier
}

enum Operateur {
  TMONEY = "TMONEY",
  FLOOZ = "FLOOZ",
}

enum StatutPaiement {
  EN_ATTENTE = "EN_ATTENTE",
  SUCCES = "SUCCES",
  ECHEC = "ECHEC"
}

export type { User, Session, Account, Dossier, ParcourAcademique, ParcourProfessionnel, Document, Paiement }
export { Role, StatutDossier, TypeDocument, Operateur, StatutPaiement }

export interface UserProfil {
  id : string
  nom ?: string
  prenom ?: string
  email ?: string
  telephone ?: string | null
  pays: string | null
  photoProfil ?: string | null
  role: "CANDIDAT" | "ADMIN"
}