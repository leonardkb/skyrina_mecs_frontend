import { Link, useLocation, useNavigate } from 'react-router-dom'

import {
  FiHome,
  FiCheckSquare,
  FiLogOut,
} from 'react-icons/fi'

export default function SupervisorSidebar({
  open,
  setOpen,
}) {

  const location = useLocation()
  const navigate = useNavigate()

  const menus = [
    {
      title: 'Dashboard',
      icon: <FiHome />,
      path: '/supervisor',
    },
    {
      title: 'Checklist',
      icon: <FiCheckSquare />,
      path: '/supervisor/checklist',
    },
  ]

  const handleLogout = () => {
    // Clear any stored auth tokens/user data
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    
    // Redirect to login page
    navigate('/', { replace: true })
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
        p-6 border-b border-slate-700
      ">

        <h1 className="
          text-2xl font-bold
        ">
          Skyrina
        </h1>

        <p className="
          text-sm text-slate-400 mt-2
        ">
          Supervisor
        </p>
      </div>

      {/* Menus */}
      <div className="
        p-4 space-y-2
      ">

        {menus.map(menu => (

          <Link
            key={menu.path}
            to={menu.path}
            onClick={() => setOpen(false)}
            className={`
              flex items-center gap-3
              p-4 rounded-2xl
              transition

              ${
                location.pathname === menu.path
                  ? 'bg-orange-500'
                  : 'hover:bg-slate-700'
              }
            `}
          >

            {menu.icon}

            <span className="
              font-medium
            ">
              {menu.title}
            </span>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div className="
        absolute bottom-0 left-0
        w-full p-4
        border-t border-slate-700
      ">

        <button 
          onClick={handleLogout}
          className="
            w-full
            flex items-center gap-3
            p-4 rounded-2xl
            hover:bg-slate-700
            transition
            cursor-pointer
          "
        >

          <FiLogOut />

          <span>
            Cerrar Sesión
          </span>
        </button>
      </div>
    </aside>
  )
}