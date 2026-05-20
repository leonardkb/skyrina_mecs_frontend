import { useEffect, useState } from 'react'

import axios from 'axios'

import JefeMecLayout
from '../../components/layout/JefeMecLayout'

export default function FallasPage() {

  const [tickets, setTickets] =
    useState([])

  useEffect(() => {

    fetchFallas()

  }, [])

  const fetchFallas = async () => {

    try {

      const response =
        await axios.get(
          '/api/v1/jefe-mecanicos/tickets/pendientes'
        )

      const filtered =
        response.data.tickets.filter(

          ticket =>
            ticket.tipo ===
            'falla_equipo'
        )

      setTickets(filtered)

    } catch (error) {

      console.log(error)
    }
  }

  return (

    <JefeMecLayout>

      <div>

        <h1 className="
          text-3xl
          font-bold
          mb-6
        ">
          Fallas
        </h1>

        <div className="
          space-y-4
        ">

          {tickets.map(ticket => (

            <div

              key={ticket.id}

              className="
                bg-white
                rounded-3xl
                border
                border-gray-200
                shadow-sm
                p-5
              "
            >

              <h2 className="
                text-lg
                font-bold
              ">
                {ticket.titulo}
              </h2>

              <p className="
                text-gray-500
                mt-2
              ">
                {ticket.descripcion}
              </p>

            </div>
          ))}

        </div>

      </div>

    </JefeMecLayout>
  )
}