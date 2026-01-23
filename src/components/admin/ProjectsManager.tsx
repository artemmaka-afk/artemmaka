import { useState, useRef, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, Upload, X, Eye, EyeOff, ExternalLink, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useProjects, useProjectMutations, useAITools, type Project, type ContentBlock } from '@/hooks/useSiteData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ContentBlocksEditor } from './ContentBlocksEditor';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useQueryClient } from '@tanstack/react-query';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

function FileUploadInput({
  value,
  onChange,
  accept,
  label,
  bucket = 'project-media',
}: {
  value: string;
  onChange: (url: string) => void;
  accept: string;
  label: string;
  bucket?: string;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`Файл слишком большой. Максимум: ${maxSize / 1024 / 1024}MB`);
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
      onChange(publicUrl);
      toast.success('Файл загружен');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Ошибка загрузки: ' + error.message);
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="URL или загрузите файл"
          className="bg-white/5 border-white/10 flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="flex-shrink-0"
        >
          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        </Button>
        <input ref={inputRef} type="file" accept={accept} onChange={handleFileChange} className="hidden" />
      </div>
      {value && (
        <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
          {value.match(/\.(mp4|webm|mov|gif)$/i) ? (
            <video src={value} className="w-16 h-12 object-cover rounded" muted />
          ) : (
            <img src={value} alt="Preview" className="w-16 h-12 object-cover rounded" />
          )}
          <span className="text-xs text-muted-foreground flex-1 truncate">{value}</span>
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange('')} className="h-6 w-6 p-0">
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  );
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
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>(project?.content_blocks || []);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!project?.id) {
      setSlug(slugify(value));
    }
  };

  const toggleTool = (toolName: string) => {
    setSelectedTools((prev) =>
      prev.includes(toolName) ? prev.filter((t) => t !== toolName) : [...prev, toolName]
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
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      ai_tools: selectedTools,
      is_published: isPublished,
      sort_order: project?.sort_order || 0,
      content_blocks: contentBlocks,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
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

      <FileUploadInput
        value={thumbnail}
        onChange={setThumbnail}
        accept="image/*"
        label="Превью (изображение)"
      />

      <div className="space-y-2">
        <label className="text-sm font-medium">Видео-превью</label>
        <p className="text-xs text-muted-foreground mb-2">
          Загрузите видео или вставьте ссылку на Kinescope (формат: https://kinescope.io/VIDEO_ID)
        </p>
        <FileUploadInput
          value={videoPreview}
          onChange={setVideoPreview}
          accept="video/*,.gif"
          label=""
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">AI Инструменты</label>
        <div className="flex flex-wrap gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
          {aiTools.map((tool) => (
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

      {/* Preview Button */}
      {slug && (
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const previewData = {
              title,
              slug,
              subtitle: subtitle || null,
              thumbnail: thumbnail || null,
              video_preview: videoPreview || null,
              year: year || null,
              duration: duration || null,
              tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
              ai_tools: selectedTools,
              is_published: isPublished,
              content_blocks: contentBlocks,
            };
            localStorage.setItem('project_preview', JSON.stringify(previewData));
            window.open(`/preview/${slug}`, '_blank');
          }}
          className="w-full gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          Предпросмотр проекта
        </Button>
      )}

      {/* Content Blocks Editor */}
      <div className="border-t border-white/10 pt-4">
        <ContentBlocksEditor blocks={contentBlocks} onChange={setContentBlocks} />
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

function SortableProjectItem({ 
  project, 
  onEdit, 
  onToggleVisibility, 
  onDelete 
}: { 
  project: Project; 
  onEdit: () => void; 
  onToggleVisibility: () => void; 
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: project.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="w-5 h-5" />
      </button>
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
            <span className="px-2 py-0.5 text-[10px] bg-yellow-500/20 text-yellow-400 rounded">Скрыт</span>
          )}
          {project.content_blocks?.length > 0 && (
            <span className="px-2 py-0.5 text-[10px] bg-violet-500/20 text-violet-400 rounded">
              {project.content_blocks.length} блоков
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">{project.subtitle}</p>
        <div className="flex gap-1.5 mt-2 flex-wrap">
          {project.tags?.slice(0, 3).map((tag) => (
            <span key={tag} className="px-2 py-0.5 text-[10px] font-mono bg-white/5 rounded">{tag}</span>
          ))}
        </div>
      </div>
      <div className="flex gap-1">
        <Button size="sm" variant="ghost" onClick={onEdit} title="Редактировать">
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onToggleVisibility}
          title={project.is_published ? 'Скрыть' : 'Показать'}
          className={project.is_published ? 'text-yellow-400 hover:text-yellow-300' : 'text-green-400 hover:text-green-300'}
        >
          {project.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>
        <Button size="sm" variant="ghost" onClick={onDelete} className="text-red-400 hover:text-red-300" title="Удалить">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export function ProjectsManager() {
  const { data: projects, isLoading } = useProjects();
  const { data: aiTools } = useAITools();
  const { upsert, remove } = useProjectMutations();
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [localProjects, setLocalProjects] = useState<Project[]>([]);
  const queryClient = useQueryClient();

  // Sync local projects with fetched data
  useEffect(() => {
    if (projects) {
      setLocalProjects([...projects].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)));
    }
  }, [projects]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !localProjects.length) return;

    const oldIndex = localProjects.findIndex((p) => p.id === active.id);
    const newIndex = localProjects.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(localProjects, oldIndex, newIndex);

    // Optimistic update - update local state immediately
    const updatedProjects = reordered.map((p, i) => ({ ...p, sort_order: i }));
    setLocalProjects(updatedProjects);

    // Update sort_order in DB
    try {
      for (let i = 0; i < reordered.length; i++) {
        if (reordered[i].sort_order !== i) {
          await supabase.from('projects').update({ sort_order: i }).eq('id', reordered[i].id);
        }
      }
      // Refetch to ensure sync
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Порядок сохранён');
    } catch (error) {
      // Revert on error
      if (projects) {
        setLocalProjects([...projects].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)));
      }
      toast.error('Ошибка сохранения порядка');
    }
  };

  const handleSave = async (data: Partial<Project>) => {
    await upsert.mutateAsync(data as any);
    setIsDialogOpen(false);
    setEditingProject(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Удалить проект навсегда?')) {
      await remove.mutateAsync(id);
    }
  };

  const handleToggleVisibility = async (project: Project) => {
    await upsert.mutateAsync({ id: project.id, is_published: !project.is_published } as any);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
      </div>
    );
  }

  // Remove unused sortedProjects - use localProjects instead

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Проекты</h3>
          <p className="text-sm text-muted-foreground">Перетаскивайте для сортировки</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingProject(null); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2 bg-gradient-violet"><Plus className="w-4 h-4" />Добавить</Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 max-w-3xl max-h-[90vh]">
            <DialogHeader><DialogTitle>{editingProject ? 'Редактировать проект' : 'Новый проект'}</DialogTitle></DialogHeader>
            <ProjectForm
              project={editingProject || undefined}
              onSave={handleSave}
              onCancel={() => { setIsDialogOpen(false); setEditingProject(null); }}
              isLoading={upsert.isPending}
              aiTools={aiTools || []}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {localProjects.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Нет проектов</p>
            <p className="text-sm">Добавьте первый проект</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={localProjects.map(p => p.id)} strategy={verticalListSortingStrategy}>
              {localProjects.map((project) => (
                <SortableProjectItem
                  key={project.id}
                  project={project}
                  onEdit={() => { setEditingProject(project); setIsDialogOpen(true); }}
                  onToggleVisibility={() => handleToggleVisibility(project)}
                  onDelete={() => handleDelete(project.id)}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
