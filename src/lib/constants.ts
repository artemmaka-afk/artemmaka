// ============= Типы данных =============

export interface ContentBlock {
  type: 'text' | 'image' | 'video' | 'comparison';
  content?: string;
  src?: string;
  beforeSrc?: string;
  afterSrc?: string;
  caption?: string;
}

export interface AITool {
  name: string;
  logo: string;
  category: 'video' | 'image';
}

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  thumbnail: string;
  videoPreview: string;
  tags: string[];
  year: string;
  duration: string;
  aiTools?: string[]; // Названия нейронок через запятую
  contentBlocks: ContentBlock[];
}

// ============= AI Инструменты =============
// Реальные логотипы нейросетей

export const aiTools: AITool[] = [
  // Для видео
  { name: 'Kling', logo: 'https://lf-flow-web-cdn.doubao.com/obj/flow-doubao/kling/favicon.png', category: 'video' },
  { name: 'Veo', logo: 'https://lh3.googleusercontent.com/6MmUXu8i60OJqFxS6Xde5sPwg6QwKpTlVxg7N4AvG-GR8JjKpDO0K5j58iIV9zHcdHdD=w300', category: 'video' },
  { name: 'SeeDance', logo: 'https://framerusercontent.com/images/VVqBT6oBr4DwRBKj2jZ0OYQm3Y.png', category: 'video' },
  { name: 'Wan', logo: 'https://img.alicdn.com/imgextra/i1/O1CN01SdJ4Tt1FCMUjxQDXX_!!6000000000450-2-tps-400-400.png', category: 'video' },
  { name: 'Sora', logo: 'https://cdn.openai.com/sora/favicon.ico', category: 'video' },
  { name: 'Minimax Hailuo', logo: 'https://cdn-www.hailuoai.com/static/images/favicon.ico', category: 'video' },
  // Для изображений
  { name: 'Midjourney', logo: 'https://cdn.midjourney.com/0bbcbb3d-4cbb-4a4e-bdb7-bf0d65f1b7d7/0_0.webp', category: 'image' },
  { name: 'Flux', logo: 'https://blackforestlabs.ai/wp-content/uploads/2024/07/bfl_logo.png', category: 'image' },
  { name: 'Nano Banana', logo: 'https://www.gstatic.com/lamda/images/gemini_favicon_f069958c85030456e93de685481c559f160ea06b.png', category: 'image' },
  { name: 'SeeDream', logo: 'https://framerusercontent.com/images/VVqBT6oBr4DwRBKj2jZ0OYQm3Y.png', category: 'image' },
  { name: 'GPT Image', logo: 'https://openai.com/favicon.ico', category: 'image' },
  { name: 'Z-Image', logo: 'https://zmo.ai/favicon.ico', category: 'image' },
];

// Функция получения инструмента по имени
export const getAIToolByName = (name: string): AITool | undefined => {
  return aiTools.find(tool => tool.name.toLowerCase() === name.toLowerCase());
};

// ============= Данные художника =============

export const artistInfo = {
  name: 'Артём Макаров',
  title: 'AI Artist / Генеративный художник',
  tagline: 'Создаю фотореалистичные видео и изображения с помощью нейросетей',
  bio: 'Занимаюсь генерацией фотореалистичных видео и изображений для промо, сюжетных и рекламных проектов. Работаю с современными генеративными моделями, при необходимости обучаю LoRA под конкретные задачи и выстраиваю пайплайн от идеи до финального ролика.',
  email: 'artem@makarov.ai',
  telegram: '@artemmak_ai',
  location: 'Москва, Россия'
};

