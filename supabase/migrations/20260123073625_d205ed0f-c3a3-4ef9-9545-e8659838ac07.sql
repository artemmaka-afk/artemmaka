-- Add site settings for favicon, meta title, meta description
INSERT INTO public.site_content (id, value, description)
VALUES 
  ('site_favicon', '', 'URL фавикона сайта'),
  ('site_title', 'Артём Макаров | AI Artist', 'Заголовок вкладки браузера'),
  ('site_description', 'Создаю фотореалистичные видео и изображения с помощью нейросетей.', 'Meta описание сайта'),
  ('about_show_more_button', 'false', 'Показывать кнопку "Подробнее" в разделе О себе'),
  ('about_extended_content', '', 'Расширенный контент для модального окна "Подробнее"')
ON CONFLICT (id) DO NOTHING;