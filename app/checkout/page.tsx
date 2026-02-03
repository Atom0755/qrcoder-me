'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check, CreditCard } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function CheckoutPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setUser(user)
  }

  const handleCheckout = async () => {
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // 调用后端API创建Stripe Checkout Session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
        }),
      })

      const { sessionId } = await response.json()

      // 重定向到Stripe Checkout
      const stripe = await stripePromise
      const { error } = await stripe!.redirectToCheckout({ sessionId })

      if (error) {
        console.error('Stripe checkout error:', error)
        alert('支付失败，请重试')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('支付失败，请重试')
    } finally {
      setLoading(false)
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
          <h1 className="text-2xl font-bold">升级专业版</h1>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Pricing Card */}
          <div className="card bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-300">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">专业版</h2>
              <div className="flex items-baseline justify-center">
                <span className="text-5xl font-bold text-purple-600">¥99</span>
                <span className="text-gray-600 ml-2">/年</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <Check className="w-5 h-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-gray-700">一年有效期，自动续费</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-gray-700">自定义尺寸（500-2000像素）</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-gray-700">方形或圆形样式</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-gray-700">自定义颜色</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-gray-700">支持Logo上传</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-gray-700">高清下载，商业使用</span>
              </li>
            </ul>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center disabled:opacity-50"
            >
              <CreditCard className="w-5 h-5 mr-2" />
              {loading ? '处理中...' : '立即购买'}
            </button>
          </div>

          {/* Payment Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-3">支付说明</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• 安全支付由Stripe提供</li>
              <li>• 支持信用卡、借记卡</li>
              <li>• 自动续费，可随时取消</li>
              <li>• 购买后立即生效</li>
            </ul>
          </div>

          {/* FAQ */}
          <div className="bg-blue-50 rounded-xl p-4">
            <h3 className="font-semibold text-blue-900 mb-3">常见问题</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-blue-900 mb-1">如何取消订阅？</p>
                <p className="text-blue-700">登录后在个人中心可以管理订阅，随时取消。</p>
              </div>
              <div>
                <p className="font-medium text-blue-900 mb-1">取消后二维码还有效吗？</p>
                <p className="text-blue-700">取消订阅后，已创建的二维码会在订阅到期后失效。</p>
              </div>
              <div>
                <p className="font-medium text-blue-900 mb-1">可以开发票吗？</p>
                <p className="text-blue-700">支付后会收到电子收据，如需发票请联系客服。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
