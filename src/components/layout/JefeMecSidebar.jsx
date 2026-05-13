import { Link, useLocation } from 'react-router-dom'

import {
  FiGrid,
  FiTool,
  FiClipboard,
  FiArchive,
  FiAlertTriangle,
  FiLogOut,
} from 'react-icons/fi'

export default function JefeMecSidebar({ open, setOpen }) {

  const location = useLocation()

  const menus = [
    {
      title: 'Dashboard',
      icon: <FiGrid />,
      path: '/jefe-mec',
    },
    {
      title: 'Máquinas',
      icon: <FiTool />,
      path: '/jefe-mec/maquinas',
    },
    {
      title: 'Tipos de Falla',
      icon: <FiAlertTriangle />,
      path: '/jefe-mec/fallas',
    },
    {
      title: 'Protocolos',
      icon: <FiClipboard />,
      path: '/jefe-mec/protocolos',
    },
    {
      title: 'Tickets Cerrados',
      icon: <FiArchive />,
      path: '/jefe-mec/cerrados',
    },
  ]

  const handleLogout = () => {
    localStorage.removeItem('user')
    window.location.href = '/'
  }

  return (
    <aside
      className={`
        fixed lg:static top-0 left-0 z-50
        h-screen
        w-64
        bg-[#0f172a]
        text-white
        transition-transform duration-300

        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}
    >
      {/* Header - Compact */}
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-xl font-bold">
          Skyrina
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Jefe Mecánicos
        </p>
      </div>

      {/* Menus - Compact */}
      <div className="p-2 space-y-1">
        {menus.map((menu) => (
          <Link
            key={menu.path}
            to={menu.path}
            onClick={() => setOpen(false)}
            className={`
              flex items-center gap-2.5
              px-3 py-2.5 rounded-lg
              transition-all duration-200
              text-sm font-medium

              ${location.pathname === menu.path
                ? 'bg-orange-500 text-white'
                : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }
            `}
          >
            <div className="text-base">
              {menu.icon}
            </div>
            <span>
              {menu.title}
            </span>
          </Link>
        ))}
      </div>

      {/* Footer - Compact */}
      <div className="absolute bottom-0 left-0 w-full p-2 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="
            w-full
            flex items-center gap-2.5
            px-3 py-2.5 rounded-lg
            text-sm font-medium
            text-slate-300 hover:bg-slate-700/50 hover:text-white
            transition-all duration-200
          "
        >
          <FiLogOut className="text-base" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  )
}