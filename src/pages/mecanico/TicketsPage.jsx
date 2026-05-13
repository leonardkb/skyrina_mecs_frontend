import { useEffect, useState } from 'react'
import MecanicoLayout from '../../components/layout/MecanicoLayout'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function TicketsPage() {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [mechanic, setMechanic] = useState(null)

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'))
      setMechanic(user)
      const response = await axios.get(
        `http://localhost:8000/mecanico/tickets/${user.id}`
      )
      console.log(response.data)
      setTickets(response.data.tickets || [])
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-700'
      case 'asignado':
        return 'bg-blue-100 text-blue-700'
      case 'en_proceso':
        return 'bg-orange-100 text-orange-700'
      case 'completado':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pendiente': return 'Pending'
      case 'asignado': return 'Assigned'
      case 'en_proceso': return 'In Progress'
      case 'completado': return 'Completed'
      default: return status
    }
  }

  return (
    <MecanicoLayout>
      <div className="min-h-screen bg-gray-100">
        {/* HEADER - Compact */}
        <div className="sticky top-0 z-10 bg-gray-100 border-b border-gray-200 px-4 py-3">
          <h1 className="text-2xl font-bold text-slate-800">
            My Tickets
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {mechanic?.nombre}
          </p>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500 text-sm">Loading tickets...</div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {tickets.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-12">
                No tickets assigned
              </div>
            ) : (
              tickets.map(ticket => (
                <div
                  key={ticket.id}
                  onClick={() => {
                    if (ticket.status !== 'completado') {
                      navigate(`/mecanico/ticket/${ticket.id}`)
                    }
                  }}
                  className={`
                    bg-white px-4 py-3 active:bg-gray-50 transition-colors
                    ${ticket.status !== 'completado' ? 'cursor-pointer' : 'opacity-60'}
                  `}
                >
                  {/* Top Row - Status & Location */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`
                      text-xs px-2 py-0.5 rounded-full font-medium
                      ${getStatusColor(ticket.status)}
                    `}>
                      {getStatusText(ticket.status)}
                    </span>
                    <span className="text-xs text-gray-400">
                      #{ticket.ticket_number}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-base font-semibold text-slate-800 mb-1 line-clamp-1">
                    {ticket.titulo}
                  </h2>

                  {/* Description - Only 2 lines */}
                  <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                    {ticket.descripcion}
                  </p>

                  {/* Machine Info - Compact horizontal layout */}
                  <div className="flex items-center gap-3 text-xs mb-2">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400">📍</span>
                      <span className="text-gray-600">{ticket.ubicacion || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400">🔧</span>
                      <span className="text-gray-600">{ticket.maquina_nombre || 'N/A'}</span>
                    </div>
                    {ticket.area && (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400">🏭</span>
                        <span className="text-gray-600">{ticket.area}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Indicator - Only if not completed */}
                  {ticket.status !== 'completado' && (
                    <div className="flex justify-end mt-1">
                      <span className="text-xs text-orange-500 flex items-center gap-0.5">
                        Tap to open →
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </MecanicoLayout>
  )
}