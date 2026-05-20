import { useState, useEffect } from 'react'
import JefeMecLayout from '../../components/layout/JefeMecLayout'

// Define getAuthHeaders function
const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  }
}

export default function MaquinasPage() {
  const [machines, setMachines] = useState([])
  const [newMachine, setNewMachine] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  // Fetch machines from API
  const fetchMachines = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/v1/jefe-mecanicos/maquinas`, {
        headers: getAuthHeaders(),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMachines(data.machines)
      } else {
        setError('Error al cargar las máquinas')
      }
    } catch (err) {
      console.error('Error fetching machines:', err)
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMachines()
  }, [])

  // Clear messages after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  const addMachine = async () => {
    if (!newMachine.trim()) return

    try {
      const response = await fetch(`/api/v1/jefe-mecanicos/maquinas?nombre=${encodeURIComponent(newMachine.trim())}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMachines([...machines, data.machine])
        setNewMachine('')
        setSuccessMessage('Máquina agregada exitosamente')
      } else {
        setError(data.detail || 'Error al agregar la máquina')
      }
    } catch (err) {
      console.error('Error adding machine:', err)
      setError('Error de conexión')
    }
  }

  const toggleMachineStatus = async (id) => {
    try {
      const response = await fetch(`/api/v1/jefe-mecanicos/maquinas/${id}/toggle`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMachines(machines.map(machine =>
          machine.id === id
            ? { ...machine, activo: data.machine.activo }
            : machine
        ))
        setSuccessMessage(data.message)
      } else {
        setError(data.detail || 'Error al cambiar el estado')
      }
    } catch (err) {
      console.error('Error toggling machine:', err)
      setError('Error de conexión')
    }
  }

  const deleteMachine = async (id, nombre) => {
    if (window.confirm(`¿Eliminar la máquina "${nombre}"?`)) {
      try {
        const response = await fetch(`/api/v1/jefe-mecanicos/maquinas/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        })
        
        const data = await response.json()
        
        if (data.success) {
          setMachines(machines.filter(machine => machine.id !== id))
          setSuccessMessage('Máquina eliminada exitosamente')
        } else {
          setError(data.detail || 'Error al eliminar la máquina')
        }
      } catch (err) {
        console.error('Error deleting machine:', err)
        setError('Error de conexión')
      }
    }
  }

  if (loading) {
    return (
      <JefeMecLayout>
        <div className="p-3 flex justify-center items-center min-h-[200px]">
          <div className="text-gray-500">Cargando máquinas...</div>
        </div>
      </JefeMecLayout>
    )
  }

  return (
    <JefeMecLayout>
      <div className="p-3">
        {/* Messages */}
        {error && (
          <div className="mb-3 p-2 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
            <button 
              onClick={() => setError(null)} 
              className="float-right font-bold"
            >
              ×
            </button>
          </div>
        )}
        
        {successMessage && (
          <div className="mb-3 p-2 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
            {successMessage}
          </div>
        )}

        {/* Header with Add Machine */}
        <div className="mb-3">
          <h1 className="text-xl font-bold text-slate-800 mb-2">
            Tipos de Máquina
          </h1>

          <div className="flex gap-2">
            <input
              type="text"
              value={newMachine}
              onChange={(e) => setNewMachine(e.target.value)}
              placeholder="Nueva máquina"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
              onKeyPress={(e) => e.key === 'Enter' && addMachine()}
            />

            <button
              onClick={addMachine}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Agregar
            </button>
          </div>
        </div>

        {/* Machines List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {machines.length > 0 ? (
            machines.map((machine, index) => (
              <div
                key={machine.id}
                className={`
                  flex items-center justify-between
                  px-3 py-2.5
                  ${index !== machines.length - 1 ? 'border-b border-gray-100' : ''}
                  group
                `}
              >
                <div 
                  onClick={() => toggleMachineStatus(machine.id)}
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-lg">
                    ⚙️
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 text-sm">
                      {machine.nombre}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {machine.activo ? 'Activo' : 'Inactivo'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`
                    w-2.5 h-2.5 rounded-full
                    ${machine.activo ? 'bg-green-500' : 'bg-gray-400'}
                  `} />
                  
                  <button
                    onClick={() => deleteMachine(machine.id, machine.nombre)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-red-500"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-3xl mb-1">📭</div>
              <p className="text-sm text-gray-500">No hay máquinas registradas</p>
              <p className="text-xs text-gray-400 mt-1">Agrega una máquina usando el campo superior</p>
            </div>
          )}
        </div>

        {/* Helper text for tapping */}
        <p className="text-xs text-gray-400 text-center mt-3">
          Toca una máquina para cambiar su estado
        </p>
      </div>
    </JefeMecLayout>
  )
}