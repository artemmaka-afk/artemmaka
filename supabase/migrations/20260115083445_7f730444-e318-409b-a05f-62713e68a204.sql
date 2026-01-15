-- Таблица настроек калькулятора (одна строка с конфигурацией)
CREATE TABLE public.calculator_config (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    base_frame_price INTEGER NOT NULL DEFAULT 3000,
    music_price INTEGER NOT NULL DEFAULT 10000,
    lipsync_price_per_30s INTEGER NOT NULL DEFAULT 5000,
    revisions_4_price INTEGER NOT NULL DEFAULT 20000,
    revisions_8_price INTEGER NOT NULL DEFAULT 50000,
    deadline_20_multiplier NUMERIC(3,2) NOT NULL DEFAULT 2.0,
    deadline_10_multiplier NUMERIC(3,2) NOT NULL DEFAULT 3.0,
    volume_discount_percent INTEGER NOT NULL DEFAULT 15,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Вставляем начальные настройки
INSERT INTO public.calculator_config (
    base_frame_price, 
    music_price, 
    lipsync_price_per_30s, 
    revisions_4_price, 
    revisions_8_price, 
    deadline_20_multiplier, 
    deadline_10_multiplier,
    volume_discount_percent
) VALUES (3000, 10000, 5000, 20000, 50000, 2.0, 3.0, 15);

-- Таблица заявок
CREATE TABLE public.project_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    telegram TEXT,
    phone TEXT,
    project_description TEXT NOT NULL,
    budget_estimate INTEGER,
    duration_seconds INTEGER,
    pace TEXT,
    audio_options TEXT[],
    revisions TEXT,
    deadline TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS для калькулятора - публичное чтение, нет записи через клиент
ALTER TABLE public.calculator_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Calculator config is publicly readable"
ON public.calculator_config
FOR SELECT
USING (true);

-- RLS для заявок - публичная вставка (анонимные заявки)
ALTER TABLE public.project_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit project requests"
ON public.project_requests
FOR INSERT
WITH CHECK (true);

-- Функция обновления updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_calculator_config_updated_at
BEFORE UPDATE ON public.calculator_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_requests_updated_at
BEFORE UPDATE ON public.project_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();