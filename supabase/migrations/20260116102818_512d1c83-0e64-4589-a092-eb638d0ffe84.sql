-- Таблица для настроек типографики
CREATE TABLE public.typography_settings (
  id TEXT PRIMARY KEY,
  desktop_size TEXT NOT NULL DEFAULT '16px',
  mobile_size TEXT NOT NULL DEFAULT '14px',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Включаем RLS
ALTER TABLE public.typography_settings ENABLE ROW LEVEL SECURITY;

-- Политика чтения для всех (публичные настройки)
CREATE POLICY "Typography settings are viewable by everyone" 
ON public.typography_settings 
FOR SELECT 
USING (true);

-- Политика редактирования только для админов
CREATE POLICY "Only admins can update typography" 
ON public.typography_settings 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can insert typography" 
ON public.typography_settings 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Добавляем начальные настройки
INSERT INTO public.typography_settings (id, desktop_size, mobile_size, description) VALUES
  ('h1', '48px', '32px', 'Главный заголовок (Hero)'),
  ('h2', '36px', '28px', 'Заголовки секций'),
  ('h3', '24px', '20px', 'Подзаголовки'),
  ('body', '16px', '14px', 'Основной текст'),
  ('small', '14px', '12px', 'Мелкий текст, подписи');

-- Триггер для обновления updated_at
CREATE TRIGGER update_typography_settings_updated_at
BEFORE UPDATE ON public.typography_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();