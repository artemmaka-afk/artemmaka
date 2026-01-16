import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectSheet } from '@/components/ProjectSheet';
import type { Project as FullProject } from '@/lib/constants';

interface PreviewProject {
  title: string;
  slug: string;
  subtitle: string | null;
  thumbnail: string | null;
  video_preview: string | null;
  year: string | null;
  duration: string | null;
  tags: string[];
  ai_tools: string[];
  is_published: boolean;
  content_blocks: any[];
}

export default function ProjectPreview() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<FullProject | null>(null);

  useEffect(() => {
    const storedData = localStorage.getItem('project_preview');
    if (storedData) {
      try {
        const previewData: PreviewProject = JSON.parse(storedData);
        if (previewData.slug === slug) {
          // Convert to FullProject format (slug is not in FullProject interface, but we can ignore it)
          const fullProject: FullProject = {
            id: 'preview',
            title: previewData.title,
            subtitle: previewData.subtitle || '',
            thumbnail: previewData.thumbnail || '',
            videoPreview: previewData.video_preview || '',
            year: previewData.year || new Date().getFullYear().toString(),
            duration: previewData.duration || '',
            tags: previewData.tags || [],
            aiTools: previewData.ai_tools || [],
            contentBlocks: previewData.content_blocks || [],
          };
          setProject(fullProject);
        }
      } catch (e) {
        console.error('Error parsing preview data:', e);
      }
    }
  }, [slug]);

  if (!project) {
    return (
      <div className="min-h-screen bg-background mesh-background noise-overlay flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-muted-foreground text-center">
          Данные предпросмотра не найдены.
          <br />
          Вернитесь в админку и нажмите «Предпросмотр» ещё раз.
        </p>
        <Link to="/admin">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            В админ-панель
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background mesh-background noise-overlay">
      {/* Preview Banner */}
      <div className="fixed top-0 left-0 right-0 z-[100] bg-yellow-500/90 text-black px-4 py-2 text-center text-sm font-medium">
        Режим предпросмотра — это черновик, изменения не сохранены
        <Link to="/admin" className="ml-4 underline hover:no-underline">
          ← Вернуться в админку
        </Link>
      </div>

      {/* The project sheet renders as a full-screen overlay */}
      <ProjectSheet project={project} onClose={() => window.close()} />
    </div>
  );
}
