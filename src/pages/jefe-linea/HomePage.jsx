import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'

export default function HomePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pendingValidationTickets, setPendingValidationTickets] = useState([])
  const [validatedTickets, setValidatedTickets] = useState([])
  const [activeTickets, setActiveTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [closingTicketId, setClosingTicketId] = useState(null)

  useEffect(() => {
    fetchTickets()
  }, [id])

  const fetchTickets = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'))
      if (!user || !user.linea_id) {
        console.log('No linea_id found')
        setLoading(false)
        return
      }

      const response = await axios.get(
        `/api/v1/tickets/linea/${user.linea_id}`
      )

      const allTickets = response.data.tickets || []
      
      const pending = allTickets.filter(ticket => ticket.status === 'completado')
      const validated = allTickets.filter(ticket => ticket.status === 'validado')
      const active = allTickets.filter(ticket => 
        ticket.status !== 'completado' && 
        ticket.status !== 'validado' && 
        ticket.status !== 'cerrado'
      )
      
      setPendingValidationTickets(pending)
      setValidatedTickets(validated)
      setActiveTickets(active)

    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCloseTicket = async (ticketId) => {
    const confirmClose = window.confirm('¿Estás seguro de que deseas cerrar este ticket? Una vez cerrado, no se podrá modificar.')
    if (!confirmClose) return

    setClosingTicketId(ticketId)
    try {
      const user = JSON.parse(localStorage.getItem('user'))
      
      const formData = new FormData()
      formData.append('closed_by', user.id)
      formData.append('comentario', 'Ticket cerrado por jefe de línea')

      const response = await axios.post(
        `/api/v1/tickets/${ticketId}/close`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )

      if (response.data.success) {
        alert('✅ Ticket cerrado correctamente')
        fetchTickets()
      }
    } catch (error) {
      console.error('Error closing ticket:', error)
      alert(error.response?.data?.detail || 'Error al cerrar el ticket')
    } finally {
      setClosingTicketId(null)
    }
  }

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-700'
      case 'asignado': return 'bg-blue-100 text-blue-700'
      case 'en_proceso': return 'bg-purple-100 text-purple-700'
      case 'completado': return 'bg-orange-100 text-orange-700'
      case 'validado': return 'bg-teal-100 text-teal-700'
      default: return 'bg-gray-100 text-gray-700'
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

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Header - Compact for mobile */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3">
          <h1 className="text-xl font-bold text-slate-800">
            Panel de Control
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Gestión de tickets de línea
          </p>
        </div>

        {/* Stats Summary - Compact cards */}
        <div className="grid grid-cols-3 gap-2 p-3">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-3 text-white shadow-sm">
            <p className="text-white/80 text-[10px] uppercase tracking-wide">Por validar</p>
            <p className="text-2xl font-bold mt-0.5">{pendingValidationTickets.length}</p>
          </div>
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-3 text-white shadow-sm">
            <p className="text-white/80 text-[10px] uppercase tracking-wide">Por cerrar</p>
            <p className="text-2xl font-bold mt-0.5">{validatedTickets.length}</p>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-3 text-white shadow-sm">
            <p className="text-white/80 text-[10px] uppercase tracking-wide">Activos</p>
            <p className="text-2xl font-bold mt-0.5">{activeTickets.length}</p>
          </div>
        </div>

        {/* PENDING VALIDATION SECTION */}
        <div className="px-3 mt-4">
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-base font-bold text-slate-800">
              Pendientes de Validación
            </h2>
            <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-xs font-semibold">
              {pendingValidationTickets.length}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-10 text-sm text-gray-500">Cargando...</div>
          ) : pendingValidationTickets.length > 0 ? (
            <div className="space-y-2">
              {pendingValidationTickets.map((ticket) => (
                <div key={ticket.id} className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm active:bg-gray-50 transition-colors">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold text-white ${getPriorityColor(ticket.prioridad_general)}`}>
                        {ticket.prioridad_general?.toUpperCase() || 'NORMAL'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getStatusBadgeColor(ticket.status)}`}>
                        {ticket.status === 'completado' ? 'completado' : ticket.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono">{ticket.ticket_number}</span>
                  </div>

                  {/* Content */}
                  <div className="mt-2">
                    <h3 className="text-sm font-bold text-slate-800 line-clamp-1">{ticket.titulo}</h3>
                    <p className="text-gray-500 text-xs mt-1 line-clamp-2">{ticket.descripcion}</p>
                  </div>

                  {/* Meta info */}
                  <div className="flex items-center justify-between mt-2 text-xs">
                    {ticket.assigned_mechanic && (
                      <span className="text-gray-600">
                        <span className="font-medium">👨‍🔧</span> {ticket.assigned_mechanic.split(' ')[0]}
                      </span>
                    )}
                    {ticket.resolution_minutes && (
                      <span className={`font-semibold text-xs ${ticket.resolution_minutes <= 7 ? 'text-green-600' : 'text-red-600'}`}>
                        ⏱️ {ticket.resolution_minutes} min
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => navigate(`/jefe-linea/${id}/validar/${ticket.id}`)}
                      className="flex-1 bg-green-500 active:bg-green-600 text-white py-2 rounded-lg text-xs font-medium transition-colors"
                    >
                      Validar
                    </button>
                    <button
                      onClick={() => navigate(`/jefe-linea/${id}/ticket/${ticket.id}`)}
                      className="flex-1 bg-gray-100 active:bg-gray-200 text-gray-700 py-2 rounded-lg text-xs font-medium transition-colors"
                    >
                      Detalle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
              <div className="text-3xl mb-1">✅</div>
              <p className="text-xs text-gray-500">No hay tickets pendientes</p>
            </div>
          )}
        </div>

        {/* VALIDATED TICKETS SECTION */}
        {validatedTickets.length > 0 && (
          <div className="px-3 mt-6">
            <div className="flex items-center justify-between mb-2 px-1">
              <h2 className="text-base font-bold text-slate-800">
                Para Cerrar
              </h2>
              <span className="bg-teal-100 text-teal-600 px-2 py-0.5 rounded-full text-xs font-semibold">
                {validatedTickets.length}
              </span>
            </div>

            <div className="space-y-2">
              {validatedTickets.map((ticket) => (
                <div key={ticket.id} className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold text-white ${getPriorityColor(ticket.prioridad_general)}`}>
                        {ticket.prioridad_general?.toUpperCase() || 'NORMAL'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-100 text-teal-700">
                        validado
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono">{ticket.ticket_number}</span>
                  </div>

                  <div className="mt-2">
                    <h3 className="text-sm font-bold text-slate-800 line-clamp-1">{ticket.titulo}</h3>
                    <p className="text-gray-500 text-xs mt-1 line-clamp-1">{ticket.descripcion}</p>
                  </div>

                  <div className="flex items-center justify-between mt-2 text-xs">
                    {ticket.assigned_mechanic && (
                      <span className="text-gray-600">
                        <span className="font-medium">👨‍🔧</span> {ticket.assigned_mechanic.split(' ')[0]}
                      </span>
                    )}
                    {ticket.resolution_minutes && (
                      <span className={`font-semibold text-xs ${ticket.resolution_minutes <= 7 ? 'text-green-600' : 'text-red-600'}`}>
                        ⏱️ {ticket.resolution_minutes} min
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleCloseTicket(ticket.id)}
                      disabled={closingTicketId === ticket.id}
                      className="flex-1 bg-teal-500 active:bg-teal-600 text-white py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:active:bg-teal-500"
                    >
                      {closingTicketId === ticket.id ? 'Cerrando...' : 'Cerrar'}
                    </button>
                    <button
                      onClick={() => navigate(`/jefe-linea/${id}/ticket/${ticket.id}`)}
                      className="flex-1 bg-gray-100 active:bg-gray-200 text-gray-700 py-2 rounded-lg text-xs font-medium transition-colors"
                    >
                      Detalle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACTIVE TICKETS SECTION */}
        <div className="px-3 mt-6">
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-base font-bold text-slate-800">
              Tickets Activos
            </h2>
            <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs font-semibold">
              {activeTickets.length}
            </span>
          </div>

          {activeTickets.length > 0 ? (
            <div className="space-y-2">
              {activeTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm active:bg-gray-50 transition-colors"
                  onClick={() => navigate(`/jefe-linea/${id}/ticket/${ticket.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold text-white ${getPriorityColor(ticket.prioridad_general)}`}>
                        {ticket.prioridad_general?.toUpperCase() || 'NORMAL'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getStatusBadgeColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400">{ticket.ubicacion || 'piso'}</span>
                  </div>

                  <div className="mt-2">
                    <h3 className="text-sm font-bold text-slate-800 line-clamp-1">{ticket.titulo}</h3>
                    <p className="text-gray-500 text-xs mt-1 line-clamp-2">{ticket.descripcion}</p>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    {ticket.assigned_mechanic && (
                      <span className="text-xs text-gray-600">
                        👨‍🔧 {ticket.assigned_mechanic.split(' ')[0]}
                      </span>
                    )}
                    <span className="text-[10px] text-gray-400 font-mono">{ticket.ticket_number}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
              <div className="text-3xl mb-1">📭</div>
              <p className="text-xs text-gray-500">Sin tickets activos</p>
            </div>
          )}
        </div>

        {/* CREATE TICKET BUTTON - Mobile optimized FAB */}
        <div className="fixed bottom-4 right-4">
          <button
            onClick={() => navigate(`/jefe-linea/${id}/nuevo-ticket`)}
            className="bg-orange-500 active:bg-orange-600 text-white w-14 h-14 rounded-full shadow-lg shadow-orange-200/50 font-semibold transition-all active:scale-95 flex items-center justify-center"
          >
            <span className="text-2xl">+</span>
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}