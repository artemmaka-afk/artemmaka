import { useState, useEffect, useRef } from 'react';
import { Save, Loader2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useSiteContent, useSiteContentMutations, type SiteContent } from '@/hooks/useSiteData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const contentLabels: Record<string, { label: string; multiline?: boolean; description?: string; typography?: string; type?: 'text' | 'textarea' | 'switch' | 'file' }> = {
  // Site Meta & Favicon
  site_favicon: { label: 'Фавикон', description: 'URL иконки сайта (отображается на вкладке браузера)', type: 'file' },
  site_title: { label: 'Заголовок сайта', description: 'Текст на вкладке браузера' },
  site_description: { label: 'Meta-описание', description: 'Описание сайта для поисковиков', multiline: true },
  og_image: { label: 'OG-изображение', description: 'URL изображения для превью в соцсетях', type: 'file' },
  // Artist info
  artist_name: { label: 'Имя', description: 'Отображается в шапке сайта', typography: 'H1' },
  artist_title: { label: 'Должность', description: 'Под именем в шапке', typography: 'Body' },
  artist_tagline: { label: 'Слоган', description: 'Подзаголовок в шапке', multiline: true, typography: 'H3' },
  artist_bio: { label: 'Биография', description: 'Описание в блоке "Обо мне"', multiline: true, typography: 'Body' },
  artist_email: { label: 'Email', description: 'Используется для связи', typography: 'Small' },
  artist_telegram: { label: 'Telegram', description: 'Используется для кнопок "Обсудить проект" и ссылок', typography: 'Small' },
  artist_location: { label: 'Локация', description: 'Отображается в блоке "Обо мне"', typography: 'Small' },
  // About extended
  about_show_more_button: { label: 'Показать кнопку "Подробнее"', description: 'Отображать кнопку в разделе "Обо мне"', type: 'switch' },
  about_extended_content: { label: 'Расширенный контент', description: 'Текст для модального окна "Подробнее"', multiline: true },
  // Page sections
  portfolio_title: { label: 'Заголовок портфолио', description: 'Заголовок раздела работ', typography: 'H2' },
  portfolio_subtitle: { label: 'Подзаголовок портфолио', description: 'Описание раздела работ', typography: 'Body' },
  calculator_title: { label: 'Заголовок калькулятора', description: 'Заголовок раздела калькулятора', typography: 'H2' },
  calculator_subtitle: { label: 'Подзаголовок калькулятора', description: 'Описание раздела калькулятора', typography: 'Body' },
  contact_title: { label: 'Заголовок формы связи', description: 'Заголовок раздела "Оставить заявку"', typography: 'H2' },
  contact_subtitle: { label: 'Подзаголовок формы связи', description: 'Описание раздела заявки', typography: 'Body' },
  footer_cta_text: { label: 'Текст CTA в футере', description: 'Подзаголовок под "Готовы создать что-то особенное?"', multiline: true, typography: 'H3' },
  footer_copyright: { label: 'Копирайт', description: 'Текст в футере', typography: 'Small' },
  // Legal & Cookies
  cookie_consent_text: { label: 'Текст про куки', description: 'Всплывающее уведомление о куках', multiline: true },
  privacy_policy_title: { label: 'Заголовок политики конф.', description: 'Заголовок модального окна' },
  privacy_policy_text: { label: 'Текст политики конф.', description: 'Содержимое политики конфиденциальности', multiline: true },
  consent_title: { label: 'Заголовок согласия', description: 'Заголовок модального окна согласия' },
  consent_text: { label: 'Текст согласия на обработку', description: 'Содержимое согласия на обработку данных', multiline: true },
  // Analytics
  yandex_metrika_id: { label: 'ID Яндекс.Метрики', description: 'Номер счётчика (например: 12345678)' },
  google_analytics_id: { label: 'ID Google Analytics', description: 'Tracking ID (например: G-XXXXXXXXXX)' },
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
              <label className="text-sm font-medium flex items-center gap-2">
                <span>{config.label}</span>
                {config.typography && (
                  <span className="px-1.5 py-0.5 text-[10px] font-mono bg-violet-500/20 text-violet-400 rounded">
                    {config.typography}
                  </span>
                )}
                {config.description && (
                  <span className="text-xs text-muted-foreground font-normal ml-2">{config.description}</span>
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
            {config.type === 'switch' ? (
              <div className="flex items-center gap-3">
                <Switch
                  checked={localValues[id] === 'true'}
                  onCheckedChange={(checked) => handleChange(id, checked ? 'true' : 'false')}
                />
                <span className="text-sm text-muted-foreground">
                  {localValues[id] === 'true' ? 'Включено' : 'Выключено'}
                </span>
              </div>
            ) : config.type === 'file' ? (
              <FileUploadField
                value={localValues[id] || ''}
                onChange={(url) => handleChange(id, url)}
                isChanged={isChanged}
              />
            ) : config.multiline ? (
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

function FileUploadField({
  value,
  onChange,
  isChanged,
}: {
  value: string;
  onChange: (url: string) => void;
  isChanged: boolean;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Файл слишком большой. Максимум: 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `site-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('project-media').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('project-media').getPublicUrl(fileName);
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
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="URL или загрузите файл"
          className={`bg-white/5 border-white/10 flex-1 ${isChanged ? 'border-violet-500/50' : ''}`}
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
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </div>
      {value && (
        <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
          <img src={value} alt="Preview" className="w-12 h-12 object-cover rounded" />
          <span className="text-xs text-muted-foreground flex-1 truncate">{value}</span>
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange('')} className="h-6 w-6 p-0">
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
