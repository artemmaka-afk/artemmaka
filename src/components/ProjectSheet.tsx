import { useEffect, useState } from 'react';
import { X, ExternalLink, Clock, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Project, ContentBlock } from '@/lib/constants';
import { Sheet, SheetContent } from '@/components/ui/sheet';

interface ProjectSheetProps {
  project: Project | null;
  onClose: () => void;
}

function renderMarkdown(text: string): React.ReactNode {
  // Simple markdown parser for bold and italic
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

function ContentBlockRenderer({ block }: { block: ContentBlock }) {
  const [comparePosition, setComparePosition] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false);

  switch (block.type) {
    case 'text':
      return (
        <div className="prose prose-invert max-w-none">
          <p className="text-lg leading-relaxed text-muted-foreground">
            {renderMarkdown(block.content || '')}
          </p>
        </div>
      );

    case 'image':
      return (
        <figure className="space-y-3">
          <div className="relative overflow-hidden rounded-2xl">
            <img
              src={block.src}
              alt={block.caption || 'Project image'}
              className="w-full h-auto object-cover"
              loading="lazy"
            />
          </div>
          {block.caption && (
            <figcaption className="text-sm text-muted-foreground font-mono text-center">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case 'video':
      return (
        <figure className="space-y-3">
          <div className="relative overflow-hidden rounded-2xl glass-card">
            <video
              src={block.src}
              className="w-full h-auto"
              controls
              playsInline
              preload="metadata"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1" />
                </div>
              </div>
            )}
          </div>
          {block.caption && (
            <figcaption className="text-sm text-muted-foreground font-mono text-center">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case 'comparison':
      return (
        <figure className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl aspect-video">
            {/* Before Image */}
            <img
              src={block.beforeSrc}
              alt="Before"
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* After Image with Clip */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - comparePosition}% 0 0)` }}
            >
              <img
                src={block.afterSrc}
                alt="After"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>

            {/* Slider */}
            <div
              className="absolute inset-y-0 w-1 bg-white/80 cursor-ew-resize"
              style={{ left: `${comparePosition}%`, transform: 'translateX(-50%)' }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center">
                <ChevronLeft className="w-4 h-4 text-white -ml-1" />
                <ChevronRight className="w-4 h-4 text-white -mr-1" />
              </div>
            </div>

            {/* Invisible slider input */}
            <input
              type="range"
              min="0"
              max="100"
              value={comparePosition}
              onChange={(e) => setComparePosition(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
            />

            {/* Labels */}
            <div className="absolute bottom-4 left-4 px-3 py-1 text-xs font-mono bg-black/50 backdrop-blur-md rounded-full">
              Before
            </div>
            <div className="absolute bottom-4 right-4 px-3 py-1 text-xs font-mono bg-white/20 backdrop-blur-md rounded-full">
              After
            </div>
          </div>
          {block.caption && (
            <figcaption className="text-sm text-muted-foreground font-mono text-center">
              {block.caption}
            </figcaption>
          )}
        </figure>
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
        className="w-full sm:max-w-2xl lg:max-w-3xl p-0 bg-background border-l border-white/10 overflow-y-auto"
      >
        {project && (
          <article className="min-h-full">
            {/* Hero Video/Image */}
            <div className="relative aspect-video">
              <video
                src={project.videoPreview}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-black/70 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-8 space-y-8">
              {/* Header */}
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

                {/* Tags */}
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

              {/* Story Content */}
              <div className="space-y-8">
                {project.contentBlocks.map((block, index) => (
                  <ContentBlockRenderer key={index} block={block} />
                ))}
              </div>

              {/* Footer CTA */}
              <footer className="pt-8 border-t border-white/10">
                <a
                  href="#calculator"
                  onClick={onClose}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-violet rounded-xl font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Commission Similar Work
                  <ExternalLink className="w-4 h-4" />
                </a>
              </footer>
            </div>
          </article>
        )}
      </SheetContent>
    </Sheet>
  );
}