export const skills = [
  {
    title: 'Генерация видео и изображений',
    description: 'Создание фотореалистичного контента для промо, сюжетных, музыкальных и рекламных роликов.'
  },
  {
    title: 'Модели и пайплайны',
    description: 'Обучение LoRA для закрепления стиля, персонажей и локаций. Построение цепочек: референсы → генерация → доработка → сборка.'
  },
  {
    title: 'Визуал и сторителлинг',
    description: 'Постановка сцены: композиция, работа с камерой, групповые сцены, морфинг и спецэффекты.'
  },
  {
    title: 'Инструменты',
    description: 'Photoshop — ретушь и композиция. DaVinci Resolve — монтаж и цветокоррекция.'
  }
];

export const stats = [
  { value: '50+', label: 'Проектов' },
  { value: '3', label: 'Года в AI' },
  { value: 'TOP 10', label: 'Creators' }
];

export const videoTechStack = [
  { name: 'Kling', logo: 'https://lf-flow-web-cdn.doubao.com/obj/flow-doubao/kling/favicon.png' },
  { name: 'Veo', logo: 'https://lh3.googleusercontent.com/6MmUXu8i60OJqFxS6Xde5sPwg6QwKpTlVxg7N4AvG-GR8JjKpDO0K5j58iIV9zHcdHdD=w300' },
  { name: 'SeeDance', logo: 'https://framerusercontent.com/images/VVqBT6oBr4DwRBKj2jZ0OYQm3Y.png' },
  { name: 'Wan', logo: 'https://img.alicdn.com/imgextra/i1/O1CN01SdJ4Tt1FCMUjxQDXX_!!6000000000450-2-tps-400-400.png' },
  { name: 'Sora', logo: 'https://cdn.openai.com/sora/favicon.ico' },
  { name: 'Minimax Hailuo', logo: 'https://cdn-www.hailuoai.com/static/images/favicon.ico' },
];

export const imageTechStack = [
  { name: 'Midjourney', logo: 'https://cdn.midjourney.com/0bbcbb3d-4cbb-4a4e-bdb7-bf0d65f1b7d7/0_0.webp' },
  { name: 'Flux', logo: 'https://blackforestlabs.ai/wp-content/uploads/2024/07/bfl_logo.png' },
  { name: 'Nano Banana', logo: 'https://www.gstatic.com/lamda/images/gemini_favicon_f069958c85030456e93de685481c559f160ea06b.png' },
  { name: 'SeeDream', logo: 'https://framerusercontent.com/images/VVqBT6oBr4DwRBKj2jZ0OYQm3Y.png' },
  { name: 'GPT Image', logo: 'https://openai.com/favicon.ico' },
  { name: 'Z-Image', logo: 'https://zmo.ai/favicon.ico' },
];

// Старый стек для обратной совместимости
export const techStack = [
  { name: 'Midjourney', icon: '🎨' },
  { name: 'Runway Gen-3', icon: '🎬' },
  { name: 'ComfyUI', icon: '⚙️' },
  { name: 'After Effects', icon: '✨' },
  { name: 'Stable Diffusion', icon: '🖼️' },
  { name: 'DaVinci Resolve', icon: '🎥' }
];

export const pipelineSteps = [
  { step: 1, title: 'Идея', description: 'Концепция и сценарий' },
  { step: 2, title: 'Генерация', description: 'AI создаёт визуал' },
  { step: 3, title: 'Анимация', description: 'Оживляем кадры' },
  { step: 4, title: 'Монтаж', description: 'Финальная сборка' }
];

// ============= Социальные сети =============

export const socialLinks = [
  { name: 'Telegram', url: 'https://t.me/artemmak_ai', icon: 'Send' },
  { name: 'Instagram', url: 'https://instagram.com/artemmak_ai', icon: 'Instagram' },
  { name: 'YouTube', url: 'https://youtube.com/@artemmak_ai', icon: 'Youtube' },
  { name: 'Behance', url: 'https://behance.net/artemmak', icon: 'Globe' }
];

// ============= Портфолио проектов =============

