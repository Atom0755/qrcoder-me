'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { generateQRCode, downloadQRCode } from '@/lib/qrcode-generator'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Link as LinkIcon, Download } from 'lucide-react'
import { addMonths } from 'date-fns'

export default function CreateFreePage() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [qrCodeData, setQrCodeData] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      // 检查用户是否登录
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      // 检查是否有环境变量错误
      if (authError && authError.message.includes('环境变量')) {
        setMessage({ type: 'error', text: authError.message })
        return
      }

      if (!user) {
        setMessage({ type: 'error', text: '请先登录或注册' })
        setTimeout(() => router.push('/login'), 2000)
        return
      }

      // 生成二维码
      const qrData = await generateQRCode({
        url,
        size: 500,
        color: '#000000',
        shape: 'square',
      })

      setQrCodeData(qrData)

      // 保存到数据库
      const expiresAt = addMonths(new Date(), 1)
      const { error } = await supabase.from('qrcodes').insert({
        user_id: user.id,
        url,
        qr_type: 'free',
        size: 500,
        shape: 'square',
        color: '#000000',
        expires_at: expiresAt.toISOString(),
        is_active: true,
        last_confirmed_at: new Date().toISOString(),
      })

      if (error) throw error

      setMessage({ type: 'success', text: '二维码生成成功！' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '生成失败，请重试' })
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (qrCodeData) {
      downloadQRCode(qrCodeData, 'qrcode-free.png')
    }
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="mobile-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
          <Link href="/" className="inline-flex items-center text-white mb-4 hover:opacity-80">
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回首页
          </Link>
          <h1 className="text-2xl font-bold">创建免费二维码</h1>
          <p className="text-blue-100 text-sm mt-2">
            500×500 黑白圆点 | 每月需确认激活
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
                {loading ? '生成中...' : '生成二维码'}
              </button>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">免费版说明</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• 二维码有效期为一个月</li>
                  <li>• 到期前需登录确认激活</li>
                  <li>• 未激活将自动失效</li>
                  <li>• 黑白圆点，500×500尺寸</li>
                </ul>
              </div>
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
                  下载二维码
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
