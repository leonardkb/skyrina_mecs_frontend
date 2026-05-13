import { useState } from 'react'
import JefeMecLayout from '../../components/layout/JefeMecLayout'

export default function ProtocolosPage() {

  const [protocolos, setProtocolos] = useState([
    {
      id: 1,
      nombre: 'Motor no enciende',
      pasos: [
        'Verificar cable',
        'Revisar corriente',
        'Resetear máquina',
      ],
    },
  ])

  const [showModal, setShowModal] = useState(false)

  const [newProtocol, setNewProtocol] = useState({
    nombre: '',
    pasos: [''],
  })

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
      pasos: newProtocol.pasos.filter(
        (_, i) => i !== index
      ),
    })
  }

  const saveProtocol = () => {

    setProtocolos([
      ...protocolos,
      {
        id: Date.now(),
        nombre: newProtocol.nombre,
        pasos: newProtocol.pasos,
      },
    ])

    setShowModal(false)

    setNewProtocol({
      nombre: '',
      pasos: [''],
    })
  }

  return (
    <JefeMecLayout>

      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="
          flex flex-col sm:flex-row
          sm:items-center
          justify-between
          gap-4 mb-8
        ">

          <div>

            <h1 className="
              text-3xl font-bold text-slate-800
            ">
              Protocolos
            </h1>

            <p className="
              text-gray-500 mt-2
            ">
              Checklists obligatorios para mecánicos
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="
              bg-orange-500
              text-white
              px-6 py-3
              rounded-2xl
              font-semibold
            "
          >
            + Nuevo
          </button>
        </div>

        {/* Protocol Cards */}
        <div className="
          grid grid-cols-1 md:grid-cols-2
          gap-6
        ">

          {protocolos.map((protocol) => (

            <div
              key={protocol.id}
              className="
                bg-white rounded-3xl border p-6
              "
            >

              <div className="
                flex items-center gap-4 mb-5
              ">

                <div className="
                  w-14 h-14
                  rounded-2xl
                  bg-yellow-100
                  flex items-center justify-center
                  text-2xl
                ">
                  📋
                </div>

                <div>

                  <h2 className="
                    text-xl font-bold text-slate-800
                  ">
                    {protocol.nombre}
                  </h2>

                  <p className="
                    text-sm text-gray-500 mt-1
                  ">
                    {protocol.pasos.length} pasos
                  </p>
                </div>
              </div>

              <div className="
                space-y-3
              ">

                {protocol.pasos.map((step, index) => (

                  <div
                    key={index}
                    className="
                      flex items-start gap-3
                      bg-slate-50
                      rounded-2xl
                      p-4
                    "
                  >

                    <div className="
                      w-7 h-7 rounded-full
                      bg-orange-500
                      text-white
                      flex items-center justify-center
                      text-sm font-bold
                    ">
                      {index + 1}
                    </div>

                    <p className="
                      text-gray-700
                    ">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (

          <div className="
            fixed inset-0
            bg-black/40
            flex items-end sm:items-center justify-center
            z-50 p-4
          ">

            <div className="
              bg-white
              w-full max-w-2xl
              rounded-3xl
              p-8
              max-h-[90vh]
              overflow-y-auto
            ">

              <h2 className="
                text-2xl font-bold mb-6
              ">
                Nuevo Protocolo
              </h2>

              {/* Name */}
              <div className="mb-6">

                <label className="
                  block text-sm font-semibold mb-2
                ">
                  Nombre
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
                  className="
                    w-full
                    border rounded-2xl
                    px-4 py-3
                  "
                />
              </div>

              {/* Steps */}
              <div>

                <div className="
                  flex items-center justify-between
                  mb-4
                ">

                  <h3 className="
                    text-lg font-bold
                  ">
                    Pasos
                  </h3>

                  <button
                    onClick={addStep}
                    className="
                      text-orange-500
                      font-semibold
                    "
                  >
                    + Agregar
                  </button>
                </div>

                <div className="
                  space-y-4
                ">

                  {newProtocol.pasos.map((step, index) => (

                    <div
                      key={index}
                      className="
                        flex gap-3
                      "
                    >

                      <input
                        type="text"
                        value={step}
                        onChange={(e) =>
                          updateStep(index, e.target.value)
                        }
                        className="
                          flex-1
                          border rounded-2xl
                          px-4 py-3
                        "
                      />

                      <button
                        onClick={() => removeStep(index)}
                        className="
                          w-12 h-12
                          rounded-2xl
                          bg-red-100
                          text-red-500
                        "
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="
                flex flex-col sm:flex-row
                gap-4 mt-8
              ">

                <button
                  onClick={saveProtocol}
                  className="
                    flex-1
                    bg-orange-500
                    text-white
                    py-3 rounded-2xl
                  "
                >
                  Guardar
                </button>

                <button
                  onClick={() => setShowModal(false)}
                  className="
                    flex-1
                    border
                    py-3 rounded-2xl
                  "
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