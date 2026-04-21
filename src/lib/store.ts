import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Motorcycle, FuelRecord } from '@/types'

interface AppState {
  motorcycles: Motorcycle[]
  fuelRecords: FuelRecord[]
  activeMotorcycleId: string | null

  // 车辆操作
  addMotorcycle: (moto: Motorcycle) => void
  updateMotorcycle: (id: string, data: Partial<Motorcycle>) => void
  removeMotorcycle: (id: string) => void
  setActiveMotorcycle: (id: string) => void

  // 加油记录操作
  addFuelRecord: (record: FuelRecord) => void
  updateFuelRecord: (id: string, data: Partial<FuelRecord>) => void
  removeFuelRecord: (id: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      motorcycles: [],
      fuelRecords: [],
      activeMotorcycleId: null,

      addMotorcycle: (moto) =>
        set((state) => ({
          motorcycles: [...state.motorcycles, moto],
          activeMotorcycleId: state.activeMotorcycleId ?? moto.id,
        })),

      updateMotorcycle: (id, data) =>
        set((state) => ({
          motorcycles: state.motorcycles.map((m) =>
            m.id === id ? { ...m, ...data } : m
          ),
        })),

      removeMotorcycle: (id) =>
        set((state) => {
          const motorcycles = state.motorcycles.filter((m) => m.id !== id)
          const fuelRecords = state.fuelRecords.filter(
            (r) => r.motorcycleId !== id
          )
          return {
            motorcycles,
            fuelRecords,
            activeMotorcycleId:
              state.activeMotorcycleId === id
                ? motorcycles[0]?.id ?? null
                : state.activeMotorcycleId,
          }
        }),

      setActiveMotorcycle: (id) => set({ activeMotorcycleId: id }),

      addFuelRecord: (record) =>
        set((state) => ({
          fuelRecords: [...state.fuelRecords, record],
        })),

      updateFuelRecord: (id, data) =>
        set((state) => ({
          fuelRecords: state.fuelRecords.map((r) =>
            r.id === id ? { ...r, ...data } : r
          ),
        })),

      removeFuelRecord: (id) =>
        set((state) => ({
          fuelRecords: state.fuelRecords.filter((r) => r.id !== id),
        })),
    }),
    {
      name: 'motorcycle-fuel-log',
    }
  )
)

// 油耗计算工具
export function calculateFuelConsumption(records: FuelRecord[]): number | null {
  const sorted = [...records].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )
  // 需要至少两条有里程的记录
  const withMileage = sorted.filter((r) => r.mileage != null)
  if (withMileage.length < 2) return null

  const first = withMileage[0]
  const last = withMileage[withMileage.length - 1]
  const distance = last.mileage! - first.mileage!
  if (distance <= 0) return null

  // 计算中间加油量（不含第一次，因为第一次加油前的油量未知）
  const totalLiters = withMileage.slice(1).reduce((sum, r) => sum + r.liters, 0)
  // 百公里油耗
  return (totalLiters / distance) * 100
}

// 保养估算: 摩托车每3000-5000公里或每6个月保养一次
export function estimateNextMaintenance(moto: Motorcycle): { date?: string; mileage?: number } {
  const result: { date?: string; mileage?: number } = {}

  if (moto.lastMaintenanceDate) {
    const lastDate = new Date(moto.lastMaintenanceDate)
    lastDate.setMonth(lastDate.getMonth() + 6) // 6个月后
    result.date = lastDate.toISOString().split('T')[0]
  }

  if (moto.lastMaintenanceMileage != null) {
    result.mileage = moto.lastMaintenanceMileage + 3000 // 每3000公里
  }

  return result
}

// 导出数据为 JSON 文件
export function exportData() {
  const { motorcycles, fuelRecords, activeMotorcycleId } = useAppStore.getState()
  const data = { motorcycles, fuelRecords, activeMotorcycleId }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `motorcycle-fuel-log-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// 从 JSON 文件导入数据
export function importData(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (!Array.isArray(data.motorcycles) || !Array.isArray(data.fuelRecords)) {
          throw new Error('数据格式不正确')
        }
        useAppStore.setState({
          motorcycles: data.motorcycles,
          fuelRecords: data.fuelRecords,
          activeMotorcycleId: data.activeMotorcycleId ?? data.motorcycles[0]?.id ?? null,
        })
        resolve()
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsText(file)
  })
}