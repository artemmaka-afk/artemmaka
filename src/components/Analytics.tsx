import { useEffect } from 'react';
import { useSiteContent } from '@/hooks/useSiteData';

export function Analytics() {
  const { data: siteContent } = useSiteContent();

  const getContent = (id: string) => 
    siteContent?.find(c => c.id === id)?.value || '';

  const yandexId = getContent('yandex_metrika_id');
  const googleId = getContent('google_analytics_id');

  useEffect(() => {
    // Yandex Metrika
    if (yandexId && !document.getElementById('yandex-metrika')) {
      const script = document.createElement('script');
      script.id = 'yandex-metrika';
      script.type = 'text/javascript';
      script.innerHTML = `
        (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
        (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

        ym(${yandexId}, "init", {
          clickmap:true,
          trackLinks:true,
          accurateTrackBounce:true,
          webvisor:true
        });
      `;
      document.head.appendChild(script);

      // Add noscript fallback
      const noscript = document.createElement('noscript');
      noscript.innerHTML = `<div><img src="https://mc.yandex.ru/watch/${yandexId}" style="position:absolute; left:-9999px;" alt="" /></div>`;
      document.body.appendChild(noscript);
    }
  }, [yandexId]);

  useEffect(() => {
    // Google Analytics
    if (googleId && !document.getElementById('google-analytics')) {
      // Load gtag.js
      const gtagScript = document.createElement('script');
      gtagScript.id = 'google-analytics';
      gtagScript.async = true;
      gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${googleId}`;
      document.head.appendChild(gtagScript);

      // Initialize gtag
      const initScript = document.createElement('script');
      initScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${googleId}');
      `;
      document.head.appendChild(initScript);
    }
  }, [googleId]);

  return null; // This component doesn't render anything
}
