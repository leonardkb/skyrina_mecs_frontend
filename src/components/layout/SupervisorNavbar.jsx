import { FiBell, FiMenu } from 'react-icons/fi'

export default function SupervisorNavbar({
  setOpen,
}) {

  return (
    <header className="
      bg-white border-b
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
            Supervisor
          </h2>

          <p className="
            text-xs sm:text-sm
            text-gray-500
          ">
            KPIs y monitoreo global
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="
        flex items-center gap-4
      ">

        <button className="
          relative
          w-11 h-11
          rounded-2xl border
          flex items-center justify-center
        ">

          <FiBell size={20} />

          <div className="
            absolute top-2 right-2
            w-2.5 h-2.5 rounded-full
            bg-red-500
          " />
        </button>

        <div className="
          flex items-center gap-3
        ">

          <div className="
            w-11 h-11 rounded-2xl
            bg-orange-500
            text-white
            flex items-center justify-center
            font-bold
          ">
            S
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
              Supervisor
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}