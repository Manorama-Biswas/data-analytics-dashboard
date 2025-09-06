import axios from 'axios'
const API = axios.create({ baseURL: 'http://localhost:5000' })
export async function getKPIs() {
  const r = await API.get('/api/kpis')
  return r.data
}
export async function getRevenueByMonth() {
  const r = await API.get('/api/revenue_by_month')
  return r.data
}
export async function getRevenueByRegion() {
  const r = await API.get('/api/revenue_by_region')
  return r.data
}
export async function getTopProducts() {
  const r = await API.get('/api/top_products')
  return r.data
}
export async function getTableData() {
  const r = await API.get('/api/data')
  return r.data
}
export async function uploadCSV(file) {
  const fd = new FormData()
  fd.append('file', file)
  const r = await API.post('/api/upload', fd)
  return r.data
}