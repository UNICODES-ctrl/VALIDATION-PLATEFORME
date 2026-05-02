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
    <div className="min-h-screen flex bg-gray-50 sticky top-0 ">
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col ">
        <div className="p-6 border-b border-gray-100 bg-blue-200  transition-all duration-300 ">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-700 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-dark" />
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900">UNICODES VAE</p>
              <p className="text-xs text-gray-400">Espace admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
            <LayoutDashboard className="w-4 h-4" /> Tableau de bord
          </Link>
          <Link href="/admin/dossiers" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
            <FolderOpen className="w-4 h-4" /> Dossiers
          </Link>
          <Link href="/admin/paiements" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
            <CreditCard className="w-4 h-4" /> Paiements
          </Link>
          <Link href="/admin/parametres" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
            <Settings className="w-4 h-4" /> Paramètres
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-100">
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

      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}