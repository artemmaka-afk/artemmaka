import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Clock } from 'lucide-react';
import { projects, Project } from '@/lib/constants';
import { ProjectSheet } from './ProjectSheet';

interface ProjectCardProps {
  project: Project;
  index: number;
  onSelect: (project: Project) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5 }
  }
};

function ProjectCard({ project, index, onSelect }: ProjectCardProps) {
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
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="relative aspect-[9/16] glass-card overflow-hidden gradient-border">
        {/* Thumbnail */}
        <img
          src={project.thumbnail}
          alt={project.title}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            isHovered ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* Video Preview */}
        <video
          ref={videoRef}
          src={project.videoPreview}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
          muted
          loop
          playsInline
          preload="metadata"
        />

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-80" />

        {/* Content */}
        <div className="absolute inset-0 p-5 flex flex-col justify-between">
          {/* Top - Tags */}
          <div className="flex flex-wrap gap-2">
            {project.tags.slice(0, 2).map((tag) => (
              <motion.span
                key={tag}
                className="px-3 py-1 text-xs font-mono bg-white/10 backdrop-blur-md rounded-full border border-white/10"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                {tag}
              </motion.span>
            ))}
          </div>

          {/* Bottom - Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-mono">{project.duration}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{project.year}</span>
            </div>
            <h3 className="text-lg font-bold mb-1 line-clamp-2">{project.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1">{project.subtitle}</p>
          </div>
        </div>

        {/* Play Indicator */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20"
            whileHover={{ scale: 1.1 }}
          >
            <Play className="w-6 h-6 text-foreground ml-1" fill="currentColor" />
          </motion.div>
        </motion.div>
      </div>
    </motion.article>
  );
}

export function PortfolioGrid() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <section id="portfolio" className="relative py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Избранные <span className="gradient-text">работы</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Коллекция AI-генерированных видео, анимаций и визуальных экспериментов
          </p>
        </motion.div>

        {/* Masonry Grid */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              onSelect={setSelectedProject}
            />
          ))}
        </motion.div>
      </div>

      {/* Project Sheet */}
      <ProjectSheet
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
}
