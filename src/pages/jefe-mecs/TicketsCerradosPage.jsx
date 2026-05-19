import {
  useEffect,
  useState
} from 'react'

import axios from 'axios'

import JefeMecLayout
from '../../components/layout/JefeMecLayout'

export default function TicketsCerradosPage() {

  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterMec, setFilterMec] = useState('')
  const [filterTitle, setFilterTitle] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      const response = await axios.get(
        'http://localhost:8000/api/v1/jefe-mecanicos/tickets/completados'
      )

      console.log('Completed/Validated tickets:', response.data)
      setTickets(response.data.tickets || [])

    } catch (error) {
      console.log('Error fetching tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const filtered = tickets.filter(ticket => {
    if (filterStatus !== 'all' && ticket.status !== filterStatus) {
      return false
    }
    
    const mechanicMatch = filterMec === '' || 
      (ticket.mechanic_name?.toLowerCase().includes(filterMec.toLowerCase()) || false)
    
    const titleMatch = filterTitle === '' || 
      (ticket.titulo?.toLowerCase().includes(filterTitle.toLowerCase()) || false)
    
    return mechanicMatch && titleMatch
  })

  const formatDate = (date) => {
    if (!date) return 'N/A'
    const d = new Date(date)
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completado':
        return <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-medium">Completado</span>
      case 'validado':
        return <span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full text-xs font-medium">Validado</span>
      case 'cerrado':
        return <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">Cerrado</span>
      default:
        return <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium">{status}</span>
    }
  }

  const getTypeBadge = (tipo) => {
    switch (tipo) {
      case 'cambio_estilo':
        return <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-medium">Cambio Estilo</span>
      case 'falla_equipo':
        return <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-medium">Falla Equipo</span>
      default:
        return <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium">{tipo}</span>
    }
  }

  const TicketCard = ({ ticket }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-3 hover:shadow-sm transition-shadow">
      {/* Header with status and time */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-1.5">
          {getStatusBadge(ticket.status)}
          {getTypeBadge(ticket.tipo)}
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-medium ${(ticket.resolution_minutes || 0) <= 7 ? 'text-green-600' : 'text-red-600'}`}>
            {ticket.resolution_minutes || 0} min
          </span>
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${ticket.delayed ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
            {ticket.delayed ? '⚠️' : '✓'}
          </span>
        </div>
      </div>

      {/* Title and number */}
      <div className="mb-2">
        <h3 className="font-semibold text-slate-800 text-sm line-clamp-1">
          {ticket.titulo}
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">
          {ticket.ticket_number}
        </p>
      </div>

      {/* Solution description (if exists) */}
      {ticket.solution_description && (
        <p className="text-xs text-gray-500 mt-1 mb-2 line-clamp-2 bg-gray-50 p-1.5 rounded">
          {ticket.solution_description}
        </p>
      )}

      {/* Footer with mechanic and date */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400">👨‍🔧</span>
          <span className="text-xs font-medium text-slate-700">
            {ticket.mechanic_name || 'Unknown'}
          </span>
        </div>
        <span className="text-xs text-gray-400">
          {formatDate(ticket.closed_at || ticket.completed_at)}
        </span>
      </div>
    </div>
  )

  return (
    <JefeMecLayout>
      <div className="p-3 space-y-3">
        {/* HEADER */}
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Tickets Completados
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Historial de tickets completados y validados
          </p>
        </div>

        {/* FILTERS - Toggleable for mobile */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-between px-3 py-2.5 text-left active:bg-gray-50"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">🔍 Filtros</span>
              {(filterMec || filterTitle || filterStatus !== 'all') && (
                <span className="bg-orange-100 text-orange-600 text-xs px-1.5 py-0.5 rounded-full">
                  Activo
                </span>
              )}
            </div>
            <span className="text-gray-400 text-sm">{showFilters ? '▲' : '▼'}</span>
          </button>
          
          {showFilters && (
            <div className="p-3 pt-0 space-y-2 border-t border-gray-100">
              <input
                type="text"
                placeholder="Filtrar por mecánico..."
                value={filterMec}
                onChange={(e) => setFilterMec(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
              <input
                type="text"
                placeholder="Filtrar por título..."
                value={filterTitle}
                onChange={(e) => setFilterTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
              >
                <option value="all">Todos los estados</option>
                <option value="completado">Completado</option>
                <option value="validado">Validado</option>
                <option value="cerrado">Cerrado</option>
              </select>
              
              {/* Clear filters button */}
              {(filterMec || filterTitle || filterStatus !== 'all') && (
                <button
                  onClick={() => {
                    setFilterMec('')
                    setFilterTitle('')
                    setFilterStatus('all')
                  }}
                  className="w-full text-center text-xs text-orange-500 py-1.5 active:text-orange-600"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          )}
        </div>

        {/* RESULTS COUNT */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {filtered.length} {filtered.length === 1 ? 'ticket' : 'tickets'}
          </p>
          {(filterMec || filterTitle || filterStatus !== 'all') && (
            <p className="text-xs text-gray-400">
              Filtrado
            </p>
          )}
        </div>

        {/* TICKETS LIST */}
        {loading ? (
          <div className="text-center py-8">
            <div className="text-sm text-gray-500">Cargando tickets...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="text-3xl mb-1">📭</div>
            <p className="text-sm font-medium text-slate-800">No se encontraron tickets</p>
            <p className="text-xs text-gray-500 mt-1">Prueba con otros filtros</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(ticket => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>
    </JefeMecLayout>
  )
}