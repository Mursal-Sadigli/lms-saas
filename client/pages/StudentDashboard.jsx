import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { BookOpen, Clock, TrendingUp, Award, Play } from 'lucide-react'
import { fetchMyEnrollments } from '../src/api'

export default function StudentDashboard() {
  const { getToken, isSignedIn } = useAuth()
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSignedIn) return
    const load = async () => {
      try {
        const token = await getToken()
        const data = await fetchMyEnrollments(token)
        setEnrollments(data)
      } catch {
        setEnrollments(mockEnrollments)
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

      <h2 className="text-lg font-bold mb-5 dark:text-white">Kurslarım</h2>

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
      ) : enrollments.length === 0 ? (
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
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 dark:bg-slate-800 rounded-full h-1.5">
                      <div className="bg-violet-600 h-1.5 rounded-full transition-all" style={{ width: `${e.progress || 0}%` }} />
                    </div>
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400 shrink-0">{e.progress || 0}%</span>
                  </div>
                </div>
                <Link to={`/course/${e.course_id}`}
                  className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shrink-0">
                  <Play size={12} /> Davam et
                </Link>
              </div>
            </div>
          ))}
        </div>
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
