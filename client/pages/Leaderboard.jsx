import { useState, useEffect } from 'react'
import { getLeaderboard } from '../src/api'
import { Trophy, Flame, Star, Medal } from 'lucide-react'

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLeaderboard()
      .then(data => {
        setLeaders(data)
        setLoading(false)
      })
      .catch(err => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-slate-50 dark:bg-slate-950">
        <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-12 md:py-20 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
      <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Header Content */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-4 bg-yellow-100 dark:bg-yellow-500/10 rounded-full mb-2">
            <Trophy size={48} className="text-yellow-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Kollektiv Liderlər Lövhəsi</h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Ən çox təcrübə xalı (XP) toplayan və dərslərinə fasilə verməyən ən üstün 10 tələbə.
            Öz yerini yüksəltmək üçün sınaqlarda iştirak et!
          </p>
        </div>

        {/* The List Container */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 p-2 md:p-4">
          
          {leaders.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Star size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Hələ heç kim xal qazanmayıb.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {leaders.map((user, index) => {
                const isFirst = index === 0
                const isSecond = index === 1
                const isThird = index === 2
                
                let badgeColor = "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                if (isFirst) badgeColor = "bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/30 shadow-sm"
                if (isSecond) badgeColor = "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 shadow-sm"
                if (isThird) badgeColor = "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50 shadow-sm"

                return (
                  <div 
                    key={user.id}
                    className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${
                      isFirst 
                        ? 'bg-linear-to-r from-yellow-50 to-white dark:from-yellow-900/10 dark:to-transparent border border-yellow-100 dark:border-yellow-500/10 scale-[1.02] my-2' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent hover:border-gray-100 dark:hover:border-slate-800'
                    }`}
                  >
                    {/* Left: Rank & Info */}
                    <div className="flex items-center gap-4 md:gap-6">
                      <div className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full font-bold text-lg md:text-xl shrink-0 ${badgeColor}`}>
                        {isFirst ? <Trophy size={20} /> : isSecond || isThird ? <Medal size={20} /> : `#${index + 1}`}
                      </div>
                      
                      <div className="flex items-center gap-3 md:gap-4">
                        <img 
                          src={user.image_url || `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=7c3aed&color=fff`} 
                          alt="User" 
                          className={`w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-2 ${isFirst ? 'border-yellow-400' : 'border-gray-200 dark:border-slate-700'}`}
                        />
                        <div>
                          <h3 className="font-bold text-base md:text-lg text-gray-900 dark:text-white flex items-center gap-2">
                            {user.first_name} {user.last_name}
                            {isFirst && <span className="hidden md:inline-flex px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-yellow-400 text-yellow-900">Çempion</span>}
                          </h3>
                        </div>
                      </div>
                    </div>

                    {/* Right: Stats */}
                    <div className="flex items-center gap-3 md:gap-6 text-right">
                      <div className="flex flex-col items-center md:items-end">
                        <div className="flex items-center gap-1.5 text-orange-500 font-bold text-sm md:text-base">
                          <Flame size={18} className={isFirst ? "animate-pulse" : ""} />
                          <span>{user.streak_count}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider hidden md:block">Günlük Seriya</span>
                      </div>
                      <div className="w-px h-8 bg-gray-200 dark:bg-slate-700 hidden md:block"></div>
                      <div className="flex flex-col items-center md:items-end w-16 md:w-auto">
                        <div className="flex items-center gap-1.5 text-yellow-500 font-extrabold text-lg md:text-xl">
                          <Star size={20} className={isFirst ? "animate-pulse" : ""} />
                          <span>{user.xp}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider hidden md:block">Təcrübə (XP)</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
