import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth, useUser } from '@clerk/clerk-react'
import {
  Star, Clock, Users, PlayCircle, CheckCircle,
  Lock, ShoppingCart, ChevronDown, ChevronUp, Send, AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchCourseById, addReview, createCheckoutSession, checkEnrollment, validateCoupon } from '../src/api'

function StarRating({ value, onChange, readonly }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button"
          onClick={() => !readonly && onChange?.(s)}
          onMouseEnter={() => !readonly && setHovered(s)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className="p-0 border-0 bg-transparent cursor-pointer">
          <Star size={readonly ? 16 : 22}
            className={`transition-colors ${(hovered || value) >= s ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
        </button>
      ))}
    </div>
  )
}

export default function CourseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isSignedIn, getToken } = useAuth()
  const { user } = useUser()

  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isUserEnrolled, setIsUserEnrolled] = useState(false)
  const [error, setError] = useState(null)
  const [openVideo, setOpenVideo] = useState(null)
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' })
  const [reviewSent, setReviewSent] = useState(false)
  const [reviewLoading, setReviewLoading] = useState(false)

  useEffect(() => {
    // 1. Kurs məlumatlarını çək
    fetchCourseById(id)
      .then(data => setCourse(data))
      .catch(() => {
        setError('Kurs tapılmadı və ya server bağlı deyil.')
      })
      .finally(() => setLoading(false))

    // 2. Əgər daxil olubsa, qeydiyyatı yoxla
    if (isSignedIn) {
      getToken().then(token => {
        checkEnrollment(token, id).then(enrolled => setIsUserEnrolled(enrolled))
      })
    }
  }, [id, isSignedIn])

  const avgRating = course?.reviews?.length
    ? course.reviews.reduce((s, r) => s + r.rating, 0) / course.reviews.length
    : course?.rating || 0

  const [buyLoading, setBuyLoading] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)

  const finalPrice = appliedCoupon && appliedCoupon.discount_percent 
    ? Math.max(0, Number(course?.price) * (1 - appliedCoupon.discount_percent / 100))
    : Number(course?.price || 0)

  const handleApplyCoupon = async () => {
    if (!couponCode) return
    if (!isSignedIn) { toast.error("Kupon tətbiq etmək üçün daxil olun"); return; }
    try {
      setCouponLoading(true)
      const token = await getToken()
      const data = await validateCoupon(token, { code: couponCode, course_id: course.id || course._id })
      setAppliedCoupon(data)
      toast.success('Kupon tətbiq edildi!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Kupon keçərsizdir')
      setAppliedCoupon(null)
    } finally {
      setCouponLoading(false)
    }
  }

  const handleBuy = async () => {
    if (!isSignedIn) { navigate('/sign-in'); return }
    try {
      setBuyLoading(true)
      const token = await getToken()
      const result = await createCheckoutSession(token, {
        courseId: course.id || course._id,
        couponCode: appliedCoupon?.code
      })
      if (result.isFree) {
        toast.success("Kursa pulsuz qoşuldunuz!")
        window.location.href = result.redirectUrl || `/learn/${course.id || course._id}`
      } else {
        window.location.href = result.url // Stripe ödəniş səhifəsinə yönləndir
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Ödəniş başladıla bilmədi.'
      toast.error(msg)
    } finally {
      setBuyLoading(false)
    }
  }

  const handleReview = async e => {
    e.preventDefault()
    if (newReview.rating === 0) return
    try {
      setReviewLoading(true)
      const token = await getToken()
      const review = await addReview(token, {
        courseId: id,
        rating: newReview.rating,
        comment: newReview.comment,
      })
      setCourse(prev => ({
        ...prev,
        reviews: [{ ...review, first_name: user?.firstName, last_name: user?.lastName }, ...(prev.reviews || [])],
      }))
      setNewReview({ rating: 0, comment: '' })
      setReviewSent(true)
      setTimeout(() => setReviewSent(false), 3000)
    } catch (err) {
      alert(err.response?.data?.error || 'Rəy göndərilə bilmədi.')
    } finally {
      setReviewLoading(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!course) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <AlertCircle size={48} className="text-red-400 mb-4" />
      <h2 className="text-xl font-bold text-gray-800 mb-2">Kurs tapılmadı</h2>
      <button onClick={() => navigate('/courses')}
        className="mt-4 bg-violet-600 text-white px-6 py-2.5 rounded-xl font-semibold cursor-pointer border-0">
        Kurslara qayıt
      </button>
    </div>
  )

  const videos = course.videos || course.curriculum || []
  const reviews = course.reviews || []
  const educatorName = course.educator_name || course.educator?.name || 'Müəllim'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors">
      {/* HERO */}
      <div className="bg-linear-to-br from-gray-900 to-violet-950 px-4 sm:px-6 py-10 sm:py-14">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10 items-start">
          <div>
            <span className="inline-block bg-violet-500/30 text-violet-300 text-xs font-semibold px-3 py-1 rounded-full mb-4">
              {course.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-4">{course.title}</h1>
            <p className="text-white/75 text-sm leading-relaxed mb-6">{course.description}</p>
            <div className="flex flex-wrap gap-5 mb-4">
              <InfoBadge icon={<Star size={14} className="fill-amber-400 text-amber-400" />} value={`${(avgRating || 0).toFixed(1)} (${reviews.length} rəy)`} />
              <InfoBadge icon={<Users size={14} className="text-white/60" />} value={`${Number(course.students || 0).toLocaleString()} Tələbə`} />
              <InfoBadge icon={<Clock size={14} className="text-white/60" />} value={course.duration || ''} />
            </div>
            <p className="text-white/50 text-sm">👨‍🏫 {educatorName}</p>
          </div>

          {/* Purchase Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl dark:shadow-none dark:border dark:border-slate-800 lg:sticky lg:top-20 transition-colors">
            {course.thumbnail && <img src={course.thumbnail} alt="" className="w-full h-40 sm:h-48 object-cover" />}
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-4xl font-extrabold text-violet-600 dark:text-violet-400">{finalPrice.toFixed(2)} ₼</div>
                {appliedCoupon && (
                  <div className="text-lg font-bold text-gray-400 dark:text-gray-500 line-through">{Number(course.price).toFixed(2)} ₼</div>
                )}
              </div>

              {isUserEnrolled ? (
                <Link to={`/learn/${course.id || course._id}`}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 transition-colors mb-4 cursor-pointer border-0 no-underline">
                  <PlayCircle size={18} /> Kursa davam et
                </Link>
              ) : (
                <>
                  <button onClick={handleBuy} disabled={buyLoading}
                    className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-bold flex items-center justify-center gap-2 transition-colors mb-4 cursor-pointer border-0">
                    <ShoppingCart size={18} /> {buyLoading ? 'Yüklənir...' : (finalPrice === 0 ? 'Pulsuz Qoşul' : 'Kursu Al')}
                  </button>

                  <div className="mb-5 flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Promo kodunuz var?" 
                      value={couponCode} 
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-violet-500 text-gray-900 dark:text-white"
                      disabled={appliedCoupon}
                    />
                    <button 
                      onClick={appliedCoupon ? () => { setAppliedCoupon(null); setCouponCode('') } : handleApplyCoupon}
                      disabled={couponLoading || (!couponCode && !appliedCoupon)}
                      className={`px-4 rounded-lg text-sm font-bold transition-colors cursor-pointer border-0 ${appliedCoupon ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'}`}
                    >
                      {couponLoading ? '...' : (appliedCoupon ? 'Ləğv et' : 'Tətbiq et')}
                    </button>
                  </div>
                  {appliedCoupon && (
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-3 text-center">
                      🎉 {appliedCoupon.discount_percent}% endirim tətbiq edildi!
                    </p>
                  )}
                </>
              )}
              <p className="text-center text-xs text-gray-400 dark:text-gray-500 mb-5">30 günlük pul geri qaytarma zəmanəti</p>
              <div className="border-t border-gray-100 dark:border-slate-800 pt-4 space-y-2">
                {['Ömürlük giriş', 'Sertifikat', 'Canlı dəstək'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <CheckCircle size={14} className="text-emerald-500 shrink-0" /> {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-10">

        {/* CURRICULUM */}
        {videos.length > 0 && (
          <section>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-5">Kurs Proqramı</h2>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden transition-colors">
              {videos.map((video, i) => (
                <div key={i} className={`border-b last:border-b-0 border-gray-100 dark:border-slate-800 ${video.is_free ? 'bg-violet-50/40 dark:bg-violet-900/10' : ''}`}>
                  <button className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer bg-transparent border-0 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                    onClick={() => setOpenVideo(openVideo === i ? null : i)}>
                    <div className="flex items-center gap-3 min-w-0">
                      {video.is_free
                        ? <PlayCircle size={18} className="text-violet-600 dark:text-violet-400 shrink-0" />
                        : <Lock size={18} className="text-gray-300 dark:text-gray-600 shrink-0" />
                      }
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{video.title}</p>
                        {video.is_free && (
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">Pulsuz</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <span className="text-xs text-gray-400">{video.duration}</span>
                      {openVideo === i ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </div>
                  </button>
                  {openVideo === i && video.description && (
                    <div className="px-5 pb-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-slate-800 pt-3 bg-gray-50 dark:bg-slate-800/40">
                      📌 {video.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* REVIEWS */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Rəylər</h2>
            {avgRating > 0 && (
              <div className="flex items-center gap-2">
                <StarRating value={Math.round(avgRating)} readonly />
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{avgRating.toFixed(1)}</span>
                <span className="text-xs text-gray-400">({reviews.length} rəy)</span>
              </div>
            )}
          </div>

          {/* Add review */}
          {isSignedIn ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 mb-5 transition-colors">
              <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-4">Rəyinizi yazın</h3>
              {reviewSent && (
                <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-semibold px-4 py-2 rounded-xl mb-4">✅ Rəyiniz əlavə edildi!</div>
              )}
              <form onSubmit={handleReview} className="flex flex-col gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Qiymətləndirməniz:</p>
                  <StarRating value={newReview.rating} onChange={r => setNewReview(v => ({ ...v, rating: r }))} />
                </div>
                <textarea value={newReview.comment} onChange={e => setNewReview(v => ({ ...v, comment: e.target.value }))}
                  placeholder="Kurs haqqında fikirlərinizi yazın..." rows={3} required
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-violet-500 transition-colors bg-gray-50 dark:bg-slate-800 dark:text-gray-100 resize-none" />
                <button type="submit" disabled={newReview.rating === 0 || reviewLoading}
                  className="self-start flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer border-0">
                  <Send size={14} /> {reviewLoading ? 'Göndərilir...' : 'Rəy Göndər'}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-900/50 rounded-xl px-5 py-4 text-sm text-violet-700 dark:text-violet-400 font-medium mb-5">
              Rəy yazmaq üçün{' '}
              <button onClick={() => navigate('/sign-in')} className="underline font-bold bg-transparent border-0 cursor-pointer text-violet-700 dark:text-violet-400">daxil olun</button>
            </div>
          )}

          {/* Review list */}
          <div className="flex flex-col gap-4">
            {reviews.map((r, i) => (
              <div key={r.id || i} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 transition-colors">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-linear-to-br from-violet-500 to-purple-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {(r.first_name || r.name || 'İ')[0]}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-800 dark:text-gray-200">{r.first_name} {r.last_name || ''}</p>
                      <StarRating value={r.rating} readonly />
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{r.created_at ? new Date(r.created_at).toLocaleDateString('az') : r.date}</span>
                </div>
                {r.comment && <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{r.comment}</p>}
              </div>
            ))}
            {reviews.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-6">Hələ rəy yoxdur. İlk rəyi siz yazın! 🌟</p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function InfoBadge({ icon, value }) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-white/80">{icon} {value}</div>
  )
}

// API bağlı olmadıqda fallback
const demoCourse = {
  id: '1', _id: '1',
  title: 'React.js — Sıfırdan Peşəkar Səviyyəyə',
  description: 'Bu kursda React.js-in bütün əsas konsepsiyalarını öyrənəcəksiniz.',
  price: 24.99, thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
  educator: { name: 'Elnur Məmmədov' }, category: 'Frontend', rating: 4.8, students: 1240,
  videos: [
    { title: 'React-a Giriş', duration: '45 dəq', is_free: true, description: 'React nədir, JSX sintaksisi.' },
    { title: 'Props və State', duration: '38 dəq', is_free: true, description: 'Komponentlər arası məlumat.' },
    { title: 'Hooks — useState, useEffect', duration: '55 dəq', is_free: false, description: 'React Hooks sistemi.' },
  ],
  reviews: [],
}
