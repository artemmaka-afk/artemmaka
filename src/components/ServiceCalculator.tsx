import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Clock, Sparkles, Volume2, RefreshCcw, CalendarClock, Send, Percent, FileText, Shield } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { useSiteContent } from '@/hooks/useSiteData';
import { toast } from 'sonner';

interface CalculatorConfig {
  base_frame_price: number;
  music_price: number;
  lipsync_price_per_30s: number;
  revisions_4_price: number;
  revisions_8_price: number;
  deadline_20_multiplier: number;
  deadline_10_multiplier: number;
  volume_discount_percent: number;
  scenario_price_per_min: number;
  nda_partial_multiplier: number;
  nda_full_multiplier: number;
  hide_pricing: boolean;
}

const defaultConfig: CalculatorConfig = {
  base_frame_price: 3000,
  music_price: 10000,
  lipsync_price_per_30s: 5000,
  revisions_4_price: 20000,
  revisions_8_price: 50000,
  deadline_20_multiplier: 2,
  deadline_10_multiplier: 3,
  volume_discount_percent: 15,
  scenario_price_per_min: 20000,
  nda_partial_multiplier: 1.3,
  nda_full_multiplier: 1.5,
  hide_pricing: false,
};

function ServiceCalculator() {
  const [config, setConfig] = useState<CalculatorConfig>(defaultConfig);
  const [duration, setDuration] = useState(30);
  const [pace, setPace] = useState<'standard' | 'dynamic' | 'ultra'>('dynamic');
  const [hasScenario, setHasScenario] = useState(false);
  const [hasMusic, setHasMusic] = useState(false);
  const [hasLipsync, setHasLipsync] = useState(false);
  const [revisions, setRevisions] = useState<'2' | '4' | '8'>('2');
  const [nda, setNda] = useState<'none' | 'partial' | 'full'>('none');
  const [deadline, setDeadline] = useState<'30' | '20' | '10'>('30');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: siteContent } = useSiteContent();
  const telegramUsername = siteContent?.find(c => c.id === 'artist_telegram')?.value || '@artemmak_ai';
  const telegramLink = `https://t.me/${telegramUsername.replace('@', '')}`;

  // Use hide_pricing from config loaded from database
  const hidePricing = config.hide_pricing;

  // Загружаем конфиг из базы
  useEffect(() => {
    const fetchConfig = async () => {
      const { data } = await supabase
        .from('calculator_config')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (data) {
        setConfig({
          base_frame_price: data.base_frame_price,
          music_price: data.music_price,
          lipsync_price_per_30s: data.lipsync_price_per_30s,
          revisions_4_price: data.revisions_4_price,
          revisions_8_price: data.revisions_8_price,
          deadline_20_multiplier: Number(data.deadline_20_multiplier),
          deadline_10_multiplier: Number(data.deadline_10_multiplier),
          volume_discount_percent: data.volume_discount_percent,
          scenario_price_per_min: (data as any).scenario_price_per_min ?? 20000,
          nda_partial_multiplier: data.nda_partial_multiplier ?? 1.3,
          nda_full_multiplier: data.nda_full_multiplier ?? 1.5,
          hide_pricing: (data as any).hide_pricing ?? false,
        });
      }
    };
    fetchConfig();
  }, []);

  // Слайдер: до 60 сек — шаг 10 сек, после 60 — шаг 30 сек
  const handleSliderChange = (value: number[]) => {
    const raw = value[0];
    if (raw <= 6) {
      // 0-6 → 0-60 секунд (шаг 10)
      setDuration(raw * 10);
    } else {
      // 7-24 → 90-600 секунд (шаг 30)
      const stepsAbove60 = raw - 6;
      setDuration(60 + stepsAbove60 * 30);
    }
  };

  const getSliderValue = () => {
    if (duration <= 60) return Math.round(duration / 10);
    return 6 + Math.round((duration - 60) / 30);
  };

  // Формат длительности: после минуты показывать как "1 мин", "1 мин 30 сек" и т.д.
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs} сек`;
    if (secs === 0) return `${mins} мин`;
    return `${mins} мин ${secs} сек`;
  };

  // Конфигурация темпа (секунды на кадр)
  const paceConfig = {
    standard: { label: 'Стандарт', secondsPerFrame: 4 },
    dynamic: { label: 'Динамичный', secondsPerFrame: 2 },
    ultra: { label: 'Ультра', secondsPerFrame: 0.5 },
  };

  const calculation = useMemo(() => {
    const paceData = paceConfig[pace];
    
    // Количество кадров
    const frames = Math.ceil(duration / paceData.secondsPerFrame);
    const baseFrameCost = frames * config.base_frame_price;

    // Сценарий: 20 000 за каждую минуту (округление вверх)
    const scenarioCost = hasScenario ? Math.ceil(duration / 60) * config.scenario_price_per_min : 0;

    // Аудио
    let audioCost = 0;
    if (hasMusic) {
      audioCost += config.music_price;
    }
    // Липсинк: 5000 за каждые 30 секунд, округление вверх
    if (hasLipsync) {
      audioCost += Math.ceil(duration / 30) * config.lipsync_price_per_30s;
    }

    // Правки
    let revisionCost = 0;
    if (revisions === '4') revisionCost = config.revisions_4_price;
    if (revisions === '8') revisionCost = config.revisions_8_price;

    // Множитель NDA (применяется до скидки)
    let ndaMultiplier = 1;
    if (nda === 'partial') ndaMultiplier = config.nda_partial_multiplier;
    if (nda === 'full') ndaMultiplier = config.nda_full_multiplier;

    // Множитель дедлайна
    let deadlineMultiplier = 1;
    if (deadline === '20') deadlineMultiplier = config.deadline_20_multiplier;
    if (deadline === '10') deadlineMultiplier = config.deadline_10_multiplier;

    const subtotal = baseFrameCost + scenarioCost + audioCost + revisionCost;
    const totalBeforeDiscount = Math.round(subtotal * ndaMultiplier * deadlineMultiplier);
    
    // Скидка за объём — только для проектов от 2 минут (120 сек)
    // 1-2 мин (60-119 сек): нет скидки
    // 2-5 мин (120-299 сек): 10%
    // 5-10 мин (300-599 сек): 15%
    // 10+ мин (600+ сек): 20%
    let discountPercent = 0;
    if (duration >= 600) {
      discountPercent = 20;
    } else if (duration >= 300) {
      discountPercent = 15;
    } else if (duration >= 120) {
      discountPercent = 10;
    }
    
    const discountedPrice = Math.round(totalBeforeDiscount * (1 - discountPercent / 100));

    return {
      frames,
      totalBeforeDiscount,
      discountedPrice,
      discountPercent,
      hasDiscount: discountPercent > 0,
    };
  }, [duration, pace, hasScenario, hasMusic, hasLipsync, revisions, nda, deadline, config]);

  const paceLabels = {
    standard: 'Стандарт',
    dynamic: 'Динамичный', 
    ultra: 'Ультра',
  };

  const ndaLabels = {
    none: 'Не нужен',
    partial: 'Частичный',
    full: 'Полный',
  };

  const handleDiscussProject = async () => {
    setIsSubmitting(true);
    
    try {
      // Save request to DB
      const audioOptions: string[] = [];
      if (hasScenario) audioOptions.push('scenario');
      if (hasMusic) audioOptions.push('music');
      if (hasLipsync) audioOptions.push('lipsync');

      const { error: dbError } = await supabase.from('project_requests').insert({
        name: 'Из калькулятора',
        project_description: `Запрос из калькулятора:\n• Длительность: ${formatDuration(duration)}\n• Темп: ${paceLabels[pace]}\n• NDA: ${ndaLabels[nda]}\n• Правки: ${revisions} кругов\n• Срок: ${deadline} дней`,
        budget_estimate: calculation.hasDiscount ? calculation.discountedPrice : calculation.totalBeforeDiscount,
        duration_seconds: duration,
        pace: pace,
        audio_options: audioOptions.length > 0 ? audioOptions : null,
        revisions: revisions,
        deadline: deadline,
      });

      if (dbError) {
        console.error('Error saving request:', dbError);
      }

      // Send Telegram notification
      try {
        await supabase.functions.invoke('send-telegram-notification', {
          body: {
            type: 'calculator_request',
            budget: calculation.hasDiscount ? calculation.discountedPrice : calculation.totalBeforeDiscount,
            duration: duration,
            pace: paceLabels[pace],
            nda: ndaLabels[nda],
            deadline: deadline,
            revisions: revisions,
          },
        });
      } catch (e) {
        console.log('Telegram notification not sent:', e);
      }

      toast.success('Заявка сохранена! Открываю Telegram...');
      
      // Build pre-filled Telegram message with calculator parameters
      const audioOptionsText = [];
      if (hasScenario) audioOptionsText.push('Сценарий');
      if (hasMusic) audioOptionsText.push('AI Музыка');
      if (hasLipsync) audioOptionsText.push('Липсинк');
      
      const message = `Добрый день! Хочу обсудить проект.

