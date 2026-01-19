import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSiteContent } from '@/hooks/useSiteData';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const { data: siteContent } = useSiteContent();

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Show after a short delay
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const getContent = (id: string, fallback: string) => {
    return siteContent?.find(c => c.id === id)?.value || fallback;
  };

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50"
        >
          <div className="glass-card p-4 border border-white/10 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Cookie className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-3">
                  {getContent('cookie_consent_text', 'Мы используем файлы cookie для улучшения работы сайта.')}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAccept} className="bg-gradient-violet text-sm">
                    Принять
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleDecline} className="text-sm">
                    Отклонить
                  </Button>
                </div>
              </div>
              <button
                onClick={handleDecline}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
