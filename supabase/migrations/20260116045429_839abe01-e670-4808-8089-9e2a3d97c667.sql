-- Add visibility setting for availability status in site_content
INSERT INTO public.site_content (id, value, description)
VALUES ('availability_visible', 'true', 'Показывать статус доступности в шапке сайта')
ON CONFLICT (id) DO NOTHING;

-- Add CTA text setting
INSERT INTO public.site_content (id, value, description)
VALUES ('footer_cta_text', 'Свяжитесь со мной, чтобы обсудить ваш проект.', 'Текст под заголовком CTA в футере')
ON CONFLICT (id) DO NOTHING;