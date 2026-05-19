import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function ValidarTicketPage() {
  const { id, ticketId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [ticket, setTicket] = useState(null)
  const [comentario, setComentario] = useState('')
  const [photos, setPhotos] = useState([])
  const [photoPreviews, setPhotoPreviews] = useState([])
  const [validating, setValidating] = useState(false)

  useEffect(() => {
    if (ticketId) {
      fetchTicket()
    }
  }, [ticketId])

  const fetchTicket = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/v1/tickets/${ticketId}`
      )
      console.log('Ticket for validation:', response.data)
      setTicket(response.data.ticket)
    } catch (error) {
      console.error('Error fetching ticket:', error)
      alert('Error loading ticket')
      navigate(`/jefe-linea/${id}`)
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files)
    if (photos.length + files.length > 3) {
      alert('Máximo 3 fotos')
      return
    }
    
    // Store actual files for upload
    setPhotos([...photos, ...files])
    
    // Create preview URLs for display
    const newPreviews = files.map(file => URL.createObjectURL(file))
    setPhotoPreviews([...photoPreviews, ...newPreviews])
  }

  const removePhoto = (index) => {
    // Remove from actual files
    const updatedPhotos = [...photos]
    updatedPhotos.splice(index, 1)
    setPhotos(updatedPhotos)
    
    // Remove preview URL
    const updatedPreviews = [...photoPreviews]
    URL.revokeObjectURL(updatedPreviews[index]) // Clean up to avoid memory leaks
    updatedPreviews.splice(index, 1)
    setPhotoPreviews(updatedPreviews)
  }

  const handleValidate = async () => {
    setValidating(true)
    try {
      const user = JSON.parse(localStorage.getItem('user'))
      
      const formData = new FormData()
      formData.append('validado_por', user.id)
      formData.append('comentario', comentario || 'Validado correctamente')
      
      // Append all photos to formData
      for (let i = 0; i < photos.length; i++) {
        formData.append('photos', photos[i])
      }

      const response = await axios.post(
        `http://localhost:8000/api/v1/tickets/${ticketId}/validate`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      )

      if (response.data.success) {
        alert(`✅ Ticket validado correctamente. ${response.data.photos_saved} fotos guardadas.`)
        navigate(`/jefe-linea/${id}`)
      }
    } catch (error) {
      console.error('Error validating ticket:', error)
      alert(error.response?.data?.detail || 'Error al validar el ticket')
    } finally {
      setValidating(false)
    }
  }

  const handleClose = async () => {
    setValidating(true)
    try {
      const user = JSON.parse(localStorage.getItem('user'))
      
      const formData = new FormData()
      formData.append('closed_by', user.id)
      formData.append('comentario', comentario || 'Ticket cerrado')
      
      // Also save photos when closing
      for (let i = 0; i < photos.length; i++) {
        formData.append('photos', photos[i])
      }

      const response = await axios.post(
        `http://localhost:8000/api/v1/tickets/${ticketId}/close`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      )

      if (response.data.success) {
        alert('✅ Ticket cerrado correctamente')
        navigate(`/jefe-linea/${id}`)
      }
    } catch (error) {
      console.error('Error closing ticket:', error)
      alert(error.response?.data?.detail || 'Error al cerrar el ticket')
    } finally {
      setValidating(false)
    }
  }

  // Cleanup preview URLs on component unmount
  useEffect(() => {
    return () => {
      photoPreviews.forEach(preview => URL.revokeObjectURL(preview))
    }
  }, [photoPreviews])

  const getPriorityColor = () => {
    switch (ticket?.prioridad_general) {
      case 'critica': return 'bg-red-500'
      case 'alta': return 'bg-yellow-500'
      case 'normal': return 'bg-green-500'
      default: return 'bg-blue-500'
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Cargando ticket...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (!ticket) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">Ticket no encontrado</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Validar Ticket
          </h1>
          <p className="text-gray-500 mt-2">
            Revisar y validar el trabajo del mecánico
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Card */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
              {/* Badges */}
              <div className="flex flex-wrap gap-3 mb-6">
                <div className={`px-4 py-2 rounded-full text-white text-sm font-semibold ${getPriorityColor()}`}>
                  {ticket.prioridad_general?.toUpperCase() || 'NORMAL'}
                </div>
                <div className="px-4 py-2 rounded-full bg-blue-500 text-white text-sm font-semibold">
                  {ticket.tipo === 'cambio_estilo' ? 'CAMBIO DE ESTILO' : 'FALLA DE EQUIPO'}
                </div>
                <div className="px-4 py-2 rounded-full bg-orange-500 text-white text-sm font-semibold">
                  {ticket.status?.toUpperCase() || 'COMPLETADO'}
                </div>
              </div>

              <h2 className="text-2xl font-bold text-slate-800">{ticket.titulo}</h2>
              <p className="text-gray-500 mt-2">{ticket.ticket_number}</p>

              {/* Machine Details */}
              <div className="mt-4 p-4 bg-gray-50 rounded-2xl">
                {ticket.tipo === 'cambio_estilo' ? (
                  <>
                    <p><strong>Estilo Origen:</strong> {ticket.estilo_actual || 'N/A'}</p>
                    <p><strong>Nuevo Estilo:</strong> {ticket.nuevo_estilo || 'N/A'}</p>
                  </>
                ) : (
                  <>
                    <p><strong>Máquina:</strong> {ticket.maquina_nombre || 'N/A'}</p>
                    <p><strong>Código:</strong> {ticket.maquina_codigo || 'N/A'}</p>
                  </>
                )}
                <p><strong>Ubicación:</strong> {ticket.ubicacion || 'piso'}</p>
              </div>

              <div className="border-t my-6"></div>

              {/* Info Rows */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Tiempo de Resolución</span>
                  <span className={`font-bold ${ticket.resolution_minutes <= 7 ? 'text-green-500' : 'text-red-500'}`}>
                    {ticket.resolution_minutes || 0} minutos
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Estado</span>
                  <span className="font-semibold text-orange-500">ESPERANDO VALIDACIÓN</span>
                </div>
              </div>

              <div className="border-t my-6"></div>

              {/* Mechanic Solution */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">
                  Solución del Mecánico
                </h3>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-gray-600">
                  “{ticket.solution_description || 'No se proporcionó descripción'}”
                </div>
              </div>
            </div>

            {/* Validation Card */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
              <h2 className="text-xl font-bold text-slate-800 mb-6">
                Validación
              </h2>

              {/* Observations */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Comentarios de Validación
                </label>
                <textarea
                  rows="4"
                  placeholder="Agregar comentarios sobre la validación..."
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  className="w-full border border-gray-300 rounded-2xl px-4 py-3 outline-none resize-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              {/* Photos for Validation */}
              <div className="mt-8">
                <label className="block text-sm font-semibold text-slate-700 mb-4">
                  Fotos de Validación ({photos.length}/3)
                </label>
                <div className="flex flex-wrap gap-4">
                  {photos.length < 3 && (
                    <label className="w-28 h-28 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 transition">
                      <span className="text-3xl text-gray-400">+</span>
                      <span className="text-sm text-gray-500">Agregar</span>
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handlePhotoUpload} 
                      />
                    </label>
                  )}
                  {photoPreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={preview} 
                        alt={`Validation photo ${index + 1}`} 
                        className="w-28 h-28 rounded-2xl object-cover border" 
                      />
                      <button 
                        type="button" 
                        onClick={() => removePhoto(index)} 
                        className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-500 text-white text-sm hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  * Puedes tomar fotos de la máquina reparada como evidencia
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mt-10">
                <button
                  onClick={handleValidate}
                  disabled={validating}
                  className="flex-1 min-w-[180px] bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl font-semibold transition shadow-lg shadow-green-200 disabled:bg-gray-400"
                >
                  {validating ? 'Procesando...' : '✓ Validar Ticket'}
                </button>
                <button
                  onClick={handleClose}
                  disabled={validating}
                  className="flex-1 min-w-[180px] bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-2xl font-semibold transition shadow-lg shadow-blue-200 disabled:bg-gray-400"
                >
                  {validating ? 'Procesando...' : '✓ Cerrar Ticket'}
                </button>
              </div>
            </div>
          </div>

          {/* Right KPI Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Información del Ticket</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Línea</p>
                  <p className="font-semibold">{ticket.linea_numero ? `Línea ${ticket.linea_numero}` : ticket.linea_id ? `ID: ${ticket.linea_id.slice(0, 8)}...` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Prioridad</p>
                  <p className={`font-semibold ${ticket.prioridad_general === 'critica' ? 'text-red-600' : ticket.prioridad_general === 'alta' ? 'text-yellow-600' : 'text-green-600'}`}>
                    {ticket.prioridad_general?.toUpperCase() || 'NORMAL'}
                  </p>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500">Meta KPI</p>
                  <p className="font-bold text-green-600">≤ 7 minutos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}