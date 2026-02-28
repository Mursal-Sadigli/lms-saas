import { useState } from 'react'
import { Mail, Phone, MapPin, Send, Clock, MessageCircle } from 'lucide-react'
import { sendContactMessage } from '../src/api'

const faqs = [
  { q: 'Kurslar nə qədər müddət ərzindədir?', a: 'Kurs aldıqdan sonra ömürlük giriş əldə edirsiniz. İstənilən vaxt, istənilən tərəfdən baxmaq olar.' },
  { q: 'Ödəniş üsulları hansılardır?', a: 'Visa, MasterCard, Kapital Bank kartları və digər ödəniş üsulları qəbul edilir.' },
  { q: 'Kurs tamamlandıqdan sonra sertifikat verilirmi?', a: 'Bəli! Bütün kurslar tamamlandıqda rəsmi LearnHub sertifikatı təqdim olunur.' },
  { q: 'Müəllim olmaq üçün nə etməliyəm?', a: 'Qeydiyyatdan keçib educator rolunu seçin, sonra kurs yaradıb yayımlayın.' },
]

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      await sendContactMessage(form)
      setSent(true)
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      alert("Xəta baş verdi. Daha sonra yenidən cəhd edin.")
    }
  }

  const inputCls = "w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-violet-500 transition-colors bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors">

      {/* Hero */}
      <div className="bg-linear-to-br from-violet-600 to-purple-500 px-6 py-14 text-center">
        <h1 className="text-4xl font-extrabold text-white mb-3">Bizimlə Əlaqə 📬</h1>
        <p className="text-white/80 text-lg">Sualın var? Rəyin var? Sevinclə cavablandıracağıq.</p>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">

          {/* Info */}
          <div className="flex flex-col gap-5">
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">Əlaqə Məlumatları</h2>
            {[
              { icon: <Mail size={20} />, label: 'Email', value: 'msadigli2025@gmail.com', href: 'mailto:msadigli2025@gmail.com' },
              { icon: <Phone size={20} />, label: 'Telefon', value: '+994 70 236 42 00', href: 'tel:+994702364200' },
              { icon: <MapPin size={20} />, label: 'Ünvan', value: 'Lənkəran, Azərbaycan', href: null },
              { icon: <Clock size={20} />, label: 'İş saatları', value: 'B.e – Cümə: 09:00 – 18:00', href: null },
            ].map((c, i) => (
              <div key={i} className="flex items-center gap-4 bg-white dark:bg-slate-900 rounded-xl p-4 border border-gray-100 dark:border-slate-800 transition-colors">
                <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/40 rounded-xl flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
                  {c.icon}
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{c.label}</p>
                  {c.href ? (
                    <a href={c.href} className="text-gray-800 dark:text-gray-200 font-semibold text-sm hover:text-violet-600 dark:hover:text-violet-400 transition-colors">{c.value}</a>
                  ) : (
                    <p className="text-gray-800 dark:text-gray-200 font-semibold text-sm">{c.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-gray-100 dark:border-slate-800 transition-colors">
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-6">Mesaj Göndər</h2>
            {sent ? (
              <div className="text-center py-10">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Mesajınız göndərildi!</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Tezliklə cavab verəcəyik.</p>
                <button onClick={() => setSent(false)} className="text-violet-600 dark:text-violet-400 font-semibold text-sm hover:underline cursor-pointer border-0 bg-transparent">
                  Yeni mesaj göndər
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">Ad Soyad</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="Adınız" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">Email</label>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required placeholder="email@az" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">Mövzu</label>
                  <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required placeholder="Sualınızın mövzusu" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">Mesaj</label>
                  <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required rows={4} placeholder="Mesajınızı yazın..." className={`${inputCls} resize-none`} />
                </div>
                <button type="submit" className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer border-0">
                  <Send size={16} /> Göndər
                </button>
              </form>
            )}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <MessageCircle size={22} className="text-violet-600 dark:text-violet-400" /> Tez-tez Verilən Suallar
          </h2>
          <div className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden transition-colors">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex justify-between items-center px-6 py-4 text-left font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer border-0 bg-transparent"
                >
                  {faq.q}
                  <span className={`text-violet-600 dark:text-violet-400 text-lg font-bold transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-slate-800 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
