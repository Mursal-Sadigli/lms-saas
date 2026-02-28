import { useState, useEffect } from 'react'
import { useAuth, RedirectToSignIn } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { Heart, BookOpen } from 'lucide-react'
import { getWishlist } from '../src/api'
import CourseCard from '../components/CourseCard'

export default function Wishlist() {
  const { getToken, isSignedIn, isLoaded } = useAuth()
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    const load = async () => {
      try {
        const token = await getToken()
        const wishData = await getWishlist(token)
        setWishlist(wishData || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isLoaded, isSignedIn, getToken])

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 transition-colors min-h-[70vh]">
      <div className="flex items-center gap-3 mb-8 sm:mb-12 border-b border-gray-200 dark:border-slate-800 pb-5">
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-xl flex items-center justify-center">
          <Heart size={24} className="fill-red-500" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">Seçilmişlərim</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 pl-0.5 text-sm font-medium">{wishlist.length} kurs bəyənmisiniz</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 h-80 animate-pulse transition-colors" />
          ))}
        </div>
      ) : wishlist.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 transition-colors shadow-sm">
          <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-5 text-gray-400">
            <BookOpen size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Seçilmiş kursunuz yoxdur</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 max-w-sm mx-auto">Sizə maraqlı gələn kursları kəşf edin və gələcəkdə baxmaq üçün ürək ikonuna klikləyərək yadda saxlayın.</p>
          <Link to="/courses"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 py-3.5 rounded-xl text-sm transition-transform hover:-translate-y-0.5 shadow-lg shadow-violet-200 dark:shadow-violet-900/20">
            Kurslara Bax
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map(w => (
            <CourseCard key={w.wishlist_id || w.id} course={{ ...w, isWishlisted: true }} />
          ))}
        </div>
      )}
    </div>
  )
}
