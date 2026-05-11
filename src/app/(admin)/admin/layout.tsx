import Link from "next/link"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, FolderOpen, CreditCard, LogOut, Settings, Shield } from "lucide-react"
import Image from "next/image"
import { prisma } from "@/lib/prisma"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect("/login")
  if (session.user.role !== "ADMIN") redirect("/dashboard")

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      
      {/* Sidebar / Topbar */}
      <aside className="w-full md:w-64 bg-white border-b md:border-r border-gray-100 flex flex-col sticky top-0 z-50 md:relative">
        
        {/* Header Admin - Masqué sur mobile */}
        <div className="p-6 border-b border-gray-100 bg-blue-50 hidden md:block">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-700 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900">UNICODES VAE</p>
              <p className="text-xs text-gray-400">Espace admin</p>
            </div>
          </div>
        </div>

        {/* Navigation : Style Tab Bar sur mobile (Icône + Petit titre en bas) */}
        <nav className="flex flex-row md:flex-col justify-around md:justify-start p-1 md:p-4 md:space-y-1">
          
          <Link href="/admin" className="flex flex-col md:flex-row items-center gap-1 md:gap-3 px-2 py-2 md:px-3 md:py-2.5 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all">
            <LayoutDashboard className="w-6 h-6 md:w-4 md:h-4" /> 
            <span className="text-[10px] md:text-sm font-medium">Dashboard</span>
          </Link>
          
          <Link href="/admin/dossiers" className="flex flex-col md:flex-row items-center gap-1 md:gap-3 px-2 py-2 md:px-3 md:py-2.5 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all">
            <FolderOpen className="w-6 h-6 md:w-4 md:h-4" /> 
            <span className="text-[10px] md:text-sm font-medium">Dossiers</span>
          </Link>
          
          <Link href="/admin/paiements" className="flex flex-col md:flex-row items-center gap-1 md:gap-3 px-2 py-2 md:px-3 md:py-2.5 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all">
            <CreditCard className="w-6 h-6 md:w-4 md:h-4" /> 
            <span className="text-[10px] md:text-sm font-medium">Paiements</span>
          </Link>
          
          <Link href="/admin/parametres" className="flex flex-col md:flex-row items-center gap-1 md:gap-3 px-2 py-2 md:px-3 md:py-2.5 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all">
            <Settings className="w-6 h-6 md:w-4 md:h-4" /> 
            <span className="text-[10px] md:text-sm font-medium">Paramètres</span>
          </Link>

          {/* Déconnexion Mobile */}
          <Link href="/api/auth/signout" className="md:hidden flex flex-col items-center gap-1 px-2 py-2 text-gray-500 hover:text-red-600">
            <LogOut className="w-6 h-6" />
            <span className="text-[10px] font-medium">Quitter</span>
          </Link>
        </nav>

        {/* Profil Admin - Desktop Uniquement */}
        <div className="hidden md:block p-4 border-t border-gray-100 mt-auto">
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
              <p className="text-xs text-indigo-500 font-medium">Administrateur</p>
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
  )
}