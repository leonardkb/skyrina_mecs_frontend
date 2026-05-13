import { useEffect, useState } from 'react'
import axios from 'axios'
import MecanicoLayout from '../../components/layout/MecanicoLayout'

export default function BonoPage() {
  const [loading, setLoading] = useState(true)
  const [bonusData, setBonusData] = useState({
    currentBonus: 0,
    currentKPI: 0,
    afectacionRate: 0,
    styleChangeRate: 0,
    qualityRate: 0,
    // Current week specific counts for breakdown display
    currentWeekClosed: 0,
    currentWeekAssigned: 0,
    currentWeekStyleClosed: 0,
    currentWeekStyleTotal: 0,
    currentWeekDelays: 0,
    currentWeekResolutionSummary: [],
    weeklyHistory: [],
    summary: {
      avgTime: 0,
      resolvedTickets: 0,
      validationRate: 0,
      rejections: 0,
      totalAssigned: 0,
      totalCompleted: 0,
      totalStyleChanges: 0,
      completedStyleChanges: 0
    }
  })

  useEffect(() => {
    fetchBonusData()
  }, [])

  // Helper function to get afectacion score per ticket based on resolution minutes
  const getAfectacionScore = (minutes) => {
    if (minutes === null || minutes === undefined) return 0
    if (minutes < 7) return 100
    if (minutes <= 15) return 50
    return 0
  }

  const fetchBonusData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'))
      if (!user?.id) {
        console.log('No user found')
        setLoading(false)
        return
      }

      const ticketsResponse = await axios.get(
        `http://localhost:8000/mecanico/tickets/${user.id}`
      )
      
      const tickets = ticketsResponse.data.tickets || []
      
      // Get current week's date range
      const now = new Date()
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay()) // Sunday
      startOfWeek.setHours(0, 0, 0, 0)
      
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      endOfWeek.setHours(23, 59, 59, 999)
      
      // Filter tickets completed this week only
      const currentWeekTickets = tickets.filter(t => {
        if (t.status !== 'cerrado') return false
        const completedDate = t.completed_at ? new Date(t.completed_at) : 
                           (t.closed_at ? new Date(t.closed_at) : null)
        return completedDate && completedDate >= startOfWeek && completedDate <= endOfWeek
      })
      
      // For assigned tickets, filter to current week assignments
      const assignedThisWeek = tickets.filter(t => {
        if (t.status === 'cancelado') return false
        const createdDate = new Date(t.created_at)
        return createdDate <= endOfWeek
      })
      
      // Calculate rates based on current week's data
      const closedTickets = currentWeekTickets
      const assignedTickets = assignedThisWeek.filter(t => t.status !== 'cancelado')
      const styleChangeTickets = assignedThisWeek.filter(t => t.tipo === 'cambio_estilo')
      const closedStyleChanges = currentWeekTickets.filter(t => t.tipo === 'cambio_estilo')
      
      // =============================================
      // NEW: Afectación Rate based on resolution minutes
      // =============================================
      let totalAfectacionScore = 0
      const resolutionSummary = closedTickets.map(ticket => {
        const minutes = ticket.resolution_minutes || 0
        const score = getAfectacionScore(minutes)
        totalAfectacionScore += score
        return {
          ticketId: ticket.id,
          minutes: minutes,
          score: score,
          status: minutes < 7 ? 'Óptimo' : (minutes <= 15 ? 'Aceptable' : 'Crítico')
        }
      })
      
      const afectacionRate = closedTickets.length > 0
        ? totalAfectacionScore / closedTickets.length
        : 0
      
      // Style Change Rate
      const styleChangeRate = styleChangeTickets.length > 0
        ? (closedStyleChanges.length / styleChangeTickets.length) * 100
        : 0
      
      // Quality Rate (based on delays - tickets > 7 minutes are delayed)
      const delayedClosedTickets = closedTickets.filter(t => (t.resolution_minutes || 0) > 7)
      const qualityRate = closedTickets.length > 0
        ? ((closedTickets.length - delayedClosedTickets.length) / closedTickets.length) * 100
        : 0
      
      // Weighted KPI calculation for current week's bonus
      // Afectacion Rate is already a percentage (0-100)
      const weightedKPI = (afectacionRate * 0.5) + (styleChangeRate * 0.25) + (qualityRate * 0.25)
      const baseBonus = 5000
      const currentBonus = Math.round(baseBonus * (weightedKPI / 100))
      
      // For summary stats - use all time data
      const allClosedTickets = tickets.filter(t => t.status === 'cerrado')
      const allAssignedTickets = tickets.filter(t => t.status !== 'cancelado')
      const allStyleChanges = tickets.filter(t => t.tipo === 'cambio_estilo')
      const allClosedStyleChanges = allStyleChanges.filter(t => t.status === 'cerrado')
      
      const totalMinutes = allClosedTickets.reduce((sum, t) => sum + (t.resolution_minutes || 0), 0)
      const avgTime = allClosedTickets.length > 0 
        ? (totalMinutes / allClosedTickets.length).toFixed(1) 
        : 0
      
      const validationRate = allAssignedTickets.length > 0
        ? (allClosedTickets.length / allAssignedTickets.length) * 100
        : 0
      
      const rejections = allClosedTickets.filter(t => (t.resolution_minutes || 0) > 7).length
      
      const weeklyHistory = generateWeeklyHistory(allClosedTickets)
      
      setBonusData({
        currentBonus: currentBonus,
        currentKPI: Math.round(weightedKPI),
        afectacionRate: Math.round(afectacionRate),
        styleChangeRate: Math.round(styleChangeRate),
        qualityRate: Math.round(qualityRate),
        // Current week specific counts
        currentWeekClosed: closedTickets.length,
        currentWeekAssigned: assignedTickets.length,
        currentWeekStyleClosed: closedStyleChanges.length,
        currentWeekStyleTotal: styleChangeTickets.length,
        currentWeekDelays: delayedClosedTickets.length,
        currentWeekResolutionSummary: resolutionSummary,
        weeklyHistory: weeklyHistory,
        summary: {
          avgTime: avgTime,
          resolvedTickets: allClosedTickets.length,
          validationRate: Math.round(validationRate),
          rejections: rejections,
          totalAssigned: allAssignedTickets.length,
          totalCompleted: allClosedTickets.length,
          totalStyleChanges: allStyleChanges.length,
          completedStyleChanges: allClosedStyleChanges.length
        }
      })
      
    } catch (error) {
      console.error('Error fetching bonus data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateWeeklyHistory = (closedTickets) => {
    const weeks = {}
    
    closedTickets.forEach(ticket => {
      const completedDate = ticket.completed_at || ticket.closed_at
      if (completedDate) {
        const date = new Date(completedDate)
        const weekNumber = getWeekNumber(date)
        const weekKey = `Semana ${weekNumber}`
        
        if (!weeks[weekKey]) {
          weeks[weekKey] = {
            tickets: [],
            totalMinutes: 0,
            totalScore: 0
          }
        }
        weeks[weekKey].tickets.push(ticket)
        weeks[weekKey].totalMinutes += (ticket.resolution_minutes || 0)
        weeks[weekKey].totalScore += getAfectacionScore(ticket.resolution_minutes || 0)
      }
    })
    
    const history = Object.entries(weeks).slice(-4).map(([weekName, data]) => {
      const weekTickets = data.tickets
      const weekDelayed = weekTickets.filter(t => (t.resolution_minutes || 0) > 7).length
      const weekQualityRate = weekTickets.length > 0
        ? ((weekTickets.length - weekDelayed) / weekTickets.length) * 100
        : 0
      
      // Calculate week's afectacion rate based on scores
      const weekAfectacionRate = weekTickets.length > 0
        ? data.totalScore / weekTickets.length
        : 0
      
      const weekStyleChangeRate = 100 // Placeholder - would need separate tracking
      
      const weekWeightedKPI = (weekAfectacionRate * 0.5) + (weekStyleChangeRate * 0.25) + (weekQualityRate * 0.25)
      const weekBonus = Math.round(5000 * (weekWeightedKPI / 100))
      
      return {
        semana: weekName,
        bono: weekBonus,
        porcentaje: Math.round(weekWeightedKPI)
      }
    })
    
    return history.reverse()
  }

  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
  }

  // Get score label and color for display
  const getScoreInfo = (minutes) => {
    if (minutes < 7) return { label: 'Óptimo', color: 'text-green-600', bgColor: 'bg-green-100' }
    if (minutes <= 15) return { label: 'Aceptable', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
    return { label: 'Crítico', color: 'text-red-600', bgColor: 'bg-red-100' }
  }

  if (loading) {
    return (
      <MecanicoLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500 text-sm">Calculando bono...</div>
        </div>
      </MecanicoLayout>
    )
  }

  return (
    <MecanicoLayout>
      <div className="min-h-screen bg-gray-100">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-gray-100 border-b border-gray-200 px-4 py-3">
          <h1 className="text-xl font-bold text-slate-800">
            Bono KPI
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Rendimiento basado en tickets cerrados
          </p>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Banner - Current Bonus */}
          <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-slate-50">
            <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-white/10" />
            <div className="relative z-10">
              <p className="text-xs text-white/90">
                Bono esta semana
              </p>
              <h1 className="text-3xl font-bold mt-1">
                ${bonusData.currentBonus.toLocaleString()}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold text-slate-800">
                  {bonusData.currentKPI}% KPI
                </div>
                <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-xs text-slate-800">
                  Basado en resolución
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown Section */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-slate-800">
                Desglose del bono
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {/* Afectación - Now based on resolution minutes */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-slate-800">
                      Afectación (Tiempo de Resolución)
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      50% del bono • {bonusData.currentWeekClosed} tickets resueltos esta semana
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700">&lt;7 min = 100%</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700">7-15 min = 50%</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700">&gt;15 min = 0%</span>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-slate-800 ml-2">
                    {bonusData.afectacionRate}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${bonusData.afectacionRate}%` }}
                  />
                </div>
              </div>

              {/* Cambios de Estilo */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-slate-800">
                      Cambios de Estilo
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      25% del bono • {bonusData.currentWeekStyleClosed} de {bonusData.currentWeekStyleTotal} cambios completados
                    </p>
                  </div>
                  <span className="text-lg font-bold text-slate-800 ml-2">
                    {bonusData.styleChangeRate}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-orange-500"
                    style={{ width: `${bonusData.styleChangeRate}%` }}
                  />
                </div>
              </div>

              {/* Orden (Tiempo y Calidad) */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-slate-800">
                      Orden (Sin Retrasos)
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      25% del bono • {bonusData.currentWeekDelays} tickets con retraso (&gt;7 min)
                    </p>
                  </div>
                  <span className="text-lg font-bold text-slate-800 ml-2">
                    {bonusData.qualityRate}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{ width: `${bonusData.qualityRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Resolution Times */}
          {bonusData.currentWeekResolutionSummary.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-slate-800">
                  Detalle de Tiempos de Resolución
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Esta semana
                </p>
              </div>
              <div className="divide-y divide-gray-100">
                {bonusData.currentWeekResolutionSummary.map((item, idx) => {
                  const scoreInfo = getScoreInfo(item.minutes)
                  return (
                    <div key={idx} className="px-4 py-3 flex items-center justify-between">
                      <div className="flex-1">
                        <span className="text-sm font-medium text-slate-800">
                          Ticket #{item.ticketId.slice(-6)}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${scoreInfo.bgColor} ${scoreInfo.color}`}>
                            {scoreInfo.label}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-lg font-bold ${item.minutes < 7 ? 'text-green-600' : item.minutes <= 15 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {item.minutes} min
                        </span>
                        <p className="text-xs text-gray-500">
                          {item.score}%
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">Promedio esta semana:</span>
                  <span className={`text-sm font-bold ${bonusData.summary.avgTime <= 7 ? 'text-green-600' : bonusData.summary.avgTime <= 15 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {bonusData.summary.avgTime} min
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Weekly History */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-800">
                  Histórico semanal
                </h2>
                <span className="text-xs text-gray-400">Últimas semanas</span>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {bonusData.weeklyHistory.length > 0 ? (
                bonusData.weeklyHistory.map((item, index) => (
                  <div key={index} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-800">
                          {item.semana}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Rendimiento KPI
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-orange-500">
                          ${item.bono.toLocaleString()}
                        </span>
                        <p className="text-xs text-gray-500">
                          {item.porcentaje}% KPI
                        </p>
                      </div>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-orange-500"
                        style={{ width: `${item.porcentaje}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-gray-400 text-sm">
                  No hay datos históricos
                </div>
              )}
            </div>
          </div>

          {/* KPI Summary & Goal */}
          <div className="grid grid-cols-1 gap-3">
            {/* KPI Summary */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-slate-800">
                  Resumen KPI
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                <div className="px-4 py-2 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Tiempo promedio</span>
                  <span className={`text-sm font-semibold ${bonusData.summary.avgTime <= 7 ? 'text-green-500' : bonusData.summary.avgTime <= 15 ? 'text-yellow-500' : 'text-red-500'}`}>
                    {bonusData.summary.avgTime} min
                  </span>
                </div>
                <div className="px-4 py-2 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Tickets cerrados</span>
                  <span className="text-sm font-semibold text-blue-500">{bonusData.summary.resolvedTickets}</span>
                </div>
                <div className="px-4 py-2 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Tasa de cierre</span>
                  <span className="text-sm font-semibold text-orange-500">{bonusData.summary.validationRate}%</span>
                </div>
                <div className="px-4 py-2 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Retrasos (&gt;7 min)</span>
                  <span className="text-sm font-semibold text-red-500">{bonusData.summary.rejections}</span>
                </div>
                <div className="px-4 py-2 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Cambios exitosos</span>
                  <span className="text-sm font-semibold text-purple-500">
                    {bonusData.summary.completedStyleChanges}/{bonusData.summary.totalStyleChanges}
                  </span>
                </div>
              </div>
            </div>

            {/* Goal Card */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 text-slate-50">
              <p className="text-xs text-white/80">
                Metas de la semana
              </p>
              <div className="mt-2 space-y-2">
                <div>
                  <h2 className="text-xl font-bold">&lt; 7 min</h2>
                  <p className="text-[10px] text-white/70">Objetivo óptimo por ticket</p>
                </div>
                <div className="pt-2 border-t border-white/20">
                  <p className="text-sm font-semibold text-white/90">Escala de puntuación:</p>
                  <ul className="text-[10px] text-white/70 mt-1 space-y-0.5">
                    <li>• &lt; 7 minutos = 100% del peso</li>
                    <li>• 7-15 minutos = 50% del peso</li>
                    <li>• &gt; 15 minutos = 0% del peso</li>
                  </ul>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-white/20">
                <p className="text-[10px] text-white/50">
                  * El bono se calcula semanalmente basado en el promedio ponderado de todos los tickets cerrados
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MecanicoLayout>
  )
}