import { Link, useLocation, useNavigate } from 'react-router-dom'

import {
  FiClipboard,
  FiDollarSign,
  FiLogOut,
} from 'react-icons/fi'

export default function MecanicoSidebar({ open, setOpen }) {

  const location = useLocation()
  const navigate = useNavigate()

  const menus = [
    {
      title: 'Mis Tickets',
      icon: <FiClipboard />,
      path: '/mecanico',
    },
    {
      title: 'Bono',
      icon: <FiDollarSign />,
      path: '/mecanico/bono',
    },
  ]

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('user')
    localStorage.removeItem('token') // if you store token
    
    // Close sidebar if open on mobile
    setOpen(false)
    
    // Navigate to login page
    navigate('/')
  }

  return (
    <aside
      className={`
        fixed lg:static top-0 left-0 z-50
        h-screen
        w-72
        bg-[#0f172a]
        text-white
        transition-transform duration-300

        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}
    >
      {/* Header */}
      <div className="
        p-4 border-b border-slate-700
      ">
        <h1 className="
          text-xl font-bold
        ">
          Skyrina
        </h1>
        <p className="
          text-xs text-slate-400 mt-1
        ">
          Mecánico
        </p>
      </div>

      {/* Menus */}
      <div className="
        p-3 space-y-1
      ">
        {menus.map((menu) => (
          <Link
            key={menu.path}
            to={menu.path}
            onClick={() => setOpen(false)}
            className={`
              flex items-center gap-3
              p-3 rounded-xl
              transition

              ${
                location.pathname === menu.path
                  ? 'bg-orange-500'
                  : 'hover:bg-slate-700'
              }
            `}
          >
            <span className="text-lg">{menu.icon}</span>
            <span className="
              text-sm font-medium
            ">
              {menu.title}
            </span>
          </Link>
        ))}
      </div>

      {/* Footer - Logout Button */}
      <div className="
        absolute bottom-0 left-0
        w-full p-3
        border-t border-slate-700
      ">
        <button 
          onClick={handleLogout}
          className="
            w-full
            flex items-center gap-3
            p-3 rounded-xl
            hover:bg-slate-700
            transition
            active:bg-slate-800
          "
        >
          <FiLogOut className="text-lg" />
          <span className="text-sm">
            Cerrar Sesión
          </span>
        </button>
      </div>
    </aside>
  )
}