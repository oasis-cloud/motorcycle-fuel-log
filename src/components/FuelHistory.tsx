import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useAppStore, calculateFuelConsumption } from '@/lib/store'
import { ArrowLeft, Trash2, Fuel, TrendingUp } from 'lucide-react'

export default function FuelHistory() {
  const navigate = useNavigate()
  const { motorcycleId } = useParams()
  const motorcycles = useAppStore((s) => s.motorcycles)
  const fuelRecords = useAppStore((s) => s.fuelRecords)
  const removeFuelRecord = useAppStore((s) => s.removeFuelRecord)

  const records = useMemo(
    () => fuelRecords
      .filter((r) => r.motorcycleId === (motorcycleId ?? ''))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [fuelRecords, motorcycleId]
  )

  const moto = motorcycles.find((m) => m.id === motorcycleId)
  const fuelConsumption = calculateFuelConsumption(records)
  const totalSpent = records.reduce((sum, r) => sum + r.amount, 0)
  const totalLiters = records.reduce((sum, r) => sum + r.liters, 0)

  if (!moto) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">车辆不存在</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-white/80 px-4 py-3 backdrop-blur-sm border-b border-lime-100">
        <button onClick={() => navigate(-1)} className="rounded-lg p-1.5 hover:bg-lime-50 transition-colors">
          <ArrowLeft size={20} className="text-lime-700" />
        </button>
        <h1 className="text-lg font-bold text-lime-800">加油历史 - {moto.name}</h1>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-3 p-4">
        <div className="rounded-lg bg-lime-50 p-3 text-center">
          <p className="text-xs text-muted-foreground">总花费</p>
          <p className="mt-1 text-lg font-bold text-lime-700">¥{totalSpent.toFixed(0)}</p>
        </div>
        <div className="rounded-lg bg-lime-50 p-3 text-center">
          <p className="text-xs text-muted-foreground">总加油</p>
          <p className="mt-1 text-lg font-bold text-lime-700">{totalLiters.toFixed(1)}L</p>
        </div>
        <div className="rounded-lg bg-lime-50 p-3 text-center">
          <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <TrendingUp size={12} /> 百公里
          </p>
          <p className="mt-1 text-lg font-bold text-lime-700">
            {fuelConsumption != null ? `${fuelConsumption.toFixed(2)}L` : '--'}
          </p>
        </div>
      </div>

      {/* 记录列表 */}
      {records.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Fuel size={40} className="mb-4 text-lime-200" />
          <p className="text-sm text-muted-foreground">暂无加油记录</p>
          <button
            onClick={() => navigate(`/fuel/add/${motorcycleId}`)}
            className="mt-4 rounded-lg bg-lime-500 px-4 py-2 text-sm text-white hover:bg-lime-600 transition-colors"
          >
            添加首条记录
          </button>
        </div>
      ) : (
        <div className="space-y-2 px-4">
          {records.map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between rounded-lg border border-lime-100 bg-white p-3"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{record.date}</span>
                  {record.isFull && (
                    <span className="rounded bg-lime-100 px-1.5 py-0.5 text-[10px] font-medium text-lime-700">
                      满箱
                    </span>
                  )}
                </div>
                <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                  <span>¥{record.amount.toFixed(2)}</span>
                  <span>{record.liters.toFixed(2)}L</span>
                  <span>{record.unitPrice.toFixed(2)}元/L</span>
                  {record.mileage != null && <span>{record.mileage}km</span>}
                </div>
              </div>
              <button
                onClick={() => {
                  if (confirm('确定删除此加油记录？')) {
                    removeFuelRecord(record.id)
                  }
                }}
                className="rounded-lg p-2 text-red-400 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}