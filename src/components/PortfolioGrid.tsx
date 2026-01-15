import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Calendar, Loader2 } from 'lucide-react';
import { Project as ConstantsProject, projects as fallbackProjects } from '@/lib/constants';
import { useProjects, type Project as DBProject } from '@/hooks/useSiteData';
import { ProjectSheet } from './ProjectSheet';

// Format date as dd.mm.yyyy
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

// Adapter to transform DB project to constants format for ProjectSheet
function toConstantsProject(p: DBProject): ConstantsProject {
  return {
    id: p.slug,
    title: p.title,
    subtitle: p.subtitle || '',
    thumbnail: p.thumbnail || '',
    videoPreview: p.video_preview || '',
    tags: p.tags,
    year: p.year || '',
    duration: p.duration || '',
    aiTools: p.ai_tools,
    contentBlocks: p.content_blocks,
  };
}

interface ProjectCardProps {
  project: ConstantsProject;
  createdAt?: string;
  index: number;
  onSelect: (project: ConstantsProject) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4 }
  }
};

function ProjectCard({ project, createdAt, index, onSelect }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    videoRef.current?.play();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    videoRef.current?.pause();
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <motion.article
      variants={cardVariants}
      className="relative group cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelect(project)}
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      {/* Мобильная версия: компактная карточка */}
      <div className="relative aspect-[4/5] sm:aspect-[9/16] glass-card overflow-hidden gradient-border">
        {/* Thumbnail */}
        <img
          src={project.thumbnail}
          alt={project.title}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            isHovered ? 'opacity-0' : 'opacity-100'
          }`}
          loading="lazy"
        />

        {/* Video Preview */}
        {project.videoPreview && (
          <video
            ref={videoRef}
            src={project.videoPreview}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
            muted
            loop
            playsInline
            preload="none"
          />
        )}

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent opacity-90" />

        {/* Content */}
        <div className="absolute inset-0 p-3 sm:p-4 flex flex-col justify-between">
          {/* Top - Tags */}
          <div className="flex flex-wrap gap-1.5">
            {project.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-[10px] sm:text-xs font-mono bg-white/10 backdrop-blur-md rounded-full border border-white/10"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Bottom - Info */}
          <div>
            {/* Show date instead of duration/year */}
            <div className="flex items-center gap-1.5 mb-1.5">
              <Calendar className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] sm:text-xs text-muted-foreground font-mono">
                {createdAt ? formatDate(createdAt) : project.year}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold mb-0.5 line-clamp-2">{project.title}</h3>
            <p className="text-xs text-muted-foreground line-clamp-1 hidden sm:block">{project.subtitle}</p>
          </div>
        </div>

        {/* Play Indicator */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div 
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20"
            whileHover={{ scale: 1.1 }}
          >
            <Play className="w-4 h-4 sm:w-5 sm:h-5 text-foreground ml-0.5" fill="currentColor" />
          </motion.div>
        </motion.div>
      </div>
    </motion.article>
  );
}

export function PortfolioGrid() {
  const { data: dbProjects, isLoading } = useProjects();
  const [selectedProject, setSelectedProject] = useState<ConstantsProject | null>(null);

  // Use DB projects if available and published, fallback to constants
  const projects = dbProjects && dbProjects.length > 0
    ? dbProjects.filter(p => p.is_published)
    : [];

  const fallback = projects.length === 0 ? fallbackProjects : [];

  if (isLoading) {
    return (
      <section id="portfolio" className="relative py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
        </div>
      </section>
    );
  }

  return (
    <section id="portfolio" className="relative py-12 sm:py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
            Избранные <span className="gradient-text">проекты</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
            Коллекция AI-генерированных видео, анимаций и визуальных экспериментов
          </p>
        </motion.div>

        {/* Адаптивная сетка: 2 колонки на мобильных, 3 на планшетах, 4 на десктопе */}
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {/* DB Projects */}
          {dbProjects?.filter(p => p.is_published).map((p, index) => (
            <ProjectCard
              key={p.id}
              project={toConstantsProject(p)}
              createdAt={p.created_at}
              index={index}
              onSelect={setSelectedProject}
            />
          ))}
          
          {/* Fallback projects */}
          {fallback.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              onSelect={setSelectedProject}
            />
          ))}
        </motion.div>

        {projects.length === 0 && fallback.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p>Нет опубликованных проектов</p>
          </div>
        )}
      </div>

      {/* Project Sheet */}
      <ProjectSheet
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
}
