import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useAppStore } from '@/lib/store'
import { ArrowLeft } from 'lucide-react'

export default function MotorcycleForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const motorcycles = useAppStore((s) => s.motorcycles)
  const addMotorcycle = useAppStore((s) => s.addMotorcycle)
  const updateMotorcycle = useAppStore((s) => s.updateMotorcycle)
  const removeMotorcycle = useAppStore((s) => s.removeMotorcycle)

  const existing = id ? motorcycles.find((m) => m.id === id) : null
  const isEdit = !!existing

  const [name, setName] = useState(existing?.name ?? '')
  const [purchaseDate, setPurchaseDate] = useState(existing?.purchaseDate ?? '')
  const [insuranceExpiry, setInsuranceExpiry] = useState(existing?.insuranceExpiry ?? '')
  const [inspectionExpiry, setInspectionExpiry] = useState(existing?.inspectionExpiry ?? '')
  const [lastMaintenanceDate, setLastMaintenanceDate] = useState(existing?.lastMaintenanceDate ?? '')
  const [lastMaintenanceMileage, setLastMaintenanceMileage] = useState(existing?.lastMaintenanceMileage?.toString() ?? '')
  const [currentMileage, setCurrentMileage] = useState(existing?.currentMileage?.toString() ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !purchaseDate) return

    const data = {
      name,
      purchaseDate,
      insuranceExpiry: insuranceExpiry || undefined,
      inspectionExpiry: inspectionExpiry || undefined,
      lastMaintenanceDate: lastMaintenanceDate || undefined,
      lastMaintenanceMileage: lastMaintenanceMileage ? Number(lastMaintenanceMileage) : undefined,
      currentMileage: currentMileage ? Number(currentMileage) : undefined,
    }

    if (isEdit) {
      updateMotorcycle(id!, data)
    } else {
      addMotorcycle({ id: crypto.randomUUID(), ...data })
    }
    navigate('/')
  }

  function handleDelete() {
    if (id && confirm('确定要删除此车辆及其所有加油记录吗？')) {
      removeMotorcycle(id)
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-white/80 px-4 py-3 backdrop-blur-sm border-b border-lime-100">
        <button onClick={() => navigate(-1)} className="rounded-lg p-1.5 hover:bg-lime-50 transition-colors">
          <ArrowLeft size={20} className="text-lime-700" />
        </button>
        <h1 className="text-lg font-bold text-lime-800">{isEdit ? '编辑摩托车' : '添加摩托车'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        <Field label="车辆名称 *" value={name} onChange={setName} placeholder="如: 本田CB400" />
        <Field label="购买日期 *" type="date" value={purchaseDate} onChange={setPurchaseDate} />
        <Field label="当前里程 (km)" type="number" value={currentMileage} onChange={setCurrentMileage} placeholder="0" />

        <div className="border-t border-lime-100 pt-4">
          <p className="mb-3 text-sm font-medium text-lime-700">保险 & 年检</p>
          <div className="space-y-4">
            <Field label="交强险到期日" type="date" value={insuranceExpiry} onChange={setInsuranceExpiry} />
            <Field label="年检到期日" type="date" value={inspectionExpiry} onChange={setInspectionExpiry} />
          </div>
        </div>

        <div className="border-t border-lime-100 pt-4">
          <p className="mb-3 text-sm font-medium text-lime-700">保养信息</p>
          <div className="space-y-4">
            <Field label="上次保养日期" type="date" value={lastMaintenanceDate} onChange={setLastMaintenanceDate} />
            <Field label="上次保养里程 (km)" type="number" value={lastMaintenanceMileage} onChange={setLastMaintenanceMileage} placeholder="0" />
          </div>
        </div>

        <div className="pt-4 space-y-3">
          <button
            type="submit"
            className="w-full rounded-xl bg-lime-500 py-3 text-sm font-medium text-white shadow-sm hover:bg-lime-600 active:bg-lime-700 transition-colors"
          >
            {isEdit ? '保存修改' : '添加车辆'}
          </button>
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              className="w-full rounded-xl border border-red-200 bg-white py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
            >
              删除车辆
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-input bg-white px-3 py-2.5 text-sm outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-200 transition-all"
      />
    </div>
  )
}