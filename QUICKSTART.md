# 🚀 快速开始指南

## 5分钟本地运行

### 1. 安装依赖
```bash
npm install
```

### 2. 创建环境变量文件
```bash
cp .env.example .env.local
```

### 3. 配置最小化环境变量（用于本地测试）

```env
# Supabase - 使用免费tier
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe - 使用测试模式
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# 本地URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. 在Supabase创建项目

1. 访问 https://app.supabase.com
2. 创建新项目（免费）
3. 复制URL和API密钥
4. 在SQL Editor中执行 `supabase/init.sql`

### 5. 在Stripe创建测试账号

1. 访问 https://dashboard.stripe.com/register
2. 获取测试模式API密钥
3. 暂时不需要配置Webhook（本地测试）

### 6. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 7. 测试功能

#### 测试免费版：
1. 注册账号（使用真实邮箱，因为需要验证）
2. 生成免费二维码
3. 下载二维码

#### 测试专业版：
1. 点击升级专业版
2. 使用Stripe测试卡：
   - 卡号: 4242 4242 4242 4242
   - 日期: 任意未来日期
   - CVC: 任意3位数字
   - 邮编: 任意5位数字
3. 完成支付
4. 生成专业版二维码

## 🎯 核心功能验证

### ✅ 用户认证
- [ ] 邮箱注册
- [ ] 邮箱验证
- [ ] 登录/登出

### ✅ 免费版二维码
- [ ] 生成黑白二维码
- [ ] 下载二维码
- [ ] 查看有效期
- [ ] 激活延期

### ✅ 专业版二维码
- [ ] 购买订阅
- [ ] 自定义尺寸
- [ ] 自定义颜色
- [ ] 选择形状
- [ ] 上传Logo
- [ ] 下载高清二维码

### ✅ 用户仪表板
- [ ] 查看所有二维码
- [ ] 查看状态（有效/过期）
- [ ] 激活免费二维码

## 📝 注意事项

1. **邮件发送**
   - Supabase免费版每天有邮件发送限制
   - 生产环境建议配置自定义SMTP

2. **Stripe测试卡**
   - 只在测试模式下有效
   - 不会产生真实扣款

3. **数据库**
   - Supabase免费版有500MB存储限制
   - 足够测试和小规模使用

## 🐛 常见问题

### 问题1：收不到验证邮件
**解决方案**：
- 检查垃圾邮件箱
- 确认Supabase项目中Email功能已启用
- 查看Supabase日志

### 问题2：支付页面打不开
**解决方案**：
- 检查Stripe API密钥是否正确
- 确认环境变量已设置
- 查看浏览器控制台错误

### 问题3：二维码生成失败
**解决方案**：
- 确认用户已登录
- 检查数据库连接
- 查看浏览器控制台错误

## 🎓 下一步

本地测试成功后，参考 `DEPLOYMENT.md` 进行生产环境部署。

主要步骤：
1. 推送代码到GitHub
2. 连接Vercel
3. 配置域名
4. 配置Stripe Webhook
5. 切换到生产模式

---

需要帮助？请查看完整的 README.md 和 DEPLOYMENT.md
