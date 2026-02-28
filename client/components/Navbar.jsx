import { Link, useLocation } from 'react-router-dom'
import { SignedIn, SignedOut, UserButton, useAuth } from '@clerk/clerk-react'
import { BookOpen, Home, Info, Mail, BookMarked, Menu, X, Moon, Sun, Bell, Heart } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTheme } from '../src/context/ThemeContext'
import { getWishlist, syncUserStreak } from '../src/api'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/', label: 'Ana Səhifə', icon: <Home size={16} /> },
  { to: '/courses', label: 'Kurslar', icon: <BookMarked size={16} /> },
  { to: '/about', label: 'Haqqında', icon: <Info size={16} /> },
  { to: '/contact', label: 'Əlaqə', icon: <Mail size={16} /> },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { getToken, isSignedIn } = useAuth()
  const [wishlistCount, setWishlistCount] = useState(0)
  const [gamification, setGamification] = useState({ xp: 0, streak_count: 0 })

  useEffect(() => {
    if (isSignedIn) {
      getToken()
        .then(token => {
           getWishlist(token).then(data => setWishlistCount(data?.length || 0)).catch(() => {})
           
           // Gamification streak update & fetch on login
           syncUserStreak(token).then(data => {
             if(data) setGamification({ xp: data.xp || 0, streak_count: data.streak_count || 0 })
           }).catch(() => {})
        })
        .catch(() => {})
    } else {
      setWishlistCount(0)
      setGamification({ xp: 0, streak_count: 0 })
    }

    const handleWishlistUpdate = (e) => {
      setWishlistCount(prev => {
        const newCount = e.detail?.added ? prev + 1 : prev - 1
        return Math.max(0, newCount)
      })
    }

    window.addEventListener('wishlistUpdated', handleWishlistUpdate)
    
    // Listen for XP rewards globally
    const handleGamificationUpdate = (e) => {
       if (e.detail?.xp) setGamification(prev => ({ ...prev, xp: prev.xp + e.detail.xp }))
    }
    window.addEventListener('gamificationUpdated', handleGamificationUpdate)
    
    return () => {
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate)
      window.removeEventListener('gamificationUpdated', handleGamificationUpdate)
    }
  }, [isSignedIn, getToken])

  const showNotifications = () => {
    toast('Hələ ki, yeni bildirişiniz yoxdur.', { icon: '🔔' })
  }

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center shrink-0">
            <BookOpen size={20} className="text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900 dark:text-white tracking-tight">
            Learn<span className="text-violet-600 dark:text-violet-400">Hub</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-2">
          {navItems.map(item => (
            <NavItem key={item.to} to={item.to} label={item.label} icon={item.icon} />
          ))}
        </div>

        {/* Auth & Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isSignedIn && (
             <Link to="/leaderboard" className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-slate-700 mr-1 shadow-inner hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors no-underline">
                <div className="flex items-center gap-1.5 font-bold text-sm text-orange-500" title="Ardıcıl giriş günləri">
                   🔥 {gamification.streak_count}
                </div>
                <div className="w-px h-4 bg-gray-300 dark:bg-slate-600"></div>
                <div className="flex items-center gap-1.5 font-bold text-sm text-yellow-500" title="Topladığınız təcrübə xalları">
                   ⭐ {gamification.xp}
                </div>
             </Link>
          )}
          <div className="flex items-center gap-1 border-r border-gray-200 dark:border-slate-700 pr-3 mr-1">
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border-0 bg-transparent"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button 
              onClick={showNotifications}
              className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors relative cursor-pointer border-0 bg-transparent"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            {isSignedIn && (
              <Link
                to="/wishlist"
                className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors relative flex items-center justify-center cursor-pointer no-underline border-0 bg-transparent"
                aria-label="Wishlist"
              >
                <Heart size={18} />
                {wishlistCount > 0 && (
                  <span className="absolute top-[2px] right-[2px] w-4 h-4 bg-violet-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white dark:border-slate-900">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            )}
          </div>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <Link to="/sign-in" className="px-4 py-2 rounded-lg border-2 border-violet-600 text-violet-600 dark:text-violet-400 dark:border-violet-500 font-semibold text-sm hover:bg-violet-50 dark:hover:bg-slate-800 transition-colors">
              Daxil ol
            </Link>
            <Link to="/sign-up" className="px-4 py-2 rounded-lg bg-violet-600 text-white font-semibold text-sm hover:bg-violet-700 transition-colors">
              Qeydiyyat
            </Link>
          </SignedOut>
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-1 sm:gap-2 md:hidden">
          {isSignedIn && (
            <Link
              to="/wishlist"
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800 transition-colors relative flex items-center justify-center cursor-pointer no-underline border-0 bg-transparent"
              aria-label="Wishlist"
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute top-[2px] right-[2px] w-4 h-4 bg-violet-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white dark:border-slate-900">
                  {wishlistCount}
                </span>
              )}
            </Link>
          )}
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800 transition-colors cursor-pointer border-0 bg-transparent"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 dark:text-gray-300 transition-colors cursor-pointer border-0 bg-transparent" onClick={() => setMobileOpen(o => !o)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 px-4 py-4 flex flex-col gap-1 shadow-md">
          {navItems.map(item => (
            <NavItem key={item.to} to={item.to} label={item.label} icon={item.icon} mobile onClick={() => setMobileOpen(false)} />
          ))}
          <div className="border-t border-gray-100 dark:border-slate-800 mt-3 pt-3 flex flex-col gap-2">
            <SignedIn>
              <Link to="/leaderboard" onClick={() => setMobileOpen(false)} className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-2 no-underline hover:bg-slate-100 dark:hover:bg-slate-700/50">
                 <div className="flex items-center gap-4">
                   <div className="flex items-center gap-1.5 font-bold text-sm text-orange-500">
                     🔥 {gamification.streak_count} Gün
                   </div>
                   <div className="flex items-center gap-1.5 font-bold text-sm text-yellow-500">
                     ⭐ {gamification.xp} XP
                   </div>
                 </div>
              </Link>
              <div className="flex items-center gap-3 px-3 py-2">
                <UserButton afterSignOutUrl="/" />
                <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">Hesabım</span>
              </div>
            </SignedIn>
            <SignedOut>
              <Link to="/sign-in" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 rounded-lg border-2 border-violet-600 dark:border-violet-500 text-violet-600 dark:text-violet-400 font-semibold text-sm text-center hover:bg-violet-50 dark:hover:bg-slate-800 transition-colors">
                Daxil ol
              </Link>
              <Link to="/sign-up" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 rounded-lg bg-violet-600 text-white font-semibold text-sm text-center hover:bg-violet-700 transition-colors">
                Qeydiyyat
              </Link>
            </SignedOut>
          </div>
        </div>
      )}
    </nav>
  )
}

function NavItem({ to, label, icon, mobile, onClick }) {
  const location = useLocation()
  const isActive = location.pathname === to
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all
        ${mobile ? 'w-full' : ''}
        ${isActive
          ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 font-semibold'
          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
        }`}
    >
      {icon} {label}
    </Link>
  )
}
