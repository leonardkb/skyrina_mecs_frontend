import { useState, useEffect } from 'react'
import JefeMecLayout from '../../components/layout/JefeMecLayout'

// Direct API configuration
const API_BASE_URL = 'http://localhost:8000' // Change this to your backend URL

// Helper function for API calls
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token')
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  })
  
  const data = await response.json()
  
  if (!response.ok) {
    // Better error message
    const errorMessage = data.detail || JSON.stringify(data) || 'Error en la petición'
    throw new Error(errorMessage)
  }
  
  return data
}

export default function ProtocolosPage() {
  const [protocolos, setProtocolos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingProtocol, setEditingProtocol] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [newProtocol, setNewProtocol] = useState({
    nombre: '',
    pasos: [''],
  })

  // Fetch protocols on component mount
  useEffect(() => {
    fetchProtocols()
  }, [])

  const fetchProtocols = async () => {
    try {
      setLoading(true)
      const data = await apiRequest('/jefe-mecanicos/protocolos')
      if (data.success) {
        setProtocolos(data.protocols)
      }
    } catch (err) {
      console.error('Error fetching protocols:', err)
      setError('Error al cargar los protocolos: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const addStep = () => {
    setNewProtocol({
      ...newProtocol,
      pasos: [...newProtocol.pasos, ''],
    })
  }

  const updateStep = (index, value) => {
    const updated = [...newProtocol.pasos]
    updated[index] = value
    setNewProtocol({
      ...newProtocol,
      pasos: updated,
    })
  }

  const removeStep = (index) => {
    setNewProtocol({
      ...newProtocol,
      pasos: newProtocol.pasos.filter((_, i) => i !== index),
    })
  }

  const saveProtocol = async () => {
    // Validate
    if (!newProtocol.nombre.trim()) {
      alert('Por favor ingresa un nombre para el protocolo')
      return
    }

    const validSteps = newProtocol.pasos.filter(step => step.trim())
    if (validSteps.length === 0) {
      alert('Por favor ingresa al menos un paso')
      return
    }

    try {
      let data
      if (editingProtocol) {
        // Update existing protocol
        data = await apiRequest(`/jefe-mecanicos/protocolos/${editingProtocol.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            nombre: newProtocol.nombre,
            pasos: validSteps,
          }),
        })
      } else {
        // Create new protocol
        console.log('Sending protocol data:', {
          nombre: newProtocol.nombre,
          pasos: validSteps,
        })
        
        data = await apiRequest('/jefe-mecanicos/protocolos', {
          method: 'POST',
          body: JSON.stringify({
            nombre: newProtocol.nombre,
            pasos: validSteps,
          }),
        })
      }

      if (data.success) {
        await fetchProtocols() // Refresh list
        resetModal()
      }
    } catch (err) {
      console.error('Error saving protocol:', err)
      alert('Error al guardar el protocolo: ' + err.message)
    }
  }

  const resetModal = () => {
    setShowModal(false)
    setEditingProtocol(null)
    setNewProtocol({
      nombre: '',
      pasos: [''],
    })
  }

  const editProtocol = (protocol) => {
    setEditingProtocol(protocol)
    setNewProtocol({
      nombre: protocol.nombre,
      pasos: [...protocol.pasos],
    })
    setShowModal(true)
  }

  const confirmDelete = (protocolId) => {
    setDeletingId(protocolId)
    setShowDeleteConfirm(true)
  }

  const deleteProtocol = async () => {
    try {
      const data = await apiRequest(`/jefe-mecanicos/protocolos/${deletingId}`, {
        method: 'DELETE',
      })
      if (data.success) {
        await fetchProtocols() // Refresh list
        setShowDeleteConfirm(false)
        setDeletingId(null)
      }
    } catch (err) {
      console.error('Error deleting protocol:', err)
      alert('Error al eliminar el protocolo: ' + err.message)
    }
  }

  if (loading) {
    return (
      <JefeMecLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Cargando protocolos...</div>
        </div>
      </JefeMecLayout>
    )
  }

  return (
    <JefeMecLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Protocolos
            </h1>
            <p className="text-gray-500 mt-2">
              Checklists obligatorios para mecánicos
            </p>
          </div>

          <button
            onClick={() => {
              setEditingProtocol(null)
              setNewProtocol({ nombre: '', pasos: [''] })
              setShowModal(true)
            }}
            className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-orange-600 transition"
          >
            + Nuevo
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Protocol Cards */}
        {protocolos.length === 0 ? (
          <div className="bg-white rounded-3xl border p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No hay protocolos</h3>
            <p className="text-gray-500 mb-6">Crea tu primer protocolo de mantenimiento</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-orange-500 text-white px-6 py-2 rounded-2xl font-semibold hover:bg-orange-600 transition"
            >
              + Crear Protocolo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {protocolos.map((protocol) => (
              <div
                key={protocol.id}
                className="bg-white rounded-3xl border p-6 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-yellow-100 flex items-center justify-center text-2xl">
                      📋
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">
                        {protocol.nombre}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {protocol.pasos.length} {protocol.pasos.length === 1 ? 'paso' : 'pasos'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editProtocol(protocol)}
                      className="text-blue-500 hover:text-blue-700 p-2"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => confirmDelete(protocol.id)}
                      className="text-red-500 hover:text-red-700 p-2"
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {protocol.pasos.map((step, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 bg-slate-50 rounded-2xl p-4"
                    >
                      <div className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-gray-700">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for Create/Edit */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-2xl rounded-3xl p-8 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">
                {editingProtocol ? 'Editar Protocolo' : 'Nuevo Protocolo'}
              </h2>

              {/* Name */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">
                  Nombre del Protocolo
                </label>
                <input
                  type="text"
                  value={newProtocol.nombre}
                  onChange={(e) =>
                    setNewProtocol({
                      ...newProtocol,
                      nombre: e.target.value,
                    })
                  }
                  placeholder="Ej: Mantenimiento Preventivo"
                  className="w-full border rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Steps */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Pasos</h3>
                  <button
                    onClick={addStep}
                    className="text-orange-500 font-semibold hover:text-orange-600"
                  >
                    + Agregar Paso
                  </button>
                </div>

                <div className="space-y-4">
                  {newProtocol.pasos.map((step, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <input
                        type="text"
                        value={step}
                        onChange={(e) =>
                          updateStep(index, e.target.value)
                        }
                        placeholder={`Paso ${index + 1}`}
                        className="flex-1 border rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      {newProtocol.pasos.length > 1 && (
                        <button
                          onClick={() => removeStep(index)}
                          className="w-12 h-12 rounded-2xl bg-red-100 text-red-500 hover:bg-red-200 transition"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button
                  onClick={saveProtocol}
                  className="flex-1 bg-orange-500 text-white py-3 rounded-2xl font-semibold hover:bg-orange-600 transition"
                >
                  {editingProtocol ? 'Actualizar' : 'Guardar'}
                </button>
                <button
                  onClick={resetModal}
                  className="flex-1 border py-3 rounded-2xl font-semibold hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md rounded-3xl p-8">
              <h2 className="text-2xl font-bold mb-4">Confirmar Eliminación</h2>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de que deseas eliminar este protocolo?
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={deleteProtocol}
                  className="flex-1 bg-red-500 text-white py-3 rounded-2xl font-semibold hover:bg-red-600 transition"
                >
                  Eliminar
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeletingId(null)
                  }}
                  className="flex-1 border py-3 rounded-2xl font-semibold hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </JefeMecLayout>
  )
}