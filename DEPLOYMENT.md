# QRCoder.me 部署指南

## 📋 部署前准备清单

- [ ] GitHub账号
- [ ] Vercel账号
- [ ] Supabase账号
- [ ] Stripe账号（支持中国大陆）
- [ ] 域名 qrcoder.me 已购买

## 🚀 完整部署步骤

### 第一步：配置Supabase

1. **创建Supabase项目**
   - 访问 https://app.supabase.com
   - 点击 "New Project"
   - 项目名称: `qrcoder-me`
   - 数据库密码: 设置一个强密码
   - 区域: 选择离用户最近的区域（建议选择新加坡）

2. **初始化数据库**
   - 进入项目后，点击左侧 "SQL Editor"
   - 点击 "New Query"
   - 复制 `supabase/init.sql` 的全部内容
   - 粘贴并点击 "Run" 执行

3. **配置认证**
   - 点击左侧 "Authentication" > "Providers"
   - 确保 "Email" 已启用
   - 在 "Email Templates" 中自定义邮件模板（可选）

4. **获取API密钥**
   - 点击左侧 "Settings" > "API"
   - 复制以下信息:
     - Project URL (NEXT_PUBLIC_SUPABASE_URL)
     - anon public key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
     - service_role key (SUPABASE_SERVICE_ROLE_KEY)

5. **配置邮件服务（生产环境必需）**
   - 进入 "Settings" > "Auth"
   - 配置SMTP设置（推荐使用SendGrid或AWS SES）
   - 测试邮件发送功能

### 第二步：配置Stripe

1. **创建Stripe账号**
   - 访问 https://dashboard.stripe.com/register
   - 注册并完成身份验证
   - 注意：需要支持中国大陆的支付方式

