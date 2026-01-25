import { useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, Eye, EyeOff, GripVertical, Send, Instagram, Youtube, Globe, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSocialLinks, useSocialLinksMutations, type SocialLink } from '@/hooks/useSiteData';
import { toast } from 'sonner';

const iconOptions = [
  { value: 'Send', label: 'Telegram', icon: Send },
  { value: 'Instagram', label: 'Instagram', icon: Instagram },
  { value: 'Youtube', label: 'YouTube', icon: Youtube },
  { value: 'Globe', label: 'Web/Behance', icon: Globe },
  { value: 'Link', label: 'Другое', icon: Link },
];

const locationOptions = [
  { value: 'both', label: 'Везде' },
  { value: 'header', label: 'Только шапка' },
  { value: 'footer', label: 'Только подвал' },
];

function LinkForm({
  link,
  onSave,
  onCancel,
  isLoading,
}: {
  link?: SocialLink;
  onSave: (data: Partial<SocialLink>) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [name, setName] = useState(link?.name || '');
  const [url, setUrl] = useState(link?.url || '');
  const [icon, setIcon] = useState(link?.icon || 'Link');
  const [location, setLocation] = useState<'header' | 'footer' | 'both'>(link?.location || 'both');
  const [isVisible, setIsVisible] = useState(link?.is_visible ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) {
      toast.error('Заполните название и URL');
      return;
    }
    onSave({
      ...(link?.id ? { id: link.id } : {}),
      name: name.trim(),
      url: url.trim(),
      icon,
      location,
      is_visible: isVisible,
      sort_order: link?.sort_order ?? 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Название *</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Telegram"
          className="bg-background/50 border-[hsl(var(--form-border))]"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">URL *</label>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://t.me/username"
          className="bg-background/50 border-[hsl(var(--form-border))]"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Иконка</label>
          <Select value={icon} onValueChange={setIcon}>
            <SelectTrigger className="bg-background/50 border-[hsl(var(--form-border))]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {iconOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <div className="flex items-center gap-2">
                    <opt.icon className="w-4 h-4" />
                    {opt.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Расположение</label>
          <Select value={location} onValueChange={(v) => setLocation(v as 'header' | 'footer' | 'both')}>
            <SelectTrigger className="bg-background/50 border-[hsl(var(--form-border))]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {locationOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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

export function SocialLinksManager() {
  const { data: links, isLoading } = useSocialLinks();
  const { upsert, remove } = useSocialLinksMutations();
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSave = async (data: Partial<SocialLink>) => {
    try {
      await upsert.mutateAsync(data);
      setIsDialogOpen(false);
      setEditingLink(null);
      toast.success('Сохранено');
    } catch (error: any) {
      toast.error('Ошибка: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Удалить эту ссылку?')) {
      try {
        await remove.mutateAsync(id);
        toast.success('Удалено');
      } catch (error: any) {
        toast.error('Ошибка: ' + error.message);
      }
    }
  };

  const toggleVisibility = async (link: SocialLink) => {
    try {
      await upsert.mutateAsync({ ...link, is_visible: !link.is_visible });
    } catch (error: any) {
      toast.error('Ошибка: ' + error.message);
    }
  };

  const getIcon = (iconName: string) => {
    const found = iconOptions.find((o) => o.value === iconName);
    return found ? found.icon : Link;
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
          <h3 className="text-lg font-semibold">Социальные сети</h3>
          <p className="text-sm text-muted-foreground">Ссылки в шапке и подвале</p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingLink(null);
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
              <DialogTitle>{editingLink ? 'Редактировать' : 'Новая ссылка'}</DialogTitle>
            </DialogHeader>
            <LinkForm
              link={editingLink || undefined}
              onSave={handleSave}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingLink(null);
              }}
              isLoading={upsert.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {links?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Нет ссылок</p>
          </div>
        ) : (
          links?.map((link) => {
            const Icon = getIcon(link.icon);
            return (
              <div
                key={link.id}
                className={`flex items-center gap-4 p-4 bg-background/50 rounded-xl border border-[hsl(var(--form-border))] ${
                  !link.is_visible ? 'opacity-50' : ''
                }`}
              >
                <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                <div className="p-2 bg-white/10 rounded-lg">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{link.name}</span>
                    <span className="text-xs px-2 py-0.5 bg-white/10 rounded">
                      {locationOptions.find((l) => l.value === link.location)?.label}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{link.url}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleVisibility(link)}
                    className={link.is_visible ? 'text-green-400' : 'text-muted-foreground'}
                  >
                    {link.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingLink(link);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(link.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
