import { BrowserRouter, Routes, Route } from 'react-router'
import Dashboard from '@/components/Dashboard'
import MotorcycleForm from '@/components/MotorcycleForm'
import FuelRecordForm from '@/components/FuelRecordForm'
import FuelHistory from '@/components/FuelHistory'

function App() {
  return (
    <BrowserRouter>
      <div className="mx-auto min-h-screen max-w-lg bg-background">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/motorcycle/add" element={<MotorcycleForm />} />
          <Route path="/motorcycle/:id/edit" element={<MotorcycleForm />} />
          <Route path="/fuel/add/:motorcycleId" element={<FuelRecordForm />} />
          <Route path="/fuel/history/:motorcycleId" element={<FuelHistory />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App