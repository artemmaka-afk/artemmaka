import { useState, useEffect } from 'react';
import { Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSiteContent, useSiteContentMutations } from '@/hooks/useSiteData';
import { toast } from 'sonner';

const statusOptions = [
  { value: 'available', label: 'Открыт для заказов', color: 'bg-emerald-500', description: 'Зелёный индикатор' },
  { value: 'medium', label: 'Средняя загрузка', color: 'bg-yellow-500', description: 'Жёлтый индикатор' },
  { value: 'busy', label: 'Высокая нагрузка', color: 'bg-red-500', description: 'Красный индикатор' },
];

export function AvailabilityManager() {
  const { data: content, isLoading } = useSiteContent();
  const { update } = useSiteContentMutations();
  const [status, setStatus] = useState('available');

  useEffect(() => {
    if (content) {
      const found = content.find((c) => c.id === 'availability_status');
      if (found) setStatus(found.value);
    }
  }, [content]);

  const handleChange = async (newStatus: string) => {
    setStatus(newStatus);
    try {
      await update.mutateAsync({ id: 'availability_status', value: newStatus });
      toast.success('Статус обновлён');
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
      <div>
        <h3 className="text-lg font-semibold">Статус доступности</h3>
        <p className="text-sm text-muted-foreground">Индикатор в шапке сайта</p>
      </div>

      <div className="grid gap-3">
        {statusOptions.map((opt) => (
          <Button
            key={opt.value}
            variant="ghost"
            className={`w-full justify-start p-4 h-auto ${
              status === opt.value
                ? 'bg-violet-500/20 border border-violet-500/50'
                : 'bg-white/5 border border-white/10 hover:bg-white/10'
            }`}
            onClick={() => handleChange(opt.value)}
            disabled={update.isPending}
          >
            <div className="flex items-center gap-4 w-full">
              <span className={`w-3 h-3 rounded-full ${opt.color} ${status === opt.value ? 'animate-pulse' : ''}`} />
              <div className="flex-1 text-left">
                <div className="font-medium">{opt.label}</div>
                <div className="text-xs text-muted-foreground">{opt.description}</div>
              </div>
              {status === opt.value && <Check className="w-5 h-5 text-violet-400" />}
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
