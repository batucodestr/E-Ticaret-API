import api from './axios'

export const adminGetCoupons = () =>
  api.get('/api/coupons/admin/')

export const adminCreateCoupon = (data) =>
  api.post('/api/coupons/admin/', data)

export const adminUpdateCoupon = (pk, data) =>
  api.put(`/api/coupons/admin/${pk}`, data)

export const adminDeleteCoupon = (pk) =>
  api.delete(`/api/coupons/admin/${pk}`)
