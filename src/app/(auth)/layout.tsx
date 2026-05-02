import Image from "next/image"


export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-px grid lg:grid-cols-2">
      {/* Panneau gauche */}
      <div className="hidden lg:flex flex-col justify-around p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #3730a3 0%, #4f46e5 50%, #6366f1 100%)" }}>
        
        {/* Cercles décoratifs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: "white", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: "white", transform: "translate(-30%, 30%)" }} />

        {/* Logo */}
        <div className="relative flex items-center gap-24">
          <div className="w-12 h-10">
            <div className="relative  backdrop-blur  flex items-center justify-center font-bold text-white text-lg h-30 w-30 overflow-hidden rounded-3xl border border-indigo-100 bg-indigo-50/70 p-3">
                      <Image 
                        src="/logo.svg" 
                        alt="Logo UNICODES" 
                        width={140} 
                        height={140} 
                        className="object-contain"
                      />         
                       </div>
          </div>
          <span className="font-semibold text-white text-lg tracking-tight">UNICODES VAE</span>
        </div>

        {/* Citation */}
        <div className="relative ">
          <div className="text-5xl text-white/20 font-serif mb-4"></div>
          <p className="text-xl font-medium text-white leading-relaxed mb-6">
            Faites reconnaître votre expérience professionnelle et obtenez le diplôme que vous méritez.
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold">U</div>
            <div>
              <p className="text-white font-medium text-sm">UNICODES</p>
              <p className="text-white/60 text-xs">Union pour l&apos;innovation des Compétences et du  Développement   Social.</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="relative grid grid-cols-2 gap-4 ">
          {[
            
            { val: "95%", label: "Satisfaction" },
            { val: "5 ans", label: "Expérience" },
          ].map(s => (
            <div key={s.val} className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10">
              <p className="text-white font-bold text-xl">{s.val}</p>
              <p className="text-white/60 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Panneau droit */}
      <div className="flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-base"
              style={{ background: "linear-gradient(135deg, #4f46e5, #6366f1)" }}>V</div>
            <span className="font-semibold text-gray-900">UNICODES VAE</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}