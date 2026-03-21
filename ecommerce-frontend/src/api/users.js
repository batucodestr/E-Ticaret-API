import api from './axios'

export const adminGetUsers = () =>
  api.get('/api/users/admin/users/')

export const adminGetUser = (pk) =>
  api.get(`/api/users/admin/users/${pk}/`)

export const adminUpdateUser = (pk, data) =>
  api.put(`/api/users/admin/users/${pk}/`, data)
