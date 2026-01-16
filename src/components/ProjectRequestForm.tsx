import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, User, MessageSquare, CheckCircle, Loader2, Paperclip, X, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function ProjectRequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    telegram: '',
    email: '',
    project_description: '',
  });

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    const newFiles = Array.from(selectedFiles);
    // Limit to 5 files, max 10MB each
    const validFiles = newFiles.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`Файл ${file.name} слишком большой (макс. 10MB)`);
        return false;
      }
      return true;
    });
    setFiles(prev => [...prev, ...validFiles].slice(0, 5));
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, []);

  const uploadFiles = async (): Promise<string[]> => {
    const urls: string[] = [];
    
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `attachments/${fileName}`;

      const { error } = await supabase.storage
        .from('request-attachments')
        .upload(filePath, file);

      if (error) {
        console.error('Error uploading file:', error);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('request-attachments')
        .getPublicUrl(filePath);

      urls.push(publicUrl);
    }

    return urls;
  };

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
      // Upload files first
      let attachmentUrls: string[] = [];
      if (files.length > 0) {
        attachmentUrls = await uploadFiles();
      }

      const { error } = await supabase.from('project_requests').insert({
        name: formData.name.trim(),
        telegram: formData.telegram.trim() || null,
        email: formData.email.trim() || null,
        project_description: formData.project_description.trim(),
        attachments: attachmentUrls.length > 0 ? attachmentUrls : null,
      });

      if (error) throw error;

      // Send Telegram notification
      try {
        await supabase.functions.invoke('send-telegram-notification', {
          body: {
            type: 'contact_form',
            name: formData.name.trim(),
            telegram: formData.telegram.trim() || undefined,
            email: formData.email.trim() || undefined,
            description: formData.project_description.trim(),
            attachments: attachmentUrls,
          },
        });
      } catch (e) {
        console.log('Telegram notification not sent:', e);
      }

      setIsSubmitted(true);
      toast.success('Заявка отправлена! Я свяжусь с вами в ближайшее время.');
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Ошибка при отправке. Попробуйте ещё раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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
            setFiles([]);
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

          {/* File Upload */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Paperclip className="w-4 h-4 text-violet-400" />
              Прикрепить файлы (до 5 файлов, макс. 10MB каждый)
            </label>
            
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                isDragging 
                  ? 'border-violet-500 bg-violet-500/10' 
                  : 'border-white/20 hover:border-white/40 bg-white/5'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
                accept="image/*,video/*,.pdf,.doc,.docx,.txt"
              />
              <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragging ? 'text-violet-400' : 'text-muted-foreground'}`} />
              <p className="text-sm text-muted-foreground">
                {isDragging ? 'Отпустите для загрузки' : 'Перетащите файлы сюда или нажмите для выбора'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Изображения, видео, PDF, документы
              </p>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-2 mt-3">
                {files.map((file, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Paperclip className="w-4 h-4 text-violet-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="h-8 w-8 p-0 hover:bg-red-500/20 hover:text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
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