import { useState, useEffect } from 'react';
import { Loader2, Check, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
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
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (content) {
      const foundStatus = content.find((c) => c.id === 'availability_status');
      if (foundStatus) setStatus(foundStatus.value);
      
      const foundVisible = content.find((c) => c.id === 'availability_visible');
      if (foundVisible) setIsVisible(foundVisible.value === 'true');
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

  const handleVisibilityChange = async (visible: boolean) => {
    setIsVisible(visible);
    try {
      await update.mutateAsync({ id: 'availability_visible', value: visible ? 'true' : 'false' });
      toast.success(visible ? 'Статус показан' : 'Статус скрыт');
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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Статус доступности</h3>
          <p className="text-sm text-muted-foreground">Индикатор в шапке сайта</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {isVisible ? 'Показан' : 'Скрыт'}
          </span>
          <Switch
            checked={isVisible}
            onCheckedChange={handleVisibilityChange}
          />
        </div>
      </div>

      <div className={`grid gap-3 transition-opacity ${!isVisible ? 'opacity-50' : ''}`}>
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
            disabled={update.isPending || !isVisible}
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
