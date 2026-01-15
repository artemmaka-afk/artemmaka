-- ============================================
-- AI Tools table for managing neural network logos
-- ============================================
CREATE TABLE public.ai_tools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  logo TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('video', 'image')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_tools ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "AI tools are viewable by everyone"
  ON public.ai_tools FOR SELECT USING (true);

-- Admin-only write access (fixed has_role argument order)
CREATE POLICY "Admins can insert AI tools"
  ON public.ai_tools FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update AI tools"
  ON public.ai_tools FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete AI tools"
  ON public.ai_tools FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- Projects table
-- ============================================
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  thumbnail TEXT,
  video_preview TEXT,
  tags TEXT[] DEFAULT '{}',
  year TEXT,
  duration TEXT,
  ai_tools TEXT[] DEFAULT '{}',
  content_blocks JSONB DEFAULT '[]',
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Public read access (only published)
CREATE POLICY "Published projects are viewable by everyone"
  ON public.projects FOR SELECT
  USING (is_published = true OR public.has_role(auth.uid(), 'admin'::app_role));

-- Admin-only write access
CREATE POLICY "Admins can insert projects"
  ON public.projects FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update projects"
  ON public.projects FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete projects"
  ON public.projects FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- Site content table for editable text blocks
-- ============================================
CREATE TABLE public.site_content (
  id TEXT NOT NULL PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Site content is viewable by everyone"
  ON public.site_content FOR SELECT USING (true);

-- Admin-only write access
CREATE POLICY "Admins can insert site content"
  ON public.site_content FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update site content"
  ON public.site_content FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- Insert default AI tools
-- ============================================
INSERT INTO public.ai_tools (name, logo, category, sort_order) VALUES
  ('Kling', 'https://lf-flow-web-cdn.doubao.com/obj/flow-doubao/kling/favicon.png', 'video', 1),
  ('Veo', 'https://lh3.googleusercontent.com/6MmUXu8i60OJqFxS6Xde5sPwg6QwKpTlVxg7N4AvG-GR8JjKpDO0K5j58iIV9zHcdHdD=w300', 'video', 2),
  ('SeeDance', 'https://framerusercontent.com/images/VVqBT6oBr4DwRBKj2jZ0OYQm3Y.png', 'video', 3),
  ('Wan', 'https://img.alicdn.com/imgextra/i1/O1CN01SdJ4Tt1FCMUjxQDXX_!!6000000000450-2-tps-400-400.png', 'video', 4),
  ('Sora', 'https://cdn.openai.com/sora/favicon.ico', 'video', 5),
  ('Minimax Hailuo', 'https://cdn-www.hailuoai.com/static/images/favicon.ico', 'video', 6),
  ('Midjourney', 'https://cdn.midjourney.com/0bbcbb3d-4cbb-4a4e-bdb7-bf0d65f1b7d7/0_0.webp', 'image', 1),
  ('Flux', 'https://blackforestlabs.ai/wp-content/uploads/2024/07/bfl_logo.png', 'image', 2),
  ('Nano Banana', 'https://www.gstatic.com/lamda/images/gemini_favicon_f069958c85030456e93de685481c559f160ea06b.png', 'image', 3),
  ('SeeDream', 'https://framerusercontent.com/images/VVqBT6oBr4DwRBKj2jZ0OYQm3Y.png', 'image', 4),
  ('GPT Image', 'https://openai.com/favicon.ico', 'image', 5),
  ('Z-Image', 'https://zmo.ai/favicon.ico', 'image', 6);

-- ============================================
-- Insert default site content
-- ============================================
INSERT INTO public.site_content (id, value, description) VALUES
  ('artist_name', 'Артём Макаров', 'Имя художника'),
  ('artist_title', 'AI Artist / Генеративный художник', 'Должность'),
  ('artist_tagline', 'Создаю фотореалистичные видео и изображения с помощью нейросетей', 'Слоган'),
  ('artist_bio', 'Занимаюсь генерацией фотореалистичных видео и изображений для промо, сюжетных и рекламных проектов. Работаю с современными генеративными моделями, при необходимости обучаю LoRA под конкретные задачи и выстраиваю пайплайн от идеи до финального ролика.', 'Биография'),
  ('artist_email', 'artem@makarov.ai', 'Email'),
  ('artist_telegram', '@artemmak_ai', 'Telegram'),
  ('artist_location', 'Москва, Россия', 'Локация');

-- ============================================
-- Add triggers for updated_at
-- ============================================
CREATE TRIGGER update_ai_tools_updated_at
  BEFORE UPDATE ON public.ai_tools
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_content_updated_at
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();