import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { BookOpen, Clock, TrendingUp, Award, Play, Heart } from 'lucide-react'
import { fetchMyEnrollments, getWishlist } from '../src/api'
import CourseCard from '../components/CourseCard'

export default function StudentDashboard() {
  const { getToken, isSignedIn } = useAuth()
  const [enrollments, setEnrollments] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [activeTab, setActiveTab] = useState('courses') // 'courses' | 'wishlist'
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSignedIn) return
    const load = async () => {
      try {
        const token = await getToken()
        const [enrollData, wishData] = await Promise.all([
          fetchMyEnrollments(token).catch(() => mockEnrollments),
          getWishlist(token).catch(() => [])
        ])
        setEnrollments(enrollData)
        setWishlist(wishData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isSignedIn])

  const avgProgress = enrollments.length
    ? Math.round(enrollments.reduce((s, e) => s + (e.progress || 0), 0) / enrollments.length)
    : 0

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 transition-colors">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">Tələbə Paneli 🎓</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Öyrənmə yolculuğunu buradan izlə.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <StatCard icon={<BookOpen size={20} />} value={enrollments.length} label="Kurslarım" color="text-violet-600" />
        <StatCard icon={<TrendingUp size={20} />} value={`${avgProgress}%`} label="Orta İrəliləyiş" color="text-emerald-500" />
        <StatCard icon={<Clock size={20} />} value="0" label="Tamamlanan" color="text-amber-500" />
        <StatCard icon={<Award size={20} />} value="0" label="Sertifikat" color="text-purple-500" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 mb-8 border-b border-gray-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('courses')}
          className={`pb-4 text-sm font-bold border-b-2 transition-colors border-0 bg-transparent cursor-pointer ${
            activeTab === 'courses'
              ? 'border-violet-600 text-violet-600 dark:border-violet-500 dark:text-violet-400'
              : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <div className="flex items-center gap-2"><BookOpen size={16} /> Mənim Kurslarım</div>
        </button>
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`pb-4 text-sm font-bold border-b-2 transition-colors border-0 bg-transparent cursor-pointer ${
            activeTab === 'wishlist'
              ? 'border-violet-600 text-violet-600 dark:border-violet-500 dark:text-violet-400'
              : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <div className="flex items-center gap-2"><Heart size={16} /> Seçilmişlərim</div>
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 animate-pulse transition-colors">
              <div className="flex gap-4">
                <div className="w-20 h-16 bg-gray-100 dark:bg-slate-800 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 dark:bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded w-1/2" />
                  <div className="h-2 bg-gray-100 dark:bg-slate-800 rounded-full w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'courses' ? (
        enrollments.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 transition-colors">
            <div className="text-5xl mb-4">📚</div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">Hələ kurs almamısınız</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Maraqlı kursları kəşf edin</p>
            <Link to="/courses"
              className="inline-block bg-violet-600 hover:bg-violet-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors">
              Kurslara Bax
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {enrollments.map(e => (
              <div key={e.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 transition-colors">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  {e.thumbnail && (
                    <img src={e.thumbnail} alt="" className="w-full sm:w-20 h-32 sm:h-14 rounded-xl object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate mb-0.5">{e.title}</h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">{e.educator_name}</p>
                    <div className="w-full mt-2">
                      <div className="flex justify-between items-center mb-1 text-xs">
                        <span className="text-gray-500 dark:text-gray-400 font-medium">İrəliləyiş</span>
                        <span className="text-violet-600 dark:text-violet-400 font-bold">{e.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-2.5">
                        <div className="bg-violet-600 h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${e.progress || 0}%` }} />
                      </div>
                    </div>
                  </div>
                  <Link to={`/learn/${e.course_id}`}
                    className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shrink-0">
                    <Play size={12} /> Davam et
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        wishlist.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 transition-colors">
            <div className="text-5xl mb-4">💔</div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">Seçilmiş kursunuz yoxdur</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Kursları ürəkləyərək buraya əlavə edə bilərsiniz.</p>
            <Link to="/courses"
              className="inline-block bg-violet-600 hover:bg-violet-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors">
              Kurslara Bax
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map(w => (
              <CourseCard key={w.wishlist_id || w.id} course={{ ...w, isWishlisted: true }} />
            ))}
          </div>
        )
      )}
    </div>
  )
}

function StatCard({ icon, value, label, color }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-4 transition-colors">
      <div className={`${color} mb-2`}>{icon}</div>
      <div className="text-xl font-extrabold text-gray-900 dark:text-white leading-tight">{value}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</div>
    </div>
  )
}

const mockEnrollments = []
