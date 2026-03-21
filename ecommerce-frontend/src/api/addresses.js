import api from './axios'

export const getCities = () =>
  api.get('/api/addresses/cities')

export const getAddresses = () =>
  api.get('/api/addresses/')

export const createAddress = (data) =>
  api.post('/api/addresses/', data)

export const updateAddress = (id, data) =>
  api.put(`/api/addresses/${id}`, data)

export const deleteAddress = (id) =>
  api.delete(`/api/addresses/${id}`)

export const adminGetAddresses = () =>
  api.get('/api/addresses/admin')
