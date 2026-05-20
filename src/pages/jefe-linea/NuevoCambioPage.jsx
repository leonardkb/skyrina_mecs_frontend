import { useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useParams, useNavigate } from 'react-router-dom'

export default function NuevoCambioPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    linea: `Línea ${id}`,
    estiloOrigen: '',
    estiloDestino: '',
    maquinasMantienen: '',
    maquinasAgregar: '',
    urgencia: 'normal',
    observaciones: '',
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const user = JSON.parse(localStorage.getItem('user'))

      if (!user?.id || !user?.linea_id) {
        alert('Usuario inválido')
        setLoading(false)
        return
      }

      const form = new FormData()

      form.append('titulo', `Cambio de estilo: ${formData.estiloOrigen} → ${formData.estiloDestino}`)
      form.append('descripcion', formData.observaciones || 'Cambio de estilo solicitado')
      form.append('created_by', user.id)
      form.append('linea_id', user.linea_id)
      form.append('estilo_actual', formData.estiloOrigen)
      form.append('nuevo_estilo', formData.estiloDestino)
      form.append('prioridad', formData.urgencia)
      form.append('observaciones', formData.observaciones || '')

      if (formData.maquinasMantienen) {
        form.append('maquinas_mantienen', formData.maquinasMantienen)
      }
      if (formData.maquinasAgregar) {
        form.append('maquinas_agregar', formData.maquinasAgregar)
      }

      const response = await fetch(
        '/api/v1/tickets/cambio-estilo',
        {
          method: 'POST',
          body: form,
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(`Error: ${data.detail || JSON.stringify(data)}`)
        return
      }

      alert('✅ Cambio de estilo creado exitosamente')
      navigate(`/jefe-linea/${id}`)
      
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Error creando cambio de estilo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3">
          <h1 className="text-xl font-bold text-slate-800">
            Nuevo Cambio de Estilo
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Crear ticket para cambio de producto o estilo
          </p>
        </div>

        {/* Main Card */}
        <div className="px-4 py-3">
          {/* User Info Banner */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4">
            <p className="text-xs text-orange-700 font-medium">
              📍 Línea {id} · Creando cambio de estilo
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Linea - Disabled */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Línea
              </label>
              <input
                type="text"
                value={formData.linea}
                disabled
                className="
                  w-full
                  bg-gray-100
                  border border-gray-200
                  rounded-xl
                  px-3 py-2.5
                  text-sm
                  text-slate-700
                  outline-none
                "
              />
            </div>

            {/* Origin & Destination Styles */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estilo Origen *
                </label>
                <input
                  type="text"
                  name="estiloOrigen"
                  value={formData.estiloOrigen}
                  onChange={handleChange}
                  placeholder="Ej. Camisa M"
                  required
                  className="
                    w-full
                    border border-gray-300
                    rounded-xl
                    px-3 py-2.5
                    text-sm
                    outline-none
                    focus:ring-2
                    focus:ring-orange-400
                  "
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estilo Destino *
                </label>
                <input
                  type="text"
                  name="estiloDestino"
                  value={formData.estiloDestino}
                  onChange={handleChange}
                  placeholder="Ej. Camisa L"
                  required
                  className="
                    w-full
                    border border-gray-300
                    rounded-xl
                    px-3 py-2.5
                    text-sm
                    outline-none
                    focus:ring-2
                    focus:ring-orange-400
                  "
                />
              </div>
            </div>

            {/* Machines Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Máquinas que Mantienen
                </label>
                <input
                  type="number"
                  name="maquinasMantienen"
                  value={formData.maquinasMantienen}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="
                    w-full
                    border border-gray-300
                    rounded-xl
                    px-3 py-2.5
                    text-sm
                    outline-none
                    focus:ring-2
                    focus:ring-orange-400
                  "
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Máquinas a Agregar
                </label>
                <input
                  type="number"
                  name="maquinasAgregar"
                  value={formData.maquinasAgregar}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="
                    w-full
                    border border-gray-300
                    rounded-xl
                    px-3 py-2.5
                    text-sm
                    outline-none
                    focus:ring-2
                    focus:ring-orange-400
                  "
                />
              </div>
            </div>

            {/* Urgency - Compact 2x2 grid for mobile */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Nivel de Urgencia *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {/* Baja */}
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      urgencia: 'baja',
                    })
                  }
                  className={`
                    rounded-xl
                    border
                    py-2.5
                    px-2
                    text-center
                    transition-all
                    active:scale-95
                    ${formData.urgencia === 'baja'
                      ? 'bg-blue-100 border-blue-500'
                      : 'border-gray-200 bg-white'
                    }
                  `}
                >
                  <div className={`text-sm font-bold ${formData.urgencia === 'baja' ? 'text-blue-600' : 'text-gray-600'}`}>
                    Baja
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    Sin urgencia
                  </div>
                </button>

                {/* Normal */}
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      urgencia: 'normal',
                    })
                  }
                  className={`
                    rounded-xl
                    border
                    py-2.5
                    px-2
                    text-center
                    transition-all
                    active:scale-95
                    ${formData.urgencia === 'normal'
                      ? 'bg-green-100 border-green-500'
                      : 'border-gray-200 bg-white'
                    }
                  `}
                >
                  <div className={`text-sm font-bold ${formData.urgencia === 'normal' ? 'text-green-600' : 'text-gray-600'}`}>
                    Normal
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    Cambio estándar
                  </div>
                </button>

                {/* Alta */}
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      urgencia: 'alta',
                    })
                  }
                  className={`
                    rounded-xl
                    border
                    py-2.5
                    px-2
                    text-center
                    transition-all
                    active:scale-95
                    ${formData.urgencia === 'alta'
                      ? 'bg-yellow-100 border-yellow-500'
                      : 'border-gray-200 bg-white'
                    }
                  `}
                >
                  <div className={`text-sm font-bold ${formData.urgencia === 'alta' ? 'text-yellow-600' : 'text-gray-600'}`}>
                    Alta
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    Prioridad alta
                  </div>
                </button>

                {/* Crítica */}
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      urgencia: 'critica',
                    })
                  }
                  className={`
                    rounded-xl
                    border
                    py-2.5
                    px-2
                    text-center
                    transition-all
                    active:scale-95
                    ${formData.urgencia === 'critica'
                      ? 'bg-red-100 border-red-500'
                      : 'border-gray-200 bg-white'
                    }
                  `}
                >
                  <div className={`text-sm font-bold ${formData.urgencia === 'critica' ? 'text-red-600' : 'text-gray-600'}`}>
                    Crítica
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    Producción detenida
                  </div>
                </button>
              </div>
            </div>

            {/* Observations */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observaciones
              </label>
              <textarea
                rows="3"
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                placeholder="Comentarios adicionales sobre el cambio de estilo..."
                className="
                  w-full
                  border border-gray-300
                  rounded-xl
                  px-3 py-2.5
                  text-sm
                  outline-none
                  resize-none
                  focus:ring-2
                  focus:ring-orange-400
                "
              />
            </div>

            {/* Summary Card - Compact */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <h3 className="text-sm font-bold text-slate-800 mb-2">
                Resumen del Cambio
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-gray-500">Estilo Actual</p>
                  <p className="font-semibold text-slate-800 mt-0.5 truncate">
                    {formData.estiloOrigen || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Nuevo Estilo</p>
                  <p className="font-semibold text-slate-800 mt-0.5 truncate">
                    {formData.estiloDestino || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Mantienen</p>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {formData.maquinasMantienen || '0'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Agregar</p>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {formData.maquinasAgregar || '0'}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Urgencia</p>
                  <p className={`font-semibold mt-0.5 text-sm ${
                    formData.urgencia === 'critica' ? 'text-red-600' :
                    formData.urgencia === 'alta' ? 'text-yellow-600' :
                    formData.urgencia === 'normal' ? 'text-green-600' :
                    'text-blue-600'
                  }`}>
                    {formData.urgencia.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Buttons - Sticky */}
            <div className="sticky bottom-0 bg-gray-50 pt-4 pb-2 flex gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="
                  flex-1
                  py-3
                  rounded-xl
                  border border-gray-300
                  text-sm
                  font-medium
                  bg-white
                  active:bg-gray-100
                  transition-colors
                "
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !formData.estiloOrigen || !formData.estiloDestino}
                className="
                  flex-1
                  py-3
                  bg-orange-500
                  active:bg-orange-600
                  text-white
                  rounded-xl
                  text-sm
                  font-semibold
                  transition-all
                  active:scale-95
                  shadow-md
                  disabled:opacity-50
                  disabled:active:scale-100
                "
              >
                {loading ? 'Creando...' : 'Abrir Cambio'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}