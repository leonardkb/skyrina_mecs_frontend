import { useEffect, useState } from 'react'
import axios from 'axios'
import JefeMecLayout from '../../components/layout/JefeMecLayout'

export default function DashboardMecPage() {

  const [completedTickets, setCompletedTickets] = useState([])
  const [validatedTickets, setValidatedTickets] = useState([])
  const [closedTickets, setClosedTickets] = useState([])
  const [tickets, setTickets] = useState([])
  const [mechanics, setMechanics] = useState([])
  const [mechanicLocations, setMechanicLocations] = useState({})
  const [stats, setStats] = useState({
    avgClosing: '0 min',
    activeTickets: 0,
    completedCount: 0,
    validatedCount: 0,
    closedCount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchTickets = async () => {
    try {
      const response = await axios.get(
        'http://localhost:8000/api/v1/jefe-mecanicos/tickets/pendientes'
      )
      console.log('Active tickets response:', response.data)
      const activeTickets = response.data.tickets || []
      setTickets(activeTickets)
      return activeTickets
    } catch (error) {
      console.log('Error fetching active tickets:', error)
      return []
    }
  }

  const fetchMechanics = async () => {
  try {
    const response = await axios.get('http://localhost:8000/api/v1/auth/users')
    console.log('Users response:', response.data)

    // Debug: Log all roles to see what you're getting
    if (response.data && response.data.users) {
      console.log('All user roles:', response.data.users.map(u => ({ 
        nombre: u.nombre, 
        role: u.role,
        roleType: typeof u.role 
      })))
    }

    // More flexible filtering - check for 'mecanico' in different formats
    const mechanicsList = (response.data.users || []).filter(user => {
      const roleValue = (user.role || '').toString().toLowerCase()
      return roleValue === 'mecanico' || roleValue === 'mecánico'
    })
    
    console.log('Filtered mechanics count:', mechanicsList.length)
    console.log('Filtered mechanics:', mechanicsList)

    if (mechanicsList.length === 0) {
      console.warn('No mechanics found - check your database')
      setMechanics([])
      return []
    }

    const mechanicsWithLoad = await Promise.all(
      mechanicsList.map(async (mechanic) => {
        try {
          const ticketsResponse = await axios.get(
            `http://localhost:8000/api/v1/jefe-mecanicos/tickets/mecanico/${mechanic.id}`
          )
          return {
            ...mechanic,
            tickets: ticketsResponse.data.tickets?.length || 0,
          }
        } catch (error) {
          console.log(`Error fetching tickets for ${mechanic.nombre}:`, error)
          return {
            ...mechanic,
            tickets: 0,
          }
        }
      })
    )
    
    setMechanics(mechanicsWithLoad)
    
    const locations = {}
    mechanicsWithLoad.forEach(mechanic => {
      locations[mechanic.id] = mechanic.current_location || 'piso'
    })
    setMechanicLocations(locations)
    
    return mechanicsWithLoad
    
  } catch (error) {
    console.error('Error fetching mechanics:', error)
    if (error.response) {
      console.error('Response status:', error.response.status)
      console.error('Response data:', error.response.data)
    }
    setMechanics([])
    return []
  }
}

  const fetchCompletedTickets = async () => {
    try {
      const response = await axios.get(
        'http://localhost:8000/api/v1/jefe-mecanicos/tickets/completados'
      )
      console.log('All completed/validated/closed tickets response:', response.data)
      const allTickets = response.data.tickets || []
      
      const completed = allTickets.filter(t => t.status === 'completado')
      const validated = allTickets.filter(t => t.status === 'validado')
      const closed = allTickets.filter(t => t.status === 'cerrado')
      
      setCompletedTickets(completed)
      setValidatedTickets(validated)
      setClosedTickets(closed)
      
      return { completed, validated, closed }
    } catch (error) {
      console.log('Error fetching completed tickets:', error)
      return { completed: [], validated: [], closed: [] }
    }
  }

  const fetchDashboard = async () => {
    setLoading(true)
    try {
      const [activeTickets, mechanicsData, ticketData] = await Promise.all([
        fetchTickets(),
        fetchMechanics(),
        fetchCompletedTickets()
      ])
      
      const activeCount = activeTickets.length || 0
      const completedCount = ticketData.completed?.length || 0
      const validatedCount = ticketData.validated?.length || 0
      const closedCount = ticketData.closed?.length || 0
      
      let totalMinutes = 0
      ticketData.completed?.forEach(ticket => {
        totalMinutes += ticket.resolution_minutes || 0
      })
      const avgMinutes = completedCount > 0 
        ? (totalMinutes / completedCount).toFixed(1) 
        : '0'
      
      console.log('Stats calculated:', {
        activeCount,
        completedCount,
        validatedCount,
        closedCount,
        avgMinutes
      })
      
      setStats({
        avgClosing: `${avgMinutes} min`,
        activeTickets: activeCount,
        completedCount: completedCount,
        validatedCount: validatedCount,
        closedCount: closedCount,
      })
      
    } catch (error) {
      console.log('Error in fetchDashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const assignTicket = async (ticketId) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'))
      
      const response = await axios.post(
        'http://localhost:8000/api/v1/jefe-mecanicos/tickets/asignar',
        null,
        {
          params: {
            ticket_id: ticketId,
            jefe_mecanicos_id: user.id,
          }
        }
      )
      
      alert(`Assigned to ${response.data.assigned_mechanic.nombre}`)
      fetchDashboard()
      
    } catch (error) {
      console.log(error)
      alert('Error assigning ticket')
    }
  }

  const reassignTicket = async (ticketId, mechanicId) => {
    if (!mechanicId) return
    
    try {
      const user = JSON.parse(localStorage.getItem('user'))
      
      await axios.post(
        'http://localhost:8000/api/v1/jefe-mecanicos/tickets/reasignar',
        null,
        {
          params: {
            ticket_id: ticketId,
            nuevo_mecanico_id: mechanicId,
            jefe_mecanicos_id: user.id,
          }
        }
      )
      
      alert('Ticket reassigned successfully')
      fetchDashboard()
      
    } catch (error) {
      console.log(error)
      alert('Error reassigning ticket')
    }
  }

  const changeMechanicLocation = async (mechanicId, location) => {
    try {
      await axios.post(
        'http://localhost:8000/api/v1/jefe-mecanicos/mecanicos/location',
        null,
        {
          params: {
            mecanico_id: mechanicId,
            location,
          }
        }
      )
      
      setMechanicLocations(prev => ({
        ...prev,
        [mechanicId]: location,
      }))
      
      alert('Location updated successfully')
      
    } catch (error) {
      console.log(error)
      alert('Error updating mechanic location')
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completado':
        return <span className="bg-yellow-100 text-yellow-700 text-xs px-1.5 py-0.5 rounded">Completado</span>
      case 'validado':
        return <span className="bg-teal-100 text-teal-700 text-xs px-1.5 py-0.5 rounded">Validado</span>
      case 'cerrado':
        return <span className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded">Cerrado</span>
      default:
        return <span className="bg-gray-100 text-gray-700 text-xs px-1.5 py-0.5 rounded">{status}</span>
    }
  }

  const TicketCard = ({ ticket }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
      <div className="flex items-center justify-between">
        {getStatusBadge(ticket.status)}
        <span className="text-xs text-gray-500">
          {ticket.resolution_minutes || 0} min
        </span>
      </div>

      <div className="mt-2">
        <h3 className="text-md font-bold text-slate-800 line-clamp-1">
          {ticket.titulo}
        </h3>
        <p className="text-gray-500 text-xs mt-1 line-clamp-2">
          {ticket.solution_description || ticket.descripcion}
        </p>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-gray-400">
          {ticket.mechanic_name || 'Unknown mechanic'}
        </p>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          ticket.delayed
            ? 'bg-red-100 text-red-600'
            : 'bg-green-100 text-green-600'
        }`}>
          {ticket.delayed ? 'Delayed' : 'On Time'}
        </span>
      </div>
    </div>
  )

  return (
    <JefeMecLayout>
      <div className="p-3 space-y-4">
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Dashboard Chief
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Supervision of mechanical equipment
          </p>
        </div>

        {/* STATS - Compact grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white border border-gray-200 rounded-xl p-3">
            <p className="text-gray-500 text-xs">Avg closing</p>
            <h2 className="text-xl font-bold text-green-500 mt-0.5">
              {stats.avgClosing}
            </h2>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-3">
            <p className="text-gray-500 text-xs">Active</p>
            <h2 className="text-xl font-bold text-orange-500 mt-0.5">
              {stats.activeTickets}
            </h2>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-3">
            <p className="text-gray-500 text-xs">Pending validation</p>
            <h2 className="text-xl font-bold text-yellow-500 mt-0.5">
              {stats.completedCount}
            </h2>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-3">
            <p className="text-gray-500 text-xs">Closed</p>
            <h2 className="text-xl font-bold text-blue-500 mt-0.5">
              {stats.validatedCount + stats.closedCount}
            </h2>
          </div>
        </div>

        {/* EQUIPMENT LOADING - Compact list */}
        <div className="bg-white border border-gray-200 rounded-xl p-3">
          <h2 className="text-md font-bold text-slate-800 mb-2">
            Mechanics ({mechanics.length})
          </h2>
          <div className="space-y-2">
            {mechanics.length > 0 ? (
              mechanics.map(mechanic => (
                <div
                  key={mechanic.id}
                  className="border border-gray-200 rounded-lg p-2 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 text-sm">
                      {mechanic.nombre}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {mechanic.tickets} active tickets
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 hidden sm:inline">Location</span>
                    <select
                      value={mechanicLocations[mechanic.id] || 'piso'}
                      onChange={(e) => changeMechanicLocation(mechanic.id, e.target.value)}
                      className="border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-orange-400"
                    >
                      <option value="piso">Piso</option>
                      <option value="taller">Taller</option>
                    </select>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500 text-sm">
                No mechanics found
              </div>
            )}
          </div>
        </div>

        {/* ACTIVE TICKETS SECTION */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-md font-bold text-slate-800">
              Active Tickets ({tickets.length})
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-10 text-sm">Loading...</div>
          ) : tickets.length > 0 ? (
            <div className="space-y-2">
              {tickets.map(ticket => (
                <div key={ticket.id} className="bg-white border border-gray-200 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full text-white ${
                        ticket.prioridad_general === 'urgente' ? 'bg-red-500' :
                        ticket.prioridad_general === 'alta' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}>
                        {ticket.prioridad_general || 'normal'}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full text-white ${
                        ticket.status === 'en_proceso' ? 'bg-blue-500' :
                        ticket.status === 'asignado' ? 'bg-purple-500' : 'bg-gray-500'
                      }`}>
                        {ticket.status || 'pendiente'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{ticket.ubicacion || 'piso'}</span>
                  </div>

                  <div className="mt-2">
                    <h3 className="text-md font-bold text-slate-800 line-clamp-1">
                      {ticket.titulo}
                    </h3>
                    <p className="text-gray-500 text-xs mt-1 line-clamp-2">
                      {ticket.descripcion}
                    </p>
                    <p className="text-xs text-orange-500 mt-1 font-medium">
                      Mechanic: {ticket.assigned_mechanic_name || 'Unassigned'}
                    </p>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-500">{ticket.ticket_number}</span>
                    
                    {!ticket.assigned_to ? (
                      <button
                        onClick={() => assignTicket(ticket.id)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition"
                      >
                        Assign
                      </button>
                    ) : (
                      <select
                        onChange={(e) => reassignTicket(ticket.id, e.target.value)}
                        className="border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-orange-400"
                        defaultValue=""
                      >
                        <option value="" disabled>Reassign</option>
                        {mechanics.map(mechanic => (
                          <option key={mechanic.id} value={mechanic.id}>
                            {mechanic.nombre}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <div className="text-3xl mb-1">✅</div>
              <p className="text-sm font-medium text-slate-800">No active tickets</p>
            </div>
          )}
        </div>

        {/* COMPLETED TICKETS SECTION */}
        {completedTickets.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-md font-bold text-slate-800">
                Pending Validation
              </h2>
              <span className="bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full text-xs font-semibold">
                {completedTickets.length}
              </span>
            </div>
            <div className="space-y-2">
              {completedTickets.map(ticket => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          </div>
        )}

        {/* VALIDATED TICKETS SECTION */}
        {validatedTickets.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-md font-bold text-slate-800">
                Validated
              </h2>
              <span className="bg-teal-100 text-teal-600 px-2 py-0.5 rounded-full text-xs font-semibold">
                {validatedTickets.length}
              </span>
            </div>
            <div className="space-y-2">
              {validatedTickets.map(ticket => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          </div>
        )}

        {/* CLOSED TICKETS SECTION */}
        {closedTickets.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-md font-bold text-slate-800">
                Closed
              </h2>
              <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-xs font-semibold">
                {closedTickets.length}
              </span>
            </div>
            <div className="space-y-2">
              {closedTickets.map(ticket => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          </div>
        )}

        {/* No tickets message */}
        {!loading && completedTickets.length === 0 && validatedTickets.length === 0 && closedTickets.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="text-3xl mb-1">📭</div>
            <p className="text-sm font-medium text-slate-800">No completed tickets</p>
          </div>
        )}
      </div>
    </JefeMecLayout>
  )
}