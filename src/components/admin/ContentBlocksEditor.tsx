import { useState, useRef } from 'react';
import { Plus, Trash2, GripVertical, Loader2, Upload, Type, Image, Film, ArrowLeftRight, MoveUp, MoveDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { ContentBlock } from '@/hooks/useSiteData';

interface ContentBlocksEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

const BLOCK_TYPES = [
  { value: 'text', label: 'Текст', icon: Type },
  { value: 'image', label: 'Изображение', icon: Image },
  { value: 'video', label: 'Видео', icon: Film },
  { value: 'comparison', label: 'Сравнение', icon: ArrowLeftRight },
] as const;

function FileUploadButton({
  onUpload,
  accept,
  label,
}: {
  onUpload: (url: string) => void;
  accept: string;
  label: string;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 50MB for videos, 10MB for images)
    const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`Файл слишком большой. Максимум: ${maxSize / 1024 / 1024}MB`);
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('project-media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('project-media')
        .getPublicUrl(fileName);

      onUpload(publicUrl);
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
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="gap-2"
      >
        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        {label}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  );
}

function BlockEditor({
  block,
  index,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  block: ContentBlock;
  index: number;
  onChange: (block: ContentBlock) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const BlockIcon = BLOCK_TYPES.find((t) => t.value === block.type)?.icon || Type;

  const renderFields = () => {
    switch (block.type) {
      case 'text':
        return (
          <div className="space-y-2">
            <Textarea
              value={block.content || ''}
              onChange={(e) => onChange({ ...block, content: e.target.value })}
              placeholder="Текст с поддержкой **жирного** и *курсива*"
              className="bg-white/5 border-white/10 min-h-[100px]"
            />
          </div>
        );

      case 'image':
        return (
          <div className="space-y-3">
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                <label className="text-xs text-muted-foreground">URL изображения</label>
                <Input
                  value={block.src || ''}
                  onChange={(e) => onChange({ ...block, src: e.target.value })}
                  placeholder="https://..."
                  className="bg-white/5 border-white/10"
                />
              </div>
              <FileUploadButton
                accept="image/*"
                label="Загрузить"
                onUpload={(url) => onChange({ ...block, src: url })}
              />
            </div>
            {block.src && (
              <img src={block.src} alt="Preview" className="w-full max-h-48 object-contain rounded-lg bg-white/5" />
            )}
            <Input
              value={block.caption || ''}
              onChange={(e) => onChange({ ...block, caption: e.target.value })}
              placeholder="Подпись (опционально)"
              className="bg-white/5 border-white/10"
            />
          </div>
        );

      case 'video':
        return (
          <div className="space-y-3">
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                <label className="text-xs text-muted-foreground">URL видео</label>
                <Input
                  value={block.src || ''}
                  onChange={(e) => onChange({ ...block, src: e.target.value })}
                  placeholder="https://..."
                  className="bg-white/5 border-white/10"
                />
              </div>
              <FileUploadButton
                accept="video/*,.gif"
                label="Загрузить"
                onUpload={(url) => onChange({ ...block, src: url })}
              />
            </div>
            {block.src && (
              <video src={block.src} className="w-full max-h-48 rounded-lg bg-white/5" controls />
            )}
            <Input
              value={block.caption || ''}
              onChange={(e) => onChange({ ...block, caption: e.target.value })}
              placeholder="Подпись (опционально)"
              className="bg-white/5 border-white/10"
            />
          </div>
        );

      case 'comparison':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Изображение "До"</label>
              <div className="flex gap-2">
                <Input
                  value={block.beforeSrc || ''}
                  onChange={(e) => onChange({ ...block, beforeSrc: e.target.value })}
                  placeholder="https://..."
                  className="bg-white/5 border-white/10 flex-1"
                />
                <FileUploadButton
                  accept="image/*"
                  label="Загрузить"
                  onUpload={(url) => onChange({ ...block, beforeSrc: url })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Изображение "После"</label>
              <div className="flex gap-2">
                <Input
                  value={block.afterSrc || ''}
                  onChange={(e) => onChange({ ...block, afterSrc: e.target.value })}
                  placeholder="https://..."
                  className="bg-white/5 border-white/10 flex-1"
                />
                <FileUploadButton
                  accept="image/*"
                  label="Загрузить"
                  onUpload={(url) => onChange({ ...block, afterSrc: url })}
                />
              </div>
            </div>
            {(block.beforeSrc || block.afterSrc) && (
              <div className="grid grid-cols-2 gap-2">
                {block.beforeSrc && (
                  <img src={block.beforeSrc} alt="Before" className="w-full h-24 object-cover rounded-lg" />
                )}
                {block.afterSrc && (
                  <img src={block.afterSrc} alt="After" className="w-full h-24 object-cover rounded-lg" />
                )}
              </div>
            )}
            <Input
              value={block.caption || ''}
              onChange={(e) => onChange({ ...block, caption: e.target.value })}
              placeholder="Подпись (опционально)"
              className="bg-white/5 border-white/10"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-4">
      <div className="flex items-center gap-2">
        <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
        <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
          <BlockIcon className="w-4 h-4 text-violet-400" />
        </div>
        <Select
          value={block.type}
          onValueChange={(type: ContentBlock['type']) => 
            onChange({ type, content: '', src: '', caption: '', beforeSrc: '', afterSrc: '' })
          }
        >
          <SelectTrigger className="w-40 bg-white/5 border-white/10 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BLOCK_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground flex-1">Блок {index + 1}</span>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onMoveUp}
            disabled={isFirst}
            className="h-8 w-8 p-0"
          >
            <MoveUp className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onMoveDown}
            disabled={isLast}
            className="h-8 w-8 p-0"
          >
            <MoveDown className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {renderFields()}
    </div>
  );
}

export function ContentBlocksEditor({ blocks, onChange }: ContentBlocksEditorProps) {
  const addBlock = (type: ContentBlock['type'] = 'text') => {
    onChange([...blocks, { type, content: '', src: '', caption: '' }]);
  };

  const updateBlock = (index: number, block: ContentBlock) => {
    const newBlocks = [...blocks];
    newBlocks[index] = block;
    onChange(newBlocks);
  };

  const deleteBlock = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    onChange(newBlocks);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Контент проекта (Story Mode)</label>
        <span className="text-xs text-muted-foreground">{blocks.length} блоков</span>
      </div>

      {blocks.length === 0 ? (
        <div className="p-8 border border-dashed border-white/20 rounded-xl text-center">
          <p className="text-muted-foreground mb-4">Добавьте блоки контента для описания проекта</p>
          <div className="flex gap-2 justify-center flex-wrap">
            {BLOCK_TYPES.map((t) => {
              const Icon = t.icon;
              return (
                <Button
                  key={t.value}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addBlock(t.value)}
                  className="gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
                </Button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {blocks.map((block, index) => (
            <BlockEditor
              key={index}
              block={block}
              index={index}
              onChange={(b) => updateBlock(index, b)}
              onDelete={() => deleteBlock(index)}
              onMoveUp={() => moveBlock(index, 'up')}
              onMoveDown={() => moveBlock(index, 'down')}
              isFirst={index === 0}
              isLast={index === blocks.length - 1}
            />
          ))}
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addBlock('text')}
            className="w-full gap-2 border-dashed"
          >
            <Plus className="w-4 h-4" />
            Добавить блок
          </Button>
        </div>
      )}
    </div>
  );
}
