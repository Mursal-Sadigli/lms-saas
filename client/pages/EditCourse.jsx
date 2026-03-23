import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PlusCircle, Trash2, Video, ImagePlus, BookOpen, DollarSign, FileText, Wand2, X } from 'lucide-react'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'
import { editCourse, fetchCourseById } from '../src/api'

const categories = ['Dərs izahları', 'Sınaq izahları', 'Sınaq PDF-ləri', 'Dərs PDF-ləri', 'Digər']

export default function EditCourse() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { getToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showAutoSplit, setShowAutoSplit] = useState(false)
  const [autoSplitForm, setAutoSplitForm] = useState({ url: '', timestamps: '' })

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Frontend',
    thumbnail: '',
  })

  const [videos, setVideos] = useState([{ title: '', videoUrl: '', quiz: null }])
  const [step, setStep] = useState(1)
  const [isFetching, setIsFetching] = useState(true)

  useEffect(() => {
    fetchCourseById(id).then(course => {
      setForm({
        title: course.title || '',
        description: course.description || '',
        price: course.price || '',
        category: course.category || 'Frontend',
        thumbnail: course.thumbnail || ''
      })
      if (course.videos && course.videos.length > 0) {
        setVideos(course.videos.map(v => ({ title: v.title, videoUrl: v.video_url, quiz: v.quiz })))
      }
    }).catch(err => {
      toast.error('Kurs tapılmadı')
      navigate('/educator/dashboard')
    }).finally(() => setIsFetching(false))
  }, [id, navigate])

  const handleFormChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleVideoChange = (i, field, value) => {
    setVideos(vs => vs.map((v, idx) => idx === i ? { ...v, [field]: value } : v))
  }

  const addVideo = () => setVideos(vs => [...vs, { title: '', videoUrl: '', quiz: null }])
  const removeVideo = i => setVideos(vs => vs.filter((_, idx) => idx !== i))

  const handleQuizChange = (i, field, value) => {
    setVideos(vs => vs.map((v, idx) => {
      if (idx !== i) return v
      const currentQuiz = v.quiz || { question: '', options: ['', '', '', ''], correctIndex: 0 }
      if (field === 'options') {
         const newOptions = [...currentQuiz.options]
         newOptions[value.index] = value.text
         return { ...v, quiz: { ...currentQuiz, options: newOptions } }
      }
      return { ...v, quiz: { ...currentQuiz, [field]: value } }
    }))
  }

  const toggleQuiz = (i) => {
    setVideos(vs => vs.map((v, idx) => {
       if (idx !== i) return v
       if (v.quiz) return { ...v, quiz: null }
       return { ...v, quiz: { question: '', options: ['', '', '', ''], correctIndex: 0 } }
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    try {
      setLoading(true)
      const token = await getToken()
      await editCourse(token, id, { ...form, videos, price: Number(form.price) })
      toast.success('Kurs uğurla yeniləndi!', { duration: 5000 })
      navigate('/educator/dashboard')
    } catch (err) {
      console.error(err)
      toast.error("Xəta baş verdi, yenidən sınayın.")
    } finally {
      setLoading(false)
    }
  }

  const parseChapters = () => {
    if (!autoSplitForm.url || !autoSplitForm.timestamps) {
      toast.error("Həm URL, həm də vaxtları daxil edin")
      return
    }
    
    const lines = autoSplitForm.timestamps.split('\n')
    const parsed = []
    const timeRegex = /(?:([0-5]?\d):)?([0-5]?\d):([0-5]\d)/
    
    for (let line of lines) {
      const match = line.match(timeRegex)
      if (match) {
        let seconds = 0
        if (match[1]) {
          seconds = parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseInt(match[3])
        } else {
          seconds = parseInt(match[2]) * 60 + parseInt(match[3])
        }
        
        let title = line.replace(match[0], '').trim()
        title = title.replace(/^[-–—:]\s*/, '').trim()
        
        parsed.push({ time: seconds, title: title || 'Fəsil' })
      }
    }
    
    if (parsed.length === 0) {
      toast.error("Heç bir fəsil tapılmadı. Formatın MM:SS olduğuna əmin olun.")
      return
    }
    
    parsed.sort((a, b) => a.time - b.time)
    
    const newVideos = []
    for (let i = 0; i < parsed.length; i++) {
      const start = parsed[i].time
      try {
        const u = new URL(autoSplitForm.url)
        u.searchParams.set('start', start)
        if (i < parsed.length - 1) u.searchParams.set('end', parsed[i + 1].time)
        newVideos.push({ title: parsed[i].title, videoUrl: u.toString() })
      } catch (e) {
        const sep = autoSplitForm.url.includes('?') ? '&' : '?'
        let endStr = i < parsed.length - 1 ? `&end=${parsed[i + 1].time}` : ''
        newVideos.push({ title: parsed[i].title, videoUrl: `${autoSplitForm.url}${sep}start=${start}${endStr}` })
      }
    }
    
    setVideos(newVideos)
    setShowAutoSplit(false)
    setAutoSplitForm({ url: '', timestamps: '' })
    toast.success(`${newVideos.length} mərhələ uğurla dərslərə çevrildi!`)
  }

  const inputCls = "w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-violet-500 transition-colors font-[inherit] bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"

  if (isFetching) return <div className="p-10 text-center">Yüklənir...</div>

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 transition-colors">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Kursu Redaktə Et 📝</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-10">Kurs məlumatlarını və videoları yeniləyin.</p>

      {/* Stepper */}
      <div className="flex gap-3 mb-10">
        {[
          { num: 1, label: 'Ümumi Məlumat' },
          { num: 2, label: 'Videolar' },
        ].map(s => (
          <button
            key={s.num}
            type="button"
            onClick={() => setStep(s.num)}
            className={`flex items-center gap-3 flex-1 px-4 py-3 rounded-xl border-2 transition-all cursor-pointer
              ${step === s.num
                ? 'border-violet-600 bg-violet-50 dark:bg-violet-900/20'
                : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0
              ${step >= s.num ? 'bg-violet-600 text-white' : 'bg-gray-200 dark:bg-slate-800 text-gray-400 dark:text-gray-500'}`}>
              {s.num}
            </div>
            <span className={`text-sm font-semibold ${step === s.num ? 'text-violet-600 dark:text-violet-400' : 'text-gray-400 dark:text-gray-500'}`}>
              {s.label}
            </span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-8 transition-colors">

            <Field label="Kurs Başlığı" icon={<BookOpen size={15} />}>
              <input
                name="title"
                value={form.title}
                onChange={handleFormChange}
                placeholder="məs. React.js — Sıfırdan Peşəkara"
                required
                className={inputCls}
              />
            </Field>

            <Field label="Açıqlama" icon={<FileText size={15} />}>
              <textarea
                name="description"
                value={form.description}
                onChange={handleFormChange}
                placeholder="Kurs haqqında ətraflı məlumat..."
                required
                rows={4}
                className={`${inputCls} resize-y`}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Qiymət ($)" icon={<DollarSign size={15} />}>
                <input
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleFormChange}
                  placeholder="49.99"
                  min="0"
                  step="0.01"
                  required
                  className={inputCls}
                />
              </Field>

              <Field label="Kateqoriya">
                <select
                  name="category"
                  value={form.category}
                  onChange={handleFormChange}
                  className={inputCls}
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Thumbnail URL" icon={<ImagePlus size={15} />}>
              <input
                name="thumbnail"
                value={form.thumbnail}
                onChange={handleFormChange}
                placeholder="https://images.unsplash.com/..."
                className={inputCls}
              />
              {form.thumbnail && (
                <img
                  src={form.thumbnail}
                  alt="preview"
                  className="w-full h-44 object-cover rounded-xl mt-3"
                />
              )}
            </Field>

            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="bg-linear-to-r from-violet-600 to-purple-500 text-white px-7 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer border-0"
              >
                Sonrakı: Videolar →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-8 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                <Video size={18} className="text-violet-600 dark:text-violet-400" /> Kurs Videoları
              </h3>
              {!showAutoSplit && (
                <button
                  type="button"
                  onClick={() => setShowAutoSplit(true)}
                  className="flex items-center gap-1.5 text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1.5 rounded border-0 cursor-pointer hover:bg-amber-200 transition-colors"
                >
                  <Wand2 size={14} /> Fəsillərdən (YouTube) Ayır
                </button>
              )}
            </div>

            {showAutoSplit && (
              <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-5 mb-6 border border-amber-200 dark:border-amber-700/50 relative">
                <button
                  type="button"
                  onClick={() => setShowAutoSplit(false)}
                  className="absolute top-3 right-3 text-amber-500 hover:text-amber-700 bg-transparent border-0 cursor-pointer p-1"
                >
                  <X size={16} />
                </button>
                <h4 className="text-sm font-bold text-amber-900 dark:text-amber-500 mb-3 flex items-center gap-2">
                  <Wand2 size={16} className="text-amber-600 dark:text-amber-400" /> YouTube Avtomatlaşdırıcı
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-600 mb-4 max-w-lg">
                  Böyük bir videonun fəsillərini (timestamps) kopyalayaraq bura yapışdırın. Sistem onu dərhal alt dərslərə çevirəcək.
                </p>
                <div className="space-y-3">
                  <input
                    value={autoSplitForm.url}
                    onChange={e => setAutoSplitForm(f => ({ ...f, url: e.target.value }))}
                    placeholder="Əsas YouTube URL-i (məs. https://youtu.be/f8Z9Jy...)"
                    className="w-full px-3 py-2 text-sm border border-amber-300 dark:border-amber-700/50 rounded focus:outline-none focus:border-amber-500 bg-white dark:bg-slate-900 dark:text-gray-100 placeholder-amber-900/30 dark:placeholder-amber-700/50"
                  />
                  <textarea
                    value={autoSplitForm.timestamps}
                    onChange={e => setAutoSplitForm(f => ({ ...f, timestamps: e.target.value }))}
                    placeholder="00:00 Giriş&#10;05:30 Quraşdırma&#10;12:00 Əsas Konsepsiyalar"
                    rows={4}
                    className="w-full px-3 py-2 text-sm border border-amber-300 dark:border-amber-700/50 rounded focus:outline-none focus:border-amber-500 bg-white dark:bg-slate-900 dark:text-gray-100 placeholder-amber-900/30 dark:placeholder-amber-700/50 resize-y"
                  />
                  <button
                    type="button"
                    onClick={parseChapters}
                    className="bg-amber-500 text-white font-bold text-xs px-4 py-2 rounded border-0 cursor-pointer hover:bg-amber-600 transition-colors w-full"
                  >
                    Parçala və Dərsləri Yarat
                  </button>
                </div>
              </div>
            )}

            {videos.map((video, i) => (
              <div key={i} className="bg-gray-50 dark:bg-slate-800/40 rounded-xl p-5 mb-4 border border-gray-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-violet-600 dark:text-violet-400">Dərs {i + 1}</span>
                  {videos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVideo(i)}
                      className="text-red-400 hover:text-red-600 transition-colors bg-transparent border-0 cursor-pointer p-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <input
                  value={video.title}
                  onChange={e => handleVideoChange(i, 'title', e.target.value)}
                  placeholder="Video başlığı"
                  required
                  className={`${inputCls} mb-3`}
                />
                <input
                  value={video.videoUrl}
                  onChange={e => handleVideoChange(i, 'videoUrl', e.target.value)}
                  placeholder="Video URL (YouTube, Vimeo, və s.)"
                  required
                  className={inputCls}
                />

                {/* YENİ: QUIZ BÖLMƏSİ */}
                <div className="mt-4 border-t border-gray-200 dark:border-slate-700 pt-4">
                  <button
                    type="button"
                    onClick={() => toggleQuiz(i)}
                    className={`text-xs font-bold px-4 py-2 rounded-lg cursor-pointer border-0 transition-colors ${video.quiz ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400' : 'bg-violet-100 text-violet-700 hover:bg-violet-200 dark:bg-violet-900/20 dark:hover:bg-violet-900/40 dark:text-violet-400'}`}
                  >
                    {video.quiz ? '- Testi Sil' : '+ Videdan Sonra Test (Quiz) Quraşdır'}
                  </button>

                  {video.quiz && (
                    <div className="mt-4 p-5 border border-violet-200 dark:border-violet-900/50 bg-violet-50/50 dark:bg-violet-900/10 rounded-xl">
                      <input
                        placeholder="Sualı buraya yazın..."
                        className="w-full p-3 text-sm border-2 border-violet-200 dark:border-violet-800 rounded-lg mb-4 outline-none focus:border-violet-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                        value={video.quiz.question}
                        onChange={e => handleQuizChange(i, 'question', e.target.value)}
                        required
                      />
                      <div className="space-y-3">
                        {video.quiz.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex gap-3 items-center">
                            <input
                              type="radio"
                              name={`quiz-${i}-correct`}
                              checked={video.quiz.correctIndex === oIdx}
                              onChange={() => handleQuizChange(i, 'correctIndex', oIdx)}
                              className="w-5 h-5 cursor-pointer accent-violet-600"
                              title="Bu variantı doğru cavab kimi seçin"
                            />
                            <input
                              placeholder={`Cavab variantı ${oIdx + 1}`}
                              value={opt}
                              onChange={e => handleQuizChange(i, 'options', { index: oIdx, text: e.target.value })}
                              required
                              className="flex-1 p-2.5 text-sm border-2 border-gray-200 dark:border-slate-700 rounded-lg outline-none focus:border-violet-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                        Tələbə yalnız doğru (dairəsi seçilmiş) cavabı tapdığı təqdirdə növbəti videoya keçə biləcək.
                      </p>
                    </div>
                  )}
                </div>

              </div>
            ))}

            <button
              type="button"
              onClick={addVideo}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-violet-400 dark:border-violet-700 text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/10 hover:bg-violet-100 dark:hover:bg-violet-900/30 rounded-xl py-3 font-semibold text-sm mb-6 cursor-pointer transition-colors"
            >
              <PlusCircle size={16} /> Video əlavə et
            </button>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="border-2 border-violet-600 text-violet-600 bg-transparent px-6 py-3 rounded-xl font-semibold text-sm hover:bg-violet-50 transition-colors cursor-pointer"
              >
                ← Geri
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-linear-to-r from-violet-600 to-purple-500 text-white px-7 py-3 rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer border-0"
              >
                {loading ? 'Gözləyin...' : '🚀 Kursu Yenilə'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}

function Field({ label, icon, children }) {
  return (
    <div className="mb-5">
      <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        {icon && <span className="text-violet-600 dark:text-violet-400">{icon}</span>}
        {label}
      </label>
      {children}
    </div>
  )
}
