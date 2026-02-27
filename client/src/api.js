import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Token-siz istəklər üçün (açıq endpoint-lər)
export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Token tələb edən istəklər üçün — token-i manual ötür
export const authApi = (token) =>
  axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

// ── Course API ──────────────────────────────
export const fetchCourses = (params = {}) =>
  api.get('/courses', { params }).then((r) => r.data.courses)

export const fetchCourseById = (id) =>
  api.get(`/courses/${id}`).then((r) => r.data.course)

export const createCourse = (token, data) =>
  authApi(token).post('/courses', data).then((r) => r.data.course)

export const publishCourse = (token, id) =>
  authApi(token).put(`/courses/${id}/publish`).then((r) => r.data.course)

// ── Payment API ─────────────────────────────
export const createCheckoutSession = (token, data) =>
  authApi(token).post('/payments/checkout', data).then((r) => r.data)

// ── Enrollment API ──────────────────────────
export const checkEnrollment = (token, courseId) =>
  authApi(token).get(`/enrollments/check/${courseId}`).then((r) => r.data.enrolled)

export const fetchMyEnrollments = (token) =>
  authApi(token).get('/enrollments/my').then((r) => r.data.enrollments)

export const enrollInCourse = (token, data) =>
  authApi(token).post('/enrollments', data).then((r) => r.data.enrollment)

// ── Review API ──────────────────────────────
export const fetchReviews = (courseId) =>
  api.get(`/reviews/${courseId}`).then((r) => r.data.reviews)

export const addReview = (token, data) =>
  authApi(token).post('/reviews', data).then((r) => r.data.review)

export const deleteReview = (token, id) =>
  authApi(token).delete(`/reviews/${id}`).then((r) => r.data)

// ── User API ────────────────────────────────
export const fetchProfile = (token) =>
  authApi(token).get('/users/me').then((r) => r.data.user)

export const updateRole = (token, role) =>
  authApi(token).put('/users/role', { role }).then((r) => r.data.user)

export const fetchEducatorCourses = (token) =>
  authApi(token).get('/courses/educator').then((r) => r.data.courses)

// ── Educator Analytics & Coupons ──────────────────
export const fetchEducatorAnalytics = (token) =>
  authApi(token).get('/educator/analytics').then((r) => r.data.sales)

export const fetchEducatorCoupons = (token) =>
  authApi(token).get('/coupons/educator').then((r) => r.data.coupons)

export const createCoupon = (token, data) =>
  authApi(token).post('/coupons', data).then((r) => r.data.coupon)

export const deleteCoupon = (token, id) =>
  authApi(token).delete(`/coupons/${id}`).then((r) => r.data)

export const validateCoupon = (token, data) =>
  authApi(token).post('/coupons/validate', data).then((r) => r.data.coupon)
