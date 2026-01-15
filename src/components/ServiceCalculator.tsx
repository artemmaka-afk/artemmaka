import { useState, useMemo } from 'react';
import { Calculator, Clock, Sparkles, Volume2, RefreshCcw, CalendarClock, Send } from 'lucide-react';
import { calculatorDefaults } from '@/lib/constants';
import { Slider } from '@/components/ui/slider';

export function ServiceCalculator() {
  const [duration, setDuration] = useState(15);
  const [pace, setPace] = useState('dynamic');
  const [audio, setAudio] = useState('client');
  const [revisions, setRevisions] = useState('2');
  const [deadline, setDeadline] = useState('30');

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

    return {
      frames,
      baseFrameCost,
      audioCost,
      revisionCost,
      subtotal,
      deadlineMultiplier: deadlineOption.multiplier,
      total,
    };
  }, [duration, pace, audio, revisions, deadline]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price) + '₽';
  };

  return (
    <section id="calculator" className="relative py-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-6">
            <Calculator className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium">Project Estimator</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Calculate Your <span className="gradient-text">Project Cost</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Get an instant estimate for your AI video project. Prices are approximate and may vary based on complexity.
          </p>
        </div>

        <div className="glass-card p-6 md:p-8 space-y-8">
          {/* Duration Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 font-medium">
                <Clock className="w-4 h-4 text-violet-400" />
                Duration
              </label>
              <span className="text-2xl font-bold font-mono">{duration}s</span>
            </div>
            <Slider
              value={[duration]}
              onValueChange={(value) => setDuration(value[0])}
              min={5}
              max={60}
              step={5}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground font-mono">
              <span>5s</span>
              <span>60s</span>
            </div>
          </div>

          {/* Pace Radio */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 font-medium">
              <Sparkles className="w-4 h-4 text-violet-400" />
              Animation Pace
            </label>
            <div className="grid grid-cols-3 gap-3">
              {calculatorDefaults.paceOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPace(option.value)}
                  className={`p-4 rounded-2xl border transition-all text-center ${
                    pace === option.value
                      ? 'bg-violet-500/20 border-violet-500/50 text-foreground'
                      : 'bg-white/5 border-white/10 text-muted-foreground hover:border-white/20'
                  }`}
                >
                  <div className="font-semibold">{option.label}</div>
                  <div className="text-xs font-mono mt-1">{option.secondsPerFrame}s/frame</div>
                </button>
              ))}
            </div>
          </div>

          {/* Audio Select */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 font-medium">
              <Volume2 className="w-4 h-4 text-violet-400" />
              Audio
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {calculatorDefaults.audioOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setAudio(option.value)}
                  className={`p-4 rounded-2xl border transition-all text-left ${
                    audio === option.value
                      ? 'bg-violet-500/20 border-violet-500/50 text-foreground'
                      : 'bg-white/5 border-white/10 text-muted-foreground hover:border-white/20'
                  }`}
                >
                  <div className="font-semibold">{option.label}</div>
                  <div className="text-xs font-mono mt-1">
                    {option.price !== undefined 
                      ? option.price === 0 ? 'Free' : `+${formatPrice(option.price)}`
                      : `+${formatPrice(option.pricePerUnit!)}/${option.unitSeconds}s`
                    }
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Revisions */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 font-medium">
              <RefreshCcw className="w-4 h-4 text-violet-400" />
              Revisions
            </label>
            <div className="grid grid-cols-3 gap-3">
              {calculatorDefaults.revisionOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setRevisions(option.value)}
                  className={`p-4 rounded-2xl border transition-all text-center ${
                    revisions === option.value
                      ? 'bg-violet-500/20 border-violet-500/50 text-foreground'
                      : 'bg-white/5 border-white/10 text-muted-foreground hover:border-white/20'
                  }`}
                >
                  <div className="font-semibold">{option.label}</div>
                  <div className="text-xs font-mono mt-1">
                    {option.price === 0 ? 'Included' : `+${formatPrice(option.price)}`}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Deadline */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 font-medium">
              <CalendarClock className="w-4 h-4 text-violet-400" />
              Deadline
            </label>
            <div className="grid grid-cols-3 gap-3">
              {calculatorDefaults.deadlineOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setDeadline(option.value)}
                  className={`p-4 rounded-2xl border transition-all text-center ${
                    deadline === option.value
                      ? 'bg-violet-500/20 border-violet-500/50 text-foreground'
                      : 'bg-white/5 border-white/10 text-muted-foreground hover:border-white/20'
                  }`}
                >
                  <div className="font-semibold">{option.label}</div>
                  <div className="text-xs font-mono mt-1">
                    {option.multiplier === 1 ? 'Standard' : `${option.multiplier}x rate`}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Calculation Summary */}
          <div className="pt-6 border-t border-white/10 space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frames ({calculation.frames})</span>
                <span className="font-mono">{formatPrice(calculation.baseFrameCost)}</span>
              </div>
              {calculation.audioCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Audio</span>
                  <span className="font-mono">+{formatPrice(calculation.audioCost)}</span>
                </div>
              )}
              {calculation.revisionCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Extra Revisions</span>
                  <span className="font-mono">+{formatPrice(calculation.revisionCost)}</span>
                </div>
              )}
              {calculation.deadlineMultiplier > 1 && (
                <div className="flex justify-between text-violet-400">
                  <span>Rush Multiplier</span>
                  <span className="font-mono">×{calculation.deadlineMultiplier}</span>
                </div>
              )}
            </div>

            <div className="flex items-end justify-between pt-4 border-t border-white/10">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Estimated Total</div>
                <div className="text-4xl font-bold gradient-text font-mono">
                  {formatPrice(calculation.total)}
                </div>
              </div>
              <button className="flex items-center gap-2 px-6 py-3 bg-gradient-violet rounded-xl font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
                <Send className="w-4 h-4" />
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
