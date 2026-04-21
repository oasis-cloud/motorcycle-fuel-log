import { useAppStore } from '@/lib/store'
import MotorcycleCard from './MotorcycleCard'
import { Plus, Bike, Fuel } from 'lucide-react'
import { useNavigate } from 'react-router'

export default function Dashboard() {
  const motorcycles = useAppStore((s) => s.motorcycles)
  const activeId = useAppStore((s) => s.activeMotorcycleId)
  const setActive = useAppStore((s) => s.setActiveMotorcycle)
  const navigate = useNavigate()

  // 新用户 - 没有车辆
  if (motorcycles.length === 0) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-6">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-lime-100">
          <Bike size={40} className="text-lime-500" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-foreground">欢迎使用摩托车油耗记录</h1>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          开始之前，请先添加您的摩托车信息
        </p>
        <button
          onClick={() => navigate('/motorcycle/add')}
          className="flex items-center gap-2 rounded-xl bg-lime-500 px-6 py-3 text-sm font-medium text-white shadow-md hover:bg-lime-600 active:bg-lime-700 transition-colors"
        >
          <Plus size={18} />
          添加摩托车
        </button>
      </div>
    )
  }

  const activeMoto = motorcycles.find((m) => m.id === activeId) ?? motorcycles[0]

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* 顶部 Tab + 添加车辆按钮 */}
      <div className="sticky top-0 z-10 flex items-center gap-1 bg-white/80 px-4 py-3 backdrop-blur-sm border-b border-lime-100">
        <div className="flex flex-1 gap-1 overflow-x-auto">
          {motorcycles.map((m) => (
            <button
              key={m.id}
              onClick={() => setActive(m.id)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                m.id === activeMoto.id
                  ? 'bg-lime-500 text-white shadow-sm'
                  : 'bg-lime-50 text-lime-700 hover:bg-lime-100'
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>
        <button
          onClick={() => navigate('/motorcycle/add')}
          className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full border border-lime-300 text-lime-600 hover:bg-lime-50 transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* 车辆卡片 */}
      <div className="px-4 pt-5">
        <MotorcycleCard motorcycle={activeMoto} />
      </div>

      {/* 底部快速记录加油按钮 */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => navigate(`/fuel/add/${activeMoto.id}`)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-lime-500 text-white shadow-lg hover:bg-lime-600 active:bg-lime-700 transition-colors"
        >
          <Fuel size={24} />
        </button>
      </div>
    </div>
  )
}