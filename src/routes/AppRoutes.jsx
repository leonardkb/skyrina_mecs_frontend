import { BrowserRouter, Routes, Route } from 'react-router-dom'

import LoginPage from '../pages/auth/LoginPage'

import HomePage from '../pages/jefe-linea/HomePage'
import NuevoTicketPage from '../pages/jefe-linea/NuevoTicketPage'
import NuevaFallaPage from '../pages/jefe-linea/NuevaFallaPage'
import NuevoCambioPage from '../pages/jefe-linea/NuevoCambioPage'
import ValidarTicketPage from '../pages/jefe-linea/ValidarTicketPage'


import DashboardMecPage from '../pages/jefe-mecs/DashboardMecPage'
import CatalogosPage from '../pages/jefe-mecs/CatalogosPage'
import MaquinasPage from '../pages/jefe-mecs/MaquinasPage'
import FallasPage from '../pages/jefe-mecs/FallasPage'
import ProtocolosPage from '../pages/jefe-mecs/ProtocolosPage'
import TicketsCerradosPage from '../pages/jefe-mecs/TicketsCerradosPage'

import TicketsPage from '../pages/mecanico/TicketsPage'
import TicketDetailPage from '../pages/mecanico/TicketDetailPage'
import BonoPage from '../pages/mecanico/BonoPage'

import SupervisorHomePage from '../pages/supervisor/SupervisorHomePage'
import ChecklistPage from '../pages/supervisor/ChecklistPage'



export default function AppRoutes() {
  return (
    <BrowserRouter>

      <Routes>

        {/* Auth */}
        <Route
          path="/"
          element={<LoginPage />}
        />

        

        <Route
          path="/nuevo-ticket"
          element={<NuevoTicketPage />}
        />

        

        <Route
  path="/jefe-linea/:id"
  element={<HomePage />}
/>

<Route
  path="/jefe-linea/:id/nuevo-ticket"
  element={<NuevoTicketPage />}
/>

<Route
  path="/jefe-linea/:id/nueva-falla"
  element={<NuevaFallaPage />}
/>

<Route
  path="/jefe-linea/:id/nuevo-cambio"
  element={<NuevoCambioPage />}
/>

<Route path="/jefe-linea/:id/validar/:ticketId" element={<ValidarTicketPage />} />



<Route path="/jefe-mec" element={<DashboardMecPage />} />
<Route path="/jefe-mec/catalogos" element={<CatalogosPage />} />
<Route path="/jefe-mec/maquinas" element={<MaquinasPage />} />
<Route path="/jefe-mec/fallas" element={<FallasPage />} />
<Route path="/jefe-mec/protocolos" element={<ProtocolosPage />} />
<Route path="/jefe-mec/cerrados" element={<TicketsCerradosPage />} />


<Route path="/mecanico" element={<TicketsPage />} />
<Route path="/mecanico/ticket/:id" element={<TicketDetailPage />} />
<Route path="/mecanico/bono" element={<BonoPage />} />

<Route
  path="/supervisor"
  element={<SupervisorHomePage />}
/>

<Route
  path="/supervisor/checklist"
  element={<ChecklistPage />}
/>
      
      
      
      </Routes>





    </BrowserRouter>
  )
}