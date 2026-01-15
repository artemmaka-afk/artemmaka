import { useState } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useProjects, useProjectMutations, useAITools, type Project } from '@/hooks/useSiteData';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

function ProjectForm({
  project,
  onSave,
  onCancel,
  isLoading,
  aiTools,
}: {
  project?: Project;
  onSave: (data: Partial<Project>) => void;
  onCancel: () => void;
  isLoading: boolean;
  aiTools: { id: string; name: string }[];
}) {
  const [title, setTitle] = useState(project?.title || '');
  const [slug, setSlug] = useState(project?.slug || '');
  const [subtitle, setSubtitle] = useState(project?.subtitle || '');
  const [thumbnail, setThumbnail] = useState(project?.thumbnail || '');
  const [videoPreview, setVideoPreview] = useState(project?.video_preview || '');
  const [year, setYear] = useState(project?.year || new Date().getFullYear().toString());
  const [duration, setDuration] = useState(project?.duration || '');
  const [tags, setTags] = useState(project?.tags?.join(', ') || '');
  const [selectedTools, setSelectedTools] = useState<string[]>(project?.ai_tools || []);
  const [isPublished, setIsPublished] = useState(project?.is_published ?? true);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!project?.id) {
      setSlug(slugify(value));
    }
  };

  const toggleTool = (toolName: string) => {
    setSelectedTools(prev =>
      prev.includes(toolName)
        ? prev.filter(t => t !== toolName)
        : [...prev, toolName]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...(project?.id ? { id: project.id } : {}),
      title,
      slug,
      subtitle: subtitle || null,
      thumbnail: thumbnail || null,
      video_preview: videoPreview || null,
      year: year || null,
      duration: duration || null,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      ai_tools: selectedTools,
      is_published: isPublished,
      sort_order: project?.sort_order || 0,
      content_blocks: project?.content_blocks || [],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Название *</label>
          <Input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Киберпанк Москва"
            className="bg-white/5 border-white/10"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Slug *</label>
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="cyberpunk-moscow"
            className="bg-white/5 border-white/10"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Подзаголовок</label>
        <Input
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Футуристический короткометражный фильм"
          className="bg-white/5 border-white/10"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Год</label>
          <Input
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="2024"
            className="bg-white/5 border-white/10"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Длительность</label>
          <Input
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="2:45"
            className="bg-white/5 border-white/10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Теги (через запятую)</label>
        <Input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="#AI, #Video, #Commercial"
          className="bg-white/5 border-white/10"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">URL превью (изображение)</label>
        <Input
          value={thumbnail}
          onChange={(e) => setThumbnail(e.target.value)}
          placeholder="https://..."
          className="bg-white/5 border-white/10"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">URL видео-превью</label>
        <Input
          value={videoPreview}
          onChange={(e) => setVideoPreview(e.target.value)}
          placeholder="https://..."
          className="bg-white/5 border-white/10"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">AI Инструменты</label>
        <div className="flex flex-wrap gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
          {aiTools.map(tool => (
            <button
              key={tool.id}
              type="button"
              onClick={() => toggleTool(tool.name)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                selectedTools.includes(tool.name)
                  ? 'bg-violet-500/30 text-violet-300 border border-violet-500/50'
                  : 'bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10'
              }`}
            >
              {tool.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
        <div>
          <div className="font-medium text-sm">Опубликован</div>
          <div className="text-xs text-muted-foreground">Виден на сайте</div>
        </div>
        <Switch checked={isPublished} onCheckedChange={setIsPublished} />
      </div>

      <div className="flex gap-2 pt-4 sticky bottom-0 bg-background pb-2">
        <Button type="submit" className="flex-1 bg-gradient-violet" disabled={isLoading}>
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Сохранить'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
      </div>
    </form>
  );
}

export function ProjectsManager() {
  const { data: projects, isLoading } = useProjects();
  const { data: aiTools } = useAITools();
  const { upsert, remove } = useProjectMutations();
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSave = async (data: Partial<Project>) => {
    await upsert.mutateAsync(data as any);
    setIsDialogOpen(false);
    setEditingProject(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Удалить проект?')) {
      await remove.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Проекты</h3>
          <p className="text-sm text-muted-foreground">Управляйте портфолио</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingProject(null);
        }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2 bg-gradient-violet">
              <Plus className="w-4 h-4" />
              Добавить
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingProject ? 'Редактировать проект' : 'Новый проект'}</DialogTitle>
            </DialogHeader>
            <ProjectForm
              project={editingProject || undefined}
              onSave={handleSave}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingProject(null);
              }}
              isLoading={upsert.isPending}
              aiTools={aiTools || []}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {projects?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Нет проектов</p>
            <p className="text-sm">Добавьте первый проект</p>
          </div>
        ) : (
          projects?.map(project => (
            <div key={project.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
              {project.thumbnail && (
                <img
                  src={project.thumbnail}
                  alt={project.title}
                  className="w-16 h-20 object-cover rounded-lg flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold truncate">{project.title}</h4>
                  {!project.is_published && (
                    <span className="px-2 py-0.5 text-[10px] bg-yellow-500/20 text-yellow-400 rounded">
                      Скрыт
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">{project.subtitle}</p>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {project.tags?.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2 py-0.5 text-[10px] font-mono bg-white/5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditingProject(project);
                    setIsDialogOpen(true);
                  }}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(project.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
