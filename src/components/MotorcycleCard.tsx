import { useMemo } from 'react'
import { useAppStore, calculateFuelConsumption, estimateNextMaintenance } from '@/lib/store'
import type { Motorcycle } from '@/types'
import { Fuel, Gauge, Wrench, Shield, Calendar, Edit } from 'lucide-react'
import { useNavigate } from 'react-router'

interface Props {
  motorcycle: Motorcycle
}

export default function MotorcycleCard({ motorcycle }: Props) {
  const navigate = useNavigate()
  const fuelRecords = useAppStore((s) => s.fuelRecords)
  const records = useMemo(
    () => fuelRecords
      .filter((r) => r.motorcycleId === motorcycle.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [fuelRecords, motorcycle.id]
  )
  const latestRecord = records[0]
  const fuelConsumption = calculateFuelConsumption(records)
  const nextMaintenance = estimateNextMaintenance(motorcycle)

  const isInsuranceExpiring = motorcycle.insuranceExpiry
    ? new Date(motorcycle.insuranceExpiry).getTime() - Date.now() < 30 * 24 * 3600 * 1000
    : false
  const isInspectionExpiring = motorcycle.inspectionExpiry
    ? new Date(motorcycle.inspectionExpiry).getTime() - Date.now() < 30 * 24 * 3600 * 1000
    : false

  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* 行驶证风格卡片 */}
      <div className="rounded-xl border-2 border-lime-300 bg-gradient-to-br from-lime-50 to-white p-5 shadow-lg">
        {/* 顶部标题栏 */}
        <div className="mb-4 flex items-center justify-between border-b border-lime-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-lime-500 text-white text-sm font-bold">
              摩
            </div>
            <h2 className="text-lg font-bold text-lime-800">{motorcycle.name}</h2>
          </div>
          <button
            onClick={() => navigate(`/motorcycle/${motorcycle.id}/edit`)}
            className="rounded-lg p-1.5 text-lime-600 hover:bg-lime-100 transition-colors"
          >
            <Edit size={18} />
          </button>
        </div>

        {/* 卡片信息区域 - 类行驶证排版 */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          {/* 购买日期 */}
          <div>
            <span className="text-xs text-muted-foreground">购买日期</span>
            <p className="font-medium text-foreground">{motorcycle.purchaseDate}</p>
          </div>

          {/* 当前里程 */}
          <div>
            <span className="text-xs text-muted-foreground">当前里程</span>
            <p className="flex items-center gap-1 font-medium text-foreground">
              <Gauge size={14} className="text-lime-600" />
              {motorcycle.currentMileage != null ? `${motorcycle.currentMileage} km` : '未记录'}
            </p>
          </div>

          {/* 油耗 */}
          <div>
            <span className="text-xs text-muted-foreground">百公里油耗</span>
            <p className="flex items-center gap-1 font-medium text-foreground">
              <Fuel size={14} className="text-lime-600" />
              {fuelConsumption != null ? `${fuelConsumption.toFixed(2)} L` : '数据不足'}
            </p>
          </div>

          {/* 最近加油 */}
          <div>
            <span className="text-xs text-muted-foreground">最近加油</span>
            <p className="font-medium text-foreground">
              {latestRecord
                ? `${latestRecord.date} / ${latestRecord.liters}L`
                : '暂无记录'}
            </p>
          </div>
        </div>

        {/* 分隔线 */}
        <div className="my-3 border-t border-dashed border-lime-200" />

        {/* 保养 & 保险信息 */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Wrench size={12} /> 下次保养
            </span>
            <p className="font-medium text-foreground">
              {nextMaintenance.date || nextMaintenance.mileage
                ? `${nextMaintenance.date ?? ''} ${nextMaintenance.mileage ? `/ ${nextMaintenance.mileage}km` : ''}`
                : '未设置'}
            </p>
          </div>

          <div>
            <span className={`flex items-center gap-1 text-xs ${isInsuranceExpiring ? 'text-red-500 font-semibold' : 'text-muted-foreground'}`}>
              <Shield size={12} /> 交强险到期
            </span>
            <p className={`font-medium ${isInsuranceExpiring ? 'text-red-600' : 'text-foreground'}`}>
              {motorcycle.insuranceExpiry ?? '未设置'}
            </p>
          </div>

          <div className="col-span-2">
            <span className={`flex items-center gap-1 text-xs ${isInspectionExpiring ? 'text-red-500 font-semibold' : 'text-muted-foreground'}`}>
              <Calendar size={12} /> 年检到期
            </span>
            <p className={`font-medium ${isInspectionExpiring ? 'text-red-600' : 'text-foreground'}`}>
              {motorcycle.inspectionExpiry ?? '未设置'}
            </p>
          </div>
        </div>

        {/* 底部操作 */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => navigate(`/fuel/add/${motorcycle.id}`)}
            className="flex-1 rounded-lg bg-lime-500 py-2.5 text-center text-sm font-medium text-white shadow-sm hover:bg-lime-600 active:bg-lime-700 transition-colors"
          >
            记录加油
          </button>
          <button
            onClick={() => navigate(`/fuel/history/${motorcycle.id}`)}
            className="flex-1 rounded-lg border border-lime-300 bg-white py-2.5 text-center text-sm font-medium text-lime-700 hover:bg-lime-50 active:bg-lime-100 transition-colors"
          >
            加油历史
          </button>
        </div>
      </div>
    </div>
  )
}