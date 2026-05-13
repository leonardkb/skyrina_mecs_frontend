import { useState } from 'react'

import JefeMecSidebar from './JefeMecSidebar'
import JefeMecNavbar from './JefeMecNavbar'

export default function JefeMecLayout({ children }) {

  const [open, setOpen] = useState(false)

  return (
    <div className="
      min-h-screen
      bg-gray-100
      flex
    ">

      {/* Overlay */}
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

      {/* Sidebar */}
      <JefeMecSidebar
        open={open}
        setOpen={setOpen}
      />

      {/* Main */}
      <div className="
        flex-1 flex flex-col
        min-w-0
      ">

        <JefeMecNavbar
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