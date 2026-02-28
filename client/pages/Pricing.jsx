import { useState } from 'react'
import { Check, X, Building, Zap, Star } from 'lucide-react'
import { useAuth, useUser } from '@clerk/clerk-react'
import toast from 'react-hot-toast'
import { api } from '../src/api'

export default function Pricing() {
  const { isSignedIn, getToken } = useAuth()
  const { user } = useUser()
  const [loading, setLoading] = useState(null) // 'monthly', 'yearly', 'enterprise'

  const handleSubscribe = async (planType) => {
    if (!isSignedIn) {
      toast.error('Zəhmət olmasa əvvəlcə daxil olun.')
      return
    }
    try {
      setLoading(planType)
      const token = await getToken()
      const res = await api.post(
        '/payments/subscribe', 
        { planType }, 
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.data.url) {
        window.location.href = res.data.url
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Xəta baş verdi')
      setLoading(null)
    }
  }

  const plans = [
    {
      id: 'monthly',
      name: 'Aylıq Paket',
      price: '20 ₼',
      description: 'Sərbəst öyrənməyə başlamaq üçün ideal',
      features: ['Bütün kurslara limitsiz giriş', 'Hər gün yenilənən dərslər', 'Tələbə Liderlər Lövhəsində iştirak', '7/24 Dəstək', 'Sertifikat verilmir'],
      icon: <Star className="w-6 h-6 text-blue-500" />,
      color: 'blue'
    },
    {
      id: 'yearly',
      name: 'İllik Paket',
      price: '200 ₼',
      description: 'Ciddi tələbələr üçün böyük endirimlə',
      features: ['Bütün kurslara limitsiz giriş', 'Offline baxmaq üçün yükləmə (Tezliklə)', 'Profillərə Xüsusi Badge', 'Rəsmi Kurs Sertifikatları', '2 ay pulsuz qazanc!'],
      icon: <Zap className="w-6 h-6 text-violet-500" />,
      color: 'violet',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Şirkətlər Üçün (B2B)',
      price: '500 ₼',
      description: 'Müəssisələr və komandalar üçün',
      features: ['10+ əməkdaş üçün toplu giriş xətti', 'Mərkəzi Şirkət İdarəetmə Paneli', 'İşçilərin inkişafının izlənməsi', 'Eksklüziv hesabatlar API', 'VIP Dəstək meneceri'],
      icon: <Building className="w-6 h-6 text-emerald-500" />,
      color: 'emerald'
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20 px-4 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">Sərhədsiz Öyrənmə <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-600 to-indigo-600">Başlayır</span></h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">Kursları tək-tək almaq əvəzinə, abunə olun və platformadakı **bütün dərslərə** limitsiz çıxış əldə edin. Öz modelinizi seçin.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`relative bg-white dark:bg-slate-900 rounded-3xl p-8 border ${plan.popular ? 'border-violet-500 ring-4 ring-violet-500/10 shadow-2xl flex flex-col scale-100 md:scale-105 z-10' : 'border-gray-200 dark:border-slate-800 shadow-xl flex flex-col z-0'}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-linear-to-r from-violet-600 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                  Ən Çox Seçilən
                </div>
              )}
              
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-2xl bg-${plan.color}-50 dark:bg-${plan.color}-900/20`}>
                  {plan.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{plan.description}</p>
                </div>
              </div>

              <div className="my-6">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{plan.price}</span>
                <span className="text-gray-500 dark:text-gray-400"> / {plan.id === 'enterprise' ? 'aylıq' : plan.id === 'yearly' ? 'illik' : 'aylıq'}</span>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 shrink-0 text-${plan.color}-500 mt-0.5`} />
                    <span className="text-gray-600 dark:text-gray-300 text-sm leading-tight">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading !== null}
                className={`w-full py-4 rounded-xl font-bold transition-all ${
                  plan.popular 
                    ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-600/30' 
                    : 'bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-900 dark:text-white'
                } disabled:opacity-50`}
              >
                {loading === plan.id ? 'Yönləndirilir...' : 'İndi Abunə Ol'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
