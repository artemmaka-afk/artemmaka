import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Clock, Sparkles, Volume2, RefreshCcw, CalendarClock, Send } from 'lucide-react';
import { calculatorDefaults } from '@/lib/constants';
import { Slider } from '@/components/ui/slider';

export function ServiceCalculator() {
  const [duration, setDuration] = useState(30);
  const [pace, setPace] = useState('dynamic');
  const [audio, setAudio] = useState('client');
  const [revisions, setRevisions] = useState('2');
  const [deadline, setDeadline] = useState('30');

  // Custom slider logic: 1-second steps up to 60s, then 10-second steps
  const handleSliderChange = (value: number[]) => {
    const raw = value[0];
    if (raw <= 60) {
      setDuration(raw);
    } else {
      // Map 61-114 to 70-600 in steps of 10
      const stepsAbove60 = raw - 60;
      setDuration(60 + stepsAbove60 * 10);
    }
  };

  const getSliderValue = () => {
    if (duration <= 60) return duration;
    return 60 + Math.round((duration - 60) / 10);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs} сек`;
    if (secs === 0) return `${mins} мин`;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculation = useMemo(() => {
    const paceOption = calculatorDefaults.paceOptions.find((p) => p.value === pace)!;
    const audioOption = calculatorDefaults.audioOptions.find((a) => a.value === audio)!;
    const revisionOption = calculatorDefaults.revisionOptions.find((r) => r.value === revisions)!;
    const deadlineOption = calculatorDefaults.deadlineOptions.find((d) => d.value === deadline)!;

    const frames = Math.ceil(duration / paceOption.secondsPerFrame);
    const baseFrameCost = frames * calculatorDefaults.basePrice;

    let audioCost = 0;
    if (audio === 'lipsync') {
      audioCost = Math.ceil(duration / 30) * 5000;
    } else {
      audioCost = audioOption.price || 0;
    }

    const revisionCost = revisionOption.price;
    const subtotal = baseFrameCost + audioCost + revisionCost;
    const total = Math.round(subtotal * deadlineOption.multiplier);
    const marketPrice = Math.round(total * 1.2);

    return {
      frames,
      baseFrameCost,
      audioCost,
      revisionCost,
      subtotal,
      deadlineMultiplier: deadlineOption.multiplier,
      total,
      marketPrice,
    };
  }, [duration, pace, audio, revisions, deadline]);

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
    <section id="calculator" className="relative py-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-12"
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
            Калькулятор <span className="gradient-text">стоимости</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Получите мгновенную оценку стоимости вашего AI-видео проекта
          </p>
        </motion.div>

        <motion.div 
          className="glass-card p-6 md:p-8 space-y-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Duration Slider */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 font-medium">
                <Clock className="w-4 h-4 text-violet-400" />
                Длительность видео
              </label>
              <span className="text-2xl font-bold font-mono gradient-text">
                {formatDuration(duration)}
              </span>
            </div>
            <Slider
              value={[getSliderValue()]}
              onValueChange={handleSliderChange}
              min={1}
              max={114}
              step={1}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground font-mono">
              <span>1 сек</span>
              <span>1 мин</span>
              <span>10 мин</span>
            </div>
          </motion.div>

          {/* Pace Radio */}
          <motion.div variants={itemVariants} className="space-y-4">
            <label className="flex items-center gap-2 font-medium">
              <Sparkles className="w-4 h-4 text-violet-400" />
              Темп монтажа
            </label>
            <div className="grid grid-cols-3 gap-3">
              {calculatorDefaults.paceOptions.map((option) => (
                <motion.button
                  key={option.value}
                  onClick={() => setPace(option.value)}
                  className={`p-4 rounded-2xl border transition-all text-center ${
                    pace === option.value
                      ? 'bg-violet-500/20 border-violet-500/50 text-foreground'
                      : 'bg-white/5 border-white/10 text-muted-foreground hover:border-white/20'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="font-semibold">{option.label}</div>
                  <div className="text-xs font-mono mt-1">×{option.multiplier}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Audio Select */}
          <motion.div variants={itemVariants} className="space-y-4">
            <label className="flex items-center gap-2 font-medium">
              <Volume2 className="w-4 h-4 text-violet-400" />
              Озвучка
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {calculatorDefaults.audioOptions.map((option) => (
                <motion.button
                  key={option.value}
                  onClick={() => setAudio(option.value)}
                  className={`p-4 rounded-2xl border transition-all text-left ${
                    audio === option.value
                      ? 'bg-violet-500/20 border-violet-500/50 text-foreground'
                      : 'bg-white/5 border-white/10 text-muted-foreground hover:border-white/20'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="font-semibold">{option.label}</div>
                  <div className="text-xs font-mono mt-1">
                    {option.price !== undefined 
                      ? option.price === 0 ? 'Бесплатно' : `+${formatPrice(option.price)}`
                      : `+${formatPrice(option.pricePerUnit!)}/${option.unitSeconds} сек`
                    }
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Revisions */}
          <motion.div variants={itemVariants} className="space-y-4">
            <label className="flex items-center gap-2 font-medium">
              <RefreshCcw className="w-4 h-4 text-violet-400" />
              Правки
            </label>
            <div className="grid grid-cols-3 gap-3">
              {calculatorDefaults.revisionOptions.map((option) => (
                <motion.button
                  key={option.value}
                  onClick={() => setRevisions(option.value)}
                  className={`p-4 rounded-2xl border transition-all text-center ${
                    revisions === option.value
                      ? 'bg-violet-500/20 border-violet-500/50 text-foreground'
                      : 'bg-white/5 border-white/10 text-muted-foreground hover:border-white/20'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="font-semibold">{option.label}</div>
                  <div className="text-xs font-mono mt-1">
                    {option.price === 0 ? 'Включено' : `+${formatPrice(option.price)}`}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Deadline */}
          <motion.div variants={itemVariants} className="space-y-4">
            <label className="flex items-center gap-2 font-medium">
              <CalendarClock className="w-4 h-4 text-violet-400" />
              Срочность
            </label>
            <div className="grid grid-cols-3 gap-3">
              {calculatorDefaults.deadlineOptions.map((option) => (
                <motion.button
                  key={option.value}
                  onClick={() => setDeadline(option.value)}
                  className={`p-4 rounded-2xl border transition-all text-center ${
                    deadline === option.value
                      ? 'bg-violet-500/20 border-violet-500/50 text-foreground'
                      : 'bg-white/5 border-white/10 text-muted-foreground hover:border-white/20'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="font-semibold">{option.label}</div>
                  <div className="text-xs font-mono mt-1">
                    {option.multiplier === 1 ? 'Стандарт' : `×${option.multiplier}`}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Calculation Summary */}
          <motion.div 
            variants={itemVariants}
            className="pt-6 border-t border-white/10 space-y-4"
          >
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Кадров ({calculation.frames})</span>
                <span className="font-mono">{formatPrice(calculation.baseFrameCost)}</span>
              </div>
              {calculation.audioCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Озвучка</span>
                  <span className="font-mono">+{formatPrice(calculation.audioCost)}</span>
                </div>
              )}
              {calculation.revisionCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Доп. правки</span>
                  <span className="font-mono">+{formatPrice(calculation.revisionCost)}</span>
                </div>
              )}
              {calculation.deadlineMultiplier > 1 && (
                <div className="flex justify-between text-violet-400">
                  <span>Срочность</span>
                  <span className="font-mono">×{calculation.deadlineMultiplier}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pt-4 border-t border-white/10">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-sm text-muted-foreground line-through">
                    Рыночная: {formatPrice(calculation.marketPrice)}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mb-1">Итоговая стоимость</div>
                <motion.div 
                  className="text-4xl md:text-5xl font-bold gradient-text font-mono"
                  key={calculation.total}
                  initial={{ scale: 1.1, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {formatPrice(calculation.total)}
                </motion.div>
              </div>
              <motion.a
                href="https://t.me/artemmak_ai"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-8 py-4 bg-gradient-violet rounded-xl font-semibold text-primary-foreground"
                whileHover={{ scale: 1.02, boxShadow: '0 0 40px hsl(263 70% 58% / 0.4)' }}
                whileTap={{ scale: 0.98 }}
              >
                <Send className="w-5 h-5" />
                Обсудить проект
              </motion.a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
