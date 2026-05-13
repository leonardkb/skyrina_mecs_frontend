import Badge from '../ui/Badge'

export default function TicketCard({ ticket }) {

  return (
    <div className="
      bg-white
      p-4 sm:p-5
      rounded-3xl
      shadow-sm
      border
    ">

      {/* Top */}
      <div className="
        flex flex-col sm:flex-row
        sm:items-center
        justify-between
        gap-3
      ">

        {/* Badges */}
        <div className="
          flex flex-wrap gap-2
        ">

          <Badge
            text={ticket.urgencia}
            color={
              ticket.urgencia === 'urgente'
                ? 'bg-red-500'
                : ticket.urgencia === 'alta'
                ? 'bg-yellow-500'
                : 'bg-green-500'
            }
          />

          <Badge
            text={ticket.status}
            color="bg-blue-500"
          />
        </div>

        <div className="
          text-sm text-gray-500
        ">
          {ticket.time}
        </div>
      </div>

      {/* Content */}
      <div className="mt-4">

        <h3 className="
          text-lg font-bold text-slate-800
        ">
          {ticket.linea}
        </h3>

        <p className="
          text-sm text-gray-500
          mt-2 line-clamp-2
        ">
          {ticket.descripcion}
        </p>
      </div>

      {/* Footer */}
      <div className="
        mt-5
        flex items-center justify-between
      ">

        <span className="
          text-sm text-gray-600
          truncate
        ">
          {ticket.mecanico}
        </span>

        <button className="
          text-orange-500
          font-semibold
          text-sm
        ">
          Ver
        </button>
      </div>
    </div>
  )
}