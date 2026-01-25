import { useState } from 'react';
import { Loader2, Save, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTypographySettings, useTypographyMutations, type TypographySettings } from '@/hooks/useSiteData';

export function TypographyManager() {
  const { data: settings, isLoading } = useTypographySettings();
  const { update } = useTypographyMutations();
  const [editedSettings, setEditedSettings] = useState<Record<string, TypographySettings>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (id: string, field: 'desktop_size' | 'mobile_size', value: string) => {
    const current = editedSettings[id] || settings?.find(s => s.id === id);
    if (!current) return;
    
    setEditedSettings(prev => ({
      ...prev,
      [id]: { ...current, [field]: value }
    }));
  };

  const getValue = (id: string, field: 'desktop_size' | 'mobile_size'): string => {
    if (editedSettings[id]) {
      return editedSettings[id][field];
    }
    return settings?.find(s => s.id === id)?.[field] || '';
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      for (const [id, setting] of Object.entries(editedSettings)) {
        await update.mutateAsync(setting);
      }
      setEditedSettings({});
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = Object.keys(editedSettings).length > 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
      </div>
    );
  }

  const orderedSettings = ['h1', 'h2', 'h3', 'body', 'small'];
  const sortedSettings = orderedSettings
    .map(id => settings?.find(s => s.id === id))
    .filter(Boolean) as TypographySettings[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Типографика</h3>
          <p className="text-sm text-muted-foreground">Настройте размеры шрифтов для ПК и мобильной версии</p>
        </div>
        {hasChanges && (
          <Button 
            onClick={handleSaveAll} 
            disabled={isSaving}
            className="gap-2 bg-gradient-violet"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Сохранить
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {sortedSettings.map((setting) => (
          <div
            key={setting.id}
            className="p-4 bg-background/50 rounded-xl border border-[hsl(var(--form-border))] space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                <Type className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <div className="font-semibold uppercase text-sm">{setting.id}</div>
                <div className="text-xs text-muted-foreground">{setting.description}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">ПК версия</label>
                <Input
                  value={getValue(setting.id, 'desktop_size')}
                  onChange={(e) => handleChange(setting.id, 'desktop_size', e.target.value)}
                  placeholder="48px"
                  className="bg-background/50 border-[hsl(var(--form-border))] font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Мобильная версия</label>
                <Input
                  value={getValue(setting.id, 'mobile_size')}
                  onChange={(e) => handleChange(setting.id, 'mobile_size', e.target.value)}
                  placeholder="32px"
                  className="bg-background/50 border-[hsl(var(--form-border))] font-mono"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-violet-500/10 rounded-xl border border-violet-500/20">
        <p className="text-sm text-violet-300">
          <strong>Подсказка:</strong> Используйте значения в формате px, rem или em. Например: 48px, 3rem, 2.5em
        </p>
      </div>
    </div>
  );
}
