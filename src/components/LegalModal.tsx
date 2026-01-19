import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useSiteContent } from '@/hooks/useSiteData';

interface LegalModalProps {
  type: 'privacy' | 'consent';
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LegalModal({ type, open, onOpenChange }: LegalModalProps) {
  const { data: siteContent } = useSiteContent();

  const getContent = (id: string, fallback: string) => {
    return siteContent?.find(c => c.id === id)?.value || fallback;
  };

  const title = type === 'privacy' 
    ? getContent('privacy_policy_title', 'Политика конфиденциальности')
    : getContent('consent_title', 'Согласие на обработку персональных данных');

  const text = type === 'privacy'
    ? getContent('privacy_policy_text', 'Информация о политике конфиденциальности.')
    : getContent('consent_text', 'Информация о согласии на обработку данных.');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg glass-card border-white/10">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {text}
        </div>
      </DialogContent>
    </Dialog>
  );
}
