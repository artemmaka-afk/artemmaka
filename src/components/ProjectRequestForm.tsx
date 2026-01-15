import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, User, MessageSquare, CheckCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function ProjectRequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    telegram: '',
    email: '',
    project_description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.project_description.trim()) {
      toast.error('Пожалуйста, заполните имя и описание проекта');
      return;
    }

    if (!formData.telegram.trim() && !formData.email.trim()) {
      toast.error('Укажите хотя бы один способ связи');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('project_requests').insert({
        name: formData.name.trim(),
        telegram: formData.telegram.trim() || null,
        email: formData.email.trim() || null,
        project_description: formData.project_description.trim(),
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast.success('Заявка отправлена! Я свяжусь с вами в ближайшее время.');
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Ошибка при отправке. Попробуйте ещё раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div 
        className="glass-card p-8 text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        </motion.div>
        <h3 className="text-xl font-bold mb-2">Заявка отправлена!</h3>
        <p className="text-muted-foreground">
          Спасибо за обращение. Я свяжусь с вами в ближайшее время.
        </p>
        <Button 
          variant="outline" 
          className="mt-6"
          onClick={() => {
            setIsSubmitted(false);
            setFormData({ name: '', telegram: '', email: '', project_description: '' });
          }}
        >
          Отправить ещё одну заявку
        </Button>
      </motion.div>
    );
  }

  return (
    <section id="contact" className="relative py-12 sm:py-20 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-6">
            <MessageSquare className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium">Связаться со мной</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Оставить <span className="gradient-text">заявку</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto text-sm sm:text-base">
            Расскажите о вашем проекте, и я свяжусь с вами для обсуждения деталей
          </p>
        </motion.div>

        <motion.form 
          onSubmit={handleSubmit}
          className="glass-card p-6 sm:p-8 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <User className="w-4 h-4 text-violet-400" />
              Ваше имя *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Как к вам обращаться"
              className="bg-white/5 border-white/10 focus:border-violet-500/50"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Send className="w-4 h-4 text-violet-400" />
                Telegram
              </label>
              <Input
                value={formData.telegram}
                onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                placeholder="@username"
                className="bg-white/5 border-white/10 focus:border-violet-500/50"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <MessageSquare className="w-4 h-4 text-violet-400" />
                Email
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                className="bg-white/5 border-white/10 focus:border-violet-500/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <MessageSquare className="w-4 h-4 text-violet-400" />
              Описание проекта *
            </label>
            <Textarea
              value={formData.project_description}
              onChange={(e) => setFormData({ ...formData, project_description: e.target.value })}
              placeholder="Опишите вашу идею, желаемый стиль, сроки и бюджет..."
              className="bg-white/5 border-white/10 focus:border-violet-500/50 min-h-[120px] resize-none"
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full gap-2 bg-gradient-violet hover:opacity-90 py-6"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Отправляю...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Отправить заявку
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Укажите хотя бы один способ связи — Telegram или Email
          </p>
        </motion.form>
      </div>
    </section>
  );
}
