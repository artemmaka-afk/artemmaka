-- 1. Добавляем колонку created_at для проектов (для отображения даты dd.mm.yyyy)
-- Уже есть created_at в projects

-- 2. Создаем таблицу для статистики (stats) - редактируемые блоки
CREATE TABLE IF NOT EXISTS public.hero_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Создаем таблицу для социальных ссылок (header и footer)
CREATE TABLE IF NOT EXISTS public.social_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT 'both', -- 'header', 'footer', 'both'
  sort_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Добавляем статус доступности в site_content
INSERT INTO public.site_content (id, value, description)
VALUES ('availability_status', 'available', 'Статус доступности: available, medium, busy')
ON CONFLICT (id) DO NOTHING;

-- 5. Добавляем NDA multipliers в calculator_config
ALTER TABLE public.calculator_config 
ADD COLUMN IF NOT EXISTS nda_partial_multiplier NUMERIC DEFAULT 1.3,
ADD COLUMN IF NOT EXISTS nda_full_multiplier NUMERIC DEFAULT 1.5;

-- 6. Добавляем колонку для файлов-вложений в заявках
ALTER TABLE public.project_requests
ADD COLUMN IF NOT EXISTS attachments TEXT[] DEFAULT NULL;

-- 7. Заполняем начальные данные для stats
INSERT INTO public.hero_stats (value, label, sort_order, is_visible) VALUES
  ('50+', 'Проектов', 0, true),
  ('3', 'Года в AI', 1, true),
  ('TOP 10', 'Creators', 2, true)
ON CONFLICT DO NOTHING;

-- 8. Заполняем начальные данные для social_links
INSERT INTO public.social_links (name, url, icon, location, sort_order, is_visible) VALUES
  ('Telegram', 'https://t.me/artemmak_ai', 'Send', 'both', 0, true),
  ('Instagram', 'https://instagram.com/artemmak_ai', 'Instagram', 'both', 1, true),
  ('YouTube', 'https://youtube.com/@artemmak_ai', 'Youtube', 'both', 2, true),
  ('Behance', 'https://behance.net/artemmak', 'Globe', 'both', 3, true)
ON CONFLICT DO NOTHING;

-- 9. RLS для hero_stats
ALTER TABLE public.hero_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hero stats are publicly readable" 
ON public.hero_stats FOR SELECT USING (true);

CREATE POLICY "Only admins can modify hero stats" 
ON public.hero_stats FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 10. RLS для social_links
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Social links are publicly readable" 
ON public.social_links FOR SELECT USING (true);

CREATE POLICY "Only admins can modify social links" 
ON public.social_links FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 11. Создаем bucket для вложений заявок
INSERT INTO storage.buckets (id, name, public)
VALUES ('request-attachments', 'request-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- 12. RLS для bucket request-attachments (публичный upload)
CREATE POLICY "Anyone can upload attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'request-attachments');

CREATE POLICY "Attachments are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'request-attachments');