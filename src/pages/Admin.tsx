import { useState, useEffect } from 'react';
import { ArrowLeft, Save, DollarSign, Film, Loader2, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { projects } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CalculatorConfig {
  id: string;
  base_frame_price: number;
  music_price: number;
  lipsync_price_per_30s: number;
  revisions_4_price: number;
  revisions_8_price: number;
  deadline_20_multiplier: number;
  deadline_10_multiplier: number;
  volume_discount_percent: number;
}

export default function Admin() {
  const [config, setConfig] = useState<CalculatorConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('calculator_config')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching config:', error);
      toast.error('Ошибка загрузки настроек');
    } else if (data) {
      setConfig({
        id: data.id,
        base_frame_price: data.base_frame_price,
        music_price: data.music_price,
        lipsync_price_per_30s: data.lipsync_price_per_30s,
        revisions_4_price: data.revisions_4_price,
        revisions_8_price: data.revisions_8_price,
        deadline_20_multiplier: Number(data.deadline_20_multiplier),
        deadline_10_multiplier: Number(data.deadline_10_multiplier),
        volume_discount_percent: data.volume_discount_percent,
      });
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!config) return;
    
    setIsSaving(true);
    
    // Примечание: для сохранения нужна авторизация админа
    // Сейчас это mock - в реальном приложении нужно добавить RLS политики для admin
    toast.info('Для сохранения настроек требуется авторизация админа. Сейчас это демо-режим.');
    
    setIsSaving(false);
  };

  const updateConfig = (field: keyof CalculatorConfig, value: number) => {
    if (!config) return;
    setConfig({ ...config, [field]: value });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background mesh-background noise-overlay flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background mesh-background noise-overlay">
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 px-4 sm:px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">На сайт</span>
              </Link>
              <div className="h-4 w-px bg-white/20" />
              <h1 className="text-lg sm:text-xl font-bold">Админ-панель</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchConfig} className="gap-2">
                <RefreshCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Обновить</span>
              </Button>
              <Button onClick={handleSave} size="sm" className="gap-2 bg-gradient-violet hover:opacity-90" disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span className="hidden sm:inline">Сохранить</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Pricing Settings */}
            <section className="glass-card p-4 sm:p-6 space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Настройки калькулятора</h2>
                  <p className="text-sm text-muted-foreground">Цены и множители</p>
                </div>
              </div>

              {config && (
                <div className="space-y-6">
                  {/* Базовые цены */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground border-b border-white/10 pb-2">
                      Базовые цены
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Цена за кадр (₽)</label>
                        <Input
                          type="number"
                          value={config.base_frame_price}
                          onChange={(e) => updateConfig('base_frame_price', Number(e.target.value))}
                          className="bg-white/5 border-white/10"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">AI Музыка (₽)</label>
                        <Input
                          type="number"
                          value={config.music_price}
                          onChange={(e) => updateConfig('music_price', Number(e.target.value))}
                          className="bg-white/5 border-white/10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Липсинк и правки */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground border-b border-white/10 pb-2">
                      Дополнительные услуги
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Липсинк / 30 сек (₽)</label>
                        <Input
                          type="number"
                          value={config.lipsync_price_per_30s}
                          onChange={(e) => updateConfig('lipsync_price_per_30s', Number(e.target.value))}
                          className="bg-white/5 border-white/10"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">4 круга правок (₽)</label>
                        <Input
                          type="number"
                          value={config.revisions_4_price}
                          onChange={(e) => updateConfig('revisions_4_price', Number(e.target.value))}
                          className="bg-white/5 border-white/10"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">8 кругов правок (₽)</label>
                        <Input
                          type="number"
                          value={config.revisions_8_price}
                          onChange={(e) => updateConfig('revisions_8_price', Number(e.target.value))}
                          className="bg-white/5 border-white/10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Множители срочности */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground border-b border-white/10 pb-2">
                      Множители срочности
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">20 дней (×)</label>
                        <Input
                          type="number"
                          step="0.1"
                          value={config.deadline_20_multiplier}
                          onChange={(e) => updateConfig('deadline_20_multiplier', Number(e.target.value))}
                          className="bg-white/5 border-white/10"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">10 дней (×)</label>
                        <Input
                          type="number"
                          step="0.1"
                          value={config.deadline_10_multiplier}
                          onChange={(e) => updateConfig('deadline_10_multiplier', Number(e.target.value))}
                          className="bg-white/5 border-white/10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Скидка за объём */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground border-b border-white/10 pb-2">
                      Скидка за объём
                    </h3>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Процент скидки (%)</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={config.volume_discount_percent}
                        onChange={(e) => updateConfig('volume_discount_percent', Number(e.target.value))}
                        className="bg-white/5 border-white/10 max-w-[150px]"
                      />
                      <p className="text-xs text-muted-foreground">
                        Применяется для проектов &gt; 60 сек или с доп. опциями
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Projects List */}
            <section className="glass-card p-4 sm:p-6 space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                  <Film className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Проекты</h2>
                  <p className="text-sm text-muted-foreground">Управление портфолио</p>
                </div>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10"
                  >
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      className="w-12 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{project.title}</h3>
                      <p className="text-xs text-muted-foreground truncate">{project.subtitle}</p>
                      <div className="flex gap-1.5 mt-1.5">
                        {project.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 text-[10px] font-mono bg-white/5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground text-center pt-4 border-t border-white/10">
                Проекты загружаются из локальных данных. Для редактирования подключите CMS.
              </p>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
