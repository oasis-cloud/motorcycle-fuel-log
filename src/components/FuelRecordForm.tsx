import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useAppStore } from '@/lib/store'
import OcrCapture from './OcrCapture'
import type { OCRResult } from '@/types'
import { ArrowLeft, ScanLine, FormInput } from 'lucide-react'

export default function FuelRecordForm() {
  const navigate = useNavigate()
  const { motorcycleId } = useParams()
  const addFuelRecord = useAppStore((s) => s.addFuelRecord)
  const updateMotorcycle = useAppStore((s) => s.updateMotorcycle)
  const motorcycles = useAppStore((s) => s.motorcycles)
  const moto = motorcycles.find((m) => m.id === motorcycleId)

  const [mode, setMode] = useState<'form' | 'ocr'>('form')
  const [amount, setAmount] = useState('')
  const [liters, setLiters] = useState('')
  const [unitPrice, setUnitPrice] = useState('')
  const [mileage, setMileage] = useState(moto?.currentMileage?.toString() ?? '')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [isFull, setIsFull] = useState(true)

  function handleOcrResult(result: OCRResult) {
    if (result.amount) setAmount(result.amount.toString())
    if (result.liters) setLiters(result.liters.toString())
    if (result.unitPrice) setUnitPrice(result.unitPrice.toString())
  }

  // 自动计算第三个值
  function autoCalc(field: 'amount' | 'liters' | 'unitPrice', value: string) {
    const a = field === 'amount' ? parseFloat(value) : parseFloat(amount)
    const l = field === 'liters' ? parseFloat(value) : parseFloat(liters)
    const u = field === 'unitPrice' ? parseFloat(value) : parseFloat(unitPrice)

    if (field === 'amount') {
      setAmount(value)
      if (l && parseFloat(value)) setUnitPrice((parseFloat(value) / l).toFixed(2))
      else if (u && parseFloat(value)) setLiters((parseFloat(value) / u).toFixed(2))
    } else if (field === 'liters') {
      setLiters(value)
      if (a && parseFloat(value)) setUnitPrice((a / parseFloat(value)).toFixed(2))
      else if (u && parseFloat(value)) setAmount((u * parseFloat(value)).toFixed(2))
    } else {
      setUnitPrice(value)
      if (a && parseFloat(value)) setLiters((a / parseFloat(value)).toFixed(2))
      else if (l && parseFloat(value)) setAmount((parseFloat(value) * l).toFixed(2))
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!amount || !liters || !unitPrice || !motorcycleId) return

    addFuelRecord({
      id: crypto.randomUUID(),
      motorcycleId,
      date,
      amount: parseFloat(amount),
      liters: parseFloat(liters),
      unitPrice: parseFloat(unitPrice),
      mileage: mileage ? parseFloat(mileage) : undefined,
      isFull,
    })

    // 更新车辆里程
    if (mileage) {
      updateMotorcycle(motorcycleId, { currentMileage: parseFloat(mileage) })
    }

    navigate('/')
  }

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
        <h1 className="text-lg font-bold text-lime-800">记录加油 - {moto.name}</h1>
      </div>

      {/* 模式切换 */}
      <div className="flex gap-2 p-4 pb-0">
        <button
          type="button"
          onClick={() => setMode('form')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-colors ${
            mode === 'form' ? 'bg-lime-500 text-white' : 'bg-lime-50 text-lime-700'
          }`}
        >
          <FormInput size={16} />
          手动录入
        </button>
        <button
          type="button"
          onClick={() => setMode('ocr')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-colors ${
            mode === 'ocr' ? 'bg-lime-500 text-white' : 'bg-lime-50 text-lime-700'
          }`}
        >
          <ScanLine size={16} />
          拍照识别
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        {mode === 'ocr' && <OcrCapture onResult={handleOcrResult} />}

        <div>
          <label className="mb-1 block text-xs text-muted-foreground">日期</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-input bg-white px-3 py-2.5 text-sm outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-200 transition-all" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">金额 (元)</label>
            <input type="number" step="0.01" value={amount} onChange={(e) => autoCalc('amount', e.target.value)}
              placeholder="0.00"
              className="w-full rounded-lg border border-input bg-white px-3 py-2.5 text-sm outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-200 transition-all" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">升数 (L)</label>
            <input type="number" step="0.01" value={liters} onChange={(e) => autoCalc('liters', e.target.value)}
              placeholder="0.00"
              className="w-full rounded-lg border border-input bg-white px-3 py-2.5 text-sm outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-200 transition-all" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">单价 (元/L)</label>
            <input type="number" step="0.01" value={unitPrice} onChange={(e) => autoCalc('unitPrice', e.target.value)}
              placeholder="0.00"
              className="w-full rounded-lg border border-input bg-white px-3 py-2.5 text-sm outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-200 transition-all" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-muted-foreground">当前里程 (km)</label>
          <input type="number" value={mileage} onChange={(e) => setMileage(e.target.value)}
            placeholder="选填，用于计算油耗"
            className="w-full rounded-lg border border-input bg-white px-3 py-2.5 text-sm outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-200 transition-all" />
        </div>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={isFull} onChange={(e) => setIsFull(e.target.checked)}
            className="h-4 w-4 rounded border-lime-300 text-lime-500 accent-lime-500" />
          已加满油箱
        </label>

        <button
          type="submit"
          className="w-full rounded-xl bg-lime-500 py-3 text-sm font-medium text-white shadow-sm hover:bg-lime-600 active:bg-lime-700 transition-colors"
        >
          保存记录
        </button>
      </form>
    </div>
  )
}