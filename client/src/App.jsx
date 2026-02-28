import { Routes, Route, useLocation } from 'react-router-dom'
import { SignIn, SignUp, AuthenticateWithRedirectCallback, useUser } from '@clerk/clerk-react'
import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Home from '../pages/Home'
import Courses from '../pages/Courses'
import About from '../pages/About'
import Contact from '../pages/Contact'
import CourseDetail from '../pages/CourseDetail'
import StudentDashboard from '../pages/StudentDashboard'
import EducatorDashboard from '../pages/EducatorDashboard'
import CreateCourse from '../pages/CreateCourse'
import EditCourse from '../pages/EditCourse'
import SuperAdminPanel from '../pages/SuperAdminPanel'
import Wishlist from '../pages/Wishlist'
import LearnPage from '../pages/LearnPage'
import PaymentSuccess from '../pages/PaymentSuccess'
import MaintenancePage from '../pages/MaintenancePage'
import { Toaster } from 'react-hot-toast'
import { getPublicSettings, trackVisitor } from './api'

function RouteTracker() {
  const location = useLocation()
  
  useEffect(() => {
    const ua = navigator.userAgent
    let browser = "Digər"
    if (ua.includes("Firefox")) browser = "Firefox"
    else if (ua.includes("SamsungBrowser")) browser = "Samsung Internet"
    else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera"
    else if (ua.includes("Edge") || ua.includes("Edg")) browser = "Edge"
    else if (ua.includes("Chrome")) browser = "Chrome"
    else if (ua.includes("Safari")) browser = "Safari"
    
    let device = "Desktop"
    if (/Mobi|Android/i.test(ua)) device = "Mobile"
    if (/Tablet|iPad/i.test(ua)) device = "Tablet"
    
    trackVisitor({
      device,
      browser,
      page_visited: location.pathname
    }).catch(() => {})
  }, [location.pathname])

  return null
}

function App() {
  const location = useLocation()
  const { user } = useUser()
  const [platformSettings, setPlatformSettings] = useState(null)
  const [isSettingsLoading, setIsSettingsLoading] = useState(true)

  useEffect(() => {
    getPublicSettings().then(data => {
      if(data) setPlatformSettings(data)
    }).finally(() => {
      setIsSettingsLoading(false)
    })
  }, [])

  const hideNavbar = location.pathname.startsWith('/learn/') || location.pathname.startsWith('/payment/')

  // Sızmanın qarşısının alınması: Əgər ayarlar hələ yoxlanırsa heç nə göstərmə (Yüklənir)
  if (isSettingsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-medium animate-pulse">Platforma Hazırlanır...</p>
      </div>
    )
  }

  // Maintenance Check
  if (platformSettings?.maintenance_mode) {
    const isAdmin = user?.publicMetadata?.role === 'admin'
    // Give access to login/signup pages or the secret admin panel url
    if (!isAdmin && location.pathname !== '/ms/admin/123' && !location.pathname.startsWith('/sign-in') && !location.pathname.startsWith('/sign-up')) {
      return <MaintenancePage />
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'dark:bg-slate-800 dark:text-white border dark:border-slate-700',
        }}
      />
      <RouteTracker />
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/course/:id" element={<CourseDetail />} />
        <Route path="/learn/:courseId" element={<LearnPage />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/wishlist" element={<Wishlist />} />
        {/* Gizli Yeni Super Admin Paneli */}
        <Route path="/ms/admin/123" element={<SuperAdminPanel />} />

        {/* Gizli Müəllim Paneli — əvvəlki test URL-i, indi hər kəs üçün dashboard */}
        <Route path="/admin/123" element={<EducatorDashboard />} />
        <Route path="/educator/dashboard" element={<EducatorDashboard />} />
        <Route path="/educator/create-course" element={<CreateCourse />} />
        <Route path="/educator/edit/:id" element={<EditCourse />} />
        <Route
          path="/sign-in"
          element={
            <div className="flex justify-center items-center min-h-[80vh] py-10">
              <SignIn routing="path" path="/sign-in" />
            </div>
          }
        />
        <Route
          path="/sign-up"
          element={
            <div className="flex justify-center items-center min-h-[80vh] py-10">
              <SignUp routing="path" path="/sign-up" />
            </div>
          }
        />
        {/* Clerk SSO callback — sosial login yönləndirilməsi üçün */}
        <Route
          path="/sign-in/sso-callback"
          element={<AuthenticateWithRedirectCallback />}
        />
        <Route
          path="/sign-up/sso-callback"
          element={<AuthenticateWithRedirectCallback />}
        />
      </Routes>
    </div>
  )
}

export default App
