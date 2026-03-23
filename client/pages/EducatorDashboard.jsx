import { useState, useEffect } from 'react'
import { useUser, useAuth } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { PlusCircle, BookOpen, Users, DollarSign, TrendingUp, Edit, Eye, UploadCloud, Tag, Trash2, BarChart2, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchEducatorCourses, publishCourse, fetchEducatorAnalytics, fetchEducatorCoupons, createCoupon, deleteCoupon, fetchProfile, updateEducatorProfile } from '../src/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function EducatorDashboard() {
  const { user } = useUser()
  const { getToken } = useAuth()
  
  const [courses, setCourses] = useState([])
  const [sales, setSales] = useState([])
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [publishingId, setPublishingId] = useState(null)
  
  const [activeTab, setActiveTab] = useState('courses') // courses, analytics, coupons, profile
  
  const [couponForm, setCouponForm] = useState({ code: '', discount_percent: 10, max_uses: '' })
  
  const [profileForm, setProfileForm] = useState({ bio: '', youtube_link: '', linkedin_link: '' })
  const [profileSaving, setProfileSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const token = await getToken()
      const [coursesData, salesData, couponsData, userProfile] = await Promise.all([
        fetchEducatorCourses(token),
        fetchEducatorAnalytics(token),
        fetchEducatorCoupons(token),
        fetchProfile(token)
      ])
      setCourses(coursesData)
      setSales(salesData)
      setCoupons(couponsData)
      setProfileForm({
        bio: userProfile?.bio || '',
        youtube_link: userProfile?.youtube_link || '',
        linkedin_link: userProfile?.linkedin_link || ''
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async (id) => {
    if (!window.confirm("Kursu yayımlamaq istədiyinizə əminsiniz? Yayımlandıqdan sonra hər kəs görəcək.")) return
    try {
      setPublishingId(id)
      const token = await getToken()
      await publishCourse(token, id)
      setCourses(c => c.map(course => course.id === id ? { ...course, is_published: true } : course))
      toast.success('Kurs uğurla yayımlandı!')
    } catch (err) {
      console.error(err)
      toast.error("Xəta baş verdi.")
    } finally {
      setPublishingId(null)
    }
  }

  const handleCreateCoupon = async (e) => {
    e.preventDefault()
    if (!couponForm.code || couponForm.discount_percent <= 0) return toast.error('Məlumatları düzgün doldurun')
    try {
      const token = await getToken()
      const newCoupon = await createCoupon(token, {
        code: couponForm.code,
        discount_percent: couponForm.discount_percent,
        max_uses: couponForm.max_uses ? Number(couponForm.max_uses) : null
      })
      setCoupons([newCoupon, ...coupons])
      setCouponForm({ code: '', discount_percent: 10, max_uses: '' })
      toast.success('Kupon yaradıldı!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xəta baş verdi')
    }
  }

  const handleDeleteCoupon = async (id) => {
    if(!window.confirm("Kuponu silmək istəyirsiniz?")) return
    try {
      const token = await getToken()
      await deleteCoupon(token, id)
      setCoupons(c => c.filter(x => x.id !== id))
      toast.success('Kupon silindi!')
    } catch (err) {
      toast.error('Xəta baş verdi')
    }
  }

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setProfileSaving(true)
    try {
      const token = await getToken()
      await updateEducatorProfile(token, profileForm)
      toast.success('Şəxsi məlumatlar müvəffəqiyyətlə yeniləndi!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Xəta baş verdi')
    } finally {
      setProfileSaving(false)
    }
  }

  const totalEarnings = courses.reduce((s, c) => s + Number(c.earnings || 0), 0)
  const totalStudents = courses.reduce((s, c) => s + Number(c.students || 0), 0)
  const monthlyRevenue = sales.reduce((s, c) => s + Number(c.total_revenue || 0), 0)

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 transition-colors">
      
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Müəllim Paneli 👨‍🏫</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1.5">
            {user?.firstName}, kurslarını idarə et, statistikanı və kuponları izlə.
          </p>
        </div>
        <Link
          to="/educator/create-course"
          className="flex items-center gap-2 bg-linear-to-r from-violet-600 to-purple-500 text-white px-5 py-3 rounded-xl font-semibold text-sm no-underline hover:opacity-90 transition-opacity"
        >
          <PlusCircle size={16} /> Yeni Kurs Yarat
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<BookOpen size={22} />} value={courses.length} label="Kurslarım" color="text-violet-600" />
        <StatCard icon={<Users size={22} />} value={totalStudents} label="Ümumi Tələbə" color="text-emerald-500" />
        <StatCard icon={<DollarSign size={22} />} value={`$${totalEarnings.toFixed(0)}`} label="Ümumi Qazanc" color="text-amber-500" />
        <StatCard icon={<TrendingUp size={22} />} value={`$${monthlyRevenue.toFixed(0)}`} label="Son 30 Gün" color="text-purple-500" />
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200 dark:border-slate-800 mb-8 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('courses')} 
          className={`pb-3 font-semibold text-sm flex items-center gap-2 transition-colors cursor-pointer border-0 bg-transparent whitespace-nowrap ${activeTab === 'courses' ? 'text-violet-600 dark:text-violet-400 border-b-2 border-violet-600 dark:border-violet-400' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
        >
          <BookOpen size={18} /> Kurslarım 
          <span className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full ml-1">{courses.length}</span>
        </button>
        <button 
          onClick={() => setActiveTab('analytics')} 
          className={`pb-3 font-semibold text-sm flex items-center gap-2 transition-colors cursor-pointer border-0 bg-transparent whitespace-nowrap ${activeTab === 'analytics' ? 'text-violet-600 dark:text-violet-400 border-b-2 border-violet-600 dark:border-violet-400' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
        >
          <BarChart2 size={18} /> Analitika
        </button>
        <button 
          onClick={() => setActiveTab('coupons')} 
          className={`pb-3 font-semibold text-sm flex items-center gap-2 transition-colors cursor-pointer border-0 bg-transparent whitespace-nowrap ${activeTab === 'coupons' ? 'text-violet-600 dark:text-violet-400 border-b-2 border-violet-600 dark:border-violet-400' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
        >
          <Tag size={18} /> Promo Kodlar
          <span className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full ml-1">{coupons.length}</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')} 
          className={`pb-3 font-semibold text-sm flex items-center gap-2 transition-colors cursor-pointer border-0 bg-transparent whitespace-nowrap ${activeTab === 'profile' ? 'text-violet-600 dark:text-violet-400 border-b-2 border-violet-600 dark:border-violet-400' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
        >
          <User size={18} /> Profil Ayarları
        </button>
      </div>

      {/* TABS CONTENT */}
      {activeTab === 'courses' && (
        <div className="flex flex-col gap-4">
          {courses.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-14 text-center">
              <BookOpen size={48} className="text-gray-200 dark:text-slate-700 mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Hələ heç bir kurs yoxdur</p>
              <p className="text-gray-500 dark:text-gray-400 mb-6">İlk kursunu yarat və tələbələri öyrət!</p>
              <Link to="/educator/create-course" className="bg-violet-600 text-white px-7 py-3 rounded-xl font-semibold hover:bg-violet-700 decoration-transparent">Kurs Yarat</Link>
            </div>
          ) : (
             courses.map(course => (
              <div key={course.id} className={`bg-white dark:bg-slate-900 rounded-2xl border transition-colors ${course.is_published ? 'border-gray-200 dark:border-slate-800' : 'border-amber-300 dark:border-amber-700/50 bg-amber-50/30 dark:bg-amber-900/10'} p-5 flex flex-col md:flex-row items-start md:items-center gap-5`}>
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt="" className="w-full md:w-28 h-20 rounded-xl object-cover shrink-0 border border-gray-100 dark:border-slate-800" />
                ) : (
                  <div className="w-full md:w-28 h-20 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-gray-200 dark:border-slate-800 text-gray-400">
                    <BookOpen size={24} />
                  </div>
                )}
                <div className="flex-1 min-w-40">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">{course.title}</h3>
                    {!course.is_published && <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded">Layihə</span>}
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 max-w-lg line-clamp-1 mb-2">{course.description}</p>
                  {course.is_published && <p className="text-xs text-gray-400 dark:text-gray-500">Yaradıldı: {new Date(course.created_at).toLocaleDateString()}</p>}
                </div>
                <div className="flex gap-6 flex-wrap mt-2 md:mt-0 px-2 md:px-0 bg-gray-50 dark:bg-slate-800/50 md:bg-transparent md:dark:bg-transparent p-3 md:p-0 rounded-xl w-full md:w-auto">
                  <Metric label="Tələbə" value={course.students || 0} color="text-emerald-500" />
                  <Metric label="Qiymət" value={`$${course.price}`} color="text-violet-600" />
                  <Metric label="Qazanc" value={`$${Number(course.earnings || 0).toFixed(0)}`} color="text-amber-500" />
                </div>
                <div className="flex items-center gap-2 mt-3 md:mt-0 w-full md:w-auto justify-end">
                  {course.is_published ? (
                    <Link to={`/course/${course.id}`} className="flex-1 md:flex-none h-10 px-4 rounded-xl bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 flex items-center justify-center gap-2 hover:bg-violet-100 dark:hover:bg-violet-900/40 font-semibold text-sm no-underline"><Eye size={16} /> Bax</Link>
                  ) : (
                    <button onClick={() => handlePublish(course.id)} disabled={publishingId === course.id} className="cursor-pointer border-0 flex-1 md:flex-none h-10 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center gap-2 font-bold text-sm disabled:opacity-50">{publishingId === course.id ? 'Gözləyin...' : <><UploadCloud size={16} /> Yayımla</>}</button>
                  )}
                  <Link to={`/educator/edit/${course.id}`} className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-700 decoration-transparent"><Edit size={16} /></Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Son 30 Günün Gəlirləri</h2>
          {sales.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-10">Hələ satış qeydə alınmayıb.</div>
          ) : (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sales} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickFormatter={(val) => new Date(val).toLocaleDateString('az-AZ', { month: 'short', day: 'numeric' })} />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={(val) => `$${val}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    formatter={(value) => [`$${value}`, 'Gəlir']}
                  />
                  <Line type="monotone" dataKey="total_revenue" stroke="#7c3aed" strokeWidth={3} dot={{ r: 4, fill: '#7c3aed' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {activeTab === 'coupons' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Yeni Promo Kod</h2>
            <form onSubmit={handleCreateCoupon} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">Kupon Kodu (məs: YENIIL20)</label>
                <input value={couponForm.code} onChange={e => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})} required placeholder="KOD" className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-violet-500 uppercase text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">Endirim Faizi (%)</label>
                <input type="number" min="1" max="100" value={couponForm.discount_percent} onChange={e => setCouponForm({...couponForm, discount_percent: e.target.value})} required className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-violet-500 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">Limit (Neçə dəfə istifadə edilə bilər? - Boş qala bilər)</label>
                <input type="number" min="1" value={couponForm.max_uses} onChange={e => setCouponForm({...couponForm, max_uses: e.target.value})} placeholder="Limitsiz" className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-violet-500 text-gray-900 dark:text-white" />
              </div>
              <button type="submit" className="mt-2 w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-2.5 rounded-xl transition-colors cursor-pointer border-0">Yarat</button>
            </form>
          </div>
          <div className="md:col-span-2">
             {coupons.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-10 text-center">
                  <Tag size={40} className="text-gray-300 dark:text-slate-700 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">Hələ heç bir aktiv promo kodunuz yoxdur.</p>
                </div>
             ) : (
               <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden overflow-x-auto">
                 <table className="w-full text-left text-sm whitespace-nowrap">
                   <thead className="bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-slate-800">
                     <tr>
                       <th className="px-5 py-3 font-semibold">Kod</th>
                       <th className="px-5 py-3 font-semibold">Endirim</th>
                       <th className="px-5 py-3 font-semibold">İstifadə</th>
                       <th className="px-5 py-3 font-semibold"></th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                     {coupons.map(coupon => (
                       <tr key={coupon.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                         <td className="px-5 py-3 font-bold text-violet-600 dark:text-violet-400">{coupon.code}</td>
                         <td className="px-5 py-3 text-gray-700 dark:text-gray-300">{coupon.discount_percent}%</td>
                         <td className="px-5 py-3 text-gray-500 dark:text-gray-400">
                            {coupon.used_count} / {coupon.max_uses || '∞'}
                         </td>
                         <td className="px-5 py-3 text-right">
                           <button onClick={() => handleDeleteCoupon(coupon.id)} className="text-red-500 hover:text-red-700 p-2 cursor-pointer border-0 bg-transparent rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                             <Trash2 size={16} />
                           </button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             )}
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="max-w-3xl bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Profil Ayarları</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Tələbələrinizə özünüzü tanıdın, təcrübələrinizdən bəhs edin və sosial şəbəkələrinizi əlavə edin.</p>

          <form onSubmit={handleProfileSave} className="flex flex-col gap-6">
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Haqqımda (Bio)</label>
              <textarea 
                value={profileForm.bio} 
                onChange={e => setProfileForm({...profileForm, bio: e.target.value})} 
                placeholder="Özünüz barədə ətraflı məlumat verin..." 
                rows="5"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-gray-900 dark:text-white transition-all resize-y"
              ></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">YouTube Kanalı</label>
                <input 
                  type="url"
                  value={profileForm.youtube_link} 
                  onChange={e => setProfileForm({...profileForm, youtube_link: e.target.value})} 
                  placeholder="https://youtube.com/@adiniz" 
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-gray-900 dark:text-white transition-all" 
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">LinkedIn Hesabı</label>
                <input 
                  type="url"
                  value={profileForm.linkedin_link} 
                  onChange={e => setProfileForm({...profileForm, linkedin_link: e.target.value})} 
                  placeholder="https://linkedin.com/in/adiniz" 
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-gray-900 dark:text-white transition-all" 
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                type="submit" 
                disabled={profileSaving}
                className="px-8 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold transition-colors cursor-pointer border-0 disabled:opacity-70 flex items-center gap-2"
              >
                {profileSaving ? (
                  <><div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"/> Saxlanılır...</>
                ) : 'Yadda Saxla'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  )
}

function StatCard({ icon, value, label, color }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 transition-colors">
      <div className={`${color} mb-3`}>{icon}</div>
      <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{value}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</div>
    </div>
  )
}

function Metric({ label, value, color }) {
  return (
    <div className="text-center">
      <div className={`text-lg font-extrabold ${color}`}>{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  )
}
