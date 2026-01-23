import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ArrowRight, User, Film, Image, Workflow, Mail, Loader2, X } from 'lucide-react';
import { pipelineSteps } from '@/lib/constants';
import { useAITools, useSiteContent } from '@/hooks/useSiteData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4 }
  }
};

function getInitials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? name[0] ?? '?';
  const second = parts.length > 1 ? parts[1]?.[0] : name[1];
  return (first + (second ?? '')).toUpperCase();
}

function TechItem({ name, logo }: { name: string; logo: string }) {
  const [hasError, setHasError] = useState(false);
  const initials = getInitials(name);

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 flex-shrink-0">
      {!hasError ? (
        <img
          src={logo}
          alt={name}
          className="w-5 h-5 object-contain rounded"
          loading="lazy"
          onError={() => setHasError(true)}
        />
      ) : (
        <div
          className="w-5 h-5 rounded flex items-center justify-center bg-white/10 border border-white/10"
          aria-hidden="true"
        >
          <span className="text-[9px] font-mono text-muted-foreground leading-none">
            {initials}
          </span>
        </div>
      )}
      <span className="font-mono text-sm whitespace-nowrap">{name}</span>
    </div>
  );
}


// Бесконечный маркер с CSS анимацией - бесшовный цикл
function InfiniteMarquee({ items, direction = 'left', duration = 20 }: { 
  items: { name: string; logo: string }[]; 
  direction?: 'left' | 'right';
  duration?: number;
}) {
  // Дублируем элементы для бесшовной прокрутки
  const doubledItems = [...items, ...items];
  
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-4 text-muted-foreground text-sm">
        Нет инструментов
      </div>
    );
  }
  
  const animationName = direction === 'left' ? 'marquee-seamless-left' : 'marquee-seamless-right';
  
  return (
    <div className="relative overflow-hidden">
      <div 
        className="flex gap-4 w-max"
        style={{
          animation: `${animationName} ${duration}s linear infinite`,
        }}
      >
        {doubledItems.map((tech, index) => (
          <TechItem key={`${tech.name}-${index}`} name={tech.name} logo={tech.logo} />
        ))}
      </div>
      <style>{`
        @keyframes marquee-seamless-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-seamless-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

function SectionLabel({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs font-mono text-violet-400 mb-3">
      <Icon className="w-3.5 h-3.5" />
      <span>{text}</span>
    </div>
  );
}

export function BentoAbout() {
  const { data: aiTools, isLoading: toolsLoading } = useAITools();
  const { data: siteContent, isLoading: contentLoading } = useSiteContent();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get content from DB with fallbacks
  const getContent = (id: string, fallback: string) => {
    return siteContent?.find(c => c.id === id)?.value || fallback;
  };

  const bio = getContent('artist_bio', 'Занимаюсь генерацией фотореалистичных видео и изображений для промо, сюжетных и рекламных проектов.');
  const email = getContent('artist_email', 'artem@makarov.ai');
  const location = getContent('artist_location', 'Москва, Россия');
  const showMoreButton = getContent('about_show_more_button', 'false') === 'true';
  const extendedContent = getContent('about_extended_content', '');

  // Split AI tools by category from DB
  const videoTools = aiTools?.filter(t => t.category === 'video').map(t => ({ name: t.name, logo: t.logo })) || [];
  const imageTools = aiTools?.filter(t => t.category === 'image').map(t => ({ name: t.name, logo: t.logo })) || [];

  const isLoading = toolsLoading || contentLoading;

  if (isLoading) {
    return (
      <section id="about" className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
        </div>
      </section>
    );
  }

  return (
    <section id="about" className="relative py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="typography-h2 font-bold">
            Обо <span className="gradient-text">мне</span>
          </h2>
        </motion.div>

        {/* Bento Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 auto-rows-auto md:auto-rows-[minmax(140px,auto)]"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Card 1: Bio - Large */}
          <motion.div
            variants={cardVariants}
            className="md:col-span-2 lg:col-span-3 md:row-span-2 glass-card p-6 flex flex-col justify-between group min-h-[200px] h-auto cursor-pointer"
            whileHover={{ scale: 1.01, y: -2 }}
            onClick={() => showMoreButton && extendedContent && setIsModalOpen(true)}
          >
            <div className="overflow-hidden">
              <SectionLabel icon={User} text="О себе" />
              <p className="typography-body leading-relaxed text-muted-foreground break-words">
                {bio}
              </p>
            </div>
            {showMoreButton && extendedContent && (
              <div className="flex items-center gap-2 text-violet-400 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-sm font-medium">Подробнее</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </motion.div>

          {/* Card 2: Location - Small */}
          <motion.div
            variants={cardVariants}
            className="md:col-span-2 lg:col-span-1 glass-card p-5 flex flex-col justify-center items-center text-center min-h-[100px] h-auto"
            whileHover={{ scale: 1.02, y: -2 }}
          >
            <MapPin className="w-6 h-6 text-violet-400 mb-2" />
            <div className="typography-small font-semibold">{location.split(',')[0]}</div>
            <div className="typography-small text-muted-foreground">{location.split(',')[1]?.trim() || 'Россия'}</div>
          </motion.div>

          {/* Card 3: Experience - Small */}
          <motion.div
            variants={cardVariants}
            className="lg:col-span-2 glass-card p-5 flex flex-col justify-center items-center text-center bg-gradient-to-br from-violet-500/10 to-purple-500/5 min-h-[100px] h-auto"
            whileHover={{ scale: 1.02, y: -2 }}
          >
            <div className="typography-h2 font-bold gradient-text">3+</div>
            <div className="typography-small text-muted-foreground">лет в AI-арте</div>
          </motion.div>

          {/* Card 4: Video Tech Stack Marquee - Medium */}
          <motion.div
            variants={cardVariants}
            className="md:col-span-4 lg:col-span-3 glass-card p-5 overflow-hidden min-h-[100px] h-auto"
            whileHover={{ scale: 1.01 }}
          >
            <SectionLabel icon={Film} text="Стек для видео" />
            <InfiniteMarquee items={videoTools} direction="left" duration={25} />
          </motion.div>

          {/* Card 5: Image Tech Stack Marquee - Medium */}
          <motion.div
            variants={cardVariants}
            className="md:col-span-4 lg:col-span-3 glass-card p-5 overflow-hidden min-h-[100px] h-auto"
            whileHover={{ scale: 1.01 }}
          >
            <SectionLabel icon={Image} text="Стек для изображений" />
            <InfiniteMarquee items={imageTools} direction="right" duration={30} />
          </motion.div>

          {/* Card 6: Pipeline - Wide */}
          <motion.div
            variants={cardVariants}
            className="md:col-span-4 lg:col-span-4 glass-card p-5 min-h-[120px] h-auto"
            whileHover={{ scale: 1.01 }}
          >
            <SectionLabel icon={Workflow} text="Мой пайплайн" />
            <div className="flex items-center justify-between gap-2">
              {pipelineSteps.map((step, index) => (
                <div key={step.step} className="flex items-center">
                  <motion.div 
                    className="flex flex-col items-center text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-violet flex items-center justify-center typography-small font-bold mb-2">
                      {step.step}
                    </div>
                    <div className="typography-small font-semibold">{step.title}</div>
                    <div className="typography-small text-muted-foreground hidden sm:block">{step.description}</div>
                  </motion.div>
                  {index < pipelineSteps.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-muted-foreground mx-1 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Card 7: Available Badge */}
          <motion.div
            variants={cardVariants}
            className="lg:col-span-2 glass-card p-5 flex flex-col justify-center items-center text-center bg-gradient-to-br from-emerald-500/10 to-green-500/5 min-h-[100px] h-auto"
            whileHover={{ scale: 1.02, y: -2 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
              <span className="typography-body font-semibold text-emerald-400">Доступен</span>
            </div>
            <div className="typography-small text-muted-foreground">Для новых проектов</div>
          </motion.div>

          {/* Card 8: Email */}
          <motion.a
            href={`mailto:${email}`}
            variants={cardVariants}
            className="lg:col-span-4 glass-card p-5 flex items-center justify-between group cursor-pointer min-h-[100px] h-auto"
            whileHover={{ scale: 1.01, y: -2 }}
          >
            <div>
              <SectionLabel icon={Mail} text="Связаться" />
              <div className="font-mono typography-h3 group-hover:text-violet-400 transition-colors">
                {email}
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
          </motion.a>
        </motion.div>
      </div>

      {/* Extended Content Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="glass-card border-white/10 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-violet-400" />
              Обо мне
            </DialogTitle>
          </DialogHeader>
          <div className="prose prose-invert max-w-none">
            <p className="typography-body leading-relaxed text-muted-foreground whitespace-pre-wrap break-words">
              {extendedContent}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
