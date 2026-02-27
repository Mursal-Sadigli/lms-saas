import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { CheckCircle, Loader, XCircle } from 'lucide-react'
import { authApi } from '../src/api'

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { getToken, isSignedIn, isLoaded } = useAuth()
  const [status, setStatus] = useState('loading') // loading | success | error

  const sessionId = searchParams.get('session_id')
  const courseId = searchParams.get('courseId')

  useEffect(() => {
    if (!isLoaded) return // Clerk hələ yüklənir
    if (!isSignedIn) { navigate('/sign-in'); return }
    if (!sessionId || !courseId) { navigate('/'); return }

    const verify = async () => {
      try {
        const token = await getToken()
        await authApi(token).get(`/payments/verify?sessionId=${sessionId}`)
        setStatus('success')
        // 2 saniyə sonra Learn səhifəsinə yönləndir
        setTimeout(() => navigate(`/learn/${courseId}`), 2000)
      } catch (err) {
        console.error(err)
        setStatus('error')
        setTimeout(() => navigate(`/course/${courseId}`), 3000)
      }
    }

    verify()
  }, [isLoaded, isSignedIn, sessionId, courseId])

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-10 text-center max-w-md w-full">
        {status === 'loading' && (
          <>
            <Loader size={52} className="text-violet-500 animate-spin mx-auto mb-5" />
            <h2 className="text-white text-xl font-bold mb-2">Ödəniş yoxlanılır...</h2>
            <p className="text-gray-500 text-sm">Bir anlığa gözləyin</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={48} className="text-emerald-400" />
            </div>
            <h2 className="text-white text-2xl font-extrabold mb-2">Ödəniş uğurlu! 🎉</h2>
            <p className="text-gray-400 text-sm mb-6">Kursunuz aktivləşdirildi. Yönləndirilirsiniz...</p>
            <div className="w-full bg-gray-800 rounded-full h-1.5">
              <div className="bg-emerald-500 h-1.5 rounded-full animate-pulse w-3/4" />
            </div>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-5">
              <XCircle size={48} className="text-red-400" />
            </div>
            <h2 className="text-white text-xl font-bold mb-2">Bir problem yarandı</h2>
            <p className="text-gray-400 text-sm">Ödəniş qəbul edildi, amma enrollment yaradılarkən xəta baş verdi. Kurs səhifəsinə qayıdırsınız...</p>
          </>
        )}
      </div>
    </div>
  )
}
