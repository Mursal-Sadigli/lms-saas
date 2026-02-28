import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getInstructorProfile } from '../src/api'
import CourseCard from '../components/CourseCard'
import { Youtube, Linkedin, Users, BookOpen, Star, Mail } from 'lucide-react'

export default function InstructorProfile() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getInstructorProfile(id)
      .then(res => {
        setData(res)
        setLoading(false)
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Müəllim məlumatları tapılmadı')
        setLoading(false)
      })
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
  
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Xəta baş verdi</h2>
      <p className="text-gray-500">{error}</p>
      <Link to="/courses" className="mt-6 font-semibold text-violet-600 hover:text-violet-700">← Kurslara Qayıt</Link>
    </div>
  )

  const { instructor, courses } = data

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-10 pb-20 transition-colors">
      
      {/* İşıqlı Arxa Plan & Profil Başlığı */}
      <div className="relative isolate overflow-hidden bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 dark:opacity-10 sm:left-[calc(50%-30rem)] sm:w-288.75 clip-path-polygon"></div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-16 lg:py-20 lg:px-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
            {/* Profil Şəkli */}
            <div className="relative shrink-0">
              <img 
                src={instructor.image_url || `https://ui-avatars.com/api/?name=${instructor.first_name}+${instructor.last_name || ''}&background=7c3aed&color=fff`} 
                alt={`${instructor.first_name} ${instructor.last_name}`} 
                className="w-40 h-40 md:w-48 md:h-48 rounded-4xl object-cover shadow-2xl ring-4 ring-white dark:ring-slate-800"
              />
              <div className="absolute -bottom-4 -right-4 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-xl flex gap-2 border border-gray-100 dark:border-slate-700">
                {instructor.youtube_link && (
                  <a href={instructor.youtube_link} target="_blank" rel="noopener noreferrer" className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors">
                    <Youtube size={20} />
                  </a>
                )}
                {instructor.linkedin_link && (
                  <a href={instructor.linkedin_link} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors">
                    <Linkedin size={20} />
                  </a>
                )}
              </div>
            </div>

            {/* Müəllim Məlumatları */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 font-semibold text-xs rounded-full mb-4">
                Platforma Müəllimi
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
                {instructor.first_name} {instructor.last_name}
              </h1>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-8 gap-y-4 mb-8">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-emerald-500"><Users size={18}/></div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider">Ümumi Tələbə</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{instructor.total_students.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-blue-500"><BookOpen size={18}/></div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider">Cəmi Kurs</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{instructor.total_courses}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-yellow-500"><Star size={18}/></div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider">Tələbə Rəyi</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{instructor.average_rating}</p>
                  </div>
                </div>
              </div>

              {instructor.bio && (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 mt-2 text-left">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Haqqında</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl whitespace-pre-wrap text-sm md:text-base">
                    {instructor.bio}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Kurslar Siyahısı */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 mt-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Müəllimin Bütün Kursları ({courses.length})
        </h2>
        
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800">
            <BookOpen size={48} className="mx-auto text-gray-300 dark:text-slate-700 mb-4" />
            <p className="text-lg font-bold text-gray-900 dark:text-white">Müəllimin aktiv kursu yoxdur.</p>
          </div>
        )}
      </div>

    </div>
  )
}
