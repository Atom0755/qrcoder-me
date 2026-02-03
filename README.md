# QRCoder.me - 智能二维码生成平台

一个现代化的二维码生成SaaS平台，支持免费和专业版两种模式，采用手机屏幕风格的响应式设计。

## ✨ 功能特点

### 免费版
- ✅ 500×500 黑白圆点二维码
- ✅ 每月免费使用
- ✅ 邮箱登录确认激活机制
- ✅ 一个月有效期，可延期

### 专业版
- ✨ 自定义尺寸（500-2000像素）
- ✨ 方形或圆形样式
- ✨ 自定义颜色
- ✨ Logo上传支持
- ✨ 一年有效期
- ✨ 自动续费管理

## 🛠️ 技术栈

- **前端框架**: Next.js 14 (App Router)
- **UI**: React 18 + TypeScript + Tailwind CSS
- **数据库**: Supabase (PostgreSQL + Auth)
- **支付**: Stripe
- **部署**: Vercel
- **二维码生成**: qrcode库

## 📦 项目结构

```
qrcoder-me/
├── app/
│   ├── page.tsx                 # 首页
│   ├── login/                   # 登录注册页
│   ├── dashboard/               # 用户仪表板
│   ├── create/
│   │   ├── free/               # 免费版生成页
│   │   └── premium/            # 专业版生成页
│   ├── checkout/               # 支付页面
│   └── api/
│       ├── webhooks/           # Stripe Webhooks
│       └── create-checkout-session/  # 创建支付会话
├── lib/
│   ├── supabase.ts            # Supabase客户端
│   └── qrcode-generator.ts    # 二维码生成工具
├── supabase/
│   └── init.sql               # 数据库初始化脚本
└── public/                    # 静态资源
```

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/yourusername/qrcoder-me.git
cd qrcoder-me
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env.local`:

```bash
cp .env.example .env.local
```

填写以下环境变量：

```env
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe配置
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# 网站URL
NEXT_PUBLIC_SITE_URL=https://qrcoder.me
```

### 4. 初始化Supabase数据库

1. 登录 [Supabase控制台](https://app.supabase.com)
2. 创建新项目
3. 进入SQL Editor
4. 执行 `supabase/init.sql` 中的SQL语句

### 5. 配置Stripe

1. 登录 [Stripe控制台](https://dashboard.stripe.com)
2. 获取API密钥（测试模式和生产模式）
3. 配置Webhook端点: `https://qrcoder.me/api/webhooks`
4. 监听以下事件:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`

### 6. 本地开发

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 🌐 部署到Vercel

### 1. 连接GitHub仓库

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/qrcoder-me.git
git push -u origin main
```

### 2. Vercel部署

1. 登录 [Vercel控制台](https://vercel.com)
2. 点击 "Import Project"
3. 选择你的GitHub仓库
4. 配置环境变量（与 `.env.local` 相同）
5. 点击 "Deploy"

### 3. 配置自定义域名

1. 在Vercel项目设置中添加域名 `qrcoder.me`
2. 按照提示配置DNS记录
3. 等待DNS生效（通常需要几分钟到几小时）

## 📧 邮件配置

Supabase默认使用自己的邮件服务，但生产环境建议使用自定义SMTP:

1. 进入Supabase项目设置
2. 选择 Authentication > Email Templates
3. 配置SMTP服务器（如SendGrid、AWS SES等）
4. 自定义邮件模板

## 🔒 安全配置

### Supabase Row Level Security (RLS)

所有数据表已启用RLS策略，确保用户只能访问自己的数据。

### Stripe Webhook验证

Webhook端点已实现签名验证，防止恶意请求。

## 📱 功能说明

### 免费版工作流程

1. 用户注册/登录
2. 输入网址生成二维码
3. 二维码有效期1个月
4. 到期前用户需登录点击"确认激活"
5. 激活后延长1个月有效期
6. 未激活则二维码失效

### 专业版工作流程

1. 用户注册/登录
2. 购买专业版订阅（$5/Monthly每月）（或$50/Yearly每年）
3. 自定义样式生成二维码
4. 二维码有效期1年
5. 订阅自动续费
6. 取消订阅后二维码在订阅期结束时失效

## 🔄 定时任务

建议在Supabase中配置 pg_cron 定时任务，每小时检查并更新过期的二维码：

```sql
SELECT cron.schedule(
  'deactivate-expired-qrcodes',
  '0 * * * *',
  'SELECT public.deactivate_expired_qrcodes()'
);
```

## 📊 数据库架构

### users 表
- 扩展 auth.users 的用户信息
- 存储邮箱和登录记录

### qrcodes 表
- 存储所有生成的二维码信息
- 包含URL、样式、有效期等

### subscriptions 表
- 存储用户订阅信息
- 关联Stripe客户和订阅ID

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License

## 📞 联系方式

- 网站: [qrcoder.me](https://qrcoder.me)
- 邮箱: support@qrcoder.me

---

Made with ❤️ using Next.js and Supabase
