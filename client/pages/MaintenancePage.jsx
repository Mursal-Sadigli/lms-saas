import React from 'react'
import { Wrench } from 'lucide-react'

const MaintenancePage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="w-24 h-24 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center mb-6 animate-pulse">
        <Wrench size={48} className="text-violet-600 dark:text-violet-400" />
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
        Saytda Texniki Baxış Gedir
      </h1>
      <p className="text-gray-500 dark:text-gray-400 max-w-lg mb-8 text-lg font-medium">
        Platformamızda hazırda vacib yenilənmə işləri aparılır. Xidmət keyfiyyətimizi artırmaq üçün qısa bir fasilə verdik. Tezliklə yenidən xidmətinizdə olacağıq. <br/><br/>Anlayışınız üçün təşəkkürlər!
      </p>
    </div>
  )
}

export default MaintenancePage
