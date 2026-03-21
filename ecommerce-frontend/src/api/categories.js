import api from './axios'

export const getCategories = () =>
  api.get('/api/categories/')

export const getCategory = (pk) =>
  api.get(`/api/categories/${pk}/`)

export const adminGetCategories = () =>
  api.get('/api/categories/admin/')

export const adminCreateCategory = (data) =>
  api.post('/api/categories/admin/', data)

export const adminUpdateCategory = (pk, data) =>
  api.put(`/api/categories/admin/${pk}/`, data)

export const adminDeleteCategory = (pk) =>
  api.delete(`/api/categories/admin/${pk}/`)
