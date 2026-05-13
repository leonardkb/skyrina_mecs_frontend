import { useState } from 'react'
import JefeMecLayout from '../../components/layout/JefeMecLayout'

export default function MaquinasPage() {

  const [machines, setMachines] = useState([
    {
      id: 1,
      nombre: 'Overlock',
      activo: true,
    },
    {
      id: 2,
      nombre: 'Singer Industrial',
      activo: false,
    },
  ])

  const [newMachine, setNewMachine] = useState('')

  const addMachine = () => {
    if (!newMachine.trim()) return

    setMachines([
      ...machines,
      {
        id: Date.now(),
        nombre: newMachine,
        activo: true,
      },
    ])

    setNewMachine('')
  }

  const toggleMachineStatus = (id) => {
    setMachines(machines.map(machine =>
      machine.id === id
        ? { ...machine, activo: !machine.activo }
        : machine
    ))
  }

  return (
    <JefeMecLayout>
      <div className="p-3">
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
                onClick={() => toggleMachineStatus(machine.id)}
                className={`
                  flex items-center justify-between
                  px-3 py-2.5
                  ${index !== machines.length - 1 ? 'border-b border-gray-100' : ''}
                  active:bg-gray-50 transition-colors
                  cursor-pointer
                `}
              >
                <div className="flex items-center gap-3 flex-1">
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

                <div className={`
                  w-2.5 h-2.5 rounded-full
                  ${machine.activo ? 'bg-green-500' : 'bg-gray-400'}
                `} />
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