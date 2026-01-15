import { motion } from 'framer-motion';
import { Send, Instagram, Youtube, Globe, ArrowDown, Loader2 } from 'lucide-react';
import { stats, socialLinks } from '@/lib/constants';
import { useSiteContent } from '@/hooks/useSiteData';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Send,
  Instagram,
  Youtube,
  Globe,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
};

export function Hero() {
  const { data: siteContent, isLoading } = useSiteContent();

  // Get content from DB with fallbacks
  const getContent = (id: string, fallback: string) => {
    return siteContent?.find(c => c.id === id)?.value || fallback;
  };

  const name = getContent('artist_name', 'Артём Макаров');
  const title = getContent('artist_title', 'AI Artist / Генеративный художник');
  const tagline = getContent('artist_tagline', 'Создаю фотореалистичные видео и изображения с помощью нейросетей');

  if (isLoading) {
    return (
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </section>
    );
  }

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-fuchsia-500/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />
      </div>

      <motion.div 
        className="relative z-10 text-center max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Eyebrow */}
        <motion.div 
          variants={itemVariants}
          className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-8"
        >
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-muted-foreground">Открыт для заказов</span>
        </motion.div>

        {/* Main Title */}
        <motion.h1 
          variants={itemVariants}
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-4"
        >
          <span className="block text-foreground">{name}</span>
        </motion.h1>

        <motion.p 
          variants={itemVariants}
          className="text-xl md:text-2xl gradient-text font-semibold mb-4"
        >
          {title}
        </motion.p>

        {/* Tagline */}
        <motion.p 
          variants={itemVariants}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
        >
          {tagline}
        </motion.p>

        {/* Stats */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mb-10"
        >
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              className="glass px-6 py-4 rounded-2xl text-center"
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <div className="text-2xl md:text-3xl font-bold gradient-text">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Social Links */}
        <motion.div 
          variants={itemVariants}
          className="flex items-center justify-center gap-3 mb-10"
        >
          {socialLinks.map((link) => {
            const Icon = iconMap[link.icon];
            return (
              <motion.a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass glass-hover p-4 rounded-2xl group"
                aria-label={link.name}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-5 h-5 text-muted-foreground group-hover:text-violet-400 transition-colors" />
              </motion.a>
            );
          })}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.a
            href="#portfolio"
            className="px-8 py-4 bg-gradient-violet rounded-2xl font-semibold text-primary-foreground shadow-lg"
            whileHover={{ scale: 1.02, boxShadow: '0 0 40px hsl(263 70% 58% / 0.4)' }}
            whileTap={{ scale: 0.98 }}
          >
            Смотреть работы
          </motion.a>
          <motion.a
            href="#calculator"
            className="px-8 py-4 glass glass-hover font-semibold rounded-2xl"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Рассчитать стоимость
          </motion.a>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <ArrowDown className="w-6 h-6 text-muted-foreground" />
      </motion.div>
    </section>
  );
}
