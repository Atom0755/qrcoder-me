'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { generateQRCode, downloadQRCode } from '@/lib/qrcode-generator'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Link as LinkIcon, Download, Upload, Palette, Maximize } from 'lucide-react'
import { addYears } from 'date-fns'

export default function CreatePremiumPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [url, setUrl] = useState('')
  const [size, setSize] = useState(1000)
  const [shape, setShape] = useState<'square' | 'circle'>('square')
  const [color, setColor] = useState('#000000')
  const [logo, setLogo] = useState<string | null>(null)
  const [qrCodeData, setQrCodeData] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogo(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      // 检查用户是否登录
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setMessage({ type: 'error', text: '请先登录或注册' })
        setTimeout(() => router.push('/login'), 2000)
        return
      }

      // 检查用户是否有有效订阅
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (!subscription) {
        setMessage({ type: 'error', text: '请先购买专业版订阅' })
        setTimeout(() => router.push('/checkout'), 2000)
        return
      }

      // 生成二维码
      const qrData = await generateQRCode({
        url,
        size,
        color,
        shape,
        logo: logo || undefined,
      })

      setQrCodeData(qrData)

      // 保存到数据库
      const expiresAt = addYears(new Date(), 1)
      const { error } = await supabase.from('qrcodes').insert({
        user_id: user.id,
        url,
        qr_type: 'premium',
        size,
        shape,
        color,
        logo_url: logo,
        expires_at: expiresAt.toISOString(),
        is_active: true,
      })

      if (error) throw error

      setMessage({ type: 'success', text: '专业版二维码生成成功！' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '生成失败，请重试' })
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (qrCodeData) {
      downloadQRCode(qrCodeData, `qrcode-premium-${size}x${size}.png`)
    }
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="mobile-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white p-6">
          <Link href="/" className="inline-flex items-center text-white mb-4 hover:opacity-80">
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回首页
          </Link>
          <h1 className="text-2xl font-bold">创建专业版二维码</h1>
          <p className="text-purple-100 text-sm mt-2">
            自定义样式 | Logo支持 | 一年有效
          </p>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {!qrCodeData ? (
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  输入网址
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="input-field pl-10"
                    placeholder="https://example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Maximize className="inline w-4 h-4 mr-1" />
                  尺寸大小
                </label>
                <select
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="input-field"
                >
                  <option value={500}>500 × 500</option>
                  <option value={800}>800 × 800</option>
                  <option value={1000}>1000 × 1000</option>
                  <option value={1500}>1500 × 1500</option>
                  <option value={2000}>2000 × 2000</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  形状样式
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setShape('square')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      shape === 'square'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-12 h-12 bg-gray-800 rounded-lg mx-auto mb-2"></div>
                    <p className="text-sm font-medium">方形</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShape('circle')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      shape === 'circle'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-12 h-12 bg-gray-800 rounded-full mx-auto mb-2"></div>
                    <p className="text-sm font-medium">圆形</p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Palette className="inline w-4 h-4 mr-1" />
                  二维码颜色
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-16 h-12 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="input-field flex-1"
                    placeholder="#000000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Upload className="inline w-4 h-4 mr-1" />
                  上传Logo（可选）
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary w-full"
                >
                  {logo ? '更换Logo' : '选择Logo图片'}
                </button>
                {logo && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <img src={logo} alt="Logo preview" className="w-20 h-20 object-contain mx-auto" />
                  </div>
                )}
              </div>

              {message && (
                <div className={`p-3 rounded-lg text-sm ${
                  message.type === 'success' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading ? '生成中...' : '生成专业版二维码'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden mb-4">
                  <img 
                    src={qrCodeData} 
                    alt="Generated QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>
                
                <button
                  onClick={handleDownload}
                  className="btn-primary w-full flex items-center justify-center"
                >
                  <Download className="w-5 h-5 mr-2" />
                  下载高清二维码
                </button>
              </div>

              <button
                onClick={() => {
                  setQrCodeData(null)
                  setUrl('')
                  setMessage(null)
                }}
                className="btn-secondary w-full"
              >
                创建新的二维码
              </button>

              <Link href="/dashboard" className="block">
                <button className="btn-secondary w-full">
                  查看我的二维码
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