export const projects: Project[] = [
  {
    id: 'cyberpunk-moscow',
    title: 'Киберпанк Москва',
    subtitle: 'Футуристический короткометражный фильм',
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    videoPreview: 'https://cdn.coverr.co/videos/coverr-neon-city-at-night-4267/1080p.mp4',
    tags: ['#AI', '#Video', '#Commercial'],
    year: '2024',
    duration: '2:45',
    aiTools: ['Kling', 'Midjourney', 'Sora'],
    contentBlocks: [
      {
        type: 'text',
        content: '**Киберпанк Москва** — это экспериментальный проект, исследующий будущее столицы через призму нейросетей. Каждый кадр создан с использованием Midjourney v6 и анимирован в Runway Gen-3.'
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200&q=80',
        caption: 'Концепт-арт: Москва-Сити 2077'
      },
      {
        type: 'text',
        content: 'Визуальный язык вдохновлён *Blade Runner* и *Ghost in the Shell*, но с уникальной русской эстетикой. Неоновые вывески на кириллице, футуристические версии знакомых зданий.'
      },
      {
        type: 'video',
        src: 'https://cdn.coverr.co/videos/coverr-neon-city-at-night-4267/1080p.mp4',
        caption: 'Финальный рендер — Акт II'
      },
      {
        type: 'comparison',
        beforeSrc: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=800&q=80',
        afterSrc: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
        caption: 'До/После: AI-обработка'
      }
    ]
  },
  {
    id: 'fashion-show-2026',
    title: 'Fashion Show 2026',
    subtitle: 'AI-генерированная коллекция одежды',
    thumbnail: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&q=80',
    videoPreview: 'https://cdn.coverr.co/videos/coverr-fashion-model-walking-8556/1080p.mp4',
    tags: ['#AI', '#Fashion', '#Art'],
    year: '2024',
    duration: '4:20',
    aiTools: ['Veo', 'Flux', 'SeeDance'],
    contentBlocks: [
      {
        type: 'text',
        content: '**Fashion Show 2026** — полностью AI-генерированный показ мод с 12 коллекциями, каждая из которых представляет определённую эмоцию.'
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&q=80',
        caption: 'Коллекция I: Эфирные Сны'
      },
      {
        type: 'text',
        content: 'С использованием *Stable Diffusion XL* и кастомных LoRA-моделей мы обучили AI на десятилетиях модной фотографии. Результат — **невозможные ткани** и силуэты, игнорирующие гравитацию.'
      },
      {
        type: 'video',
        src: 'https://cdn.coverr.co/videos/coverr-fashion-model-walking-8556/1080p.mp4',
        caption: 'Анимация подиума в Runway Gen-3'
      },
      {
        type: 'comparison',
        beforeSrc: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80',
        afterSrc: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&q=80',
        caption: 'Стиль-трансфер'
      }
    ]
  },
  {
    id: 'abstract-dream',
    title: 'Абстрактный Сон',
    subtitle: 'Сюрреалистические флюид-анимации',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
    videoPreview: 'https://cdn.coverr.co/videos/coverr-colorful-abstract-background-4689/1080p.mp4',
    tags: ['#AI', '#Abstract', '#Motion'],
    year: '2023',
    duration: '3:15',
    aiTools: ['Minimax Hailuo', 'Nano Banana'],
    contentBlocks: [
      {
        type: 'text',
        content: '**Абстрактный Сон** — исследование подсознания через генеративное искусство. Комбинация симуляции флюидов и AI-driven теории цвета.'
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1634017839464-5c339bbe3f6c?w=1200&q=80',
        caption: 'Этюд кадра: Emergence'
      },
      {
        type: 'text',
        content: 'Анимация реагирует на частоты звука, создавая *синестетический опыт*. Каждый кадр содержит более **10 миллионов частиц**.'
      },
      {
        type: 'video',
        src: 'https://cdn.coverr.co/videos/coverr-colorful-abstract-background-4689/1080p.mp4',
        caption: 'Финальный луп'
      },
      {
        type: 'comparison',
        beforeSrc: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800&q=80',
        afterSrc: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
        caption: 'Сырая симуляция vs AI-версия'
      }
    ]
  },
  {
    id: 'neon-portraits',
    title: 'Неоновые Портреты',
    subtitle: 'Серия AI-генерированных портретов',
    thumbnail: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80',
    videoPreview: 'https://cdn.coverr.co/videos/coverr-woman-in-neon-lights-7825/1080p.mp4',
    tags: ['#AI', '#Portrait', '#Neon'],
    year: '2024',
    duration: '1:30',
    aiTools: ['GPT Image', 'Wan'],
    contentBlocks: [
      {
        type: 'text',
        content: '**Неоновые Портреты** — серия работ, исследующих человеческую индивидуальность через неоновое освещение и AI-генерацию.'
      },
      {
        type: 'video',
        src: 'https://cdn.coverr.co/videos/coverr-woman-in-neon-lights-7825/1080p.mp4',
        caption: 'Процесс создания'
      }
    ]
  },
  {
    id: 'product-viz',
    title: 'Визуализация Продуктов',
    subtitle: 'Коммерческая 3D визуализация',
    thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    videoPreview: 'https://cdn.coverr.co/videos/coverr-gold-rotating-ring-2391/1080p.mp4',
    tags: ['#Commercial', '#3D', '#Product'],
    year: '2024',
    duration: '0:45',
    aiTools: ['Flux', 'Kling'],
    contentBlocks: [
      {
        type: 'text',
        content: '**Визуализация Продуктов** — коммерческие ролики для брендов с использованием AI-генерации и классического 3D.'
      },
      {
        type: 'video',
        src: 'https://cdn.coverr.co/videos/coverr-gold-rotating-ring-2391/1080p.mp4',
        caption: 'Пример продуктовой съёмки'
      }
    ]
  },
  {
    id: 'nature-surreal',
    title: 'Природа: Сюрреализм',
    subtitle: 'Фантастические пейзажи',
    thumbnail: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&q=80',
    videoPreview: 'https://cdn.coverr.co/videos/coverr-waves-crashing-on-rocks-1927/1080p.mp4',
    tags: ['#AI', '#Nature', '#Surreal'],
    year: '2023',
    duration: '2:00',
    aiTools: ['SeeDream', 'Veo'],
    contentBlocks: [
      {
        type: 'text',
        content: '**Природа: Сюрреализм** — переосмысление природных ландшафтов через призму искусственного интеллекта.'
      },
      {
        type: 'video',
        src: 'https://cdn.coverr.co/videos/coverr-waves-crashing-on-rocks-1927/1080p.mp4',
        caption: 'Сюрреалистичный океан'
      }
    ]
  }
];

// ============= Калькулятор цен =============

export const calculatorDefaults = {
  basePrice: 3000,
  paceOptions: [
    { label: 'Стандарт', value: 'standard', secondsPerFrame: 4, multiplier: 0.25 },
    { label: 'Динамичный', value: 'dynamic', secondsPerFrame: 2, multiplier: 0.5 },
    { label: 'Ультра', value: 'ultra', secondsPerFrame: 0.5, multiplier: 2.0 }
  ],
  audioOptions: [
    { label: 'Своя озвучка', value: 'client', price: 0 },
    { label: 'AI озвучка', value: 'ai', price: 10000 },
    { label: 'Липсинк', value: 'lipsync', pricePerUnit: 5000, unitSeconds: 30 }
  ],
  revisionOptions: [
    { label: '2 круга правок', value: '2', price: 0 },
    { label: '4 круга правок', value: '4', price: 20000 },
    { label: '8 кругов правок', value: '8', price: 50000 }
  ],
  deadlineOptions: [
    { label: '30 дней', value: '30', multiplier: 1 },
    { label: '20 дней', value: '20', multiplier: 2 },
    { label: '10 дней', value: '10', multiplier: 3 }
  ]
};
