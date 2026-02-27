import { Link } from 'react-router-dom'
import { Target, Eye, Heart, Users, BookOpen, Award, Linkedin, Github } from 'lucide-react'

const team = [
  { name: 'Elnur Məmmədov', role: 'Baş Müəllim · Frontend', avatar: 'E', color: 'from-violet-500 to-purple-400' },
  { name: 'Leyla Hüseynova', role: 'Data Science Mütəxəssisi', avatar: 'L', color: 'from-pink-500 to-rose-400' },
  { name: 'Anar Əliyev', role: 'Backend Mühəndis', avatar: 'A', color: 'from-blue-500 to-cyan-400' },
]

const values = [
  { icon: <Target size={24} />, title: 'Missiya', desc: 'Hər azərbaycanlıya keyfiyyətli texniki təhsil əldə etmək imkanı vermək.' },
  { icon: <Eye size={24} />, title: 'Vizyon', desc: 'Azərbaycanda rəqəmsal bilik üçün ən etibarlı online platforma olmaq.' },
  { icon: <Heart size={24} />, title: 'Dəyərlər', desc: 'Keyfiyyət, şəffaflıq, insan mərkəzli yanaşma, davamlı inkişaf.' },
]

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors">

      {/* Hero */}
      <div className="bg-linear-to-br from-violet-600 to-purple-500 px-6 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-extrabold text-white mb-4">LearnHub Haqqında 🎓</h1>
          <p className="text-white/80 text-lg leading-relaxed">
            Biz Azərbaycanda onlayn texniki təhsili hamı üçün əlçatan etməyə çalışan
            bir komandayıq. Hər kurs real layihələr üzərindən qurulub.
          </p>
        </div>
      </div>

      {/* Values */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white text-center mb-10">Bizi fərqli edən nədir?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((v, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-7 border border-gray-100 dark:border-slate-800 hover:shadow-md transition-all hover:-translate-y-1">
              <div className="text-violet-600 dark:text-violet-400 mb-4">{v.icon}</div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{v.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white dark:bg-slate-900 py-12 px-6 border-y border-gray-100 dark:border-slate-800 transition-colors">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { icon: <Users size={28} />, value: '12,000+', label: 'Məzun Tələbə' },
            { icon: <BookOpen size={28} />, value: '150+', label: 'Aktiv Kurs' },
            { icon: <Award size={28} />, value: '8,500+', label: 'Sertifikat' },
            { icon: <Heart size={28} />, value: '98%', label: 'Məmnuniyyət' },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-violet-600 dark:text-violet-400 flex justify-center mb-3">{s.icon}</div>
              <div className="text-3xl font-extrabold text-gray-900 dark:text-white">{s.value}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white text-center mb-10">Komandamız 👥</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {team.map((t, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-7 border border-gray-100 dark:border-slate-800 text-center hover:shadow-md transition-all hover:-translate-y-1">
              <div className={`w-16 h-16 rounded-full bg-linear-to-br ${t.color} flex items-center justify-center text-white text-2xl font-extrabold mx-auto mb-4`}>
                {t.avatar}
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">{t.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-linear-to-br from-violet-600 to-purple-500 py-14 px-6 text-center">
        <h2 className="text-2xl font-extrabold text-white mb-3">Bizimlə öyrən, inkişaf et 🚀</h2>
        <p className="text-white/80 mb-8">İlk kursunu pulsuz baxışla sına, sonra qərar ver.</p>
        <Link
          to="/courses"
          className="inline-block bg-white dark:bg-slate-900 font-bold px-8 py-3.5 rounded-2xl hover:bg-violet-50 dark:hover:bg-slate-800 transition-colors text-violet-700 dark:text-violet-400"
        >
          Kurslara Bax
        </Link>
      </section>
    </div>
  )
}
