import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, ChevronRight, Sparkles, Mail, MapPin, Phone,
  Send, Award, BookOpen, Clock, Users, Shield, Zap, Star
} from 'lucide-react'
import CourseCard from '../components/CourseCard'
import { fetchCourses, sendContactMessage, getWishlist } from '../src/api'
import { useAuth } from '@clerk/clerk-react'

export const allCourses = [
  {
    _id: '1',
    title: 'İnformatika — Sıfırdan Peşəkar Səviyyəyə (Magistratura)',
    description: 'Bütün mövzular, alqoritmlər, proqramlaşdırma əsasları.',
    price: 24.99,
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80',
    educator: { name: 'Mürsəl Sadıqlı' },
    category: 'Dərs izahları',
    rating: 4.8,
    students: 1240,
    duration: '18 saat',
  },
  {
    _id: '2',
    title: 'Sınaq Toplusu — I Bölmə',
    description: 'Qəbul tipli sınaqlar və ətraflı video izahlar.',
    price: 9.99,
    thumbnail: 'https://images.unsplash.com/photo-1606326666333-e70a2550e588?w=400&q=80',
    educator: { name: 'Mürsəl Sadıqlı' },
    category: 'Sınaq izahları',
    rating: 4.7,
    students: 890,
    duration: '5 saat',
  },
  {
    _id: '3',
    title: 'Model Sınaqlar (PDF)',
    description: 'Yüklənə bilən sınaq materialları siyahısı.',
    price: 4.99,
    thumbnail: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=400&q=80',
    educator: { name: 'Mürsəl Sadıqlı' },
    category: 'Sınaq PDF-ləri',
    rating: 4.9,
    students: 2100,
    duration: 'PDF',
  },
  {
    _id: '4',
    title: 'Dərs Qeydləri — Tam Paket',
    description: 'Bütün mövzuların qısa və lakonik PDF konspektləri.',
    price: 14.99,
    thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80',
    educator: { name: 'Mürsəl Sadıqlı' },
    category: 'Dərs PDF-ləri',
    rating: 4.6,
    students: 680,
    duration: 'PDF',
  },
  {
    _id: '5',
    title: 'Flutter — Mobil Tətbiq İnkişafı',
    description: 'Dart dili, widget sistemi, iOS & Android tətbiqlər.',
    price: 27.99,
    thumbnail: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&q=80',
    educator: { name: 'Rauf Babayev' },
    category: 'Mobile',
    rating: 4.7,
    students: 540,
    duration: '20 saat',
  },
  {
    _id: '6',
    title: 'DevOps — Docker & Kubernetes',
    description: 'Konteynerizasiya, CI/CD pipeline, bulud infrastrukturunun idarəsi.',
    price: 39.99,
    thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=400&q=80',
    educator: { name: 'Tural İsmayılov' },
    category: 'DevOps',
    rating: 4.8,
    students: 420,
    duration: '25 saat',
  },
]

const categories = ['Hamısı', 'Dərs izahları', 'Sınaq izahları', 'Sınaq PDF-ləri', 'Dərs PDF-ləri']

// Mock fallback data (server bağlı olmadıqda)
const mockCourses = allCourses

const features = [
  { icon: <BookOpen size={26} />, title: 'Keyfiyyətli Kurslar', desc: 'Peşəkar müəllimlər tərəfindən hazırlanmış, praktik yönümlü dərslər.' },
  { icon: <Award size={26} />, title: 'Sertifikat', desc: 'Kursu bitirdikdə rəsmi sertifikat əldə et, CV-ni gücləndir.' },
  { icon: <Clock size={26} />, title: 'Öz Tempinlə', desc: 'İstənilən vaxt, istənilən yerdən — ömürlük giriş imkanı.' },
  { icon: <Shield size={26} />, title: '30 Gün Zəmanət', desc: 'Məmnun qalmasan pulunu geri alarsan. Heç bir sual olmadan.' },
  { icon: <Users size={26} />, title: 'Canlı Dəstək', desc: 'Müəllimlərlə birbaşa əlaqə, Q&A sessiyaları.' },
  { icon: <Zap size={26} />, title: 'Sürətli Nəticə', desc: 'Real layihələr üzərindən öyrən, bilikləri dərhal tətbiq et.' },
]

