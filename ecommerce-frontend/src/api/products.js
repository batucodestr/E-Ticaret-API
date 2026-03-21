import api from './axios'

export const getProducts = (params) =>
  api.get('/api/products/', { params })

export const getProduct = (slug) =>
  api.get(`/api/products/${slug}/`)

export const adminGetProducts = (params) =>
  api.get('/api/products/admin/', { params })

export const adminGetProduct = (pk) =>
  api.get(`/api/products/admin/${pk}/`)

export const adminCreateProduct = (data) =>
  api.post('/api/products/admin/create/', data)

export const adminUpdateProduct = (pk, data) =>
  api.put(`/api/products/admin/${pk}/edit/`, data)

export const adminDeleteProduct = (pk) =>
  api.delete(`/api/products/admin/${pk}/delete/`)

export const adminGetProductImages = (pk) =>
  api.get(`/api/products/admin/${pk}/images/`)

export const adminUploadProductImage = (pk, formData) =>
  api.post(`/api/products/admin/${pk}/images/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const adminDeleteProductImage = (imagePk) =>
  api.delete(`/api/products/admin/product-images/${imagePk}`)
