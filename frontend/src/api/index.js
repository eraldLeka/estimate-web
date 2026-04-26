import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// Auth
export const login = (data) => api.post('/auth/login', data)

// Products
export const getProducts = () => api.get('/products/')
export const createProduct = (data) => api.post('/products/', data)
export const updateProduct = (id, data) => api.put(`/products/${id}`, data)
export const deleteProduct = (id) => api.delete(`/products/${id}`)
export const uploadProductImage = (id, file) => {
  const form = new FormData()
  form.append('file', file)
  return api.post(`/products/${id}/image`, form)
}

// Preventiva
export const getPreventiva = () => api.get('/preventiva/')
export const getPreventiv = (id) => api.get(`/preventiva/${id}`)
export const createPreventiv = (data) => api.post('/preventiva/', data)
export const deletePreventiv = (id) => api.delete(`/preventiva/${id}`)
export const exportPdf = (id) => api.get(`/preventiva/${id}/pdf`, { responseType: 'blob' })

// Seller
export const getSeller = () => api.get('/seller/')
export const updateSeller = (data) => api.put('/seller/', data)