2. **获取API密钥**
   - 进入 "Developers" > "API keys"
   - 复制:
     - Publishable key (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
     - Secret key (STRIPE_SECRET_KEY)
   - 注意：先使用测试模式的密钥

3. **创建产品和价格**
   - 进入 "Products" > "Add product"
   - 产品名称: QRCoder.me 专业版
   - 价格: ¥99 CNY
   - 计费周期: 年度订阅
   - 保存产品ID（后续可能需要）

4. **配置Webhook（部署后再做）**
   - 进入 "Developers" > "Webhooks"
   - 点击 "Add endpoint"
   - URL: `https://qrcoder.me/api/webhooks`
   - 监听事件:
     - checkout.session.completed
     - customer.subscription.updated
     - customer.subscription.deleted
     - invoice.payment_failed
   - 复制 Signing secret (STRIPE_WEBHOOK_SECRET)

### 第三步：推送代码到GitHub

1. **初始化Git仓库**
   ```bash
   cd qrcoder-me
   git init
   git add .
   git commit -m "Initial commit: QRCoder.me project"
   ```

2. **创建GitHub仓库**
   - 访问 https://github.com/new
   - 仓库名称: `qrcoder-me`
   - 设置为私有（推荐）
   - 不要初始化README（我们已经有了）

3. **推送代码**
   ```bash
   git remote add origin https://github.com/yourusername/qrcoder-me.git
   git branch -M main
   git push -u origin main
   ```

### 第四步：部署到Vercel

1. **导入项目**
   - 访问 https://vercel.com
   - 点击 "Add New" > "Project"
   - 选择 "Import Git Repository"
   - 选择你的 `qrcoder-me` 仓库

2. **配置环境变量**
   在 "Environment Variables" 中添加以下变量:
   
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
   STRIPE_SECRET_KEY=sk_test_xxxxx
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   NEXT_PUBLIC_SITE_URL=https://qrcoder.me
   ```

3. **部署设置**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Node.js Version: 18.x
   - 点击 "Deploy"

4. **等待部署完成**
   - 首次部署需要3-5分钟
   - 完成后会得到一个临时域名，如: `qrcoder-me.vercel.app`

### 第五步：配置自定义域名

1. **在Vercel中添加域名**
   - 进入项目 "Settings" > "Domains"
   - 输入 `qrcoder.me`
   - 点击 "Add"
   - Vercel会提供DNS配置信息

2. **配置DNS记录**
   - 登录你的域名注册商（如阿里云、GoDaddy等）
   - 添加以下记录:
     ```
     类型: A
     主机记录: @
     记录值: 76.76.21.21 (Vercel的IP)
     
     类型: CNAME
     主机记录: www
     记录值: cname.vercel-dns.com
     ```
   - 保存配置

3. **等待DNS生效**
   - 通常需要10分钟到24小时
   - 可以使用 `dig qrcoder.me` 命令检查

4. **SSL证书**
   - Vercel会自动配置Let's Encrypt SSL证书
   - 通常在域名生效后几分钟内完成

### 第六步：完成Stripe Webhook配置

1. **更新Webhook URL**
   - 现在域名已配置，回到Stripe控制台
   - 更新Webhook endpoint URL为: `https://qrcoder.me/api/webhooks`
   - 复制新的 Signing secret

2. **更新Vercel环境变量**
   - 在Vercel项目设置中
   - 更新 `STRIPE_WEBHOOK_SECRET` 为新的值
   - 更新 `NEXT_PUBLIC_SITE_URL` 为 `https://qrcoder.me`
   - 保存后触发重新部署

### 第七步：测试功能

1. **测试免费版功能**
   - 访问 https://qrcoder.me
   - 注册新账号
   - 尝试生成免费二维码
   - 检查邮箱是否收到验证邮件

2. **测试专业版功能**
   - 点击升级专业版
   - 使用Stripe测试卡号:
     - 卡号: 4242 4242 4242 4242
     - 日期: 任意未来日期
     - CVC: 任意3位数字
   - 完成支付流程
   - 生成专业版二维码

3. **测试用户仪表板**
   - 查看已生成的二维码
   - 测试激活功能（免费版）
   - 测试下载功能

## 🔧 生产环境配置

### 切换到Stripe生产模式

1. **获取生产密钥**
   - 在Stripe控制台切换到 "Live mode"
   - 获取生产环境的API密钥

2. **更新Vercel环境变量**
   - 更新所有Stripe相关的密钥
   - 触发重新部署

3. **完成Stripe账号验证**
   - 提供商业信息
   - 完成身份验证
   - 设置银行账户信息

### 配置定时任务

在Supabase中配置pg_cron：

```sql
SELECT cron.schedule(
  'deactivate-expired-qrcodes',
  '0 * * * *',
  'SELECT public.deactivate_expired_qrcodes()'
);
```

### 配置监控和分析

1. **Vercel Analytics**
   - 在项目设置中启用Analytics
   - 监控访问量和性能

2. **Supabase监控**
   - 查看API使用情况
   - 设置告警阈值

3. **Stripe监控**
   - 设置支付失败通知
   - 监控订阅状态

## 🛡️ 安全检查清单

- [ ] 所有API密钥已安全存储在环境变量中
- [ ] Supabase RLS策略已正确配置
- [ ] Stripe Webhook已配置签名验证
- [ ] HTTPS已启用（Vercel自动配置）
- [ ] 邮件验证已启用
- [ ] 定期备份数据库

## 📈 性能优化建议

1. **启用Vercel Edge Functions**
   - 将API路由部署到边缘节点
   - 降低延迟

2. **配置CDN**
   - Vercel自动提供全球CDN
   - 静态资源自动优化

3. **数据库优化**
   - 定期清理过期数据
   - 优化查询索引

## 🔄 持续集成

每次推送到main分支，Vercel会自动：
1. 构建项目
2. 运行测试（如果有）
3. 部署到生产环境
4. 生成部署预览

## 📞 遇到问题？

常见问题和解决方案：

1. **邮件发不出去**
   - 检查Supabase SMTP配置
   - 确认邮件服务商设置正确

2. **支付失败**
   - 检查Stripe密钥是否正确
   - 确认Webhook配置正确

3. **数据库连接失败**
   - 检查Supabase URL和密钥
   - 确认数据库没有休眠（免费版可能会休眠）

4. **域名无法访问**
   - 检查DNS配置是否正确
   - 等待DNS传播（最长24小时）

需要帮助？请查看:
- Vercel文档: https://vercel.com/docs
- Supabase文档: https://supabase.com/docs
- Stripe文档: https://stripe.com/docs

---

祝部署顺利！🎉
