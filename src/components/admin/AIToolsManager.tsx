import { useState } from 'react';
import { Plus, Pencil, Trash2, Film, Image, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAITools, useAIToolMutations, type AITool } from '@/hooks/useSiteData';

function ToolForm({ 
  tool, 
  onSave, 
  onCancel,
  isLoading 
}: { 
  tool?: AITool; 
  onSave: (data: Partial<AITool>) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [name, setName] = useState(tool?.name || '');
  const [logo, setLogo] = useState(tool?.logo || '');
  const [category, setCategory] = useState<'video' | 'image'>(tool?.category || 'video');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ 
      ...(tool?.id ? { id: tool.id } : {}),
      name, 
      logo, 
      category,
      sort_order: tool?.sort_order || 0
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Название</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Midjourney"
          className="bg-white/5 border-white/10"
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">URL логотипа</label>
        <Input
          value={logo}
          onChange={(e) => setLogo(e.target.value)}
          placeholder="https://..."
          className="bg-white/5 border-white/10"
          required
        />
        {logo && (
          <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
            <img src={logo} alt="Preview" className="w-8 h-8 object-contain rounded" />
            <span className="text-xs text-muted-foreground">Предпросмотр</span>
          </div>
        )}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Категория</label>
        <Select value={category} onValueChange={(v) => setCategory(v as 'video' | 'image')}>
          <SelectTrigger className="bg-white/5 border-white/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="video">Видео</SelectItem>
            <SelectItem value="image">Изображения</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2 pt-4">
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

export function AIToolsManager() {
  const { data: tools, isLoading } = useAITools();
  const { upsert, remove } = useAIToolMutations();
  const [editingTool, setEditingTool] = useState<AITool | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const videoTools = tools?.filter(t => t.category === 'video') || [];
  const imageTools = tools?.filter(t => t.category === 'image') || [];

  const handleSave = async (data: Partial<AITool>) => {
    await upsert.mutateAsync(data as any);
    setIsDialogOpen(false);
    setEditingTool(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Удалить инструмент?')) {
      await remove.mutateAsync(id);
    }
  };

  const renderToolRow = (tool: AITool) => (
    <div key={tool.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
      <img src={tool.logo} alt={tool.name} className="w-8 h-8 object-contain rounded" />
      <span className="flex-1 font-medium text-sm">{tool.name}</span>
      <div className="flex gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setEditingTool(tool);
            setIsDialogOpen(true);
          }}
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleDelete(tool.id)}
          className="text-red-400 hover:text-red-300"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

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
          <h3 className="text-lg font-semibold">AI Инструменты</h3>
          <p className="text-sm text-muted-foreground">Логотипы автоматически обновятся на сайте</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingTool(null);
        }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2 bg-gradient-violet">
              <Plus className="w-4 h-4" />
              Добавить
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10">
            <DialogHeader>
              <DialogTitle>{editingTool ? 'Редактировать инструмент' : 'Новый инструмент'}</DialogTitle>
            </DialogHeader>
            <ToolForm
              tool={editingTool || undefined}
              onSave={handleSave}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingTool(null);
              }}
              isLoading={upsert.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Video Tools */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-violet-400">
          <Film className="w-4 h-4" />
          <span>Для видео ({videoTools.length})</span>
        </div>
        <div className="space-y-2">
          {videoTools.map(renderToolRow)}
        </div>
      </div>

      {/* Image Tools */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-violet-400">
          <Image className="w-4 h-4" />
          <span>Для изображений ({imageTools.length})</span>
        </div>
        <div className="space-y-2">
          {imageTools.map(renderToolRow)}
        </div>
      </div>
    </div>
  );
}
