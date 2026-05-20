// SupervisorHomePage.jsx - Fixed version with correct formula and debug logging

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
  const [activeTab, setActiveTab] = useState('tickets')
  const [debugInfo, setDebugInfo] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // ==========================================
  // CORRECTED FORMULA: 
  // ≤7 min = 100%
  // 7-15 min = 100 - 6.25 × (minutes - 7)
  // ≥15 min = 0%
  // ==========================================
  const getAfectacionScore = (minutes) => {
    if (minutes === null || minutes === undefined) return 0
    if (minutes <= 7) return 100
    if (minutes >= 15) return 0
    return 100 - (6.25 * (minutes - 7))
  }

  // Calculate afectacion using simple ticket average (not daily aggregation)
  const calculateSimpleAfectacion = (tickets) => {
    if (!tickets || tickets.length === 0) return 0
    
    let totalScore = 0
    tickets.forEach(ticket => {
      const score = getAfectacionScore(ticket.resolution_minutes)
      totalScore += score
    })
    
    return totalScore / tickets.length
  }

  // Calculate afectacion using daily aggregation (average of daily scores)
  const calculateDailyScores = (tickets) => {
    if (!tickets || tickets.length === 0) return 0
    
    const days = {}
    
    tickets.forEach(ticket => {
      const completedDate = ticket.completed_at || ticket.closed_at
      if (completedDate && ticket.status === 'cerrado') {
        const date = new Date(completedDate)
        const dateKey = date.toISOString().split('T')[0]
        
        if (!days[dateKey]) {
          days[dateKey] = {
            totalMinutes: 0,
            ticketCount: 0,
            tickets: []
          }
        }
        days[dateKey].totalMinutes += (ticket.resolution_minutes || 0)
        days[dateKey].ticketCount += 1
        days[dateKey].tickets.push({
          number: ticket.ticket_number,
          minutes: ticket.resolution_minutes
        })
      }
    })
    
    let totalScore = 0
    let dayCount = 0
    const dailyBreakdown = []
    
    Object.entries(days).forEach(([date, day]) => {
      const avgMinutes = day.totalMinutes / day.ticketCount
      let dayScore
      if (avgMinutes <= 7) dayScore = 100
      else if (avgMinutes >= 15) dayScore = 0
      else dayScore = 100 - (6.25 * (avgMinutes - 7))
      
      dailyBreakdown.push({
        date: date,
        avgMinutes: avgMinutes.toFixed(1),
        score: dayScore.toFixed(1),
        ticketCount: day.ticketCount,
        tickets: day.tickets
      })
      
      totalScore += dayScore
      dayCount++
    })
    
    return {
      average: dayCount > 0 ? totalScore / dayCount : 0,
      dailyBreakdown: dailyBreakdown,
      dayCount: dayCount
    }
  }

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data...')
      
      const [statsRes, linesRes, mechanicsRes] = await Promise.all([
        axios.get('/api/v1/supervisor/dashboard/stats'),
        axios.get('/api/v1/supervisor/lines/performance'),
        axios.get('/api/v1/supervisor/mechanics/performance'),
      ])

      console.log('Stats response:', statsRes.data)

      if (statsRes.data.success) {
        const dashboardStats = statsRes.data.stats || {}
        
        // Get tickets from the correct location
        let allTickets = []
        if (dashboardStats.tickets && Array.isArray(dashboardStats.tickets)) {
          allTickets = dashboardStats.tickets
        } else if (statsRes.data.tickets && Array.isArray(statsRes.data.tickets)) {
          allTickets = statsRes.data.tickets
        } else if (dashboardStats.recent_tickets && Array.isArray(dashboardStats.recent_tickets)) {
          allTickets = dashboardStats.recent_tickets
        }
        
        console.log('Found tickets:', allTickets.length)
        
        const closedTickets = allTickets.filter(t => t.status === 'cerrado')
        console.log('Closed tickets:', closedTickets.length)
        
        // ==========================================
        // DEBUG: Log all closed tickets with dates
        // ==========================================
        console.log('=== DEBUG AFECTACION CALCULATION ===')
        closedTickets.forEach(ticket => {
          const completedDate = ticket.completed_at || ticket.closed_at
          const date = completedDate ? new Date(completedDate).toISOString().split('T')[0] : 'NO_DATE'
          const score = getAfectacionScore(ticket.resolution_minutes)
          console.log(`Ticket: ${ticket.ticket_number}, Minutes: ${ticket.resolution_minutes}, Date: ${date}, Score: ${score}%`)
        })
        
        // Calculate both methods for comparison
        const simpleRate = calculateSimpleAfectacion(closedTickets)
        const dailyResult = calculateDailyScores(closedTickets)
        
        console.log('Simple average (per ticket):', simpleRate.toFixed(1) + '%')
        console.log('Daily aggregation:', dailyResult.average.toFixed(1) + '%')
        console.log('Days with data:', dailyResult.dayCount)
        
        if (dailyResult.dailyBreakdown.length > 0) {
          console.log('Daily breakdown:')
          dailyResult.dailyBreakdown.forEach(day => {
            console.log(`  ${day.date}: ${day.ticketCount} tickets, avg ${day.avgMinutes} min → ${day.score}%`)
            day.tickets.forEach(t => {
              console.log(`    - ${t.number}: ${t.minutes} min`)
            })
          })
        }
        
        // Use daily aggregation for consistency with requirements
        const calculatedAfectacionRate = Math.round(dailyResult.average)
        
        // Store debug info for display (optional)
        setDebugInfo({
          simpleRate: Math.round(simpleRate),
          dailyRate: calculatedAfectacionRate,
          dayCount: dailyResult.dayCount,
          dailyBreakdown: dailyResult.dailyBreakdown
        })
        
        setStats({
          avgClosing: dashboardStats.avgClosing || 0,
          activeTickets: dashboardStats.activeTickets || 0,
          pendingValidation: dashboardStats.pendingValidation || 0,
          totalTickets: dashboardStats.totalTickets || 0,
          closedTickets: dashboardStats.closedTickets || closedTickets.length,
        })
        
        setKpis({
          afectacion: calculatedAfectacionRate,
          cambios: dashboardStats.cambios_kpi || statsRes.data.kpis?.cambios || 0,
          orden: dashboardStats.orden_kpi || statsRes.data.kpis?.orden || 0,
        })
        
        setTickets(allTickets)
      } else {
        console.error('Stats response success false:', statsRes.data)
      }

      if (linesRes.data.success) {
        const linesData = linesRes.data.lines || []
        const updatedLines = linesData.map(line => {
          const dailyResult = calculateDailyScores(line.tickets || [])
          return {
            ...line,
            afectacion_rate: Math.round(dailyResult.average)
          }
        })
        setLines(updatedLines)
      } else {
        console.error('Lines response error:', linesRes.data)
      }

      if (mechanicsRes.data.success) {
        const mechanicsData = mechanicsRes.data.mechanics || []
        const updatedMechanics = mechanicsData.map(mech => {
          const dailyResult = calculateDailyScores(mech.tickets || [])
          return {
            ...mech,
            afectacion_rate: Math.round(dailyResult.average)
          }
        })
        setMechanics(updatedMechanics)
      } else {
        console.error('Mechanics response error:', mechanicsRes.data)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
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
    if (minutes <= 7) return 'text-green-500'
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
        <div className="mb-4">
          <h1 className="text-xl font-bold text-slate-800">
            Dashboard Supervisor
          </h1>
          <p className="text-xs text-gray-500">
            Monitoreo global de producción
          </p>
        </div>

        {/* Debug Panel - Hidden by default, shows in console */}
        {debugInfo && process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-3 bg-gray-100 rounded-xl text-xs font-mono hidden">
            <p>Debug: Simple avg: {debugInfo.simpleRate}% | Daily avg: {debugInfo.dailyRate}% | Days: {debugInfo.dayCount}</p>
          </div>
        )}

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

        <div className="bg-white rounded-xl border p-3 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-800">
              KPIs Globales - Semana
            </h2>
            <div className="flex gap-1 text-[10px]">
              <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700">≤7 min = 100%</span>
              <span className="px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700">7-15 min = fórmula</span>
              <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700">≥15 min = 0%</span>
            </div>
          </div>
          <div className="space-y-3">
            <KPIBar
              label="Afectación (Tiempo de Resolución Diario)"
              value={kpis.afectacion}
              color="bg-blue-600"
              detail="Promedio diario: ≤7 min=100%, 7-15 min=100-6.25×(min-7), ≥15 min=0%"
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
          <div className="mt-3 pt-2 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 text-center">
              * La afectación se calcula promediando el puntaje diario de cada día trabajado
            </p>
          </div>
        </div>

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

        {activeTab === 'tickets' && (
          <div className="space-y-2">
            {tickets.length === 0 ? (
              <div className="bg-white rounded-xl border p-6 text-center text-gray-500 text-sm">
                No hay tickets registrados
              </div>
            ) : (
              tickets.map(ticket => (
                <div key={ticket.id} className="bg-white rounded-xl border p-3 active:bg-gray-50 transition-colors">
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
                        {ticket.resolution_minutes <= 7 ? ' ✓' : ticket.resolution_minutes <= 15 ? ' ⚠' : ' ✗'}
                      </span>
                    )}
                  </div>
                  
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