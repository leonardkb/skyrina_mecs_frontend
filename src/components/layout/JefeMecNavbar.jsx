import { FiBell, FiMenu } from 'react-icons/fi'

export default function JefeMecNavbar({ setOpen }) {

  return (
    <header className="
      bg-white
      border-b
      px-4 sm:px-6
      py-4
      flex items-center justify-between
    ">

      {/* Left */}
      <div className="
        flex items-center gap-4
      ">

        <button
          onClick={() => setOpen(true)}
          className="lg:hidden"
        >
          <FiMenu size={24} />
        </button>

        <div>

          <h2 className="
            text-lg sm:text-xl
            font-bold text-slate-800
          ">
            Jefe Mecánicos
          </h2>

          <p className="
            text-xs sm:text-sm
            text-gray-500
          ">
            Gestión del equipo mecánico
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="
        flex items-center gap-4
      ">

        {/* Notification */}
        <button className="
          relative
          w-11 h-11
          rounded-2xl
          border
          flex items-center justify-center
          hover:bg-slate-50
        ">

          <FiBell size={20} />

          <div className="
            absolute top-2 right-2
            w-2.5 h-2.5
            rounded-full
            bg-red-500
          " />
        </button>

        {/* User */}
        <div className="
          flex items-center gap-3
        ">

          <div className="
            w-11 h-11
            rounded-2xl
            bg-orange-500
            text-white
            flex items-center justify-center
            font-bold
          ">
            JM
          </div>

          <div className="hidden sm:block">

            <h3 className="
              text-sm font-semibold
              text-slate-800
            ">
              Leonardo
            </h3>

            <p className="
              text-xs text-gray-500
            ">
              Jefe Mecánicos
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}