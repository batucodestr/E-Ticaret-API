import api from './axios'

export const getOrders = () =>
  api.get('/api/orders/')

export const getOrder = (pk) =>
  api.get(`/api/orders/${pk}/`)

export const createOrder = (data) =>
  api.post('/api/orders/create', data)

export const adminGetOrders = (params) =>
  api.get('/api/orders/admin', { params })

export const adminGetOrder = (pk) =>
  api.get(`/api/orders/admin/${pk}/`)

export const adminUpdateOrderStatus = (pk, status) =>
  api.patch(`/api/orders/admin/${pk}/update-status/`, { status })
