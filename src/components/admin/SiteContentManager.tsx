import { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useSiteContent, useSiteContentMutations, type SiteContent } from '@/hooks/useSiteData';

const contentLabels: Record<string, { label: string; multiline?: boolean }> = {
  artist_name: { label: 'Имя' },
  artist_title: { label: 'Должность' },
  artist_tagline: { label: 'Слоган' },
  artist_bio: { label: 'Биография', multiline: true },
  artist_email: { label: 'Email' },
  artist_telegram: { label: 'Telegram' },
  artist_location: { label: 'Локация' },
};

export function SiteContentManager() {
  const { data: content, isLoading } = useSiteContent();
  const { update } = useSiteContentMutations();
  const [localValues, setLocalValues] = useState<Record<string, string>>({});
  const [changedIds, setChangedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (content) {
      const values: Record<string, string> = {};
      content.forEach(item => {
        values[item.id] = item.value;
      });
      setLocalValues(values);
    }
  }, [content]);

  const handleChange = (id: string, value: string) => {
    setLocalValues(prev => ({ ...prev, [id]: value }));
    const original = content?.find(c => c.id === id)?.value;
    if (value !== original) {
      setChangedIds(prev => new Set(prev).add(id));
    } else {
      setChangedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleSave = async (id: string) => {
    await update.mutateAsync({ id, value: localValues[id] });
    setChangedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleSaveAll = async () => {
    for (const id of changedIds) {
      await update.mutateAsync({ id, value: localValues[id] });
    }
    setChangedIds(new Set());
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
          <h3 className="text-lg font-semibold">Контент сайта</h3>
          <p className="text-sm text-muted-foreground">Редактируйте тексты на сайте</p>
        </div>
        {changedIds.size > 0 && (
          <Button 
            size="sm" 
            className="gap-2 bg-gradient-violet" 
            onClick={handleSaveAll}
            disabled={update.isPending}
          >
            {update.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Сохранить всё ({changedIds.size})
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {Object.entries(contentLabels).map(([id, config]) => {
          const isChanged = changedIds.has(id);
          
          return (
            <div key={id} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">{config.label}</label>
                {isChanged && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-xs text-violet-400"
                    onClick={() => handleSave(id)}
                    disabled={update.isPending}
                  >
                    <Save className="w-3 h-3 mr-1" />
                    Сохранить
                  </Button>
                )}
              </div>
              {config.multiline ? (
                <Textarea
                  value={localValues[id] || ''}
                  onChange={(e) => handleChange(id, e.target.value)}
                  className={`bg-white/5 border-white/10 min-h-[100px] ${isChanged ? 'border-violet-500/50' : ''}`}
                />
              ) : (
                <Input
                  value={localValues[id] || ''}
                  onChange={(e) => handleChange(id, e.target.value)}
                  className={`bg-white/5 border-white/10 ${isChanged ? 'border-violet-500/50' : ''}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
