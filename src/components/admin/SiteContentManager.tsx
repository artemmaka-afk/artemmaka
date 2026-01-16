import { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useSiteContent, useSiteContentMutations, type SiteContent } from '@/hooks/useSiteData';

const contentLabels: Record<string, { label: string; multiline?: boolean; description?: string }> = {
  artist_name: { label: 'Имя', description: 'Отображается в шапке сайта' },
  artist_title: { label: 'Должность', description: 'Под именем в шапке' },
  artist_tagline: { label: 'Слоган', description: 'Подзаголовок в шапке', multiline: true },
  artist_bio: { label: 'Биография', description: 'Описание в блоке "Обо мне"', multiline: true },
  artist_email: { label: 'Email', description: 'Используется для связи' },
  artist_telegram: { label: 'Telegram', description: 'Используется для кнопок "Обсудить проект" и ссылок' },
  artist_location: { label: 'Локация', description: 'Отображается в блоке "Обо мне"' },
  // Page sections
  portfolio_title: { label: 'Заголовок портфолио', description: 'Заголовок раздела работ' },
  portfolio_subtitle: { label: 'Подзаголовок портфолио', description: 'Описание раздела работ' },
  calculator_title: { label: 'Заголовок калькулятора', description: 'Заголовок раздела калькулятора' },
  calculator_subtitle: { label: 'Подзаголовок калькулятора', description: 'Описание раздела калькулятора' },
  contact_title: { label: 'Заголовок формы связи', description: 'Заголовок раздела "Оставить заявку"' },
  contact_subtitle: { label: 'Подзаголовок формы связи', description: 'Описание раздела заявки' },
  footer_cta_text: { label: 'Текст CTA в футере', description: 'Подзаголовок под "Готовы создать что-то особенное?"', multiline: true },
  footer_copyright: { label: 'Копирайт', description: 'Текст в футере' },
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
              <label className="text-sm font-medium flex items-center justify-between">
                <span>{config.label}</span>
                {config.description && (
                  <span className="text-xs text-muted-foreground font-normal">{config.description}</span>
                )}
              </label>
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
