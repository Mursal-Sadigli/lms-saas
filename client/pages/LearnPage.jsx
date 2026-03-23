import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import {
  CheckCircle, Lock, Play, ChevronLeft, Award,
  Clock, BookOpen, ChevronRight, Loader, CheckCircle2
} from 'lucide-react'
import { authApi } from '../src/api'
import toast from 'react-hot-toast'

export default function LearnPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { getToken, isSignedIn } = useAuth()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeVideo, setActiveVideo] = useState(null)
  const [completing, setCompleting] = useState(false)
  const [justCompleted, setJustCompleted] = useState(false)
  const [certificateId, setCertificateId] = useState(null)
  
  // Quiz states
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizAnswer, setQuizAnswer] = useState(null)

  useEffect(() => {
    if (!isSignedIn) { navigate('/sign-in'); return }
    loadLearnData()
  }, [courseId, isSignedIn])

  const loadLearnData = async () => {
    try {
      setLoading(true)
      const token = await getToken()
      const res = await authApi(token).get(`/learn/${courseId}`)
      const d = res.data
      setData(d)
      // İlk kilidsiz tamamlanmamış videonu aç
      const firstUnlocked = d.videos.find(v => v.unlocked && !v.completed) || d.videos.find(v => v.unlocked)
      setActiveVideo(firstUnlocked || d.videos[0])
      if (d.certificateId) setCertificateId(d.certificateId)
    } catch (err) {
      if (err.response?.status === 403) {
        navigate(`/course/${courseId}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteClick = () => {
    if (activeVideo?.quiz && !activeVideo.completed) {
      setShowQuiz(true);
      setQuizAnswer(null);
    } else {
      handleComplete();
    }
  }

  const submitQuiz = () => {
    if (quizAnswer === null) return toast.error("Lütfən bir cavab seçin", { style: { background: '#333', color: '#fff' } })
    if (quizAnswer === activeVideo.quiz.correctIndex) {
      toast.success("Doğru cavab! Halaldır 🎉", { style: { background: '#333', color: '#fff' }, duration: 4000 })
      setShowQuiz(false)
      handleComplete()
    } else {
      toast.error("Yanlış cavab 🤔 Videoya yenidən baxmağınız tövsiyə olunur.", { style: { background: '#333', color: '#fff' } })
      setQuizAnswer(null) // reset to let them try again
    }
  }

  const handleComplete = async () => {
    if (!activeVideo || completing) return
    try {
      setCompleting(true)
      const token = await getToken()
      const res = await authApi(token).post(`/learn/${activeVideo.id}/complete`)
      const { progress, nextVideoId, newCertId } = res.data

      if (newCertId) setCertificateId(newCertId)

      // Local state yenilə
      setData(prev => {
        const updatedVideos = prev.videos.map((v, i, arr) => {
          if (v.id === activeVideo.id) return { ...v, completed: true }
          // Növbəti videonu kiliddən çıxar
          if (arr[i - 1]?.id === activeVideo.id) return { ...v, unlocked: true }
          return v
        })
        return { ...prev, videos: updatedVideos, progress }
      })

      setJustCompleted(true)
      setTimeout(() => setJustCompleted(false), 3000)

      // Növbəti videoya keç
      if (nextVideoId) {
        setData(prev => {
          const next = prev.videos.find(v => v.id === nextVideoId)
          if (next) setActiveVideo({ ...next, unlocked: true })
          return prev
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setCompleting(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Yüklənir...</p>
      </div>
    </div>
  )

  if (!data) return null

  const { course, videos, progress } = data
  const completedCount = videos.filter(v => v.completed).length

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">

      {/* Top Bar */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between gap-4 sticky top-0 z-50">
        <div className="flex items-center gap-3 min-w-0">
          <Link to={`/course/${courseId}`}
            className="text-gray-400 hover:text-white transition-colors shrink-0">
            <ChevronLeft size={20} />
          </Link>
          <div className="min-w-0">
            <h1 className="text-white font-bold text-sm truncate">{course?.title}</h1>
            <p className="text-gray-500 text-xs">{completedCount}/{videos.length} tamamlandı</p>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-32 sm:w-48 bg-gray-800 rounded-full h-1.5">
            <div className="bg-violet-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs text-gray-400 font-bold">{progress}%</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* === Video Player (sol/üst) === */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Player Container */}
          <div className="relative bg-black w-full" style={{ paddingTop: '56.25%' }}>
            {activeVideo ? (
              activeVideo.video_file_url ? (
                <video
                  key={activeVideo.video_file_url}
                  src={activeVideo.video_file_url}
                  controls
                  autoPlay
                  className="absolute inset-0 w-full h-full object-contain bg-black"
                  controlsList="nodownload"
                  onContextMenu={e => e.preventDefault()}
                />
              ) : (
                <iframe
                  key={activeVideo.id}
                  src={(() => {
                    try {
                      const u = activeVideo.video_url;
                      if (!u) return '';
                      let vid = '';
                      const parsed = new URL(u);
                      if (u.includes('youtu.be/')) vid = parsed.pathname.slice(1);
                      else if (u.includes('youtube.com/watch')) vid = parsed.searchParams.get('v');
                      else if (u.includes('youtube.com/embed/')) vid = parsed.pathname.split('embed/')[1];
                      else return u;

                      let params = '?autoplay=1&rel=0&modestbranding=1&enablejsapi=1';
                      if (parsed.searchParams.has('start')) params += `&start=${parsed.searchParams.get('start')}`;
                      if (parsed.searchParams.has('end')) params += `&end=${parsed.searchParams.get('end')}`;
                      return `https://www.youtube.com/embed/${vid}${params}`;
                    } catch (e) {
                      return activeVideo.video_url; // fallback
                    }
                  })()}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={activeVideo.title}
                />
              )
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                <Play size={48} />
              </div>
            )}
          </div>

          {/* Video Info */}
          {activeVideo && (
            <div className="bg-gray-900 px-5 py-5 flex flex-col sm:flex-row gap-4 justify-between border-b border-gray-800">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-violet-400 font-semibold">
                    Bölmə {activeVideo.position}
                  </span>
                  {activeVideo.completed && (
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                      <CheckCircle size={11} /> Tamamlandı
                    </span>
                  )}
                </div>
                <h2 className="text-white font-bold text-base sm:text-lg leading-tight mb-2">
                  {activeVideo.title}
                </h2>
                {activeVideo.description && (
                  <p className="text-gray-400 text-sm leading-relaxed">{activeVideo.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  {activeVideo.pdf_url && (
                    <a 
                      href={activeVideo.pdf_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 px-4 py-2 rounded-lg text-xs font-bold transition-all no-underline border border-amber-500/30"
                    >
                      <FileText size={14} /> Dərs Materialı (PDF)
                    </a>
                  )}
                  {course.pdf_url && (
                    <a 
                      href={course.pdf_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg text-xs font-bold transition-all no-underline border border-blue-500/30"
                    >
                      <FileText size={14} /> Kursun Ümumi Materialı
                    </a>
                  )}
                </div>
              </div>

              {/* Complete Button */}
              <div className="shrink-0 self-start sm:self-center">
                {activeVideo.completed ? (
                  justCompleted ? (
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <CheckCircle size={18} /> Tamamlandı! 🎉
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-emerald-500 font-semibold text-sm">
                      <CheckCircle size={18} /> Artıq tamamlandı
                    </div>
                  )
                ) : (
                  <button onClick={handleCompleteClick} disabled={completing}
                    className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer border-0 whitespace-nowrap">
                    {completing ? <Loader size={15} className="animate-spin" /> : (activeVideo?.quiz ? <CheckCircle2 size={15} /> : <CheckCircle size={15} />)}
                    {completing ? 'Qeyd edilir...' : (activeVideo?.quiz ? 'Testə Keç ✓' : 'Tamamlandı ✓')}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Certificate Banner */}
          {progress === 100 && (
            <div className="bg-linear-to-r from-amber-900/50 to-yellow-900/50 border border-amber-700 mx-4 my-4 rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-center gap-4 justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center shrink-0">
                  <Award size={24} className="text-amber-400" />
                </div>
                <div>
                  <h3 className="text-amber-300 font-extrabold text-base">Təbriklər, Kursu Tamamladınız! 🎉</h3>
                  <p className="text-amber-500/80 text-xs mt-0.5">Sertifikatınız avtomatik olaraq profilinizə əlavə edildi.</p>
                </div>
              </div>
              
              {certificateId ? (
                <Link to={`/certificate/${certificateId}`} target="_blank" className="shrink-0 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors border-0 no-underline whitespace-nowrap">
                  Sertifikata Bax 🎓
                </Link>
              ) : (
                <button disabled className="shrink-0 bg-amber-800/50 text-amber-500/50 font-bold px-5 py-2.5 rounded-xl text-sm border-0 whitespace-nowrap">
                  Hazırlanır...
                </button>
              )}
            </div>
          )}
        </div>

        {/* === Sidebar — Video siyahısı === */}
        <div className="w-80 xl:w-96 bg-gray-900 border-l border-gray-800 flex-col hidden lg:flex overflow-hidden">
          <div className="px-4 py-4 border-b border-gray-800 flex items-center gap-2">
            <BookOpen size={16} className="text-violet-400" />
            <span className="text-white font-bold text-sm">Kurs Məzmunu</span>
            <span className="ml-auto text-xs text-gray-500">{completedCount}/{videos.length}</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {videos.map((video, i) => {
              const isActive = activeVideo?.id === video.id
              const isLocked = !video.unlocked

              return (
                <button key={video.id}
                  onClick={() => !isLocked && setActiveVideo(video)}
                  disabled={isLocked}
                  className={`w-full text-left px-4 py-3.5 border-b border-gray-800/50 flex items-start gap-3 transition-all cursor-pointer border-0
                    ${isActive ? 'bg-violet-900/40 border-l-2 border-l-violet-500' : ''}
                    ${isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800/50'}
                  `}>

                  {/* İkon */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5
                    ${video.completed ? 'bg-emerald-500' : isActive ? 'bg-violet-600' : isLocked ? 'bg-gray-700' : 'bg-gray-700'}`}>
                    {video.completed
                      ? <CheckCircle size={14} className="text-white" />
                      : isLocked
                        ? <Lock size={12} className="text-gray-500" />
                        : isActive
                          ? <Play size={12} className="text-white fill-white" />
                          : <span className="text-gray-400 text-xs font-bold">{i + 1}</span>
                    }
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-semibold leading-tight line-clamp-2
                      ${isActive ? 'text-violet-300' : video.completed ? 'text-emerald-400' : isLocked ? 'text-gray-600' : 'text-gray-300'}`}>
                      {video.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-600">{video.duration}</span>
                      {video.is_free && !video.completed && (
                        <span className="text-xs text-emerald-500 font-semibold">Pulsuz</span>
                      )}
                    </div>
                  </div>

                  {isActive && !isLocked && (
                    <ChevronRight size={14} className="text-violet-400 shrink-0 mt-1" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Mobile: video siyahısı altda */}
      <div className="lg:hidden bg-gray-900 border-t border-gray-800 flex-1 overflow-y-auto">
        <div className="px-4 py-4 border-b border-gray-800 text-white font-bold text-sm flex items-center gap-2">
          <BookOpen size={15} className="text-violet-400" /> Kurs Məzmunu
          <span className="ml-auto text-xs text-gray-500">{completedCount}/{videos.length}</span>
        </div>
        
        <div className="flex flex-col">
          {videos.map((video, i) => {
            const isActive = activeVideo?.id === video.id
            const isLocked = !video.unlocked

            return (
              <button key={video.id}
                onClick={() => !isLocked && setActiveVideo(video)}
                disabled={isLocked}
                className={`w-full text-left px-4 py-3.5 border-b border-gray-800/50 flex items-start gap-3 transition-all cursor-pointer border-0
                  ${isActive ? 'bg-violet-900/40 border-l-2 border-l-violet-500' : ''}
                  ${isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800/50'}
                `}>

                {/* İkon */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5
                  ${video.completed ? 'bg-emerald-500' : isActive ? 'bg-violet-600' : isLocked ? 'bg-gray-700' : 'bg-gray-700'}`}>
                  {video.completed
                    ? <CheckCircle size={14} className="text-white" />
                    : isLocked
                      ? <Lock size={12} className="text-gray-500" />
                      : isActive
                        ? <Play size={12} className="text-white fill-white" />
                        : <span className="text-gray-400 text-xs font-bold">{i + 1}</span>
                  }
                </div>

                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-semibold leading-tight line-clamp-2
                    ${isActive ? 'text-violet-300' : video.completed ? 'text-emerald-400' : isLocked ? 'text-gray-600' : 'text-gray-300'}`}>
                    {video.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-600">{video.duration}</span>
                    {video.is_free && !video.completed && (
                      <span className="text-xs text-emerald-500 font-semibold">Pulsuz</span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Quiz Modal */}
      {showQuiz && activeVideo?.quiz && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Mövzu Testi 📝</h3>
            <p className="text-gray-400 text-sm mb-6">Növbəti videoya keçmək üçün doğru cavabı tapmalısınız.</p>
            <div className="bg-gray-800/50 rounded-2xl p-4 sm:p-5 mb-6 border border-gray-700/50">
               <p className="text-gray-200 text-lg font-medium">{activeVideo.quiz.question}</p>
            </div>
            <div className="space-y-3 mb-8">
              {activeVideo.quiz.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setQuizAnswer(i)}
                  className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-colors cursor-pointer border-solid ${quizAnswer === i ? 'border-violet-500 bg-violet-500/10 text-violet-300' : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600 hover:bg-gray-800'}`}
                >
                  <span className="font-bold mr-3 opacity-60">{String.fromCharCode(65 + i)}.</span> {opt}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowQuiz(false)} className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white bg-transparent hover:bg-gray-800 border-0 cursor-pointer transition-colors">
                Ləğv et
              </button>
              <button type="button" onClick={submitQuiz} className="px-6 py-3 rounded-xl font-bold bg-violet-600 hover:bg-violet-700 text-white cursor-pointer border-0 transition-colors">
                Təsdiqlə
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
