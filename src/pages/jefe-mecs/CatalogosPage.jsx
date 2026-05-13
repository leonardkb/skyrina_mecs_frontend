import { useNavigate } from 'react-router-dom'
import JefeMecLayout from '../../components/layout/JefeMecLayout'

export default function CatalogosPage() {

  const navigate = useNavigate()

  const cards = [
    {
      title: 'Tipos de Máquina',
      icon: '⚙️',
      path: '/jefe-mec/maquinas',
      color: 'bg-blue-50',
    },
    {
      title: 'Tipos de Falla',
      icon: '🔧',
      path: '/jefe-mec/fallas',
      color: 'bg-orange-50',
    },
    {
      title: 'Protocolos',
      icon: '📋',
      path: '/jefe-mec/protocolos',
      color: 'bg-yellow-50',
    },
    {
      title: 'Tickets Cerrados',
      icon: '📁',
      path: '/jefe-mec/cerrados',
      color: 'bg-green-50',
    },
  ]

  return (
    <JefeMecLayout>

      <div className="max-w-6xl mx-auto">

        <h1 className="
          text-3xl font-bold text-slate-800 mb-8
        ">
          Catálogos
        </h1>

        <div className="
          grid grid-cols-1 sm:grid-cols-2
          gap-6
        ">

          {cards.map((card, index) => (

            <div
              key={index}
              onClick={() => navigate(card.path)}
              className={`
                ${card.color}
                rounded-3xl
                p-8
                cursor-pointer
                hover:scale-[1.02]
                transition
                border
              `}
            >

              <div className="text-5xl">
                {card.icon}
              </div>

              <h2 className="
                text-xl font-bold text-slate-800 mt-5
              ">
                {card.title}
              </h2>
            </div>
          ))}
        </div>
      </div>
    </JefeMecLayout>
  )
}