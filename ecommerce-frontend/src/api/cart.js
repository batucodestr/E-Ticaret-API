import api from './axios'

export const getCart = () =>
  api.get('/api/cards/')

export const addToCart = (product_id, quantity = 1) =>
  api.post('/api/cards/add', { product_id, quantity })

export const updateCartItem = (pk, quantity) =>
  api.put(`/api/cards/update/${pk}`, { quantity })

export const removeCartItem = (pk) =>
  api.delete(`/api/cards/delete/${pk}`)

export const clearCart = () =>
  api.delete('/api/cards/clear')
