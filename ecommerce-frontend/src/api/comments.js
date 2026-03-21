import api from './axios'

export const getProductComments = (productId) =>
  api.get(`/api/comments/product/${productId}`)

export const createComment = (productId, data) =>
  api.post(`/api/comments/${productId}/create`, data)

export const updateComment = (pk, data) =>
  api.put(`/api/comments/${pk}`, data)

export const deleteComment = (pk) =>
  api.delete(`/api/comments/${pk}`)

export const adminGetComments = (params) =>
  api.get('/api/comments/admin', { params })

export const adminUpdateComment = (pk, data) =>
  api.patch(`/api/comments/admin/${pk}`, data)

export const adminDeleteComment = (pk) =>
  api.delete(`/api/comments/admin/${pk}`)
