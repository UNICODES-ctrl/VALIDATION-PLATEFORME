import Link from "next/link"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Plus, Settings, LogOut } from "lucide-react"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { UserProvider } from "@/context/UserContext"


export default async function CandidatLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect("/login")

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })

  return (
    // On change flex-row en flex-col par défaut (mobile) et flex-row sur md: (PC)
    <UserProvider>
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">

      {/* Sidebar : devient une Topbar sur mobile */}
      <aside className="w-full md:w-64 bg-white border-b md:border-r border-gray-100 flex flex-col sticky top-0 z-50 md:relative">

        {/* Header : Logo (Caché sur mobile pour gagner de la place, ou réduit) */}
        <div className="p-4 md:p-6 border-b border-gray-100 hidden md:block">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-lg">V</div>
            <div>
              <p className="font-semibold text-sm text-gray-900">UNICODES VAE</p>
              <p className="text-xs text-gray-400">Espace candidat</p>
            </div>
          </div>
        </div>

        {/* Navigation : Horizontale sur mobile, Verticale sur PC */}
        {/* Navigation : Tab Bar en bas/haut sur mobile avec titres en dessous */}
        <nav className="flex flex-row md:flex-col justify-around md:justify-start p-1 md:p-4 md:space-y-1 flex-1">

          {/* Lien Tableau de bord */}
          <Link href="/dashboard" className="flex flex-col md:flex-row items-center gap-1 md:gap-3 px-2 py-2 md:px-3 md:py-2.5 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all">
            <LayoutDashboard className="w-6 h-6 md:w-4 md:h-4" />
            <span className="text-[10px] md:text-sm font-medium">Tableau de bord</span>
          </Link>

          {/* Lien Nouvelle candidature */}
          <Link href="/dashboard/dossier/nouveau" className="flex flex-col md:flex-row items-center gap-1 md:gap-3 px-2 py-2 md:px-3 md:py-2.5 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all">
            <Plus className="w-6 h-6 md:w-4 md:h-4" />
            <span className="text-[10px] md:text-sm font-medium text-center leading-tight">Nouveau</span>
          </Link>

          {/* Lien Paramètres */}
          <Link href="/dashboard/parametres" className="flex flex-col md:flex-row items-center gap-1 md:gap-3 px-2 py-2 md:px-3 md:py-2.5 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all">
            <Settings className="w-6 h-6 md:w-4 md:h-4" />
            <span className="text-[10px] md:text-sm font-medium">Paramètres</span>
          </Link>

          {/* Déconnexion (Mobile uniquement) */}
          <Link href="/api/auth/signout" className="md:hidden flex flex-col items-center gap-1 px-2 py-2 text-gray-500 hover:text-red-600">
            <LogOut className="w-6 h-6" />
            <span className="text-[10px] font-medium">Quitter</span>
          </Link>
        </nav>

        {/* Profil : Caché sur mobile pour épurer la barre du haut */}
        <div className="hidden md:block p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 mb-2">
            {user?.photoProfil ? (
              <Image src={user.photoProfil} alt="avatar" width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-sm font-bold text-indigo-600">
                {user?.prenom?.[0]}{user?.nom?.[0]}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.prenom} {user?.nom}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <Link href="/api/auth/signout">
            <Button variant="ghost" size="sm" className="w-full justify-start text-gray-500 hover:text-red-600">
              <LogOut className="w-4 h-4 mr-2" /> Déconnexion
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
    </UserProvider>
  )
}