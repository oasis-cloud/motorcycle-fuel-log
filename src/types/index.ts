export interface Motorcycle {
  id: string
  name: string
  purchaseDate: string // YYYY-MM-DD
  insuranceExpiry?: string // 交强险到期日 YYYY-MM-DD
  inspectionExpiry?: string // 年检到期日 YYYY-MM-DD
  lastMaintenanceDate?: string // 上次保养日期
  lastMaintenanceMileage?: number // 上次保养里程
  currentMileage?: number // 当前里程
}

export interface FuelRecord {
  id: string
  motorcycleId: string
  date: string // YYYY-MM-DD
  amount: number // 金额（元）
  liters: number // 升数
  unitPrice: number // 单价（元/升）
  mileage?: number // 当前里程数
  isFull?: boolean // 是否加满
}

export interface OCRResult {
  amount?: number
  liters?: number
  unitPrice?: number
  raw: string
}