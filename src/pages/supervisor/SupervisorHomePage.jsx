import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import SupervisorLayout from '../../components/layout/SupervisorLayout'

export default function SupervisorHomePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    avgClosing: 0,
    activeTickets: 0,
    pendingValidation: 0,
    totalTickets: 0,
    closedTickets: 0,
  })
  const [kpis, setKpis] = useState({
    afectacion: 0,
    cambios: 0,
    orden: 0,
  })
  const [tickets, setTickets] = useState([])
  const [lines, setLines] = useState([])
  const [mechanics, setMechanics] = useState([])
  const [activeTab, setActiveTab] = useState('tickets') // 'tickets', 'lines', 'mechanics'

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Helper function to get afectacion score per ticket based on resolution minutes
  const getAfectacionScore = (minutes) => {
    if (minutes === null || minutes === undefined) return 0
    if (minutes < 7) return 100
    if (minutes <= 15) return 50
    return 0
  }

  const fetchDashboardData = async () => {
    try {
      const [statsRes, linesRes, mechanicsRes] = await Promise.all([
        axios.get('http://localhost:8000/supervisor/dashboard/stats'),
        axios.get('http://localhost:8000/supervisor/lines/performance'),
        axios.get('http://localhost:8000/supervisor/mechanics/performance'),
      ])

      if (statsRes.data.success) {
        const dashboardStats = statsRes.data.stats
        const dashboardKpis = statsRes.data.kpis
        
        // Recalculate afectacion KPI based on resolution minutes scoring
        const tickets = dashboardStats.tickets || statsRes.data.tickets || []
        const closedTickets = tickets.filter(t => t.status === 'cerrado')
        
        let totalAfectacionScore = 0
        closedTickets.forEach(ticket => {
          totalAfectacionScore += getAfectacionScore(ticket.resolution_minutes)
        })
        
        const calculatedAfectacionRate = closedTickets.length > 0
          ? Math.round(totalAfectacionScore / closedTickets.length)
          : 0
        
        setStats({
          avgClosing: dashboardStats.avgClosing || 0,
          activeTickets: dashboardStats.activeTickets || 0,
          pendingValidation: dashboardStats.pendingValidation || 0,
          totalTickets: dashboardStats.totalTickets || 0,
          closedTickets: dashboardStats.closedTickets || 0,
        })
        
        setKpis({
          afectacion: calculatedAfectacionRate,
          cambios: dashboardKpis?.cambios || 0,
          orden: dashboardKpis?.orden || 0,
        })
        
        setTickets(statsRes.data.tickets || [])
      }

      if (linesRes.data.success) {
        const linesData = linesRes.data.lines || []
        // Recalculate line afectacion scores
        const updatedLines = linesData.map(line => ({
          ...line,
          afectacion_rate: calculateLineAfectacionRate(line.tickets || [])
        }))
        setLines(updatedLines)
      }

      if (mechanicsRes.data.success) {
        const mechanicsData = mechanicsRes.data.mechanics || []
        // Recalculate mechanic afectacion scores
        const updatedMechanics = mechanicsData.map(mech => ({
          ...mech,
          afectacion_rate: calculateMechanicAfectacionRate(mech.tickets || [])
        }))
        setMechanics(updatedMechanics)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateLineAfectacionRate = (tickets) => {
    const closedTickets = tickets.filter(t => t.status === 'cerrado')
    if (closedTickets.length === 0) return 0
    
    let totalScore = 0
    closedTickets.forEach(ticket => {
      totalScore += getAfectacionScore(ticket.resolution_minutes)
    })
    return Math.round(totalScore / closedTickets.length)
  }

  const calculateMechanicAfectacionRate = (tickets) => {
    const closedTickets = tickets.filter(t => t.status === 'cerrado')
    if (closedTickets.length === 0) return 0
    
    let totalScore = 0
    closedTickets.forEach(ticket => {
      totalScore += getAfectacionScore(ticket.resolution_minutes)
    })
    return Math.round(totalScore / closedTickets.length)
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critica': return 'bg-red-500'
      case 'alta': return 'bg-yellow-500'
      case 'normal': return 'bg-green-500'
      default: return 'bg-blue-500'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-700'
      case 'asignado': return 'bg-blue-100 text-blue-700'
      case 'en_proceso': return 'bg-purple-100 text-purple-700'
      case 'completado': return 'bg-orange-100 text-orange-700'
      case 'validado': return 'bg-teal-100 text-teal-700'
      case 'cerrado': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getResolutionTimeColor = (minutes) => {
    if (minutes < 7) return 'text-green-500'
    if (minutes <= 15) return 'text-yellow-500'
    return 'text-red-500'
  }

  if (loading) {
    return (
      <SupervisorLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Cargando datos...</div>
        </div>
      </SupervisorLayout>
    )
  }

  return (
    <SupervisorLayout>
      <div className="max-w-7xl mx-auto px-3">
        {/* Header - Reduced spacing */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-slate-800">
            Dashboard Supervisor
          </h1>
          <p className="text-xs text-gray-500">
            Monitoreo global de producción
          </p>
        </div>

        {/* KPI Cards - Compact grid with smaller cards */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <MetricCard
            title="Tiempo Promedio"
            value={stats.avgClosing}
            unit="min"
            color={stats.avgClosing <= 7 ? "text-green-500" : stats.avgClosing <= 15 ? "text-yellow-500" : "text-red-500"}
          />
          <MetricCard
            title="Tickets Activos"
            value={stats.activeTickets}
            color="text-orange-500"
          />
          <MetricCard
            title="Por Validar"
            value={stats.pendingValidation}
            color="text-yellow-500"
          />
          <MetricCard
            title="Tickets Cerrados"
            value={stats.closedTickets}
            color="text-green-500"
          />
        </div>

        {/* KPI Bars - Compact version with updated afectacion info */}
        <div className="bg-white rounded-xl border p-3 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-800">
              KPIs Globales - Semana
            </h2>
            <div className="flex gap-1 text-[10px]">
              <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700">&lt;7min</span>
              <span className="px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700">7-15min</span>
              <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700">&gt;15min</span>
            </div>
          </div>
          <div className="space-y-3">
            <KPIBar
              label="Afectación (Tiempo de Resolución)"
              value={kpis.afectacion}
              color="bg-blue-600"
              detail="Promedio ponderado por ticket"
            />
            <KPIBar
              label="Cambios de Estilo"
              value={kpis.cambios}
              color="bg-orange-500"
              detail="Completados exitosamente"
            />
            <KPIBar
              label="Orden (Sin Retrasos)"
              value={kpis.orden}
              color="bg-green-500"
              detail="Tickets completados en ≤7 min"
            />
          </div>
        </div>

        {/* Tabs - More compact, better for touch */}
        <div className="flex gap-1 mb-3 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('tickets')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'tickets'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-gray-600'
            }`}
          >
            Tickets
          </button>
          <button
            onClick={() => setActiveTab('lines')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'lines'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-gray-600'
            }`}
          >
            Líneas
          </button>
          <button
            onClick={() => setActiveTab('mechanics')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'mechanics'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-gray-600'
            }`}
          >
            Mecánicos
          </button>
        </div>

        {/* Tickets Tab - Compact cards */}
        {activeTab === 'tickets' && (
          <div className="space-y-2">
            {tickets.length === 0 ? (
              <div className="bg-white rounded-xl border p-6 text-center text-gray-500 text-sm">
                No hay tickets registrados
              </div>
            ) : (
              tickets.map(ticket => (
                <div key={ticket.id} className="bg-white rounded-xl border p-3 active:bg-gray-50 transition-colors">
                  {/* Header with badges in one row */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold text-white ${getPriorityColor(ticket.prioridad)}`}>
                      {ticket.prioridad?.toUpperCase() || 'NORMAL'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                    {ticket.resolution_minutes && (
                      <span className={`ml-auto text-xs font-bold ${getResolutionTimeColor(ticket.resolution_minutes)}`}>
                        {ticket.resolution_minutes} min
                        {ticket.resolution_minutes < 7 ? ' ✓' : ticket.resolution_minutes <= 15 ? ' ⚠' : ' ✗'}
                      </span>
                    )}
                  </div>
                  
                  {/* Title and details */}
                  <h3 className="text-base font-bold text-slate-800 leading-tight">
                    {ticket.titulo}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Línea {ticket.linea_numero || 'N/A'} · {ticket.ticket_number}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {ticket.descripcion}
                  </p>
                  {ticket.mechanic_name && (
                    <p className="text-xs text-orange-500 mt-2">
                      👨‍🔧 {ticket.mechanic_name}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Lines Tab - Compact table with afectacion column */}
        {activeTab === 'lines' && (
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left p-2 text-xs font-semibold">Línea</th>
                    <th className="text-center p-2 text-xs font-semibold">Total</th>
                    <th className="text-center p-2 text-xs font-semibold">Cerrados</th>
                    <th className="text-center p-2 text-xs font-semibold">Activos</th>
                    <th className="text-center p-2 text-xs font-semibold">Promedio</th>
                    <th className="text-center p-2 text-xs font-semibold">Afectación</th>
                    <th className="text-center p-2 text-xs font-semibold">Tasa</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map(line => (
                    <tr key={line.linea_id} className="border-b hover:bg-slate-50">
                      <td className="p-2 font-semibold text-xs">
                        L{line.linea_numero}
                      </td>
                      <td className="p-2 text-center text-xs">{line.total_tickets}</td>
                      <td className="p-2 text-center text-green-600 font-semibold text-xs">{line.closed_tickets}</td>
                      <td className="p-2 text-center text-orange-500 text-xs">{line.active_tickets}</td>
                      <td className={`p-2 text-center font-semibold text-xs ${getResolutionTimeColor(line.avg_resolution_minutes)}`}>
                        {line.avg_resolution_minutes}m
                      </td>
                      <td className="p-2 text-center">
                        <div className="flex items-center gap-1">
                          <span className={`text-xs font-semibold ${line.afectacion_rate >= 80 ? 'text-green-500' : line.afectacion_rate >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                            {line.afectacion_rate || 0}%
                          </span>
                          <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${line.afectacion_rate >= 80 ? 'bg-green-500' : line.afectacion_rate >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                              style={{ width: `${line.afectacion_rate || 0}%` }} 
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-semibold">{line.completion_rate}%</span>
                          <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${line.completion_rate}%` }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Mechanics Tab - With afectacion column */}
        {activeTab === 'mechanics' && (
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left p-2 text-xs font-semibold">Mecánico</th>
                    <th className="text-center p-2 text-xs font-semibold">Total</th>
                    <th className="text-center p-2 text-xs font-semibold">Cerrados</th>
                    <th className="text-center p-2 text-xs font-semibold">Promedio</th>
                    <th className="text-center p-2 text-xs font-semibold">Afectación</th>
                    <th className="text-center p-2 text-xs font-semibold">Tasa</th>
                    <th className="text-center p-2 text-xs font-semibold">Ubic</th>
                  </tr>
                </thead>
                <tbody>
                  {mechanics.map(mech => (
                    <tr key={mech.mecanico_id} className="border-b hover:bg-slate-50">
                      <td className="p-2 font-semibold text-xs truncate max-w-[80px]">{mech.mecanico_nombre}</td>
                      <td className="p-2 text-center text-xs">{mech.total_tickets}</td>
                      <td className="p-2 text-center text-green-600 font-semibold text-xs">{mech.closed_tickets}</td>
                      <td className={`p-2 text-center font-semibold text-xs ${getResolutionTimeColor(mech.avg_resolution_minutes)}`}>
                        {mech.avg_resolution_minutes}m
                      </td>
                      <td className="p-2 text-center">
                        <div className="flex items-center gap-1">
                          <span className={`text-xs font-semibold ${mech.afectacion_rate >= 80 ? 'text-green-500' : mech.afectacion_rate >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                            {mech.afectacion_rate || 0}%
                          </span>
                          <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${mech.afectacion_rate >= 80 ? 'bg-green-500' : mech.afectacion_rate >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                              style={{ width: `${mech.afectacion_rate || 0}%` }} 
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-semibold">{mech.completion_rate}%</span>
                          <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${mech.completion_rate}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                          mech.current_location === 'taller' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {mech.current_location === 'taller' ? 'Taller' : 'Piso'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </SupervisorLayout>
  )
}

// Compact Metric Card - Reduced padding and text sizes
function MetricCard({ title, value, unit, color }) {
  return (
    <div className="bg-white rounded-xl border p-2">
      <p className="text-[10px] text-gray-500 uppercase tracking-wide">{title}</p>
      <h2 className={`text-xl font-bold mt-0.5 ${color}`}>
        {value}
        {unit && <span className="text-xs ml-0.5">{unit}</span>}
      </h2>
    </div>
  )
}

// Compact KPI Bar - Reduced spacing
function KPIBar({ label, value, color, detail }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex-1">
          <span className="text-xs text-gray-600">{label}</span>
          {detail && <p className="text-[10px] text-gray-400">{detail}</p>}
        </div>
        <span className="text-xs font-bold ml-2">{value}%</span>
      </div>
      <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}