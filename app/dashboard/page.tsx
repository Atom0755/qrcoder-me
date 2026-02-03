'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { QrCode, LogOut, CheckCircle, XCircle, Calendar, ExternalLink } from 'lucide-react'
import { format, isBefore } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface QRCodeItem {
  id: string
  url: string
  qr_type: 'free' | 'premium'
  size: number
  shape: string
  color: string
  is_active: boolean
  expires_at: string
  created_at: string
  last_confirmed_at: string | null
}

export default function DashboardPage() {
  const router = useRouter()
  const [qrcodes, setQrcodes] = useState<QRCodeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkUser()
    loadQRCodes()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setUser(user)
  }

  const loadQRCodes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('qrcodes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setQrcodes(data || [])
    } catch (error) {
      console.error('Error loading QR codes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async (qrcodeId: string) => {
    try {
      const { error } = await supabase
        .from('qrcodes')
        .update({ 
          last_confirmed_at: new Date().toISOString(),
          is_active: true 
        })
        .eq('id', qrcodeId)

      if (error) throw error
      
      alert('激活成功！有效期已延长一个月')
      loadQRCodes()
    } catch (error) {
      alert('激活失败，请重试')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const isExpired = (expiresAt: string) => {
    return isBefore(new Date(expiresAt), new Date())
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="mobile-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">我的二维码</h1>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
          <p className="text-blue-100 text-sm">
            {user?.email}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {qrcodes.length === 0 ? (
            <div className="text-center py-12">
              <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-6">还没有创建任何二维码</p>
              <div className="space-y-3">
                <Link href="/create/free" className="block">
                  <button className="btn-secondary w-full">
                    创建免费二维码
                  </button>
                </Link>
                <Link href="/create/premium" className="block">
                  <button className="btn-primary w-full">
                    创建专业版二维码
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {qrcodes.map((qrcode) => {
                const expired = isExpired(qrcode.expires_at)
                const needsConfirmation = qrcode.qr_type === 'free' && !expired

                return (
                  <div key={qrcode.id} className="card">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            qrcode.qr_type === 'premium'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {qrcode.qr_type === 'premium' ? '专业版' : '免费版'}
                          </span>
                          {qrcode.is_active && !expired ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        <a 
                          href={qrcode.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-gray-600 hover:text-blue-600 flex items-center"
                        >
                          <span className="truncate">{qrcode.url}</span>
                          <ExternalLink className="w-3 h-3 ml-1 flex-shrink-0" />
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center text-xs text-gray-500 space-x-4 mb-3">
                      <span>{qrcode.size}×{qrcode.size}</span>
                      <span>{qrcode.shape === 'circle' ? '圆形' : '方形'}</span>
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-1"
                          style={{ backgroundColor: qrcode.color }}
                        ></div>
                        {qrcode.color}
                      </div>
                    </div>

                    <div className="flex items-center text-xs text-gray-500 mb-3">
                      <Calendar className="w-3 h-3 mr-1" />
                      到期时间: {format(new Date(qrcode.expires_at), 'yyyy年MM月dd日', { locale: zhCN })}
                    </div>

                    {needsConfirmation && (
                      <button
                        onClick={() => handleConfirm(qrcode.id)}
                        className="btn-primary w-full text-sm py-2"
                      >
                        确认激活（延长一个月）
                      </button>
                    )}

                    {expired && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                        此二维码已过期失效
                      </div>
                    )}
                  </div>
                )
              })}

              <div className="pt-4 space-y-3">
                <Link href="/create/free" className="block">
                  <button className="btn-secondary w-full">
                    + 创建免费二维码
                  </button>
                </Link>
                <Link href="/create/premium" className="block">
                  <button className="btn-primary w-full">
                    + 创建专业版二维码
                  </button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
