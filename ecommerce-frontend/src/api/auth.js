import api from './axios'

export const login = (email, password) =>
  api.post('/api/users/login', { email, password })

export const signup = (data) =>
  api.post('/api/users/signup', data)

export const refreshToken = (refresh) =>
  api.post('/api/users/token/refresh', { refresh })
