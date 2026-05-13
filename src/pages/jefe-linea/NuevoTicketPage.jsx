import { useNavigate } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'

export default function NuevoTicketPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3">
          <h1 className="text-xl font-bold text-slate-800">
            Nuevo Ticket
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Línea {id}
          </p>
        </div>

        {/* Cards Grid - Optimized for mobile */}
        <div className="p-4 space-y-3">
          {/* FALLA Card */}
          <div
            onClick={() => navigate(`/jefe-linea/${id}/nueva-falla`)}
            className="
              bg-white
              p-4
              rounded-xl
              shadow-sm
              border border-gray-100
              cursor-pointer
              active:scale-[0.98]
              transition-all
              flex
              items-center
              gap-4
            "
          >
            <div className="text-4xl">
              🔧
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold text-slate-800">
                Falla de Equipo
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Reportar avería o falla en máquina
              </p>
            </div>
            <div className="text-gray-300 text-lg">
              →
            </div>
          </div>

          {/* CAMBIO Card */}
          <div
            onClick={() => navigate(`/jefe-linea/${id}/nuevo-cambio`)}
            className="
              bg-white
              p-4
              rounded-xl
              shadow-sm
              border border-gray-100
              cursor-pointer
              active:scale-[0.98]
              transition-all
              flex
              items-center
              gap-4
            "
          >
            <div className="text-4xl">
              🔄
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold text-slate-800">
                Cambio de Estilo
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Solicitar cambio de producto o estilo
              </p>
            </div>
            <div className="text-gray-300 text-lg">
              →
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}