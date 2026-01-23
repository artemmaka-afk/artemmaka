import { useEffect } from 'react';
import { useSiteContent } from '@/hooks/useSiteData';

export function DynamicMeta() {
  const { data: siteContent } = useSiteContent();

  const getContent = (id: string, fallback: string) =>
    siteContent?.find(c => c.id === id)?.value || fallback;

  useEffect(() => {
    if (!siteContent) return;

    const title = getContent('site_title', 'Артём Макаров | AI Artist');
    const description = getContent('site_description', 'Создаю фотореалистичные видео и изображения с помощью нейросетей.');
    const favicon = getContent('site_favicon', '');
    const ogImage = getContent('og_image', '');

    // Update document title
    document.title = title;

    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }

    // Update OG tags
    const ogTags: Record<string, string> = {
      'og:title': title,
      'og:description': description,
    };
    
    if (ogImage) {
      ogTags['og:image'] = ogImage;
    }

    Object.entries(ogTags).forEach(([property, content]) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (tag) {
        tag.setAttribute('content', content);
      }
    });

    // Update Twitter tags
    const twitterTags: Record<string, string> = {
      'twitter:title': title,
      'twitter:description': description,
    };
    
    if (ogImage) {
      twitterTags['twitter:image'] = ogImage;
    }

    Object.entries(twitterTags).forEach(([name, content]) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (tag) {
        tag.setAttribute('content', content);
      }
    });

    // Update favicon if provided
    if (favicon) {
      let link = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = favicon;
    }
  }, [siteContent]);

  return null;
}