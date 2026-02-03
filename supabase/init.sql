-- 创建用户扩展表（Supabase已有auth.users表，这里扩展用户信息）
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- 创建二维码表
CREATE TABLE IF NOT EXISTS public.qrcodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  qr_type TEXT NOT NULL CHECK (qr_type IN ('free', 'premium')),
  size INTEGER DEFAULT 500,
  shape TEXT DEFAULT 'square' CHECK (shape IN ('square', 'circle')),
  color TEXT DEFAULT '#000000',
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_confirmed_at TIMESTAMP WITH TIME ZONE
);

-- 创建订阅表
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_qrcodes_user_id ON public.qrcodes(user_id);
CREATE INDEX IF NOT EXISTS idx_qrcodes_expires_at ON public.qrcodes(expires_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- 启用行级安全策略 (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qrcodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 用户表策略
CREATE POLICY "Users can view their own data"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- 二维码表策略
CREATE POLICY "Users can view their own qrcodes"
  ON public.qrcodes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own qrcodes"
  ON public.qrcodes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own qrcodes"
  ON public.qrcodes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own qrcodes"
  ON public.qrcodes FOR DELETE
  USING (auth.uid() = user_id);

-- 订阅表策略
CREATE POLICY "Users can view their own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 创建触发器函数：新用户注册时自动创建扩展信息
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 创建函数：检查并更新过期的二维码
CREATE OR REPLACE FUNCTION public.deactivate_expired_qrcodes()
RETURNS void AS $$
BEGIN
  UPDATE public.qrcodes
  SET is_active = false
  WHERE expires_at < NOW() AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建定时任务（需要在Supabase后台配置pg_cron）
-- 每小时检查一次过期的二维码
-- SELECT cron.schedule('deactivate-expired-qrcodes', '0 * * * *', 'SELECT public.deactivate_expired_qrcodes()');
