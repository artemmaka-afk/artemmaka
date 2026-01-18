import { motion } from 'framer-motion';
import { Send, Heart, Mail, ArrowUpRight, Instagram, Youtube, Globe, Link } from 'lucide-react';
import { useSiteContent, useSocialLinks } from '@/hooks/useSiteData';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Send,
  Instagram,
  Youtube,
  Globe,
  Link,
};

export function Footer() {
  const { data: siteContent } = useSiteContent();
  const { data: socialLinks } = useSocialLinks();

  // Get content from DB with fallbacks
  const getContent = (id: string, fallback: string) => {
    return siteContent?.find(c => c.id === id)?.value || fallback;
  };

  const name = getContent('artist_name', 'Артём Макаров');
  const email = getContent('artist_email', 'artem@makarov.ai');
  const telegram = getContent('artist_telegram', '@artemmak_ai');

  // Filter footer social links
  const footerLinks = socialLinks?.filter(l => l.is_visible && (l.location === 'footer' || l.location === 'both')) || [];

  return (
    <footer className="py-16 px-6 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        {/* CTA Section */}
        <motion.div 
          className="glass-card p-8 md:p-12 mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="typography-h2 font-bold mb-4">
            Готовы создать <span className="gradient-text">что-то особенное</span>?
          </h3>
          <p className="typography-body text-muted-foreground mb-8 max-w-xl mx-auto">
            {getContent('footer_cta_text', 'Свяжитесь со мной, чтобы обсудить ваш проект.')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.a
              href={`https://t.me/${telegram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-8 py-4 bg-gradient-violet rounded-2xl font-semibold text-primary-foreground"
              whileHover={{ scale: 1.02, boxShadow: '0 0 40px hsl(263 70% 58% / 0.4)' }}
              whileTap={{ scale: 0.98 }}
            >
              <Send className="w-5 h-5" />
              Написать в Telegram
            </motion.a>
            <motion.a
              href={`mailto:${email}`}
              className="flex items-center gap-2 px-8 py-4 glass glass-hover rounded-2xl font-semibold"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Mail className="w-5 h-5" />
              {email}
            </motion.a>
          </div>
        </motion.div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="typography-small text-muted-foreground">
            {getContent('copyright', `© ${new Date().getFullYear()} ${name}. Все права защищены.`)}
          </div>
          
          <div className="flex items-center gap-1 typography-small text-muted-foreground">
            Сделано с <Heart className="w-4 h-4 text-red-500 mx-1" fill="currentColor" /> с помощью AI
          </div>

          {footerLinks.length > 0 && (
            <div className="flex items-center gap-4">
              {footerLinks.map((link) => {
                const Icon = iconMap[link.icon] || Link;
                return (
                  <motion.a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm"
                    whileHover={{ x: 2 }}
                  >
                    {link.name}
                    <ArrowUpRight className="w-3 h-3" />
                  </motion.a>
                );
              })}
            </div>
          )}
        </div>

        {/* Admin Link */}
        <div className="mt-8 text-center">
          <a
            href="/admin"
            className="text-xs text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors"
          >
            Админ-панель
          </a>
        </div>
      </div>
    </footer>
  );
}
