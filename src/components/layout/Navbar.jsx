import { FiMenu } from 'react-icons/fi'

export default function Navbar({ setOpen }) {

  return (
    <header className="
      bg-white
      border-b
      px-4 sm:px-6
      py-4
      flex items-center justify-between
    ">

      {/* Left */}
      <div className="flex items-center gap-4">

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
            Jefe de Línea
          </h2>

          <p className="
            text-xs sm:text-sm
            text-gray-500
          ">
            Sistema de tickets
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="
        w-10 h-10
        rounded-full
        bg-orange-500
        text-white
        flex items-center justify-center
        font-bold
      ">
        JL
      </div>
    </header>
  )
}