import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Star, Clock, Users, ChevronRight, Heart } from 'lucide-react'
import { useAuth } from '@clerk/clerk-react'
import { toggleWishlist } from '../src/api'
import toast from 'react-hot-toast'

export default function CourseCard({ course }) {
  // API (snake_case) və mock data (camelCase) hər ikisini dəstəkləyir
  const id = course.id || course._id
  const title = course.title
  const description = course.description
  const price = course.price
  const thumbnail = course.thumbnail
  const category = course.category
  const rating = course.rating
  const duration = course.duration
  const students = course.students
  // API educator_name, mock educator.name qaytarır
  const educatorName = course.educator_name || course.educator?.name || ''

  const { getToken, isSignedIn } = useAuth()
  const navigate = useNavigate()
  const [isWishlisted, setIsWishlisted] = useState(course.isWishlisted || false)
  const [loading, setLoading] = useState(false)

  const handleHeartClick = async (e) => {
    e.preventDefault() // Link keçidinin qarşısını al
    if (!isSignedIn) {
      toast.error('Seçilmişlərə əlavə etmək üçün daxil olun')
      navigate('/sign-in')
      return
    }
    try {
      setLoading(true)
      const token = await getToken()
      const res = await toggleWishlist(token, id)
      setIsWishlisted(res.isWishlisted)
      if (res.isWishlisted) toast.success('Seçilmişlərə əlavə edildi 💖', { style: { background: '#333', color: '#fff' } })
    } catch(err) {
      toast.error('Xəta baş verdi', { style: { background: '#333', color: '#fff' } })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Link to={`/course/${id}`} className="no-underline group">
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-800 transition-all duration-300 cursor-pointer group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-violet-100/50 dark:group-hover:shadow-violet-900/20 group-hover:border-violet-400 dark:group-hover:border-violet-500">

        {/* Thumbnail */}
        <div className="relative h-44 overflow-hidden">
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <span className="absolute top-3 left-3 bg-violet-600 dark:bg-violet-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm z-10">
            {category}
          </span>
          <button 
            onClick={handleHeartClick}
            disabled={loading}
            className="absolute top-3 right-3 z-10 w-9 h-9 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-sm cursor-pointer border-0"
          >
            <Heart 
              size={18} 
              className={`transition-colors duration-300 ${isWishlisted ? 'text-red-500 fill-red-500' : 'text-gray-500 dark:text-gray-300'}`} 
            />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2 leading-snug line-clamp-2">
            {title}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed line-clamp-2">
            {description}
          </p>

          {/* Educator */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-full bg-linear-to-br from-violet-500 to-purple-400 flex items-center justify-center text-white text-xs font-bold">
              {educatorName?.[0] || '?'}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{educatorName}</span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mb-4">
            {rating && <StatBadge icon={<Star size={13} className="text-amber-400 fill-amber-400" />} value={Number(rating).toFixed(1)} />}
            {students && <StatBadge icon={<Users size={13} className="text-gray-400" />} value={Number(students).toLocaleString()} />}
            {duration && <StatBadge icon={<Clock size={13} className="text-gray-400" />} value={duration} />}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-slate-800">
            <span className="text-xl font-extrabold text-violet-600 dark:text-violet-400">{Number(price).toFixed(2)} ₼</span>
            <div className="flex items-center gap-1 text-violet-600 text-sm font-semibold">
              Detal <ChevronRight size={14} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

function StatBadge({ icon, value }) {
  return (
    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs">
      {icon} <span>{value}</span>
    </div>
  )
}
