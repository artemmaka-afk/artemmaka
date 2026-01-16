import { useEffect } from 'react';
import { useTypographySettings } from './useSiteData';

export function useApplyTypography() {
  const { data: settings } = useTypographySettings();

  useEffect(() => {
    if (!settings) return;

    const root = document.documentElement;
    
    settings.forEach((setting) => {
      // Устанавливаем CSS-переменные для desktop
      root.style.setProperty(`--typography-${setting.id}-desktop`, setting.desktop_size);
      // Устанавливаем CSS-переменные для mobile
      root.style.setProperty(`--typography-${setting.id}-mobile`, setting.mobile_size);
    });
  }, [settings]);
}

// Хелпер для получения CSS-класса с типографикой
export function getTypographyClass(type: 'h1' | 'h2' | 'h3' | 'body' | 'small'): string {
  return `typography-${type}`;
}
