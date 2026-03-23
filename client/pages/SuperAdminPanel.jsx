import { useState, useEffect } from 'react'
import { useUser, useAuth, useClerk } from '@clerk/clerk-react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  ShieldAlert, 
  Users, 
  BookOpen, 
  DollarSign, 
  Trash2, 
  LayoutDashboard, 
  CreditCard, 
  Ticket, 
  Settings, 
  LogOut,
  ArrowLeft,
  Activity,
  BarChart3,
  Globe,
  Lock,
  Mail,
  Wallet,
  CheckCircle,
  Eye,
  Menu,
  X,
  FileText,
  Video,
  Edit
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'
import { 
  getAdminStats, 
  getAllUsers, 
  getAllAdminCourses, 
  changeUserRole, 
  adminDeleteCourse,
  getPlatformSettings,
  updatePlatformSettings,
  approveCourse,
  fetchAdminVisitors,
  clearAdminVisitors
} from '../src/api'

export default function SuperAdminPanel() {
  const { isLoaded, isSignedIn, user } = useUser()
  const { getToken } = useAuth()
  const { signOut } = useClerk()
  const navigate = useNavigate()

  const [stats, setStats] = useState({ totalUsers: 0, totalCourses: 0, draftCourses: 0, totalRevenue: 0 })
  const [usersList, setUsersList] = useState([])
  const [coursesList, setCoursesList] = useState([])
  const [settings, setSettings] = useState(null)
  const [visitorsList, setVisitorsList] = useState([])
  
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('adminMainTab') || 'dashboard')
  const [settingsTab, setSettingsTab] = useState('general')
  const [loading, setLoading] = useState(true)
  const [savingSettings, setSavingSettings] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Recharts üçün simulyasiya məlumatları
  const chartData = [
    { name: 'Bazar E.', satışlar: 400, qeydiyyat: 240 },
    { name: 'Çərşənbə A.', satışlar: 300, qeydiyyat: 139 },
    { name: 'Çərşənbə', satışlar: 500, qeydiyyat: 380 },
    { name: 'Cümə A.', satışlar: 278, qeydiyyat: 390 },
    { name: 'Cümə', satışlar: 189, qeydiyyat: 480 },
    { name: 'Şənbə', satışlar: 239, qeydiyyat: 380 },
    { name: 'Bazar', satışlar: 349, qeydiyyat: 430 },
  ]

  useEffect(() => {
    if (!isSignedIn) return
    const fetchData = async () => {
      try {
        const token = await getToken()
        const [statsData, usersData, coursesData, settingsData, visitorsData] = await Promise.all([
          getAdminStats(token),
          getAllUsers(token),
          getAllAdminCourses(token),
          getPlatformSettings(token),
          fetchAdminVisitors(token)
        ])
        setStats(statsData)
        setUsersList(usersData)
        setCoursesList(coursesData)
        setSettings(settingsData.settings)
        setVisitorsList(visitorsData)
      } catch (err) {
        toast.error('Giriş qadağandır və ya xəta baş verdi', { style: { background: '#333', color: '#fff' } })
        navigate('/') // Admin deyilsə anında ana səhifəyə qaytar
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [isSignedIn, navigate])

  // Aktiv tabı yadda saxlamaq üçün
  useEffect(() => {
    localStorage.setItem('adminMainTab', activeTab)
  }, [activeTab])

  if (!isLoaded) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-gray-500 font-medium animate-pulse">Platforma yüklənir...</p>
    </div>
  )

  if (!isSignedIn) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 px-6 text-center transition-colors">
      <ShieldAlert size={64} className="text-red-500 mb-6 drop-shadow-md" />
      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">Sistem İcazəsi Rədd Edildi</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm">Bu səhifəyə giriş yalnız qeydiyyatdan keçmiş Mərkəzi İdarəçilər (Super Admin) üçündür.</p>
      <Link to="/sign-in" className="bg-violet-600 shadow-lg shadow-violet-600/20 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-violet-700 hover:-translate-y-1 transition-all">
        Giriş Səhifəsinə Keç
      </Link>
    </div>
  )

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = await getToken()
      await changeUserRole(token, userId, newRole)
      toast.success('İstifadəçi rolu uğurla dəyişdirildi', { style: { background: '#333', color: '#fff' } })
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } catch (err) {
      toast.error('Xəta baş verdi', { style: { background: '#333', color: '#fff' } })
    }
  }

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Bu kursu platformadan birdəfəlik silmək istədiyinizə əminsiniz? (Qaytarıla bilməz)')) return
    try {
      const token = await getToken()
      await adminDeleteCourse(token, courseId)
      toast.success('Kurs uğurla silindi', { style: { background: '#333', color: '#fff' } })
      setCoursesList(prev => prev.filter(c => c.id !== courseId))
    } catch (err) {
      toast.error('Silinmə xətası baş verdi', { style: { background: '#333', color: '#fff' } })
    }
  }

  const handleApproveCourse = async (courseId) => {
    if (!window.confirm('Bu kursu təsdiqləyib platformada yayımlamaq istədiyinizə əminsiniz?')) return
    try {
      const token = await getToken()
      await approveCourse(token, courseId)
      toast.success('Kurs uğurla təsdiqləndi', { style: { background: '#333', color: '#fff' } })
      setCoursesList(prev => prev.map(c => c.id === courseId ? { ...c, is_published: true } : c))
    } catch (err) {
      toast.error('Təsdiqləmə xətası baş verdi', { style: { background: '#333', color: '#fff' } })
    }
  }

  const handleSaveSettings = async (e) => {
    e.preventDefault()
    if (!settings) return
    
    setSavingSettings(true)
    try {
      const token = await getToken()
      const res = await updatePlatformSettings(token, settings)
      if (res.success) {
        toast.success(res.message, { style: { background: '#333', color: '#fff' } })
      }
    } catch (err) {
      toast.error('Tənzimləmələri yadda saxlamaq mümkün olmadı', { style: { background: '#333', color: '#fff' } })
    } finally {
      setSavingSettings(false)
    }
  }

  const handleClearAllVisitors = async () => {
    if (!window.confirm('Bütün ziyarətçi tarixçəsini silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.')) return
    try {
      const token = await getToken()
      await clearAdminVisitors(token)
      setVisitorsList([])
      toast.success('Bütün ziyarətçilər uğurla silindi', { style: { background: '#333', color: '#fff' } })
    } catch (err) {
      toast.error('Silinmə xətası baş verdi', { style: { background: '#333', color: '#fff' } })
    }
  }

  // Sidebar menü elementləri
  const menuItems = [
    { id: 'dashboard', label: 'İdarə Paneli', icon: LayoutDashboard },
    { id: 'users', label: 'İstifadəçilər', icon: Users },
    { id: 'courses', label: 'Kurslar', icon: BookOpen },
    { id: 'visitors', label: 'Ziyarətçilər', icon: Eye },
    { id: 'payments', label: 'Maliyyə', icon: CreditCard },
    { id: 'coupons', label: 'Kuponlar', icon: Ticket },
    { id: 'settings', label: 'Tənzimləmələr', icon: Settings },
  ]

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 overflow-hidden font-sans transition-colors duration-200">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 p-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-2">
          <ShieldAlert className="text-red-500" size={24} />
          <h1 className="font-extrabold text-lg tracking-tight leading-tight">Super Admin</h1>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)} 
          className="p-2 border-0 bg-gray-100 dark:bg-slate-800 focus:bg-gray-200 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 w-72 md:w-64 bg-white dark:bg-slate-900 md:border-r border-gray-200 dark:border-slate-800 flex flex-col shadow-2xl md:shadow-xs z-50 transition-transform duration-300 ease-in-out shrink-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center">
            <ShieldAlert className="text-red-500 mr-2.5" size={24} />
            <div>
              <h1 className="font-extrabold text-lg tracking-tight leading-tight">Super Admin</h1>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">{user?.firstName} {user?.lastName}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="md:hidden p-1.5 border-0 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 rounded-lg cursor-pointer transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          <p className="px-3 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Əsas Menyü</p>
          {menuItems.map(item => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  setIsSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all border-0 cursor-pointer ${
                  isActive 
                    ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-600/20' 
                    : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-violet-50 dark:hover:bg-slate-800 hover:text-violet-600 dark:hover:text-violet-400'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-violet-200' : 'text-gray-400'} />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-slate-800 space-y-2 shrink-0">
          <button 
            onClick={() => navigate('/')} 
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-0 bg-transparent hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-400 rounded-xl font-bold text-sm transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} /> Sayta Qayıt
          </button>
          <button 
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-0 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl font-bold text-sm transition-colors cursor-pointer"
          >
            <LogOut size={16} /> Hesabdan Çıx
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/80 p-6 sm:p-10 relative">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-medium animate-pulse">Məlumatlar gətirilir...</p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto pb-20">
            {/* Header / Title */}
            <div className="mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white capitalize">
                {menuItems.find(i => i.id === activeTab)?.label}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Platformanın mərkəzi nəzarət sistemi.</p>
            </div>

            {/* DASHBOARD TAB */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-white dark:bg-slate-900 py-6 px-8 rounded-3xl border border-gray-100 dark:border-slate-800 flex flex-col justify-center items-start shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mb-4">
                      <Users size={24} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-4xl font-extrabold text-gray-900 dark:text-white mb-1">{stats.totalUsers}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">İstifadəçi</div>
                  </div>
                  
                  <div className="bg-white dark:bg-slate-900 py-6 px-8 rounded-3xl border border-gray-100 dark:border-slate-800 flex flex-col justify-center items-start shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/40 rounded-full flex items-center justify-center mb-4">
                      <BookOpen size={24} className="text-violet-600 dark:text-violet-400" />
                    </div>
                    <div className="text-4xl font-extrabold text-gray-900 dark:text-white mb-1">
                      {stats.totalCourses}
                      {stats.draftCourses > 0 && <span className="text-base text-gray-400 font-medium ml-2">(+{stats.draftCourses} Qaralama)</span>}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Aktiv Kurs</div>
                  </div>
                  
                  <div className="bg-white dark:bg-slate-900 py-6 px-8 rounded-3xl border border-gray-100 dark:border-slate-800 flex flex-col justify-center items-start shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mb-4">
                      <DollarSign size={24} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="text-4xl font-extrabold text-gray-900 dark:text-white mb-1">{stats.totalRevenue.toLocaleString()} ₼</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Ümumi Qazanc</div>
                  </div>
                </div>

                {/* Analytics Section */}
                <div className="mt-12 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
                      <BarChart3 size={20} />
                    </div>
                    <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">Platforma Analitikası</h3>
                  </div>
                  
                  {/* Real Recharts API Qrafiki */}
                  <div className="h-72 sm:h-80 w-full mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 12, fill: '#64748b' }} 
                          dy={10} 
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 12, fill: '#64748b' }} 
                        />
                        <Tooltip 
                          cursor={{ fill: 'rgba(139, 92, 246, 0.05)' }}
                          contentStyle={{ 
                            borderRadius: '12px', 
                            border: 'none', 
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            backgroundColor: 'white',
                            color: '#0f172a',
                            fontWeight: 'bold'
                          }}
                        />
                        <Bar 
                          dataKey="satışlar" 
                          fill="#8b5cf6" 
                          radius={[6, 6, 0, 0]} 
                          name="Satışlar (₼)" 
                          barSize={32}
                        />
                        <Bar 
                          dataKey="qeydiyyat" 
                          fill="#f43f5e" 
                          radius={[6, 6, 0, 0]} 
                          name="Yeni İstifadəçi" 
                          barSize={32}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-6 font-medium max-w-lg mx-auto">
                    Bu qrafik son 7 gündə platformaya olan marağı və qeydiyyat/satış dinamikasını simulyasiya edir. (Xarici Kitabxana ilə əsl Data bağlamaq mümkündür).
                  </p>
                </div>
              </div>
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 overflow-visible shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-gray-100 dark:border-slate-800">
                        <th className="px-8 py-5 text-xs uppercase text-gray-500 dark:text-gray-400 font-extrabold tracking-widest pl-8">İstifadəçi</th>
                        <th className="px-8 py-5 text-xs uppercase text-gray-500 dark:text-gray-400 font-extrabold tracking-widest">Email</th>
                        <th className="px-8 py-5 text-xs uppercase text-gray-500 dark:text-gray-400 font-extrabold tracking-widest">Qeydiyyat</th>
                        <th className="px-8 py-5 text-xs uppercase text-gray-500 dark:text-gray-400 font-extrabold tracking-widest text-right">Rol İdarəsi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50 text-sm">
                      {usersList.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                          <td className="px-8 py-5 flex items-center gap-4">
                            <img src={u.image_url || 'https://via.placeholder.com/48'} alt="" className="w-12 h-12 rounded-full object-cover bg-gray-100 dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700" />
                            <div className="flex flex-col">
                              <span className="font-extrabold text-gray-900 dark:text-white capitalize">{u.first_name} {u.last_name || ''}</span>
                              <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 max-w-[150px] truncate">{u.id}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-gray-600 dark:text-gray-400 font-medium">{u.email}</td>
                          <td className="px-8 py-5 text-gray-500 dark:text-gray-500 font-medium">{new Date(u.created_at).toLocaleDateString('az-AZ')}</td>
                          <td className="px-8 py-5 text-right">
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-xs font-bold rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 cursor-pointer shadow-sm hover:border-violet-300 dark:hover:border-slate-600 transition-colors"
                            >
                              <option value="student">Tələbə</option>
                              <option value="educator">Müəllim</option>
                              <option value="admin">Super Admin</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* COURSES TAB */}
            {activeTab === 'courses' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {coursesList.map(c => (
                  <div key={c.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col hover:shadow-xl hover:shadow-violet-900/5 transition-all duration-300 group">
                    <div className="relative h-48 overflow-hidden">
                      {c.thumbnail ? (
                        <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <BookOpen className="text-slate-300 dark:text-slate-700" size={40} />
                        </div>
                      )}
                      
                      <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                        <span className="bg-slate-900/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold">
                          {c.category || 'Ümumi'}
                        </span>
                        {c.is_published ? (
                          <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> Aktiv
                          </span>
                        ) : (
                          <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm line-through decoration-2 decoration-white/50">
                            Qaralama
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="flex-1 font-extrabold text-gray-900 dark:text-white text-lg leading-tight mb-2 line-clamp-2">{c.title}</h3>
                      <div className="flex items-center gap-4 mt-auto mb-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                          <Users size={14} /> {c.students || 0}
                        </div>
                        {c.pdf_url && (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-red-500" title="Kurs materialı (PDF)">
                             <FileText size={14} /> PDF
                          </div>
                        )}
                        {Number(c.video_file_count) > 0 && (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-violet-500" title={`${c.video_file_count} Video Fayl`}>
                             <Video size={14} /> {c.video_file_count} Video
                          </div>
                        )}
                         {Number(c.video_pdf_count) > 0 && (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-orange-500" title={`${c.video_pdf_count} Dərs PDF-i`}>
                             <FileText size={14} /> {c.video_pdf_count} PDF
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-auto flex justify-between items-center pt-5 border-t border-gray-100 dark:border-slate-800/60">
                        <span className="text-lg font-extrabold text-violet-600 dark:text-violet-400">{Number(c.price).toFixed(2)} ₼</span>
                        <div className="flex gap-2">
                          {c.is_published ? (
                            <button 
                              onClick={() => navigate(`/educator/edit/${c.id}`)}
                              className="flex items-center gap-2 text-xs font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 px-3 py-2 rounded-xl transition-colors cursor-pointer border-0"
                            >
                              <Edit size={16} /> Redaktə
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleApproveCourse(c.id)}
                              className="flex items-center gap-2 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 px-3 py-2 rounded-xl transition-colors cursor-pointer border-0"
                            >
                              <CheckCircle size={16} /> Təsdiqlə
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteCourse(c.id)}
                            className="flex items-center gap-2 text-xs font-extrabold text-red-600 dark:text-red-400 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 px-3 py-2 rounded-xl transition-colors cursor-pointer border-0"
                          >
                            <Trash2 size={16} /> Sil
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* VISITORS TAB */}
            {activeTab === 'visitors' && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 overflow-visible shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                       <Eye className="text-violet-500" size={20} />
                       Sayt Ziyarətçiləri
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Sistem yaddaşında qalan son 500 ziyarət sessiyası.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm border border-violet-100 dark:border-violet-900/30">
                      <Activity size={16} /> Total: {visitorsList.length}
                    </div>
                    {visitorsList.length > 0 && (
                      <button 
                        onClick={handleClearAllVisitors} 
                        className="flex items-center gap-2 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl text-sm font-bold border border-red-100 dark:border-red-900/30 transition-colors cursor-pointer"
                      >
                        <Trash2 size={16} /> Təmizlə
                      </button>
                    )}
                  </div>
                </div>
                <div className="overflow-x-auto max-h-[60vh]">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead className="sticky top-0 bg-slate-50 dark:bg-slate-950 z-10 shadow-sm shadow-slate-200/50 dark:shadow-slate-900/50">
                      <tr>
                        <th className="px-8 py-5 text-xs uppercase text-gray-500 dark:text-gray-400 font-extrabold tracking-widest pl-8">İP Ünvan</th>
                        <th className="px-8 py-5 text-xs uppercase text-gray-500 dark:text-gray-400 font-extrabold tracking-widest">Cihaz / OS</th>
                        <th className="px-8 py-5 text-xs uppercase text-gray-500 dark:text-gray-400 font-extrabold tracking-widest">Brauzer</th>
                        <th className="px-8 py-5 text-xs uppercase text-gray-500 dark:text-gray-400 font-extrabold tracking-widest">Səhifə</th>
                        <th className="px-8 py-5 text-xs uppercase text-gray-500 dark:text-gray-400 font-extrabold tracking-widest text-right">Tarix</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50 text-sm">
                      {visitorsList.length === 0 ? (
                         <tr>
                            <td colSpan="5" className="px-8 py-12 text-center text-gray-400 font-medium">Hələ heç bir ziyarətçi izlənilməyib.</td>
                         </tr>
                      ) : visitorsList.map(v => (
                        <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-8 py-4 font-mono text-xs font-bold text-gray-900 dark:text-white pl-8">
                             {v.ip_address}
                          </td>
                          <td className="px-8 py-4 text-gray-600 dark:text-gray-400 font-medium">
                             {v.device || 'Naməlum'}
                          </td>
                          <td className="px-8 py-4 text-gray-600 dark:text-gray-400 font-medium">
                             {v.browser || 'Naməlum'}
                          </td>
                          <td className="px-8 py-4 max-w-[200px] truncate text-violet-600 dark:text-violet-400 font-medium" title={v.page_visited}>
                             {v.page_visited}
                          </td>
                          <td className="px-8 py-4 text-right text-gray-500 dark:text-gray-500 font-medium text-xs">
                             {new Date(v.created_at).toLocaleString('az-AZ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SETTINGS TAB (Zənginləşdirilmiş SaaS Model) */}
            {activeTab === 'settings' && settings && (
              <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 animate-in fade-in zoom-in-95 duration-500">
                
                {/* Sol Sub-Menyu */}
                <div className="w-full md:w-64 shrink-0">
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-4 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <div className="mb-4 px-3 pt-2">
                       <h3 className="font-extrabold text-gray-900 dark:text-white flex items-center gap-2 text-lg">
                          <Settings className="text-violet-500" size={20} /> Tənzimləmələr
                       </h3>
                    </div>
                    
                    <nav className="space-y-1 relative z-10">
                      {[
                        { id: 'general', label: 'Ümumi', icon: Globe },
                        { id: 'security', label: 'Sistem & İcazələr', icon: Lock },
                        { id: 'finance', label: 'Maliyyə & API', icon: Wallet },
                        { id: 'smtp', label: 'E-poçt (SMTP)', icon: Mail },
                      ].map(item => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold text-sm ${
                            settingsTab === item.id 
                            ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20' 
                            : 'text-gray-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                          }`}
                        >
                          <item.icon size={18} className={settingsTab === item.id ? 'text-white' : 'text-gray-400'} />
                          {item.label}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>

                {/* Sağ Məzmun Sahəsi */}
                <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-8 shadow-sm">
                  <form onSubmit={handleSaveSettings} className="space-y-6">
                    
                    {/* ÜMUMİ (GENERAL) */}
                    {settingsTab === 'general' && (
                      <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <div className="border-b border-gray-100 dark:border-slate-800 pb-4 mb-6">
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white">Ümumi Platforma Ayarları</h4>
                          <p className="text-sm text-gray-500">Platformanın ictimai kimliyi və əlaqə məlumatları.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-xs uppercase tracking-widest font-extrabold text-gray-500 dark:text-gray-400 mb-2">Platforma Adı</label>
                            <input type="text" value={settings.brand_name || ''} onChange={(e) => setSettings({...settings, brand_name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500" />
                          </div>
                          <div>
                            <label className="block text-xs uppercase tracking-widest font-extrabold text-gray-500 dark:text-gray-400 mb-2">Əlaqə E-Poçtu</label>
                            <input type="email" value={settings.contact_email || ''} onChange={(e) => setSettings({...settings, contact_email: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500" />
                          </div>
                          <div>
                            <label className="block text-xs uppercase tracking-widest font-extrabold text-gray-500 dark:text-gray-400 mb-2">Dəstək Nömrəsi</label>
                            <input type="text" value={settings.support_phone || ''} onChange={(e) => setSettings({...settings, support_phone: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500" />
                          </div>
                          <div>
                            <label className="block text-xs uppercase tracking-widest font-extrabold text-gray-500 dark:text-gray-400 mb-2">Mərkəzi Ünvan</label>
                            <input type="text" value={settings.address || ''} onChange={(e) => setSettings({...settings, address: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SİSTEM & İCAZƏLƏR (SECURITY) */}
                    {settingsTab === 'security' && (
                      <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <div className="border-b border-gray-100 dark:border-slate-800 pb-4 mb-6">
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white">İcazələr və Nəzarət</h4>
                          <p className="text-sm text-gray-500">İstifadəçilərin saytdakı davranış limitləri.</p>
                        </div>
                        
                        <div className="space-y-5">
                          <label className="flex items-center gap-4 cursor-pointer p-4 rounded-2xl border border-gray-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <div className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 shrink-0 ${settings.maintenance_mode ? 'bg-red-500' : 'bg-gray-300 dark:bg-slate-700'}`}>
                              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.maintenance_mode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </div>
                            <input type="checkbox" className="hidden" checked={settings.maintenance_mode || false} onChange={(e) => setSettings({...settings, maintenance_mode: e.target.checked})} />
                            <div>
                              <div className="font-extrabold text-gray-900 dark:text-white">Texniki Baxım Rejimi (Maintenance)</div>
                              <div className="text-xs text-gray-500 mt-1">Aktiv olduqda sayt adi istifadəçilər (Tələbələr) üçün bağlanır.</div>
                            </div>
                          </label>

                          <label className="flex items-center gap-4 cursor-pointer p-4 rounded-2xl border border-gray-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <div className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 shrink-0 ${settings.is_educator_registration_open ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-slate-700'}`}>
                              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.is_educator_registration_open ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </div>
                            <input type="checkbox" className="hidden" checked={settings.is_educator_registration_open} onChange={(e) => setSettings({...settings, is_educator_registration_open: e.target.checked})} />
                            <div>
                              <div className="font-extrabold text-gray-900 dark:text-white">Avtomatik Müəllim Qeydiyyatı</div>
                              <div className="text-xs text-gray-500 mt-1">İstifadəçilər özləri sərbəst müəllim profilinə keçə bilərlər.</div>
                            </div>
                          </label>

                          <label className="flex items-center gap-4 cursor-pointer p-4 rounded-2xl border border-gray-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <div className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 shrink-0 ${settings.require_course_approval ? 'bg-amber-500' : 'bg-gray-300 dark:bg-slate-700'}`}>
                              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.require_course_approval ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </div>
                            <input type="checkbox" className="hidden" checked={settings.require_course_approval} onChange={(e) => setSettings({...settings, require_course_approval: e.target.checked})} />
                            <div>
                              <div className="font-extrabold text-gray-900 dark:text-white">Məcburi Kurs Təsdiqi</div>
                              <div className="text-xs text-gray-500 mt-1">Müəllimlərin yüklədiyi kurs dərhal çıxmır, Admin təsdiqi gözləyir.</div>
                            </div>
                          </label>

                          <label className="flex items-center gap-4 cursor-pointer p-4 rounded-2xl border border-gray-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <div className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 shrink-0 ${settings.allow_student_reviews ? 'bg-blue-500' : 'bg-gray-300 dark:bg-slate-700'}`}>
                              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.allow_student_reviews ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </div>
                            <input type="checkbox" className="hidden" checked={settings.allow_student_reviews || false} onChange={(e) => setSettings({...settings, allow_student_reviews: e.target.checked})} />
                            <div>
                              <div className="font-extrabold text-gray-900 dark:text-white">Rəy və Yorumlara İcazə</div>
                              <div className="text-xs text-gray-500 mt-1">Tələbələr kurslara və müəllimlərə rəy yaza bilərlər.</div>
                            </div>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* MALİYYƏ VƏ GATEWAY (FINANCE) */}
                    {settingsTab === 'finance' && (
                      <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <div className="border-b border-gray-100 dark:border-slate-800 pb-4 mb-6">
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white">Maliyyə & Gateway (Stripe)</h4>
                          <p className="text-sm text-gray-500">Komissiyalar və ödəniş sistemi bağlantıları.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                          <div>
                             <label className="block text-xs uppercase tracking-widest font-extrabold text-gray-500 dark:text-gray-400 mb-2">Platforma Komissiyası (%)</label>
                             <div className="relative">
                               <input type="number" min="0" max="100" value={settings.platform_fee_percent} onChange={(e) => setSettings({...settings, platform_fee_percent: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500" />
                               <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                             </div>
                          </div>
                          <div>
                             <label className="block text-xs uppercase tracking-widest font-extrabold text-gray-500 dark:text-gray-400 mb-2">Minimum Çıxarış Limiti (₼)</label>
                             <div className="relative">
                               <input type="number" min="1" value={settings.min_payout_amount} onChange={(e) => setSettings({...settings, min_payout_amount: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500" />
                               <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₼</span>
                             </div>
                          </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-violet-100 dark:border-violet-900/30">
                          <h5 className="font-extrabold text-violet-600 dark:text-violet-400 mb-4 flex items-center gap-2"><CreditCard size={18}/> Stripe İnteqrasiya Açarları</h5>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-xs uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400 mb-2">Stripe Public Key</label>
                              <input type="text" value={settings.stripe_public_key || ''} onChange={(e) => setSettings({...settings, stripe_public_key: e.target.value})} placeholder="pk_test_..." className="w-full bg-white dark:bg-black border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 font-mono text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500" />
                            </div>
                            <div>
                              <label className="block text-xs uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400 mb-2">Stripe Secret Key</label>
                              <input type="password" value={settings.stripe_secret_key || ''} onChange={(e) => setSettings({...settings, stripe_secret_key: e.target.value})} placeholder="sk_test_..." className="w-full bg-white dark:bg-black border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 font-mono text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SMTP VƏ E-POÇT (EMAIL) */}
                    {settingsTab === 'smtp' && (
                      <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                         <div className="border-b border-gray-100 dark:border-slate-800 pb-4 mb-6">
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white">SMTP Göndərici (E-Poçt)</h4>
                          <p className="text-sm text-gray-500">Platformanın avtomatik poçtları üçün server tranzit ayarları.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div>
                              <label className="block text-xs uppercase tracking-widest font-extrabold text-gray-500 dark:text-gray-400 mb-2">SMTP Host</label>
                              <input type="text" value={settings.smtp_host || ''} onChange={(e) => setSettings({...settings, smtp_host: e.target.value})} placeholder="smtp.resend.com" className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500" />
                           </div>
                           <div>
                              <label className="block text-xs uppercase tracking-widest font-extrabold text-gray-500 dark:text-gray-400 mb-2">SMTP Port</label>
                              <input type="number" value={settings.smtp_port || 465} onChange={(e) => setSettings({...settings, smtp_port: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500" />
                           </div>
                           <div>
                              <label className="block text-xs uppercase tracking-widest font-extrabold text-gray-500 dark:text-gray-400 mb-2">SMTP Username</label>
                              <input type="text" value={settings.smtp_user || ''} onChange={(e) => setSettings({...settings, smtp_user: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500" />
                           </div>
                           <div>
                              <label className="block text-xs uppercase tracking-widest font-extrabold text-gray-500 dark:text-gray-400 mb-2">SMTP Password</label>
                              <input type="password" value={settings.smtp_pass || ''} onChange={(e) => setSettings({...settings, smtp_pass: e.target.value})} placeholder="••••••••" className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500" />
                           </div>
                        </div>
                      </div>
                    )}

                    <div className="pt-8 mt-8 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end">
                      <button 
                        type="submit" 
                        disabled={savingSettings}
                        className="bg-violet-600 hover:bg-violet-700 text-white font-extrabold py-3.5 px-10 rounded-xl shadow-lg shadow-violet-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {savingSettings ? 'Yadda Saxlanılır...' : 'Dəyişiklikləri Tətbiq Et'}
                      </button>
                    </div>

                  </form>
                </div>
              </div>
            )}

            {/* PLACEHOLDER TABS */}
            {['payments', 'coupons'].includes(activeTab) && (
              <div className="bg-white dark:bg-slate-900 py-24 rounded-3xl border border-gray-100 dark:border-slate-800 flex flex-col items-center text-center shadow-sm animate-in fade-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 text-slate-400 dark:text-slate-500">
                  <Activity size={32} />
                </div>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">Bu bölmə hələ ki hazır deyil</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">
                  Gələcək yeniləmələrlə birlikdə burada detallı Məlumat və Tənzimləmələr ekranları aktivləşdiriləcək.
                </p>
              </div>
            )}
            
          </div>
        )}
      </main>
    </div>
  )
}
