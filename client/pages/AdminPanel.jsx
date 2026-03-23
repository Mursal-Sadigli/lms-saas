import { useState, useEffect } from 'react'
import { useUser, useAuth } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { PlusCircle, BookOpen, Users, DollarSign, TrendingUp, Edit, Eye, Lock } from 'lucide-react'
import { fetchEducatorCourses } from '../src/api'

export default function AdminPanel() {
  const { isLoaded, isSignedIn, user } = useUser()
  const { getToken } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSignedIn) return
    const load = async () => {
      try {
        const token = await getToken()
        const data = await fetchEducatorCourses(token)
        setCourses(data)
      } catch {
        setCourses(mockCourses)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isSignedIn])

  if (!isLoaded) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!isSignedIn) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center transition-colors">
      <Lock size={52} className="text-gray-300 dark:text-gray-600 mb-5" />
      <h2 className="text-2xl font-extrabold text-gray-800 dark:text-gray-200 mb-3">Giriş tələb olunur</h2>
      <Link to="/sign-in" className="bg-violet-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-violet-700 transition-colors">
        Daxil ol
      </Link>
    </div>
  )

  const totalEarnings = courses.reduce((s, c) => s + Number(c.earnings || 0), 0)
  const totalStudents = courses.reduce((s, c) => s + Number(c.students || 0), 0)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 transition-colors">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 text-xs font-bold px-3 py-1.5 rounded-full mb-3">
            <Lock size={12} /> Gizli Müəllim Paneli
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">Müəllim Paneli 👨‍🏫</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">{user?.firstName}, kurslarını idarə et.</p>
        </div>
        <Link to="/educator/create-course"
          className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-3 rounded-xl font-semibold text-sm transition-colors self-start">
          <PlusCircle size={16} /> Yeni Kurs Yarat
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <StatCard icon={<BookOpen size={20} />} value={courses.length} label="Kurslarım" color="text-violet-600" />
        <StatCard icon={<Users size={20} />} value={totalStudents} label="Tələbə" color="text-emerald-500" />
        <StatCard icon={<DollarSign size={20} />} value={`${totalEarnings.toLocaleString()} ₼`} label="Qazanc" color="text-amber-500" />
        <StatCard icon={<TrendingUp size={20} />} value="+12%" label="Bu Ay" color="text-purple-500" />
      </div>

      <h2 className="text-lg font-bold mb-4 dark:text-white">Kurslarım</h2>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 animate-pulse h-20 transition-colors" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 transition-colors">
          <div className="text-5xl mb-4">📚</div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Hələ kurs yaratmamısınız</p>
          <Link to="/educator/create-course"
            className="inline-block bg-violet-600 text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-violet-700 transition-colors">
            İlk Kursunu Yarat
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {courses.map(course => (
            <div key={course.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-colors">
              <div className="w-full sm:w-20 h-32 sm:h-14 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-gray-100 dark:border-slate-800 overflow-hidden">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                ) : (
                  <BookOpen size={20} className="text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate mb-1">{course.title}</h3>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${course.is_published ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400'}`}>
                    {course.is_published ? 'Yayımlanıb' : 'Qaralama'}
                  </span>
                </div>
              </div>
              <div className="flex gap-6 w-full sm:w-auto">
                <Metric label="Tələbə" value={course.students || 0} color="text-emerald-500" />
                <Metric label="Qiymət" value={`${Number(course.price).toFixed(2)} ₼`} color="text-violet-600" />
                <Metric label="Qazanc" value={`${Number(course.earnings || 0).toLocaleString()} ₼`} color="text-amber-500" />
              </div>
              <div className="flex gap-2">
                <Link to={`/course/${course.id}`}
                  className="w-9 h-9 rounded-lg bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 flex items-center justify-center hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors">
                  <Eye size={15} />
                </Link>
                <button className="w-9 h-9 rounded-lg bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center transition-colors cursor-pointer border-0">
                  <Edit size={15} />
                </button>
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

function Metric({ label, value, color }) {
  return (
    <div className="text-center">
      <div className={`text-base font-extrabold ${color}`}>{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  )
}

const mockCourses = [
  { id: '1', title: 'React.js — Sıfırdan Peşəkar Səviyyəyə', thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&q=80', students: 124, price: 24.99, earnings: 3108.76, is_published: true },
]
