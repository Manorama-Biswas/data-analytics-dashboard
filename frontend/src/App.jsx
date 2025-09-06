import React, { useEffect, useState } from 'react'
import Plot from 'react-plotly.js'
import { getKPIs, getRevenueByMonth, getRevenueByRegion, getTopProducts, getTableData, uploadCSV } from './api'

export default function App() {
  const [kpis, setKpis] = useState(null)
  const [monthData, setMonthData] = useState([])
  const [regionData, setRegionData] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [tableData, setTableData] = useState([])

  useEffect(() => {
    refreshAll()
  }, [])

  async function refreshAll() {
    try {
      const k = await getKPIs()
      setKpis(k)
      const m = await getRevenueByMonth()
      setMonthData(m || [])
      const r = await getRevenueByRegion()
      setRegionData(r || [])
      const t = await getTopProducts()
      setTopProducts(t || [])
      const d = await getTableData()
      setTableData(d || [])
    } catch (e) {
      console.error(e)
    }
  }

  async function handleUpload(e) {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    await uploadCSV(f)
    await refreshAll()
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Business Insights Dashboard</h1>
        <input type="file" accept=".csv" onChange={handleUpload} />
      </div>

      <div className="grid kpis" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="text-sm">Total Revenue</div>
          <div className="text-xl" style={{ fontWeight: 700 }}>{kpis ? `₹${Number(kpis.total_revenue).toLocaleString()}` : '...'}</div>
        </div>
        <div className="card">
          <div className="text-sm">Total Orders</div>
          <div className="text-xl" style={{ fontWeight: 700 }}>{kpis ? kpis.total_orders : '...'}</div>
        </div>
        <div className="card">
          <div className="text-sm">Total Units</div>
          <div className="text-xl" style={{ fontWeight: 700 }}>{kpis ? kpis.total_units : '...'}</div>
        </div>
        <div className="card">
          <div className="text-sm">Avg Order Value</div>
          <div className="text-xl" style={{ fontWeight: 700 }}>{kpis ? `₹${Number(kpis.avg_order_value).toFixed(2)}` : '...'}</div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="card">
          <Plot
            data={[{ x: monthData.map(d => d.month), y: monthData.map(d => d.revenue), type: 'bar' }]}
            layout={{ title: 'Revenue by Month', autosize: true }}
            useResizeHandler={true}
            style={{ width: '100%', height: '350px' }}
          />
        </div>

        <div className="card">
          <Plot
            data={[{ labels: regionData.map(d => d.region), values: regionData.map(d => d.revenue), type: 'pie' }]}
            layout={{ title: 'Revenue by Region', autosize: true }}
            useResizeHandler={true}
            style={{ width: '100%', height: '350px' }}
          />
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>Top Products</h2>
        <Plot
          data={[{ x: topProducts.map(d => d.product), y: topProducts.map(d => d.revenue), type: 'bar' }]}
          layout={{ autosize: true }}
          useResizeHandler={true}
          style={{ width: '100%', height: '350px' }}
        />
      </div>

      <div className="card" style={{ marginTop: 16, overflowX: 'auto' }}>
        <h2 style={{ marginTop: 0 }}>Raw Data</h2>
        <table className="table">
          <thead>
            <tr>
              {tableData[0] ? Object.keys(tableData[0]).map(k => <th key={k}>{k}</th>) : <th>No data</th>}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, i) => (
              <tr key={i}>
                {Object.values(row).map((v, j) => <td key={j}>{v === null || v === undefined ? '' : v.toString()}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