📋 Параметры из калькулятора:
• Длительность: ${formatDuration(duration)}
• Темп: ${paceLabels[pace]}
• Опции: ${audioOptionsText.length > 0 ? audioOptionsText.join(', ') : 'нет'}
• NDA: ${ndaLabels[nda]}
• Правки: ${revisions} кругов
• Срок: ${deadline} дней
• Бюджет: ${formatPrice(calculation.hasDiscount ? calculation.discountedPrice : calculation.totalBeforeDiscount)}${calculation.hasDiscount ? ` (скидка ${calculation.discountPercent}%)` : ''}`;

      const encodedMessage = encodeURIComponent(message);
      const telegramDeepLink = `${telegramLink}?text=${encodedMessage}`;
      
      // Open Telegram with pre-filled message
      window.open(telegramDeepLink, '_blank');
    } catch (error) {
      console.error('Error:', error);
      // Still open Telegram even if DB save fails
      window.open(telegramLink, '_blank');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section id="calculator" className="relative py-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-6">
            <Calculator className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium">Оценка проекта</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {(siteContent?.find(c => c.id === 'calculator_title')?.value || 'Калькулятор стоимости').split(' ').slice(0, -1).join(' ')}{' '}
            <span className="gradient-text">{(siteContent?.find(c => c.id === 'calculator_title')?.value || 'Калькулятор стоимости').split(' ').slice(-1)[0]}</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {siteContent?.find(c => c.id === 'calculator_subtitle')?.value || 'Получите мгновенную оценку стоимости вашего AI-видео проекта'}
          </p>
        </motion.div>

        <motion.div 
          className="glass-card p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Duration Slider */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 font-medium text-sm sm:text-base">
                <Clock className="w-4 h-4 text-violet-400" />
                Длительность видео
              </label>
              <span className="text-xl sm:text-2xl font-bold font-mono gradient-text">
                {formatDuration(duration)}
              </span>
            </div>
            <Slider
              value={[getSliderValue()]}
              onValueChange={handleSliderChange}
              min={0}
              max={24}
              step={1}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground font-mono">
              <span>0 сек</span>
              <span>1 мин</span>
              <span>10 мин</span>
            </div>
          </motion.div>

          {/* Scenario Checkbox */}
          <motion.div variants={itemVariants} className="space-y-3 sm:space-y-4">
            <label className="flex items-center gap-2 font-medium text-sm sm:text-base">
              <FileText className="w-4 h-4 text-violet-400" />
              Сценарий
            </label>
            <motion.button
              onClick={() => setHasScenario(!hasScenario)}
              className={`w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all text-left ${
                hasScenario
                  ? 'bg-violet-500/20 border-violet-500/50 text-foreground'
                  : 'bg-background/50 border-[hsl(var(--form-border))] text-muted-foreground hover:border-[hsl(var(--form-border-hover))]'
              }`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                  hasScenario ? 'bg-violet-500 border-violet-500' : 'border-[hsl(var(--form-border))]'
                }`}>
                  {hasScenario && <span className="text-white text-xs">✓</span>}
                </div>
                <span className="font-semibold text-sm">Написание сценария</span>
              </div>
              {!hidePricing && (
                <div className="text-[10px] sm:text-xs font-mono mt-1 ml-6">
                  +{formatPrice(config.scenario_price_per_min)}/мин ролика
                </div>
              )}
            </motion.button>
          </motion.div>

          {/* Pace Radio */}
          <motion.div variants={itemVariants} className="space-y-3 sm:space-y-4">
            <label className="flex items-center gap-2 font-medium text-sm sm:text-base">
              <Sparkles className="w-4 h-4 text-violet-400" />
              Темп монтажа
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {(Object.entries(paceConfig) as [typeof pace, typeof paceConfig.standard][]).map(([value, data]) => (
                <motion.button
                  key={value}
                  onClick={() => setPace(value)}
                  className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all text-center ${
                    pace === value
                      ? 'bg-violet-500/20 border-violet-500/50 text-foreground'
                      : 'bg-background/50 border-[hsl(var(--form-border))] text-muted-foreground hover:border-[hsl(var(--form-border-hover))]'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="font-semibold text-xs sm:text-sm">{data.label}</div>
                  {!hidePricing && (
                    <div className="text-[10px] sm:text-xs font-mono mt-1">{data.secondsPerFrame} сек/кадр</div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Audio Checkboxes */}
          <motion.div variants={itemVariants} className="space-y-3 sm:space-y-4">
            <label className="flex items-center gap-2 font-medium text-sm sm:text-base">
              <Volume2 className="w-4 h-4 text-violet-400" />
              Озвучка
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <motion.button
                onClick={() => setHasMusic(!hasMusic)}
                className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all text-left ${
                  hasMusic
                    ? 'bg-violet-500/20 border-violet-500/50 text-foreground'
                    : 'bg-background/50 border-[hsl(var(--form-border))] text-muted-foreground hover:border-[hsl(var(--form-border-hover))]'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    hasMusic ? 'bg-violet-500 border-violet-500' : 'border-[hsl(var(--form-border))]'
                  }`}>
                    {hasMusic && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span className="font-semibold text-sm">AI Музыка</span>
                </div>
                {!hidePricing && (
                  <div className="text-[10px] sm:text-xs font-mono mt-1 ml-6">+{formatPrice(config.music_price)}</div>
                )}
              </motion.button>

              <motion.button
                onClick={() => setHasLipsync(!hasLipsync)}
                className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all text-left ${
                  hasLipsync
                    ? 'bg-violet-500/20 border-violet-500/50 text-foreground'
                    : 'bg-background/50 border-[hsl(var(--form-border))] text-muted-foreground hover:border-[hsl(var(--form-border-hover))]'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    hasLipsync ? 'bg-violet-500 border-violet-500' : 'border-[hsl(var(--form-border))]'
                  }`}>
                    {hasLipsync && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span className="font-semibold text-sm">Липсинк</span>
                </div>
                {!hidePricing && (
                  <div className="text-[10px] sm:text-xs font-mono mt-1 ml-6">+{formatPrice(config.lipsync_price_per_30s)}/30 сек</div>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Revisions Radio */}
          <motion.div variants={itemVariants} className="space-y-3 sm:space-y-4">
            <label className="flex items-center gap-2 font-medium text-sm sm:text-base">
              <RefreshCcw className="w-4 h-4 text-violet-400" />
              Кругов правок
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { value: '2', label: '2 правки', price: 0 },
                { value: '4', label: '4 правки', price: config.revisions_4_price },
                { value: '8', label: '8 правок', price: config.revisions_8_price },
              ].map((option) => (
                <motion.button
                  key={option.value}
                  onClick={() => setRevisions(option.value as '2' | '4' | '8')}
                  className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all text-center ${
                    revisions === option.value
                      ? 'bg-violet-500/20 border-violet-500/50 text-foreground'
                      : 'bg-background/50 border-[hsl(var(--form-border))] text-muted-foreground hover:border-[hsl(var(--form-border-hover))]'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="font-semibold text-xs sm:text-sm">{option.label}</div>
                  {!hidePricing && (
                    <div className="text-[10px] sm:text-xs font-mono mt-1">
                      {option.price === 0 ? 'Включено' : `+${formatPrice(option.price)}`}
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* NDA Radio */}
          <motion.div variants={itemVariants} className="space-y-3 sm:space-y-4">
            <label className="flex items-center gap-2 font-medium text-sm sm:text-base">
              <Shield className="w-4 h-4 text-violet-400" />
              NDA (конфиденциальность)
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { value: 'none', label: 'Не нужен', multiplier: 1 },
                { value: 'partial', label: 'Частичный', multiplier: config.nda_partial_multiplier },
                { value: 'full', label: 'Полный', multiplier: config.nda_full_multiplier },
              ].map((option) => (
                <motion.button
                  key={option.value}
                  onClick={() => setNda(option.value as 'none' | 'partial' | 'full')}
                  className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all text-center ${
                    nda === option.value
                      ? 'bg-violet-500/20 border-violet-500/50 text-foreground'
                      : 'bg-background/50 border-[hsl(var(--form-border))] text-muted-foreground hover:border-[hsl(var(--form-border-hover))]'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="font-semibold text-xs sm:text-sm">{option.label}</div>
                  {!hidePricing && (
                    <div className="text-[10px] sm:text-xs font-mono mt-1">
                      {option.multiplier === 1 ? 'Стандарт' : `×${option.multiplier}`}
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Deadline Radio */}
          <motion.div variants={itemVariants} className="space-y-3 sm:space-y-4">
            <label className="flex items-center gap-2 font-medium text-sm sm:text-base">
              <CalendarClock className="w-4 h-4 text-violet-400" />
              Срок сдачи
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { value: '30', label: '30 дней', multiplier: 1 },
                { value: '20', label: '20 дней', multiplier: config.deadline_20_multiplier },
                { value: '10', label: '10 дней', multiplier: config.deadline_10_multiplier },
              ].map((option) => (
                <motion.button
                  key={option.value}
                  onClick={() => setDeadline(option.value as '30' | '20' | '10')}
                  className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all text-center ${
                    deadline === option.value
                      ? 'bg-violet-500/20 border-violet-500/50 text-foreground'
                      : 'bg-background/50 border-[hsl(var(--form-border))] text-muted-foreground hover:border-[hsl(var(--form-border-hover))]'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="font-semibold text-xs sm:text-sm">{option.label}</div>
                  {!hidePricing && (
                    <div className="text-[10px] sm:text-xs font-mono mt-1">
                      {option.multiplier === 1 ? 'Стандарт' : `×${option.multiplier}`}
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Calculation Summary */}
          <motion.div 
            variants={itemVariants}
            className="pt-6 border-t border-white/10"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
              <div className="w-full sm:w-auto">
                {/* Итоговая цена */}
                {calculation.hasDiscount ? (
                  <>
                    {/* Цена до скидки — зачёркнутая */}
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-xl line-through text-muted-foreground">
                        {formatPrice(calculation.totalBeforeDiscount)}
                      </span>
                    </div>
                    
                    {/* Бейдж скидки */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-lg">
                        <Percent className="w-3 h-3 text-green-400" />
                        <span className="text-xs font-bold text-green-400">-{calculation.discountPercent}%</span>
                      </div>
                      <span className="text-xs text-muted-foreground">скидка за объём</span>
                    </div>
                    
                    {/* Итоговая цена со скидкой */}
                    <motion.div 
                      className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text font-mono"
                      key={calculation.discountedPrice}
                      initial={{ scale: 1.1, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      {formatPrice(calculation.discountedPrice)}
                    </motion.div>
                  </>
                ) : (
                  <motion.div 
                    className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text font-mono"
                    key={calculation.totalBeforeDiscount}
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {formatPrice(calculation.totalBeforeDiscount)}
                  </motion.div>
                )}
                
                <div className="text-xs text-muted-foreground mt-2">
                  Кадров: {calculation.frames} • {formatDuration(duration)}
                </div>
              </div>
              
              <motion.button
                onClick={handleDiscussProject}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-violet rounded-xl font-semibold text-primary-foreground text-sm sm:text-base disabled:opacity-50"
                whileHover={{ scale: isSubmitting ? 1 : 1.02, boxShadow: isSubmitting ? 'none' : '0 0 40px hsl(263 70% 58% / 0.4)' }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              >
                {isSubmitting ? (
                  <div className="w-4 sm:w-5 h-4 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 sm:w-5 h-4 sm:h-5" />
                )}
                {isSubmitting ? 'Сохраняю...' : 'Обсудить проект'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default ServiceCalculator;
