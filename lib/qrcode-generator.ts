import QRCode from 'qrcode'

export interface QRCodeOptions {
  url: string
  size: number
  color: string
  shape: 'square' | 'circle'
  logo?: string
}

export async function generateQRCode(options: QRCodeOptions): Promise<string> {
  const { url, size, color, shape, logo } = options

  // 生成基础二维码
  const qrDataUrl = await QRCode.toDataURL(url, {
    width: size,
    margin: 2,
    color: {
      dark: color,
      light: '#FFFFFF',
    },
    errorCorrectionLevel: logo ? 'H' : 'M',
  })

  // 如果不需要logo或形状处理，直接返回
  if (!logo && shape === 'square') {
    return qrDataUrl
  }

  // 创建canvas进行高级处理
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  canvas.width = size
  canvas.height = size

  // 加载二维码图像
  const qrImage = await loadImage(qrDataUrl)
  
  if (shape === 'circle') {
    // 创建圆形遮罩
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()
  }

  ctx.drawImage(qrImage, 0, 0, size, size)

  // 如果有logo，添加到中心
  if (logo) {
    const logoSize = size * 0.2
    const logoX = (size - logoSize) / 2
    const logoY = (size - logoSize) / 2

    // 绘制白色背景
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10)

    // 绘制logo
    const logoImage = await loadImage(logo)
    ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize)
  }

  return canvas.toDataURL('image/png')
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export function downloadQRCode(dataUrl: string, filename: string = 'qrcode.png') {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
