import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Clock, Calendar, ChevronLeft, ChevronRight, Play, Pause, Maximize } from 'lucide-react';
import { Project, ContentBlock } from '@/lib/constants';
import { Sheet, SheetContent } from '@/components/ui/sheet';

interface ProjectSheetProps {
  project: Project | null;
  onClose: () => void;
}

function AIToolBadge({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
      <span className="text-xs font-mono">{name}</span>
    </div>
  );
}

// Проверяем является ли URL embed-ссылкой на Kinescope
function isKinescopeUrl(url: string): boolean {
  return url.includes('kinescope.io');
}

// Извлекаем ID видео из Kinescope URL
function getKinescopeEmbedUrl(url: string): string {
  // Поддерживаем форматы:
  // https://kinescope.io/jRTcPUDJ1Hoy4MJG1iDThL
  // https://kinescope.io/embed/jRTcPUDJ1Hoy4MJG1iDThL
  const match = url.match(/kinescope\.io\/(?:embed\/)?([a-zA-Z0-9]+)/);
  if (match) {
    return `https://kinescope.io/embed/${match[1]}`;
  }
  return url;
}

// Компонент видеоплеера с сохранением пропорций
function VideoPlayer({ 
  src, 
  autoPlay = false 
}: { 
  src: string; 
  autoPlay?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [showControls, setShowControls] = useState(true);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  // Kinescope embed
  if (isKinescopeUrl(src)) {
    const embedUrl = getKinescopeEmbedUrl(src);
    return (
      <div className="relative w-full bg-black rounded-2xl overflow-hidden">
        <div style={{ position: 'relative', paddingTop: '177.78%', width: '100%' }}>
          <iframe
            src={embedUrl}
            style={{ 
              position: 'absolute', 
              width: '100%', 
              height: '100%', 
              top: 0, 
              left: 0,
              border: 'none'
            }}
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer; clipboard-write; screen-wake-lock;"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  // Обычное видео с контролами
  return (
    <div 
      className="relative w-full bg-black rounded-2xl overflow-hidden group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-auto max-h-[70vh] object-contain"
        autoPlay={autoPlay}
        loop
        playsInline
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      
      {/* Custom Controls Overlay */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: showControls ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-white/30 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white ml-0.5" />
            )}
          </button>
          
          <button
            onClick={toggleFullscreen}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-white/30 transition-colors"
          >
            <Maximize className="w-4 h-4 text-white" />
          </button>
        </div>
      </motion.div>
      
      {/* Center Play Button when paused */}
      {!isPlaying && (
        <motion.div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
            <Play className="w-8 h-8 text-white ml-1" />
          </div>
        </motion.div>
      )}
    </div>
  );
}

function renderMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index} className="italic text-violet-400">{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

function ContentBlockRenderer({ block, index }: { block: ContentBlock; index: number }) {
  const [comparePosition, setComparePosition] = useState(50);

  switch (block.type) {
    case 'text':
      return (
        <motion.div 
          className="prose prose-invert max-w-none"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <p className="text-lg leading-relaxed text-muted-foreground">
            {renderMarkdown(block.content || '')}
          </p>
        </motion.div>
      );

    case 'image':
      return (
        <motion.figure 
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="relative overflow-hidden rounded-2xl">
            <img
              src={block.src}
              alt={block.caption || 'Изображение проекта'}
              className="w-full h-auto object-cover"
              loading="lazy"
            />
          </div>
          {block.caption && (
            <figcaption className="text-sm text-muted-foreground font-mono text-center">
              {block.caption}
            </figcaption>
          )}
        </motion.figure>
      );

    case 'video':
      return (
        <motion.figure 
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="relative overflow-hidden rounded-2xl glass-card">
            <VideoPlayer src={block.src || ''} />
          </div>
          {block.caption && (
            <figcaption className="text-sm text-muted-foreground font-mono text-center">
              {block.caption}
            </figcaption>
          )}
        </motion.figure>
      );

    case 'comparison':
      return (
        <motion.figure 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="relative overflow-hidden rounded-2xl aspect-video">
            <img
              src={block.beforeSrc}
              alt="До"
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - comparePosition}% 0 0)` }}
            >
              <img
                src={block.afterSrc}
                alt="После"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>

            <div
              className="absolute inset-y-0 w-1 bg-white/80 cursor-ew-resize"
              style={{ left: `${comparePosition}%`, transform: 'translateX(-50%)' }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center">
                <ChevronLeft className="w-4 h-4 text-white -ml-1" />
                <ChevronRight className="w-4 h-4 text-white -mr-1" />
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={comparePosition}
              onChange={(e) => setComparePosition(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
            />

            <div className="absolute bottom-4 left-4 px-3 py-1 text-xs font-mono bg-black/50 backdrop-blur-md rounded-full">
              До
            </div>
            <div className="absolute bottom-4 right-4 px-3 py-1 text-xs font-mono bg-white/20 backdrop-blur-md rounded-full">
              После
            </div>
          </div>
          {block.caption && (
            <figcaption className="text-sm text-muted-foreground font-mono text-center">
              {block.caption}
            </figcaption>
          )}
        </motion.figure>
      );

    default:
      return null;
  }
}

export function ProjectSheet({ project, onClose }: ProjectSheetProps) {
  useEffect(() => {
    if (project) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [project]);

  return (
    <Sheet open={!!project} onOpenChange={(open) => !open && onClose()}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-2xl lg:max-w-3xl p-0 bg-background border-l border-white/10 overflow-y-auto [&>button]:hidden"
      >
        <AnimatePresence>
          {project && (
            <motion.article 
              className="min-h-full"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              {/* Hero Video/Image with proper aspect ratio */}
              <div className="relative">
                <VideoPlayer src={project.videoPreview} autoPlay={true} />
                
                <motion.button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/20 z-10"
                  aria-label="Закрыть"
                  whileHover={{ scale: 1.1, backgroundColor: 'rgba(0,0,0,0.7)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="px-6 py-8 space-y-8">
                <header className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {project.year}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {project.duration}
                    </span>
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl font-bold">{project.title}</h1>
                  <p className="text-xl text-muted-foreground">{project.subtitle}</p>

                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-4 py-2 text-sm font-mono bg-white/5 rounded-full border border-white/10"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </header>

                <div className="space-y-8">
                  {project.contentBlocks.map((block, index) => (
                    <ContentBlockRenderer key={index} block={block} index={index} />
                  ))}
                </div>

                {/* AI Tools Used */}
                {project.aiTools && project.aiTools.length > 0 && (
                  <div className="pt-6 border-t border-white/10">
                    <div className="text-xs font-mono text-muted-foreground mb-3">Использованные нейросети</div>
                    <div className="flex flex-wrap gap-2">
                      {project.aiTools.map((toolName) => (
                        <AIToolBadge key={toolName} name={toolName} />
                      ))}
                    </div>
                  </div>
                )}

                <footer className="pt-8 border-t border-white/10">
                  <motion.a
                    href="#calculator"
                    onClick={onClose}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-violet rounded-xl font-semibold text-primary-foreground"
                    whileHover={{ scale: 1.02, boxShadow: '0 0 30px hsl(263 70% 58% / 0.3)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Заказать похожий проект
                    <ExternalLink className="w-4 h-4" />
                  </motion.a>
                </footer>
              </div>
            </motion.article>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
}
