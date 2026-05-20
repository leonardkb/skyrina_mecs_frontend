import { useEffect, useState } from 'react'
import axios from 'axios'
import SupervisorLayout from '../../components/layout/SupervisorLayout'

export default function ChecklistPage() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [checklist, setChecklist] = useState(null)
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    fetchChecklist()
    fetchHistory()
  }, [])

  const fetchChecklist = async () => {
    try {
      const response = await axios.get('/api/v1/supervisor/checklist/today')
      if (response.data.success) {
        setChecklist(response.data.checklist)
        setSubmitted(response.data.checklist.completed || false)
      }
    } catch (error) {
      console.error('Error fetching checklist:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchHistory = async () => {
    try {
      const response = await axios.get('/api/v1/supervisor/checklist/history')
      if (response.data.success) {
        setHistory(response.data.history)
      }
    } catch (error) {
      console.error('Error fetching history:', error)
    }
  }

  const toggleItem = (index) => {
    if (submitted) return
    
    const updatedItems = [...checklist.items]
    updatedItems[index] = {
      ...updatedItems[index],
      checked: !updatedItems[index].checked
    }
    setChecklist({ ...checklist, items: updatedItems })
  }

  const submitChecklist = async () => {
    setSubmitting(true)
    try {
      const response = await axios.post(
        '/api/v1/supervisor/checklist/submit',
        { items: checklist.items }
      )
      if (response.data.success) {
        setSubmitted(true)
        alert('✅ Checklist enviado correctamente')
        fetchHistory()
      }
    } catch (error) {
      console.error('Error submitting checklist:', error)
      alert('Error al enviar el checklist: ' + (error.response?.data?.detail || error.message))
    } finally {
      setSubmitting(false)
    }
  }

  const done = checklist?.items?.filter(x => x.checked).length || 0
  const totalItems = checklist?.items?.length || 0
  const allDone = totalItems > 0 && done === totalItems

  if (loading) {
    return (
      <SupervisorLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Cargando checklist...</div>
        </div>
      </SupervisorLayout>
    )
  }

  return (
    <SupervisorLayout>
      <div className="max-w-4xl mx-auto px-3">
        {/* Header - Compact */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-slate-800">
            Checklist Diario
          </h1>
          <p className="text-xs text-gray-500">
            Verificación de orden, limpieza y seguridad
          </p>
        </div>

        {/* Date - Compact */}
        <div className="bg-gray-100 rounded-xl p-2 mb-3 text-center">
          <p className="text-[10px] text-gray-500">Fecha</p>
          <p className="text-sm font-semibold">{checklist?.date || new Date().toISOString().split('T')[0]}</p>
        </div>

        {/* Tabs - Compact segmented control */}
        <div className="flex gap-1 mb-3 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setShowHistory(false)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              !showHistory
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-gray-600'
            }`}
          >
            Hoy
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              showHistory
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-gray-600'
            }`}
          >
            Historial
          </button>
        </div>

        {!showHistory ? (
          /* Checklist Card - Compact */
          <div className="bg-white rounded-xl border p-3">
            {/* Header with progress */}
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-slate-800">
                Checklist diario
              </h2>
              <div className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                allDone && !submitted
                  ? 'bg-green-100 text-green-700'
                  : submitted
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {submitted ? 'Completado' : `${done}/${totalItems}`}
              </div>
            </div>

            {/* Progress bar - Compact */}
            <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden mb-3">
              <div
                className={`h-full transition-all duration-300 ${
                  allDone && !submitted
                    ? 'bg-green-500'
                    : submitted
                    ? 'bg-green-500'
                    : 'bg-orange-500'
                }`}
                style={{ width: `${(done / totalItems) * 100}%` }}
              />
            </div>

            {/* Submitted State - Compact */}
            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <div className="text-3xl mb-2">✅</div>
                <h2 className="text-base font-bold text-green-700">
                  Checklist enviado
                </h2>
                <p className="text-xs text-green-600 mt-1">
                  KPI actualizado correctamente
                </p>
              </div>
            ) : (
              <>
                {/* Items - Compact list */}
                <div className="space-y-1.5">
                  {checklist?.items?.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => toggleItem(index)}
                      className="w-full flex items-center gap-2 text-left border rounded-lg p-2 hover:bg-slate-50 transition active:bg-slate-100"
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition shrink-0 ${
                        item.checked
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300'
                      }`}>
                        {item.checked && (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`flex-1 text-sm ${
                        item.checked
                          ? 'line-through text-gray-400'
                          : 'text-slate-700'
                      }`}>
                        {item.label}
                      </span>
                      {item.category && (
                        <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full shrink-0">
                          {item.category === 'limpieza' && '🧹'}
                          {item.category === 'seguridad' && '🛡️'}
                          {item.category === 'organizacion' && '📦'}
                          {item.category === 'organización' && '📦'}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Submit Button - Compact */}
                {allDone && (
                  <button
                    onClick={submitChecklist}
                    disabled={submitting}
                    className="w-full mt-3 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition disabled:bg-gray-400 text-sm active:bg-orange-600"
                  >
                    {submitting ? 'Enviando...' : 'Enviar checklist'}
                  </button>
                )}

                {/* Warning message - Compact */}
                {!allDone && (
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                    <p className="text-xs text-yellow-700">
                      ✓ Marca todos los items para enviar
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          /* History View - Compact */
          <div className="bg-white rounded-xl border p-3">
            <h2 className="text-sm font-bold text-slate-800 mb-2">
              Historial
            </h2>
            {history.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm">
                No hay checklists previos
              </div>
            ) : (
              <div className="space-y-2">
                {history.map(record => (
                  <div key={record.id} className="border rounded-lg p-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="font-semibold text-sm text-slate-800">
                        {record.date}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        record.completion_percentage === 100
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {record.completion_percentage}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full"
                        style={{ width: `${record.completion_percentage}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1.5">
                      {new Date(record.submitted_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </SupervisorLayout>
  )
}