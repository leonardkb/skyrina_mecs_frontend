import {
  useEffect,
  useState
} from 'react'

import {
  useParams,
  useNavigate
} from 'react-router-dom'

import axios from 'axios'

import MecanicoLayout
from '../../components/layout/MecanicoLayout'

export default function TicketDetailPage() {

  const { id } = useParams()
  const navigate = useNavigate()

  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const [solutionDescription, setSolutionDescription] = useState('')
  const [completing, setCompleting] = useState(false)

  // =====================================
  // FETCH TICKET
  // =====================================
  useEffect(() => {
    fetchTicket()
  }, [id])

  // =====================================
  // TIMER
  // =====================================
  useEffect(() => {
    let interval = null
    if (running && ticket?.status !== 'completado' && ticket?.status !== 'validado' && ticket?.status !== 'cerrado') {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [running, ticket?.status])

  // =====================================
  // FETCH TICKET DETAILS
  // =====================================
  const fetchTicket = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/v1/tickets/${id}`
      )
      console.log('Ticket details:', response.data)

      const fetchedTicket = response.data.ticket

      if (fetchedTicket.status === 'completado' || fetchedTicket.status === 'validado' || fetchedTicket.status === 'cerrado') {
        setTicket(fetchedTicket)
        setRunning(false)
        setLoading(false)
        return
      }

      setTicket(fetchedTicket)
      await startTicket(fetchedTicket)
      
    } catch (error) {
      console.log('Error fetching ticket:', error)
      if (error.response?.status === 404) {
        alert('Ticket not found')
        navigate('/mecanico')
      }
    } finally {
      setLoading(false)
    }
  }

  // =====================================
  // START TIMER
  // =====================================
  const startTicket = async (ticketData) => {
    try {
      console.log('Starting ticket timer for ticket:', id)
      
      if (ticketData.status === 'completado' || ticketData.status === 'validado' || ticketData.status === 'cerrado') {
        console.log('Ticket already finished, not starting timer')
        return
      }

      const response = await axios.post(
        `http://localhost:8000/api/v1/mecanico/ticket/start/${id}`
      )
      
      console.log('Start ticket response:', response.data)
      setRunning(true)
      
      if (ticketData.started_at) {
        const startTime = new Date(ticketData.started_at)
        const now = new Date()
        const elapsedSeconds = Math.floor((now - startTime) / 1000)
        console.log('Elapsed seconds from existing start time:', elapsedSeconds)
        setSeconds(elapsedSeconds)
      } else {
        console.log('Timer started from 0')
        setSeconds(0)
      }
      
    } catch (error) {
      console.log('Error starting ticket:', error)
      if (error.response?.status === 403) {
        alert('This ticket is already completed')
        navigate('/mecanico')
      }
    }
  }

  // =====================================
  // COMPLETE TICKET
  // =====================================
  const completeTicket = async () => {
    if (!solutionDescription.trim()) {
      alert('Please provide a solution description before completing the ticket')
      return
    }

    setCompleting(true)
    
    try {
      const response = await axios.post(
        `http://localhost:8000/api/v1/mecanico/ticket/complete/${id}`,
        {
          solution_description: solutionDescription
        }
      )

      console.log('Complete ticket response:', response.data)

      const minutes = response.data.minutes || 0
      const isDelayed = response.data.delayed || false

      const message = isDelayed
        ? `⚠️ Ticket completed in ${minutes} minutes (Delayed - exceeded 7 minute target)`
        : `✅ Ticket completed in ${minutes} minutes (On time!)`

      alert(message)
      navigate('/mecanico')
      
    } catch (error) {
      console.log('Error completing ticket:', error)
      console.log('Error response:', error.response?.data)
      
      if (error.response?.status === 403) {
        alert('This ticket has already been completed')
        navigate('/mecanico')
      } else if (error.response?.status === 404) {
        alert('Ticket not found')
        navigate('/mecanico')
      } else {
        alert(`Error completing ticket: ${error.response?.data?.detail || 'Unknown error'}`)
      }
    } finally {
      setCompleting(false)
    }
  }

  // =====================================
  // FORMAT TIME
  // =====================================
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // =====================================
  // CHECK IF TICKET IS FINISHED
  // =====================================
  const isFinished = ticket?.status === 'completado' || ticket?.status === 'validado' || ticket?.status === 'cerrado'
  
  // =====================================
  // CHECK IF TICKET IS CAMBIO ESTILO
  // =====================================
  const isCambioEstilo = ticket?.tipo === 'cambio_estilo'

  // =====================================
  // GET DISPLAY LINEA
  // =====================================
  const getDisplayLinea = () => {
    if (ticket?.linea_numero) {
      return `Línea ${ticket.linea_numero}`
    }
    if (ticket?.linea_nombre) {
      return ticket.linea_nombre
    }
    if (ticket?.linea_id) {
      const shortId = ticket.linea_id.split('-').pop().slice(0, 4).toUpperCase()
      return `Línea ${shortId}`
    }
    return ticket?.area || ticket?.linea || 'N/A'
  }

  // =====================================
  // GET STATUS MESSAGE
  // =====================================
  const getStatusMessage = () => {
    switch (ticket?.status) {
      case 'completado':
        return { 
          title: 'Ticket Completed', 
          message: 'This ticket has been completed and is waiting for validation by the line supervisor.', 
          color: 'purple',
          icon: '⏳'
        }
      case 'validado':
        return { 
          title: 'Ticket Validated', 
          message: 'This ticket has been validated and is waiting to be closed.', 
          color: 'teal',
          icon: '✓✓'
        }
      case 'cerrado':
        return { 
          title: 'Ticket Closed', 
          message: 'This ticket has been closed. No further action is required.', 
          color: 'green',
          icon: '🔒'
        }
      default:
        return { 
          title: 'Ticket Completed', 
          message: 'This ticket has been marked as completed', 
          color: 'green',
          icon: '✅'
        }
    }
  }

  // =====================================
  // LOADING
  // =====================================
  if (loading) {
    return (
      <MecanicoLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500 text-sm">Loading ticket...</div>
        </div>
      </MecanicoLayout>
    )
  }

  // =====================================
  // NO TICKET
  // =====================================
  if (!ticket) {
    return (
      <MecanicoLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500 text-sm">Ticket not found</div>
        </div>
      </MecanicoLayout>
    )
  }

  // =====================================
  // FINISHED TICKET VIEW (completado/validado/cerrado)
  // =====================================
  if (isFinished) {
    const statusInfo = getStatusMessage()
    const bgColorClass = statusInfo.color === 'purple' ? 'bg-purple-50' :
                         statusInfo.color === 'teal' ? 'bg-teal-50' :
                         'bg-green-50'
    const textColorClass = statusInfo.color === 'purple' ? 'text-purple-700' :
                           statusInfo.color === 'teal' ? 'text-teal-700' :
                           'text-green-700'
    
    return (
      <MecanicoLayout>
        <div className="min-h-screen bg-gray-100">
          {/* Sticky Header */}
          <div className="sticky top-0 z-10 bg-gray-100 border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-semibold text-slate-800 truncate">
                  {ticket.titulo}
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  {ticket.ticket_number}
                </p>
              </div>
              <button
                onClick={() => navigate('/mecanico')}
                className="bg-gray-200 active:bg-gray-300 px-4 py-2 rounded-xl text-sm font-medium transition"
              >
                Back
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* STATUS BANNER */}
            <div className={`rounded-xl p-4 text-center ${bgColorClass}`}>
              <div className="text-3xl mb-1">
                {statusInfo.icon}
              </div>
              <h2 className={`font-semibold ${textColorClass}`}>
                {statusInfo.title}
              </h2>
              <p className={`text-xs ${textColorClass} mt-1 opacity-80`}>
                {statusInfo.message}
              </p>
              {ticket.resolution_minutes && (
                <p className={`text-xs ${textColorClass} mt-2 font-medium`}>
                  Resolution: {ticket.resolution_minutes} min
                  {ticket.delayed ? ' ⚠️ Delayed' : ' ✅ On time'}
                </p>
              )}
            </div>

            {/* TICKET INFO */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-slate-800">Description</h2>
                <p className="text-xs text-gray-600 mt-1">{ticket.descripcion}</p>
              </div>

              {ticket.solution_description && (
                <div className="px-4 py-3">
                  <h2 className="text-sm font-semibold text-slate-800">Solution</h2>
                  <p className="text-xs text-gray-600 mt-1">{ticket.solution_description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </MecanicoLayout>
    )
  }

  // =====================================
  // ACTIVE TICKET VIEW
  // =====================================
  const minutesElapsed = Math.floor(seconds / 60)
  const isDelayedWarning = minutesElapsed > 7

  return (
    <MecanicoLayout>
      <div className="min-h-screen bg-gray-100 pb-4">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-gray-100 border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold text-slate-800 truncate">
                  {ticket.titulo}
                </h1>
                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                  isCambioEstilo 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {isCambioEstilo ? 'Style Change' : 'Breakdown'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {ticket.ticket_number}
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-200 active:bg-gray-300 px-3 py-1.5 rounded-xl text-sm font-medium transition"
            >
              Back
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* TIMER */}
          <div className={`rounded-xl p-4 ${
            isDelayedWarning 
              ? 'bg-red-50' 
              : 'bg-orange-50'
          }`}>
            <div className="flex items-center justify-between">
              <h2 className={`font-semibold text-sm ${
                isDelayedWarning ? 'text-red-600' : 'text-orange-600'
              }`}>
                Resolution Timer
              </h2>
              <span className={`text-xs ${isDelayedWarning ? 'text-red-500' : 'text-orange-500'}`}>
                Target: 7 min
              </span>
            </div>
            <p className={`text-3xl font-bold mt-2 ${
              isDelayedWarning ? 'text-red-500' : 'text-orange-500'
            }`}>
              {formatTime(seconds)}
            </p>
            {isDelayedWarning && (
              <div className="mt-2 text-xs text-red-600 bg-red-100 px-2 py-1 rounded-lg">
                ⚠️ Exceeding target - will be marked as Delayed
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <h2 className="text-sm font-semibold text-slate-800">Description</h2>
            <p className="text-xs text-gray-600 mt-1">{ticket.descripcion}</p>
          </div>

          {/* Details Grid - Compact 2 columns */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-2 divide-x divide-gray-100">
              {isCambioEstilo ? (
                <>
                  <div className="p-3">
                    <p className="text-xs text-gray-400">Line</p>
                    <p className="text-sm font-medium text-slate-700 mt-0.5">{getDisplayLinea()}</p>
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-gray-400">Origin Style</p>
                    <p className="text-sm font-medium text-slate-700 mt-0.5 truncate">{ticket.estilo_actual || 'N/A'}</p>
                  </div>
                  <div className="p-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400">New Style</p>
                    <p className="text-sm font-medium text-slate-700 mt-0.5 truncate">{ticket.nuevo_estilo || 'N/A'}</p>
                  </div>
                  <div className="p-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400">Priority</p>
                    <p className={`text-sm font-medium mt-0.5 ${
                      ticket.prioridad_general === 'critica' ? 'text-red-600' : 
                      ticket.prioridad_general === 'alta' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {ticket.prioridad_general?.toUpperCase() || 'NORMAL'}
                    </p>
                  </div>
                  <div className="p-3 border-t border-gray-100 col-span-2">
                    <p className="text-xs text-gray-400">Location</p>
                    <p className="text-sm font-medium text-slate-700 mt-0.5">{ticket.ubicacion || 'piso'}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3">
                    <p className="text-xs text-gray-400">Line</p>
                    <p className="text-sm font-medium text-slate-700 mt-0.5">{getDisplayLinea()}</p>
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-gray-400">Machine</p>
                    <p className="text-sm font-medium text-slate-700 mt-0.5 truncate">{ticket.maquina_nombre || 'N/A'}</p>
                  </div>
                  <div className="p-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400">Machine Code</p>
                    <p className="text-sm font-medium text-slate-700 mt-0.5 truncate">{ticket.maquina_codigo || 'N/A'}</p>
                  </div>
                  <div className="p-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400">Priority</p>
                    <p className={`text-sm font-medium mt-0.5 ${
                      ticket.prioridad_general === 'critica' ? 'text-red-600' : 
                      ticket.prioridad_general === 'alta' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {ticket.prioridad_general?.toUpperCase() || 'NORMAL'}
                    </p>
                  </div>
                  <div className="p-3 border-t border-gray-100 col-span-2">
                    <p className="text-xs text-gray-400">Location</p>
                    <p className="text-sm font-medium text-slate-700 mt-0.5">{ticket.ubicacion || 'piso'}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Solution Protocol - Collapsible style */}
          <div className="bg-blue-50 rounded-xl p-3">
            <h2 className="text-sm font-semibold text-blue-700">📋 Solution Protocol</h2>
            <div className="text-xs text-blue-600 mt-1 space-y-0.5">
              {isCambioEstilo ? (
                <>
                  <p>• Verify new style specifications</p>
                  <p>• Check machine configuration</p>
                  <p>• Validate fabric compatibility</p>
                  <p>• Test first unit for quality</p>
                  <p>• Adjust settings as needed</p>
                  <p>• Confirm completion with supervisor</p>
                </>
              ) : (
                <>
                  <p>• Verify machine calibration</p>
                  <p>• Inspect electrical response</p>
                  <p>• Validate needle alignment</p>
                  <p>• Test operational behavior</p>
                  <p>• Confirm safety before closing</p>
                </>
              )}
            </div>
          </div>

          {/* Photo - Only for Falla Equipo */}
          {!isCambioEstilo && ticket.image_url && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <img 
                src={`http://localhost:8000/api/v1/${ticket.image_url}`} 
                alt="machine" 
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          {/* Solution Description */}
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <h2 className="text-sm font-semibold text-slate-800">
              Solution Description <span className="text-red-500">*</span>
            </h2>
            <textarea
              value={solutionDescription}
              onChange={(e) => setSolutionDescription(e.target.value)}
              placeholder={isCambioEstilo ? "Describe how you completed the style change..." : "Describe how you solved the machine issue..."}
              className="w-full border border-gray-200 rounded-lg p-3 h-28 text-sm mt-2 resize-none focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
            <p className="text-xs text-gray-400 mt-1">* Required before completing</p>
          </div>

          {/* Action Buttons - Fixed bottom on mobile */}
          <div className="flex gap-3 pt-2">
            <button 
              onClick={() => navigate('/mecanico')} 
              className="flex-1 bg-gray-200 active:bg-gray-300 text-gray-700 py-3 rounded-xl text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              onClick={completeTicket}
              disabled={completing || !solutionDescription.trim()}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition ${
                completing || !solutionDescription.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : minutesElapsed > 7 
                    ? 'bg-red-500 active:bg-red-600 text-white'
                    : 'bg-green-500 active:bg-green-600 text-white'
              }`}
            >
              {completing ? 'Completing...' : minutesElapsed > 7 ? 'Complete (Delayed)' : 'Complete'}
            </button>
          </div>
        </div>
      </div>
    </MecanicoLayout>
  )
}