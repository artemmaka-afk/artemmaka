import { useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, Eye, EyeOff, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useHeroStats, useHeroStatsMutations, type HeroStat } from '@/hooks/useSiteData';
import { toast } from 'sonner';

function StatForm({
  stat,
  onSave,
  onCancel,
  isLoading,
}: {
  stat?: HeroStat;
  onSave: (data: Partial<HeroStat>) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [value, setValue] = useState(stat?.value || '');
  const [label, setLabel] = useState(stat?.label || '');
  const [isVisible, setIsVisible] = useState(stat?.is_visible ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || !label.trim()) {
      toast.error('Заполните все поля');
      return;
    }
    onSave({
      ...(stat?.id ? { id: stat.id } : {}),
      value: value.trim(),
      label: label.trim(),
      is_visible: isVisible,
      sort_order: stat?.sort_order ?? 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Значение *</label>
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="50+"
          className="bg-background/50 border-[hsl(var(--form-border))]"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Подпись *</label>
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Проектов"
          className="bg-background/50 border-[hsl(var(--form-border))]"
          required
        />
      </div>

      <div className="flex items-center justify-between p-3 bg-background/50 border border-[hsl(var(--form-border))] rounded-lg">
        <div>
          <div className="font-medium text-sm">Видимость</div>
          <div className="text-xs text-muted-foreground">Показывать на сайте</div>
        </div>
        <Switch checked={isVisible} onCheckedChange={setIsVisible} />
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

export function HeroStatsManager() {
  const { data: stats, isLoading } = useHeroStats();
  const { upsert, remove } = useHeroStatsMutations();
  const [editingStat, setEditingStat] = useState<HeroStat | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSave = async (data: Partial<HeroStat>) => {
    try {
      await upsert.mutateAsync(data);
      setIsDialogOpen(false);
      setEditingStat(null);
      toast.success('Сохранено');
    } catch (error: any) {
      toast.error('Ошибка: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Удалить этот блок статистики?')) {
      try {
        await remove.mutateAsync(id);
        toast.success('Удалено');
      } catch (error: any) {
        toast.error('Ошибка: ' + error.message);
      }
    }
  };

  const toggleVisibility = async (stat: HeroStat) => {
    try {
      await upsert.mutateAsync({ ...stat, is_visible: !stat.is_visible });
    } catch (error: any) {
      toast.error('Ошибка: ' + error.message);
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
          <h3 className="text-lg font-semibold">Статистика</h3>
          <p className="text-sm text-muted-foreground">Блоки с цифрами в шапке</p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingStat(null);
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2 bg-gradient-violet">
              <Plus className="w-4 h-4" />
              Добавить
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-[hsl(var(--form-border))]">
            <DialogHeader>
              <DialogTitle>{editingStat ? 'Редактировать' : 'Новый блок'}</DialogTitle>
            </DialogHeader>
            <StatForm
              stat={editingStat || undefined}
              onSave={handleSave}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingStat(null);
              }}
              isLoading={upsert.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {stats?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Нет блоков статистики</p>
          </div>
        ) : (
          stats?.map((stat) => (
            <div
              key={stat.id}
              className={`flex items-center gap-4 p-4 bg-background/50 rounded-xl border border-[hsl(var(--form-border))] ${
                !stat.is_visible ? 'opacity-50' : ''
              }`}
            >
              <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg gradient-text">{stat.value}</span>
                  <span className="text-muted-foreground">— {stat.label}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleVisibility(stat)}
                  className={stat.is_visible ? 'text-green-400' : 'text-muted-foreground'}
                >
                  {stat.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditingStat(stat);
                    setIsDialogOpen(true);
                  }}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(stat.id)}
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
