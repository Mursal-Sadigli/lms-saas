import { useState, useEffect } from 'react'
import { Search, SlidersHorizontal, BookOpen, Clock, Users, Star } from 'lucide-react'
import { fetchCourses } from '../src/api'
import CourseCard from '../components/CourseCard'

const categories = ['Hamısı', 'Dərs izahları', 'Sınaq izahları', 'Sınaq PDF-ləri', 'Dərs PDF-ləri', 'Digər']

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Hamısı')
  const [sort, setSort] = useState('popular')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const params = {}
        if (activeCategory !== 'Hamısı') params.category = activeCategory
        if (search.trim()) params.search = search.trim()
        const data = await fetchCourses(params)
        setCourses(data)
      } catch (err) {
        console.warn('API error, empty data')
        setError('Hələ ki heç bir kurs yoxdur.')
        setCourses([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [activeCategory, search])

  const sorted = [...courses].sort((a, b) => {
    if (sort === 'price-asc') return a.price - b.price
    if (sort === 'price-desc') return b.price - a.price
    if (sort === 'rating') return (b.rating || 0) - (a.rating || 0)
    return (b.students || 0) - (a.students || 0) // popular
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors">
      {/* Header */}
      <div className="bg-linear-to-br from-violet-600 to-purple-500 py-12 px-4 sm:px-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Bütün Kurslar 📚</h1>
        <p className="text-white/80 text-sm sm:text-base mb-8 max-w-xl mx-auto">
          Peşəkar müəllimlərdən öyrən, istənilən vaxt, istənilən yerdən.
        </p>
        <div className="flex items-center bg-white dark:bg-slate-900 rounded-2xl pl-4 pr-1.5 py-1.5 shadow-xl max-w-lg mx-auto gap-2 transition-colors">
          <Search size={18} className="text-gray-400 shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Kurs axtar..."
            className="flex-1 border-none outline-none text-sm py-2 bg-transparent text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 min-w-0"
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Filters row */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 items-start sm:items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all cursor-pointer
                  ${activeCategory === cat
                    ? 'bg-violet-600 border-violet-600 text-white'
                    : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-500 dark:text-gray-400 hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-400'
                  }`}>
                {cat}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <SlidersHorizontal size={15} className="text-gray-400 dark:text-gray-500" />
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="border-2 border-gray-200 dark:border-slate-800 rounded-xl text-xs font-medium px-3 py-1.5 outline-none focus:border-violet-500 bg-white dark:bg-slate-900 dark:text-gray-300 transition-colors">
              <option value="popular">Populyar</option>
              <option value="rating">Reytinq</option>
              <option value="price-asc">Ucuz əvvəl</option>
              <option value="price-desc">Baha əvvəl</option>
            </select>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700/50 text-amber-700 dark:text-amber-500 text-sm px-4 py-3 rounded-xl mb-6">
            ⚠️ {error}
          </div>
        )}

        {/* Count */}
        {!loading && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            <span className="font-bold text-gray-800 dark:text-gray-100">{sorted.length}</span> kurs tapıldı
          </p>
        )}

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 animate-pulse transition-colors">
                <div className="h-40 bg-gray-100 dark:bg-slate-800 rounded-t-2xl" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-100 dark:bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded w-full" />
                  <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-500 dark:text-gray-400">Heç bir kurs tapılmadı</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {sorted.map(course => <CourseCard key={course.id || course._id} course={course} />)}
          </div>
        )}
      </div>
    </div>
  )
}

// API bağlı olmadıqda mövcud kursları istifadə et
const mockCourses = [
  { _id: '1', title: 'İnformatika — Sıfırdan Peşəkar Səviyyəyə (Magistratura)', description: 'Bütün mövzular, alqoritmlər, proqramlaşdırma əsasları.', price: 24.99, thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80', educator: { name: 'Mürsəl Sadıqlı' }, category: 'Dərs izahları', rating: 4.8, students: 1240, duration: '18 saat' },
  { _id: '2', title: 'Sınaq Toplusu — I Bölmə', description: 'Qəbul tipli sınaqlar və ətraflı video izahlar.', price: 9.99, thumbnail: 'https://images.unsplash.com/photo-1606326666333-e70a2550e588?w=400&q=80', educator: { name: 'Mürsəl Sadıqlı' }, category: 'Sınaq izahları', rating: 4.7, students: 890, duration: '5 saat' },
  { _id: '3', title: 'Model Sınaqlar (PDF)', description: 'Yüklənə bilən sınaq materialları siyahısı.', price: 4.99, thumbnail: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=400&q=80', educator: { name: 'Mürsəl Sadıqlı' }, category: 'Sınaq PDF-ləri', rating: 4.9, students: 2100, duration: 'PDF' },
  { _id: '4', title: 'Dərs Qeydləri — Tam Paket', description: 'Bütün mövzuların qısa və lakonik PDF konspektləri.', price: 14.99, thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80', educator: { name: 'Mürsəl Sadıqlı' }, category: 'Dərs PDF-ləri', rating: 4.6, students: 680, duration: 'PDF' },
]
