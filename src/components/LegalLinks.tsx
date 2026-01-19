import { useState } from 'react';
import { LegalModal } from './LegalModal';

export function LegalLinks() {
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground/50">
        <button
          onClick={() => setPrivacyOpen(true)}
          className="hover:text-muted-foreground transition-colors underline-offset-2 hover:underline"
        >
          Политика конфиденциальности
        </button>
        <span>•</span>
        <button
          onClick={() => setConsentOpen(true)}
          className="hover:text-muted-foreground transition-colors underline-offset-2 hover:underline"
        >
          Согласие на обработку данных
        </button>
      </div>

      <LegalModal type="privacy" open={privacyOpen} onOpenChange={setPrivacyOpen} />
      <LegalModal type="consent" open={consentOpen} onOpenChange={setConsentOpen} />
    </>
  );
}
