import { Routes, Route, useLocation } from 'react-router-dom'
import { SignIn, SignUp, AuthenticateWithRedirectCallback } from '@clerk/clerk-react'
import Navbar from '../components/Navbar'
import Home from '../pages/Home'
import Courses from '../pages/Courses'
import About from '../pages/About'
import Contact from '../pages/Contact'
import CourseDetail from '../pages/CourseDetail'
import StudentDashboard from '../pages/StudentDashboard'
import EducatorDashboard from '../pages/EducatorDashboard'
import CreateCourse from '../pages/CreateCourse'
import AdminPanel from '../pages/AdminPanel'
import LearnPage from '../pages/LearnPage'
import PaymentSuccess from '../pages/PaymentSuccess'
import { Toaster } from 'react-hot-toast'

function App() {
  const location = useLocation()
  const hideNavbar = location.pathname.startsWith('/learn/') || location.pathname.startsWith('/payment/')
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'dark:bg-slate-800 dark:text-white border dark:border-slate-700',
        }}
      />
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
        {/* Gizli Müəllim Paneli — yalnız /admin/123 ilə açılır */}
        <Route path="/admin/123" element={<EducatorDashboard />} />
        <Route path="/educator/dashboard" element={<EducatorDashboard />} />
        <Route path="/educator/create-course" element={<CreateCourse />} />
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
