import { useState } from 'react'

import SupervisorSidebar from './SupervisorSidebar'
import SupervisorNavbar from './SupervisorNavbar'

export default function SupervisorLayout({
  children,
}) {

  const [open, setOpen] = useState(false)

  return (
    <div className="
      min-h-screen bg-gray-100 flex
    ">

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="
            fixed inset-0
            bg-black/40
            z-40 lg:hidden
          "
        />
      )}

      <SupervisorSidebar
        open={open}
        setOpen={setOpen}
      />

      <div className="
        flex-1 flex flex-col
        min-w-0
      ">

        <SupervisorNavbar
          setOpen={setOpen}
        />

        <main className="
          flex-1
          p-4 sm:p-6 lg:p-8
          overflow-x-hidden
        ">
          {children}
        </main>
      </div>
    </div>
  )
}