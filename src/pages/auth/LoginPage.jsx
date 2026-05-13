import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.username || !formData.password) {
      setError('Completa todos los campos')
      return
    }

    try {
      setLoading(true)

      const response = await fetch('http://127.0.0.1:8000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.detail || 'Login failed')
        setLoading(false)
        return
      }

      // SAVE USER
      localStorage.setItem('user', JSON.stringify(data.user))

      // ROLE-BASED NAVIGATION
      const role = data.user.role

      // JEFE LINEA
      if (role === 'jefe_linea') {
        const lineaNumber = data.user.username.split('_')[2]
        navigate(`/jefe-linea/${lineaNumber}`)
      }
      // JEFE MECANICOS
      else if (role === 'jefe_mecanicos') {
        navigate('/jefe-mec')
      }
      // MECANICO
      else if (role === 'mecanico') {
        navigate('/mecanico')
      }
      // SUPERVISOR
      else if (role === 'supervisor') {
        navigate('/supervisor')
      }
      // RH
      else if (role === 'rh') {
        navigate('/rh')
      }
    } catch (err) {
      setError('No se pudo conectar al servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-orange-50 flex items-center justify-center p-3">
      {/* Login Card - Compact version */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Top Banner - Reduced padding */}
        <div className="bg-[#0f172a] px-5 py-5 text-center">
          {/* Logo - Smaller on mobile */}
          <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-500 flex items-center justify-center text-3xl shadow-md shadow-orange-500/30">
            ⚙️
          </div>

          <h1 className="text-2xl font-bold text-white mt-3">
            Skyrina
          </h1>

          <p className="text-slate-300 mt-1 text-xs">
            Sistema Integral de Gestión
          </p>
        </div>

        {/* Form - Reduced padding */}
        <div className="p-5">
          <div className="mb-4 text-center">
            <h2 className="text-xl font-bold text-slate-800">
              Iniciar Sesión
            </h2>
            <p className="text-gray-500 mt-1 text-xs">
              Accede al sistema de mantenimiento
            </p>
          </div>

          <form onSubmit={handleLogin}>
            {/* USERNAME - Reduced margin */}
            <div className="mb-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Usuario
              </label>

              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="jefe_linea_1"
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-400 transition"
              />
            </div>

            {/* PASSWORD - Reduced margin */}
            <div className="mb-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contraseña
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-400 transition"
              />
            </div>

            {/* ERROR - Compact */}
            {error && (
              <div className="mb-3 bg-red-100 text-red-600 px-3 py-2 rounded-xl text-xs">
                {error}
              </div>
            )}

            {/* LOGIN BUTTON - Better touch target */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-3.5 rounded-xl font-semibold transition shadow-md shadow-orange-200 text-base active:scale-[0.98]"
            >
              {loading ? 'Ingresando...' : 'Entrar'}
            </button>
          </form>

          {/* FOOTER - Minimal spacing */}
          <div className="mt-5 text-center text-xs text-gray-400">
            Skyrina Mecánicos © 2026
          </div>
        </div>
      </div>
    </div>
  )
}