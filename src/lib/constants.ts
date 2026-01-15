export interface ContentBlock {
  type: 'text' | 'image' | 'video' | 'comparison';
  content?: string;
  src?: string;
  beforeSrc?: string;
  afterSrc?: string;
  caption?: string;
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
  contentBlocks: ContentBlock[];
}

export const projects: Project[] = [
  {
    id: 'neon-samurai',
    title: 'Neon Samurai in Moscow',
    subtitle: 'Cyberpunk Short Film',
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    videoPreview: 'https://cdn.coverr.co/videos/coverr-neon-city-at-night-4267/1080p.mp4',
    tags: ['Midjourney', 'Runway Gen-3', 'After Effects'],
    year: '2024',
    duration: '2:45',
    contentBlocks: [
      {
        type: 'text',
        content: '**Neon Samurai** is a passion project that explores the fusion of traditional Japanese warrior culture with a dystopian cyberpunk Moscow. The film follows a lone warrior navigating through rain-soaked streets illuminated by holographic advertisements.'
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200&q=80',
        caption: 'Initial concept frame generated in Midjourney v6'
      },
      {
        type: 'text',
        content: 'The visual language draws heavily from *Blade Runner* and *Ghost in the Shell*, while incorporating uniquely Russian architectural elements. Every frame was carefully crafted to maintain a balance between **chaos and serenity**.'
      },
      {
        type: 'video',
        src: 'https://cdn.coverr.co/videos/coverr-neon-city-at-night-4267/1080p.mp4',
        caption: 'Final rendered sequence - Act II'
      },
      {
        type: 'comparison',
        beforeSrc: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=800&q=80',
        afterSrc: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
        caption: 'Before/After: AI enhancement process'
      }
    ]
  },
  {
    id: 'digital-fashion',
    title: 'Digital Fashion Week',
    subtitle: 'AI-Generated Clothing Showcase',
    thumbnail: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&q=80',
    videoPreview: 'https://cdn.coverr.co/videos/coverr-fashion-model-walking-8556/1080p.mp4',
    tags: ['Stable Diffusion', 'Runway Gen-3', 'DaVinci Resolve'],
    year: '2024',
    duration: '4:20',
    contentBlocks: [
      {
        type: 'text',
        content: '**Digital Fashion Week** reimagines haute couture through the lens of artificial intelligence. This project showcases 12 completely AI-generated fashion collections, each representing a different emotion.'
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&q=80',
        caption: 'Collection I: Ethereal Dreams'
      },
      {
        type: 'text',
        content: 'Working with *Stable Diffusion XL* and custom LoRA models, we trained the AI on decades of fashion photography. The result is a seamless blend of **impossible fabrics** and gravity-defying silhouettes.'
      },
      {
        type: 'video',
        src: 'https://cdn.coverr.co/videos/coverr-fashion-model-walking-8556/1080p.mp4',
        caption: 'Runway animation generated with Runway Gen-3'
      },
      {
        type: 'comparison',
        beforeSrc: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80',
        afterSrc: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&q=80',
        caption: 'Style transfer comparison'
      }
    ]
  },
  {
    id: 'abstract-dreams',
    title: 'Abstract Dreams',
    subtitle: 'Surreal Fluid Animations',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
    videoPreview: 'https://cdn.coverr.co/videos/coverr-colorful-abstract-background-4689/1080p.mp4',
    tags: ['TouchDesigner', 'ComfyUI', 'Houdini'],
    year: '2023',
    duration: '3:15',
    contentBlocks: [
      {
        type: 'text',
        content: '**Abstract Dreams** is an exploration of the subconscious through generative art. This piece combines traditional fluid dynamics simulation with AI-driven color theory and composition.'
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1634017839464-5c339bbe3f6c?w=1200&q=80',
        caption: 'Frame study: Emergence'
      },
      {
        type: 'text',
        content: 'The animation responds to audio frequencies, creating a *synesthetic experience* where sound becomes visible. Each frame contains over **10 million particles** simulated in real-time.'
      },
      {
        type: 'video',
        src: 'https://cdn.coverr.co/videos/coverr-colorful-abstract-background-4689/1080p.mp4',
        caption: 'Final animation loop'
      },
      {
        type: 'comparison',
        beforeSrc: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800&q=80',
        afterSrc: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
        caption: 'Raw simulation vs. AI-enhanced output'
      }
    ]
  }
];

export const socialLinks = [
  { name: 'Instagram', url: 'https://instagram.com', icon: 'Instagram' },
  { name: 'Twitter', url: 'https://twitter.com', icon: 'Twitter' },
  { name: 'YouTube', url: 'https://youtube.com', icon: 'Youtube' },
  { name: 'Behance', url: 'https://behance.net', icon: 'Globe' }
];

export const calculatorDefaults = {
  basePrice: 3000,
  paceOptions: [
    { label: 'Standard', value: 'standard', secondsPerFrame: 4, multiplier: 0.25 },
    { label: 'Dynamic', value: 'dynamic', secondsPerFrame: 2, multiplier: 0.5 },
    { label: 'Ultra', value: 'ultra', secondsPerFrame: 0.5, multiplier: 2.0 }
  ],
  audioOptions: [
    { label: "Client's Audio", value: 'client', price: 0 },
    { label: 'AI Generated', value: 'ai', price: 10000 },
    { label: 'Lipsync', value: 'lipsync', pricePerUnit: 5000, unitSeconds: 30 }
  ],
  revisionOptions: [
    { label: '2 Revisions', value: '2', price: 0 },
    { label: '4 Revisions', value: '4', price: 20000 },
    { label: '8 Revisions', value: '8', price: 50000 }
  ],
  deadlineOptions: [
    { label: '30 Days', value: '30', multiplier: 1 },
    { label: '20 Days', value: '20', multiplier: 2 },
    { label: '10 Days', value: '10', multiplier: 3 }
  ]
};

export const artistInfo = {
  name: 'Alex Volkov',
  title: 'AI Video Artist',
  tagline: 'Crafting impossible worlds through artificial intelligence',
  bio: 'Award-winning AI artist specializing in generative video content, motion design, and experimental storytelling.',
  email: 'hello@alexvolkov.ai'
};