const testimonials = [
  { name: 'Cavid H.', role: 'Frontend Developer', text: 'LearnHub sayəsində 4 ay ərzində iş tapdım. Kurslar çox praktikdir!', rating: 5 },
  { name: 'Samirə K.', role: 'Data Analyst', text: 'Python kursunu bitirdikdən sonra işimdə 40% daha səmərəli oldum.', rating: 5 },
  { name: 'Orxan N.', role: 'Mobile Developer', text: 'Flutter kursunu tövsiyə edirəm. Müəllim çox mükəmməl izah edir.', rating: 4 },
]

export default function Home() {
  const { getToken, isSignedIn } = useAuth()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Hamısı')
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)
  const [courses, setCourses] = useState(mockCourses)
  const [coursesLoading, setCoursesLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchCourses()
        let wishlists = []
        if (isSignedIn) {
          const token = await getToken()
          if (token) {
            wishlists = await getWishlist(token)
          }
        }
        const wIds = wishlists.map(w => w.id)
        const mapped = data.map(c => ({
          ...c,
          isWishlisted: wIds.includes(c.id || c._id)
        }))
        setCourses(mapped)
      } catch (err) {
        setCourses([])
      } finally {
        setCoursesLoading(false)
      }
    }
    loadData()
  }, [isSignedIn, getToken])

  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(search.toLowerCase())
    const matchCat = activeCategory === 'Hamısı' || c.category === activeCategory
    return matchSearch && matchCat
  })

  const handleContact = async e => {
    e.preventDefault()
    try {
      await sendContactMessage(contactForm)
      setSent(true)
      setContactForm({ name: '', email: '', message: '' })
    } catch(err) {
      alert(err.response?.data?.error || "Xəta baş verdi. Daha sonra cəhd edin.")
    }
  }

  return (
    <div>

      {/* ── HERO ── */}
      <section className="bg-linear-to-br from-violet-600 to-purple-500 py-16 sm:py-24 px-4 sm:px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="absolute rounded-full border border-white"
              style={{ width: 180 + i * 90, height: 180 + i * 90, top: `${-15 + i * 14}%`, left: `${-8 + i * 19}%` }} />
          ))}
        </div>
        <div className="relative max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-5">
            <Sparkles size={13} /> Azərbaycanda #1 Online Təhsil Platforması
          </div>
            <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight mb-6">
              İnformatikanı bizimlə <br />
              <span className="text-yellow-300">peşəkar öyrən</span> 🎓
            </h1>
            <p className="text-white/90 text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
              Magistratura, sınaqlar və ətraflı dərs izahları. Tacir Hüseynov ilə informatika dünyasına addım atın.
            </p>
          <div className="flex items-center bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-2xl pl-4 sm:pl-5 pr-1.5 py-1.5 shadow-2xl max-w-xl mx-auto gap-2 transition-colors">
            <Search size={18} className="text-gray-400 dark:text-gray-500 shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Hansı mövzunu öyrənmək istəyirsən?"
              className="flex-1 border-none outline-none text-sm py-2 bg-transparent text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 min-w-0"
            />
            <button className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 sm:px-5 py-2.5 rounded-xl transition-colors shrink-0 cursor-pointer border-0">
              Axtar
            </button>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-white dark:bg-slate-950 py-8 sm:py-10 px-4 sm:px-6 border-b border-gray-100 dark:border-slate-800 transition-colors">
        <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: '12,000+', label: 'Tələbə' },
            { value: '150+', label: 'Kurs' },
            { value: '500+', label: 'Saat Məzmun' },
            { value: '4.8 ★', label: 'Orta Reytinq' },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">{s.value}</div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── COURSES ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">Populyar Kurslar</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Ən çox bəyənilən kurslarımızı kəşf et</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap mb-8">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer
                ${activeCategory === cat
                  ? 'bg-violet-600 border-violet-600 text-white'
                  : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-300 hover:border-violet-400 dark:hover:border-violet-500 hover:text-violet-600 dark:hover:text-white'
                }`}>
              {cat}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-500"><p className="text-lg">Heç bir kurs tapılmadı 🔍</p></div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mb-10">
              {filtered.slice(0, 3).map(course => <CourseCard key={course.id || course._id} course={course} />)}
            </div>
            <div className="text-center">
              <Link to="/courses"
                className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 py-3.5 rounded-2xl transition-colors text-sm sm:text-base">
                Bütün Kurslara Bax <ChevronRight size={18} />
              </Link>
            </div>
          </>
        )}
      </section>

      {/* ── WHY ACE ACADEMY ── */}
      <section className="bg-violet-50 dark:bg-violet-950/20 py-14 sm:py-16 px-4 sm:px-6 transition-colors">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">Niyə ACE Academy? 💡</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Sənin öyrənmə yolunda ən etibarlı tərəfdaş</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-slate-800 hover:shadow-md hover:-translate-y-1 transition-all">
                <div className="text-violet-600 dark:text-violet-400 mb-3">{f.icon}</div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1.5 text-sm sm:text-base">{f.title}</h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-14 sm:py-16 px-4 sm:px-6 bg-white dark:bg-slate-950 transition-colors">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">Tələbələrimiz Nə Deyir? ⭐</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Real insanlar, real nəticələr</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-gray-50 dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} size={14} className={s < t.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 dark:text-gray-700'} />
                  ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-linear-to-br from-violet-500 to-purple-400 flex items-center justify-center text-white text-sm font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{t.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section className="py-14 sm:py-16 px-4 sm:px-6 bg-gray-50 dark:bg-slate-900 transition-colors border-t border-gray-100 dark:border-slate-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">Bizimlə Əlaqə 📬</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Sualın var? 24 saat ərzində cavab veririk.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">

            {/* Info */}
            <div className="flex flex-col gap-4">
              {[
                { icon: <Mail size={20} />, label: 'Email', value: 'msadigli2025@gmail.com' },
                { icon: <Phone size={20} />, label: 'Telefon', value: '+994 70 236 42 00' },
                { icon: <MapPin size={20} />, label: 'Ünvan', value: 'Lənkəran, Azərbaycan' },
                { icon: <Clock size={20} />, label: 'İş saatları', value: 'B.e – Cümə: 09:00 – 18:00' },
              ].map((c, i) => (
                <div key={i} className="flex items-center gap-4 bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700 shadow-sm transition-colors">
                  <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/40 rounded-xl flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
                    {c.icon}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{c.label}</p>
                    <p className="text-gray-800 dark:text-gray-200 font-semibold text-sm">{c.value}</p>
                  </div>
                </div>
              ))}

              {/* Educator CTA */}
              <div className="mt-2 p-6 bg-violet-600 rounded-2xl text-white">
                <h3 className="font-bold text-lg mb-1">Müəllim olmaq istəyirsən?</h3>
                <p className="text-white/80 text-sm mb-4">Platformamızda kurs yarat, tələbələrə öyrət, qazanc əldə et.</p>
                <Link
                  to="/sign-up"
                  className="inline-block bg-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-violet-50 transition-colors"
                  style={{ color: '#5b21b6' }}
                >
                  İndi Başla →
                </Link>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 border border-gray-100 dark:border-slate-700 shadow-sm transition-colors">
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-5">Mesaj Göndər</h3>
              {sent ? (
                <div className="text-center py-10">
                  <div className="text-5xl mb-4">✅</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Mesajınız göndərildi!</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Tezliklə sizinlə əlaqə saxlayacağıq.</p>
                  <button onClick={() => setSent(false)} className="text-violet-600 dark:text-violet-400 font-semibold text-sm hover:underline bg-transparent border-0 cursor-pointer">
                    Yeni mesaj göndər
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContact} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">Ad Soyad</label>
                      <input value={contactForm.name} onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))} required placeholder="Adınız"
                        className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 rounded-xl text-sm outline-none focus:border-violet-500 transition-colors" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">Email</label>
                      <input type="email" value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))} required placeholder="email@example.com"
                        className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 rounded-xl text-sm outline-none focus:border-violet-500 transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">Mesaj</label>
                    <textarea value={contactForm.message} onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))} required rows={5}
                      placeholder="Sualınızı yazın..." className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 rounded-xl text-sm outline-none focus:border-violet-500 transition-colors resize-none" />
                  </div>
                  <button type="submit"
                    className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer border-0">
                    <Send size={15} /> Göndər
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-white pt-14 pb-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">

          {/* 4 sütunlu grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12 pb-12 border-b border-gray-800">

            {/* Brand + Social */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex flex-col leading-none">
                  <span className="font-bold text-[10px] text-violet-400 tracking-[0.3em] uppercase mb-1">İnformatika</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-black text-2xl text-white tracking-tighter uppercase">ACE</span>
                    <span className="font-bold text-xs text-gray-400 uppercase tracking-tighter">Academy</span>
                  </div>
                </div>
                <img 
                  src="/logo_dark.png" 
                  alt="ACE Academy Logo" 
                  className="h-24 md:h-32 w-auto object-contain" 
                  style={{ 
                    filter: 'brightness(1.15) contrast(1.1)',
                    maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)',
                    WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
                  }}
                />
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-5">
                Azərbaycanda keyfiyyətli online təhsil platforması. Peşəkar müəllimlərdən öyrən.
              </p>
              <div className="flex gap-3">
                <a href="https://linkedin.com" target="_blank" rel="noreferrer"
                  className="w-9 h-9 bg-gray-800 hover:bg-violet-600 rounded-lg flex items-center justify-center transition-colors group" title="LinkedIn">
                  <svg className="w-4 h-4 group-hover:fill-white transition-colors" style={{ fill: '#9ca3af' }} viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer"
                  className="w-9 h-9 bg-gray-800 hover:bg-violet-600 rounded-lg flex items-center justify-center transition-colors group" title="Instagram">
                  <svg className="w-4 h-4 group-hover:fill-white transition-colors" style={{ fill: '#9ca3af' }} viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer"
                  className="w-9 h-9 bg-gray-800 hover:bg-violet-600 rounded-lg flex items-center justify-center transition-colors group" title="Facebook">
                  <svg className="w-4 h-4 group-hover:fill-white transition-colors" style={{ fill: '#9ca3af' }} viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Platforma */}
            <div>
              <h4 className="font-bold text-white text-xs mb-5 uppercase tracking-widest">Platformamız</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link to="/" className="hover:text-white transition-colors">Ana Səhifə</Link></li>
                <li><Link to="/courses" className="hover:text-white transition-colors">Kurslar</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">Haqqında</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Əlaqə</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold text-white text-xs mb-5 uppercase tracking-widest">Dəstək</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="mailto:msadigli2025@gmail.com"
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <Mail size={13} className="shrink-0" />
                    msadigli2025@gmail.com
                  </a>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                    FAQ — Tez-tez Verilən Suallar
                  </Link>
                </li>
                <li className="flex items-center gap-2 text-emerald-400 text-xs font-medium">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shrink-0" />
                  24 saat ərzində cavab veririk
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold text-white text-xs mb-5 uppercase tracking-widest">Hüquqi</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Məxfilik Siyasəti</a></li>
                <li><a href="#" className="hover:text-white transition-colors">İstifadə Şərtləri</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Geri Ödəmə Siyasəti</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-500">
            <p>© 2025 ACE Academy. Bütün hüquqlar qorunur.</p>
            <p className="flex items-center gap-1.5">
              <span className="text-violet-400">♥</span> Azərbaycanda hazırlanıb
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
