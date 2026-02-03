import Link from 'next/link'
import { QrCode, Sparkles, Shield, Clock } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen py-8 px-4">
      <div className="mobile-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 text-center">
          <QrCode className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">QRCoder.me</h1>
          <p className="text-blue-100">智能二维码生成平台</p>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* Free Plan */}
          <div className="card border-2 border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">免费版</h2>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                ¥0
              </span>
            </div>
            
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <Clock className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-600">每月免费使用，需确认激活</span>
              </li>
              <li className="flex items-start">
                <QrCode className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-600">500×500 黑白圆点二维码</span>
              </li>
              <li className="flex items-start">
                <Shield className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-600">邮箱注册，安全可靠</span>
              </li>
            </ul>

            <Link href="/create/free" className="block">
              <button className="btn-secondary w-full">
                开始免费创建
              </button>
            </Link>
          </div>

          {/* Premium Plan */}
          <div className="flex items-center justify-between mb-4">
  <h2 className="text-xl font-bold text-gray-800">专业版</h2>
  <div className="flex flex-col items-end gap-1">
    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
      $5/月
    </span>
    <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-medium">
      或 $50/年
    </span>
  </div>
</div>
            
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <Sparkles className="w-5 h-5 text-purple-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-600">一年有效期，自动续费</span>
              </li>
              <li className="flex items-start">
                <QrCode className="w-5 h-5 text-purple-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-600">自定义尺寸、形状和颜色</span>
              </li>
              <li className="flex items-start">
                <Sparkles className="w-5 h-5 text-purple-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-600">支持Logo上传，品牌定制</span>
              </li>
              <li className="flex items-start">
                <Shield className="w-5 h-5 text-purple-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-600">高清下载，商业使用</span>
              </li>
            </ul>

            <Link href="/create/premium" className="block">
              <button className="btn-primary w-full">
                立即升级专业版
              </button>
            </Link>
          </div>

          {/* Login Link */}
          <div className="text-center pt-4">
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              已有账号？立即登录
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
