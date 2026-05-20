import { useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useParams } from 'react-router-dom'
import axios from 'axios'

export default function NuevaFallaPage() {
  const { id } = useParams()
  const [formData, setFormData] = useState({
    linea: `Línea ${id}`,
    tipoMaquina: '',
    numeroMaquina: '',
    tipoFalla: '',
    urgencia: 'normal',
    observaciones: '',
  })

  const [photos, setPhotos] = useState([])

  const machineTypes = [
    'Overlock',
    'Recta',
    'Collaretera',
    'Botonera',
    'Cortadora',
  ]

  const failureTypes = [
    'Motor detenido',
    'Ruido extraño',
    'Aguja rota',
    'Sensor dañado',
    'Falla eléctrica',
  ]

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files)

    if (photos.length + files.length > 3) {
      alert('Máximo 3 fotos')
      return
    }

    setPhotos([...photos, ...files])
  }

  const removePhoto = (index) => {
    const updated = [...photos]
    updated.splice(index, 1)
    setPhotos(updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const user = JSON.parse(localStorage.getItem('user'))

      if (!user?.id || !user?.linea_id) {
        alert('Usuario o línea inválida')
        return
      }

      const form = new FormData()

      form.append('titulo', `Falla ${formData.tipoFalla}`)
      form.append('descripcion', formData.observaciones || 'Sin descripción')
      form.append('created_by', user.id)
      form.append('linea_id', user.linea_id)
      form.append('maquina_nombre', formData.tipoMaquina)
      form.append('maquina_codigo', formData.numeroMaquina)
      form.append('prioridad', formData.urgencia)
      form.append('area', `Línea ${id}`)
      form.append('observaciones', formData.observaciones || '')

      if (photos.length > 0) {
        form.append('image', photos[0])
      }

      const response = await fetch(
        '/api/v1/tickets/falla-equipo',
        {
          method: 'POST',
          body: form,
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(JSON.stringify(data))
        return
      }

      alert('✅ Ticket creado correctamente')
    } catch (error) {
      console.log(error)
      alert('❌ Error creando ticket')
    }
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3">
          <h1 className="text-xl font-bold text-slate-800">
            Nueva Falla
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Reportar problema o avería de máquina
          </p>
        </div>

        {/* Form Card */}
        <div className="px-4 py-3">
          {/* Info Banner - Compact */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4">
            <p className="text-xs text-orange-700 font-medium">
              📍 Línea autocompletada · Jefe: Leonardo
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Machine & Failure Grid */}
            <div className="space-y-3">
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

              {/* Tipo de Máquina */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipo de Máquina
                </label>
                <select
                  name="tipoMaquina"
                  value={formData.tipoMaquina}
                  onChange={handleChange}
                  className="
                    w-full
                    border border-gray-300
                    rounded-xl
                    px-3 py-2.5
                    text-sm
                    outline-none
                    focus:ring-2
                    focus:ring-orange-400
                    bg-white
                  "
                >
                  <option value="">Seleccionar</option>
                  {machineTypes.map((machine, index) => (
                    <option key={index} value={machine}>
                      {machine}
                    </option>
                  ))}
                </select>
              </div>

              {/* Número Máquina */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Número Máquina
                </label>
                <input
                  type="text"
                  name="numeroMaquina"
                  placeholder="Ej. M-12"
                  value={formData.numeroMaquina}
                  onChange={handleChange}
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

              {/* Tipo de Falla */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipo de Falla
                </label>
                <select
                  name="tipoFalla"
                  value={formData.tipoFalla}
                  onChange={handleChange}
                  className="
                    w-full
                    border border-gray-300
                    rounded-xl
                    px-3 py-2.5
                    text-sm
                    outline-none
                    focus:ring-2
                    focus:ring-orange-400
                    bg-white
                  "
                >
                  <option value="">Seleccionar</option>
                  {failureTypes.map((failure, index) => (
                    <option key={index} value={failure}>
                      {failure}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Urgency - Compact horizontal scroll on mobile */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Nivel de Urgencia
              </label>
              <div className="grid grid-cols-3 gap-2">
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
                    Estándar
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
                    Rápida
                  </div>
                </button>

                {/* Urgente */}
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      urgencia: 'urgente',
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
                    ${formData.urgencia === 'urgente'
                      ? 'bg-red-100 border-red-500'
                      : 'border-gray-200 bg-white'
                    }
                  `}
                >
                  <div className={`text-sm font-bold ${formData.urgencia === 'urgente' ? 'text-red-600' : 'text-gray-600'}`}>
                    Urgente
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    Detenida
                  </div>
                </button>
              </div>
            </div>

            {/* Observations - Compact */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observaciones
              </label>
              <textarea
                name="observaciones"
                rows="4"
                placeholder="Describe el problema..."
                value={formData.observaciones}
                onChange={handleChange}
                className="
                  w-full
                  border border-gray-300
                  rounded-xl
                  px-3 py-2.5
                  text-sm
                  outline-none
                  focus:ring-2
                  focus:ring-orange-400
                  resize-none
                "
              />
            </div>

            {/* Photos - Compact grid */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Fotos ({photos.length}/3)
              </label>
              <div className="flex flex-wrap gap-2">
                {/* Upload Box */}
                {photos.length < 3 && (
                  <label
                    className="
                      w-20 h-20
                      border-2 border-dashed border-gray-300
                      rounded-xl
                      flex flex-col items-center justify-center
                      cursor-pointer
                      active:bg-gray-50
                      transition-colors
                    "
                  >
                    <span className="text-2xl text-gray-400">
                      +
                    </span>
                    <span className="text-[10px] text-gray-500 mt-0.5">
                      Agregar
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}

                {/* Preview */}
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt=""
                      className="
                        w-20 h-20
                        object-cover
                        rounded-xl
                        border
                        border-gray-200
                      "
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="
                        absolute -top-1.5 -right-1.5
                        w-6 h-6
                        bg-red-500
                        text-white
                        rounded-full
                        text-xs
                        font-bold
                        active:scale-95
                        transition-transform
                      "
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Buttons - Sticky on mobile */}
            <div className="sticky bottom-0 bg-gray-50 pt-4 pb-2 flex gap-3">
              <button
                type="button"
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
                "
              >
                Abrir Ticket
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}