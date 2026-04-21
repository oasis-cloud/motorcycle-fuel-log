import { useState, useRef } from 'react'
import { createWorker } from 'tesseract.js'
import type { OCRResult } from '@/types'
import { Camera, Loader2, ImageIcon } from 'lucide-react'

interface Props {
  onResult: (result: OCRResult) => void
}

export default function OcrCapture({ onResult }: Props) {
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setLoading(true)
    const url = URL.createObjectURL(file)
    setPreview(url)

    try {
      const worker = await createWorker('chi_sim+eng')
      const { data } = await worker.recognize(file)
      await worker.terminate()

      const text = data.text
      const result = parseOCRText(text)
      onResult(result)
    } catch (err) {
      console.error('OCR failed:', err)
      onResult({ raw: '识别失败，请手动输入' })
    } finally {
      setLoading(false)
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleInputChange}
      />

      {preview ? (
        <div className="relative overflow-hidden rounded-lg border border-lime-200">
          <img src={preview} alt="预览" className="w-full object-contain max-h-48" />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm">
                <Loader2 size={16} className="animate-spin text-lime-600" />
                正在识别...
              </div>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-lime-300 bg-lime-50/50 py-8 text-lime-600 hover:bg-lime-50 transition-colors"
        >
          <div className="flex gap-2">
            <Camera size={24} />
            <ImageIcon size={24} />
          </div>
          <span className="text-sm">拍照或选择加油机图片</span>
        </button>
      )}

      {preview && !loading && (
        <button
          type="button"
          onClick={() => {
            setPreview(null)
            fileRef.current?.click()
          }}
          className="w-full rounded-lg border border-lime-300 bg-white py-2 text-sm text-lime-700 hover:bg-lime-50 transition-colors"
        >
          重新拍照
        </button>
      )}
    </div>
  )
}

function parseOCRText(text: string): OCRResult {
  const result: OCRResult = { raw: text }

  // 尝试匹配金额 (如: 金额 50.00 元 / ¥50.00 / 50.00元)
  const amountMatch = text.match(/(?:金额|总[计价]|合计|amount|¥|￥)\s*[:：]?\s*(\d+\.?\d*)/i)
    || text.match(/(\d+\.?\d*)\s*元/)
  if (amountMatch) result.amount = parseFloat(amountMatch[1])

  // 尝试匹配升数 (如: 3.52升 / 3.52L / 升数 3.52)
  const litersMatch = text.match(/(?:升数|数量|volume)\s*[:：]?\s*(\d+\.?\d*)/i)
    || text.match(/(\d+\.?\d*)\s*[升lL]/)
  if (litersMatch) result.liters = parseFloat(litersMatch[1])

  // 尝试匹配单价 (如: 单价 7.62 / 7.62元/升)
  const priceMatch = text.match(/(?:单价|price)\s*[:：]?\s*(\d+\.?\d*)/i)
    || text.match(/(\d+\.?\d*)\s*元[/／]升/)
  if (priceMatch) result.unitPrice = parseFloat(priceMatch[1])

  return result
}