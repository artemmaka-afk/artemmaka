-- Add analytics tracking IDs to site_content
INSERT INTO public.site_content (id, value, description)
VALUES 
  ('yandex_metrika_id', '', 'ID счётчика Яндекс.Метрики'),
  ('google_analytics_id', '', 'ID Google Analytics (GA4)')
ON CONFLICT (id) DO NOTHING;