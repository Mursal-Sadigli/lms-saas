import { useState, useEffect } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { Plus, Trash2, Building, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../src/api'

export default function CompanyDashboard() {
  const { getToken } = useAuth()
  const { user } = useUser()
  const [employees, setEmployees] = useState([])
  const [emailInput, setEmailInput] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const token = await getToken()
      const res = await api.get('/payments/company/employees', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setEmployees(res.data.employees || [])
    } catch (err) {
      console.error(err)
      toast.error('Gözlənilməz xəta baş verdi')
    } finally {
      setLoading(false)
    }
  }

  const handleAddEmployee = async (e) => {
    e.preventDefault()
    if (!emailInput.trim()) return

    try {
      const token = await getToken()
      await api.post('/payments/company/employees', 
        { email: emailInput },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success('İşçi uğurla dəvət edildi!')
      setEmailInput('')
      fetchEmployees()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Xəta baş verdi')
    }
  }

  const handleRemoveEmployee = async (email) => {
    if (!window.confirm(`${email} ünvanlı işçini şirkətdən və təlim hüququndan məhrum etmək istədiyinizə əminsiniz?`)) return
    
    try {
      const token = await getToken()
      await api.delete('/payments/company/employees', {
        headers: { Authorization: `Bearer ${token}` },
        data: { email }
      })
      toast.success('İşçi uğurla silindi')
      fetchEmployees()
    } catch (err) {
      toast.error('İşçi silinərkən xəta baş verdi')
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 transition-colors">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <Building size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Şirkət İdarə Paneli (B2B)</h1>
            <p className="text-gray-500 dark:text-gray-400">İşçilərinizi əlavə edin və onların VIP təlim hüquqlarını idarə edin.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Yeni İşçi Əlavə Et</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Paketiniz daxilində limitsiz sayda və ya limit daxilində işçinizin email ünvanını yazın.</p>
              
              <form onSubmit={handleAddEmployee} className="flex flex-col gap-4">
                <input 
                  type="email" 
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-gray-900 dark:text-white transition-all"
                />
                <button 
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-lg shadow-emerald-500/30"
                >
                  <Plus size={18} /> İşçini Dəvət Et
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none min-h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Users size={20} className="text-indigo-500" /> Şirkət İşçiləri
                </h2>
                <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-sm font-bold">
                  {employees.length} İstifadəçi
                </span>
              </div>

              {employees.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-slate-800 text-sm font-semibold text-gray-500 dark:text-gray-400">
                        <th className="pb-3 text-left">Email Ünvanı</th>
                        <th className="pb-3 text-left">Status</th>
                        <th className="pb-3 text-right">Əməliyyat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((emp, i) => (
                        <tr key={i} className="border-b border-gray-50 dark:border-slate-800/50 last:border-0">
                          <td className="py-4">
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">{emp.email}</p>
                            {emp.first_name && <p className="text-xs text-gray-500">{emp.first_name} {emp.last_name}</p>}
                          </td>
                          <td className="py-4">
                            {emp.status === 'accepted' ? (
                              <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-md">Qeydiyyatdan Keçib</span>
                            ) : (
                              <span className="inline-block px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-bold rounded-md">Gözləmədə...</span>
                            )}
                          </td>
                          <td className="py-4 text-right">
                            <button 
                              onClick={() => handleRemoveEmployee(emp.email)}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer border-0 bg-transparent"
                              title="Sil və hüququ ləğv et"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-20 px-4">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-gray-300 dark:text-slate-600 mb-4">
                    <Users size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Heç bir işçi yoxdur</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">Sol tərəfdəki formadan işçilərinizin email ünvanlarını daxil edərək onlara limitsiz öyrənmə hüququ tanıyın.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
