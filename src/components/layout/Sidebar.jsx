import {
  Link,
  useLocation,
  useParams,
  useNavigate,
} from 'react-router-dom'

import {
  FiHome,
  FiPlusCircle,
  FiCheckCircle,
  FiX,
  FiLogOut,
} from 'react-icons/fi'

export default function Sidebar({
  open,
  setOpen,
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const { id } = useParams()

  // DYNAMIC BASE ROUTE
  const baseRoute = `/jefe-linea/${id}`

  const menus = [
    {
      title: 'Inicio',
      icon: <FiHome />,
      path: baseRoute,
    },
    {
      title: 'Nuevo Ticket',
      icon: <FiPlusCircle />,
      path: `${baseRoute}/nuevo-ticket`,
    },
    {
      title: 'Validar',
      icon: <FiCheckCircle />,
      path: `${baseRoute}/validar-ticket`,
    },
  ]

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    
    // Close sidebar if open on mobile
    setOpen(false)
    
    // Redirect to login page
    navigate('/')
  }

  return (
    <>
      {/* SIDEBAR */}
      <aside
        className={`
          fixed lg:static top-0 left-0 z-50
          h-screen
          w-72
          bg-[#0f172a]
          text-white
          transition-transform duration-300
          flex flex-col
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* HEADER */}
        <div className="
          flex items-center justify-between
          p-5 border-b border-slate-700
        ">
          <div>
            <h1  onClick={handleLogout} className="text-xl font-bold">
              Skyrina
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Línea {id}
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden p-1 active:bg-slate-700 rounded-lg transition"
          >
            <FiX size={22} />
          </button>
        </div>

        {/* MENU */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {menus.map((menu) => (
            <Link
              key={menu.path}
              to={menu.path}
              onClick={() => setOpen(false)}
              className={`
                flex items-center gap-3
                px-4 py-3 rounded-xl
                transition-all active:scale-[0.98]
                ${location.pathname === menu.path
                  ? 'bg-orange-500'
                  : 'hover:bg-slate-700 active:bg-slate-700'
                }
              `}
            >
              <span className="text-lg">
                {menu.icon}
              </span>
              <span className="text-sm font-medium">
                {menu.title}
              </span>
            </Link>
          ))}
        </div>

        {/* FOOTER WITH LOGOUT BUTTON */}
        <div className="border-t border-slate-700">
          {/* User Info */}
          <div className="p-4">
            <div className="bg-slate-800 rounded-xl p-3">
              <p className="text-xs text-slate-400">
                Usuario Actual
              </p>
              <p className="text-sm font-semibold mt-0.5">
                Jefe Línea {id}
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="
              w-full
              flex items-center gap-3
              px-4 py-3
              text-left
              text-red-400
              hover:bg-red-500/10
              active:bg-red-500/20
              transition-all
              border-t border-slate-700
            "
          >
            <FiLogOut size={18} />
            <span className="text-sm font-medium">
              Cerrar Sesión
            </span>
          </button>
        </div>
      </aside>
    </>
  )
}