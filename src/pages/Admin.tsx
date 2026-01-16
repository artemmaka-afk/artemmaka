import { useState, useEffect } from 'react';
import { ArrowLeft, Save, DollarSign, Film, Loader2, RefreshCcw, LogIn, LogOut, Inbox, Eye, CheckCircle, Clock, Palette, Cpu, Paperclip, FileText, ExternalLink, Trash2, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIToolsManager } from '@/components/admin/AIToolsManager';
import { ProjectsManager } from '@/components/admin/ProjectsManager';
import { SiteContentManager } from '@/components/admin/SiteContentManager';
import { HeroStatsManager } from '@/components/admin/HeroStatsManager';
import { SocialLinksManager } from '@/components/admin/SocialLinksManager';
import { AvailabilityManager } from '@/components/admin/AvailabilityManager';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface CalculatorConfig {
  id: string;
  base_frame_price: number;
  music_price: number;
  lipsync_price_per_30s: number;
  revisions_4_price: number;
  revisions_8_price: number;
  deadline_20_multiplier: number;
  deadline_10_multiplier: number;
  volume_discount_percent: number;
  scenario_price_per_min: number;
  nda_partial_multiplier: number;
  nda_full_multiplier: number;
}

interface ProjectRequest {
  id: string;
  name: string;
  email: string | null;
  telegram: string | null;
  phone: string | null;
  project_description: string;
  budget_estimate: number | null;
  duration_seconds: number | null;
  deadline: string | null;
  pace: string | null;
  audio_options: string[] | null;
  revisions: string | null;
  status: string;
  created_at: string;
  attachments: string[] | null;
}

type StatusFilter = 'all' | 'new' | 'in_progress' | 'done' | 'deleted';

export default function Admin() {
  const { user, isAdmin, isLoading, login, register, logout } = useAdminAuth();
  
  const [config, setConfig] = useState<CalculatorConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [requests, setRequests] = useState<ProjectRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchConfig();
      fetchRequests();
    }
  }, [isAdmin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    await login(email, password);
    setIsAuthLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    await register(email, password);
    setIsAuthLoading(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  const fetchConfig = async () => {
    const { data, error } = await supabase
      .from('calculator_config')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching config:', error);
      toast.error('Ошибка загрузки настроек');
    } else if (data) {
      setConfig({
        id: data.id,
        base_frame_price: data.base_frame_price,
        music_price: data.music_price,
        lipsync_price_per_30s: data.lipsync_price_per_30s,
        revisions_4_price: data.revisions_4_price,
        revisions_8_price: data.revisions_8_price,
        deadline_20_multiplier: Number(data.deadline_20_multiplier),
        deadline_10_multiplier: Number(data.deadline_10_multiplier),
        volume_discount_percent: data.volume_discount_percent,
        scenario_price_per_min: data.scenario_price_per_min,
        nda_partial_multiplier: Number(data.nda_partial_multiplier ?? 1.3),
        nda_full_multiplier: Number(data.nda_full_multiplier ?? 1.5),
      });
    }
  };

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('project_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching requests:', error);
      toast.error('Ошибка загрузки заявок');
    } else {
      setRequests(data || []);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    
    setIsSaving(true);
    
    const { error } = await supabase
      .from('calculator_config')
      .update({
        base_frame_price: config.base_frame_price,
        music_price: config.music_price,
        lipsync_price_per_30s: config.lipsync_price_per_30s,
        revisions_4_price: config.revisions_4_price,
        revisions_8_price: config.revisions_8_price,
        deadline_20_multiplier: config.deadline_20_multiplier,
        deadline_10_multiplier: config.deadline_10_multiplier,
        volume_discount_percent: config.volume_discount_percent,
        scenario_price_per_min: config.scenario_price_per_min,
        nda_partial_multiplier: config.nda_partial_multiplier,
        nda_full_multiplier: config.nda_full_multiplier,
      })
      .eq('id', config.id);

    if (error) {
      toast.error('Ошибка сохранения: ' + error.message);
    } else {
      toast.success('Настройки сохранены!');
    }
    
    setIsSaving(false);
  };

  const updateConfig = (field: keyof CalculatorConfig, value: number) => {
    if (!config) return;
    setConfig({ ...config, [field]: value });
  };

  const updateRequestStatus = async (requestId: string, newStatus: string) => {
    const { error } = await supabase
      .from('project_requests')
      .update({ status: newStatus })
      .eq('id', requestId);

    if (error) {
      toast.error('Ошибка обновления статуса');
    } else {
      toast.success('Статус обновлён');
      fetchRequests();
    }
  };

  const filteredRequests = requests.filter(req => {
    if (statusFilter === 'all') return req.status !== 'deleted';
    return req.status === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-lg">Новая</span>;
      case 'in_progress':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-500/20 text-yellow-400 rounded-lg">В работе</span>;
      case 'done':
        return <span className="px-2 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded-lg">Завершена</span>;
      case 'deleted':
        return <span className="px-2 py-1 text-xs font-medium bg-red-500/20 text-red-400 rounded-lg">Удалена</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-500/20 text-gray-400 rounded-lg">{status}</span>;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background mesh-background noise-overlay flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background mesh-background noise-overlay flex items-center justify-center px-4">
        <div className="w-full max-w-md glass-card p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-violet-500/20 flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-violet-400" />
            </div>
            <h1 className="text-2xl font-bold">
              {isRegisterMode ? 'Регистрация' : 'Вход в админ-панель'}
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              {isRegisterMode ? 'Создайте аккаунт' : 'Введите данные для входа'}
            </p>
          </div>
          
          <form onSubmit={isRegisterMode ? handleRegister : handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="bg-white/5 border-white/10"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Пароль</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-white/5 border-white/10"
                required
                minLength={6}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-violet hover:opacity-90"
              disabled={isAuthLoading}
            >
              {isAuthLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isRegisterMode ? (
                'Зарегистрироваться'
              ) : (
                'Войти'
              )}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsRegisterMode(!isRegisterMode)}
              className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
            >
              {isRegisterMode ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
            </button>
          </div>
          
          <div className="mt-4 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Вернуться на сайт
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background mesh-background noise-overlay flex items-center justify-center px-4">
        <div className="w-full max-w-md glass-card p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Доступ запрещён</h1>
          <p className="text-muted-foreground mb-6">У вас нет прав администратора</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Выйти
            </Button>
            <Link to="/">
              <Button variant="ghost">На главную</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background mesh-background noise-overlay">
      <div className="relative z-10">
        <header className="border-b border-white/10 px-4 sm:px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">На сайт</span>
              </Link>
              <div className="h-4 w-px bg-white/20" />
              <h1 className="text-lg sm:text-xl font-bold">Админ-панель</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchRequests} className="gap-2">
                <RefreshCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Обновить</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Выйти</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <Tabs defaultValue="requests" className="space-y-6">
            <TabsList className="bg-white/5 border border-white/10 flex-wrap h-auto gap-1 p-1">
              <TabsTrigger value="requests" className="gap-2">
                <Inbox className="w-4 h-4" />
                <span className="hidden sm:inline">Заявки</span>
              </TabsTrigger>
              <TabsTrigger value="projects" className="gap-2">
                <Film className="w-4 h-4" />
                <span className="hidden sm:inline">Проекты</span>
              </TabsTrigger>
              <TabsTrigger value="ai-tools" className="gap-2">
                <Cpu className="w-4 h-4" />
                <span className="hidden sm:inline">Нейронки</span>
              </TabsTrigger>
              <TabsTrigger value="content" className="gap-2">
                <Palette className="w-4 h-4" />
                <span className="hidden sm:inline">Контент</span>
              </TabsTrigger>
              <TabsTrigger value="hero" className="gap-2">
                <Palette className="w-4 h-4" />
                <span className="hidden sm:inline">Шапка</span>
              </TabsTrigger>
              <TabsTrigger value="calculator" className="gap-2">
                <DollarSign className="w-4 h-4" />
                <span className="hidden sm:inline">Калькулятор</span>
              </TabsTrigger>
            </TabsList>

            {/* Requests Tab */}
            <TabsContent value="requests" className="space-y-6">
              <div className="glass-card p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-semibold">Входящие заявки</h2>
                    <p className="text-sm text-muted-foreground">Всего: {requests.length}</p>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={statusFilter === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter('all')}
                    >
                      Все
                    </Button>
                    <Button
                      variant={statusFilter === 'new' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter('new')}
                      className="gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      Новые
                    </Button>
                    <Button
                      variant={statusFilter === 'in_progress' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter('in_progress')}
                      className="gap-1"
                    >
                      <Clock className="w-3 h-3" />
                      В работе
                    </Button>
                    <Button
                      variant={statusFilter === 'done' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter('done')}
                      className="gap-1"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Завершённые
                    </Button>
                    <Button
                      variant={statusFilter === 'deleted' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter('deleted')}
                      className="gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Удалённые
                    </Button>
                  </div>
                </div>

                {filteredRequests.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Inbox className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Нет заявок</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredRequests.map((request) => (
                      <div
                        key={request.id}
                        className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">{request.name}</span>
                              {getStatusBadge(request.status)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(request.created_at)}
                            </div>
                          </div>
                          
                          <div className="flex gap-1">
                            {request.status !== 'new' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateRequestStatus(request.id, 'new')}
                                className="h-8 px-2"
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                            )}
                            {request.status !== 'in_progress' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateRequestStatus(request.id, 'in_progress')}
                                className="h-8 px-2"
                              >
                                <Clock className="w-3 h-3" />
                              </Button>
                            )}
                            {request.status !== 'done' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateRequestStatus(request.id, 'done')}
                                className="h-8 px-2"
                              >
                                <CheckCircle className="w-3 h-3" />
                              </Button>
                            )}
                            {request.status === 'deleted' ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateRequestStatus(request.id, 'new')}
                                className="h-8 px-2 text-green-400 hover:text-green-300"
                                title="Восстановить"
                              >
                                <RotateCcw className="w-3 h-3" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateRequestStatus(request.id, 'deleted')}
                                className="h-8 px-2 text-red-400 hover:text-red-300"
                                title="Удалить"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 text-sm">
                          {request.email && (
                            <a href={`mailto:${request.email}`} className="text-violet-400 hover:underline">
                              {request.email}
                            </a>
                          )}
                          {request.telegram && (
                            <a href={`https://t.me/${request.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">
                              {request.telegram}
                            </a>
                          )}
                          {request.phone && (
                            <a href={`tel:${request.phone}`} className="text-violet-400 hover:underline">
                              {request.phone}
                            </a>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {request.project_description}
                        </p>

                        {/* Project Details */}
                        <div className="flex flex-wrap gap-2">
                          {request.budget_estimate && (
                            <span className="px-2 py-1 text-xs font-mono bg-green-500/20 text-green-400 rounded-lg">
                              💰 {new Intl.NumberFormat('ru-RU').format(request.budget_estimate)} ₽
                            </span>
                          )}
                          {request.duration_seconds && (
                            <span className="px-2 py-1 text-xs font-mono bg-blue-500/20 text-blue-400 rounded-lg">
                              ⏱ {Math.floor(request.duration_seconds / 60)}:{(request.duration_seconds % 60).toString().padStart(2, '0')}
                            </span>
                          )}
                          {request.pace && (
                            <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded-lg">
                              🎬 {request.pace}
                            </span>
                          )}
                          {request.deadline && (
                            <span className="px-2 py-1 text-xs bg-orange-500/20 text-orange-400 rounded-lg">
                              📅 {request.deadline} дней
                            </span>
                          )}
                          {request.revisions && (
                            <span className="px-2 py-1 text-xs bg-cyan-500/20 text-cyan-400 rounded-lg">
                              🔄 {request.revisions} правок
                            </span>
                          )}
                          {request.audio_options && request.audio_options.length > 0 && (
                            <span className="px-2 py-1 text-xs bg-pink-500/20 text-pink-400 rounded-lg">
                              🎵 {request.audio_options.join(', ')}
                            </span>
                          )}
                        </div>

                        {/* Attachments */}
                        {request.attachments && request.attachments.length > 0 && (
                          <div className="space-y-2 pt-2 border-t border-white/10">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                              <Paperclip className="w-4 h-4" />
                              Вложения ({request.attachments.length})
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {request.attachments.map((url, idx) => {
                                const fileName = url.split('/').pop() || `Файл ${idx + 1}`;
                                const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
                                return (
                                  <a
                                    key={idx}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10 hover:border-violet-500/50 transition-colors"
                                  >
                                    {isImage ? (
                                      <img src={url} alt={fileName} className="w-8 h-8 object-cover rounded" />
                                    ) : (
                                      <FileText className="w-4 h-4 text-violet-400" />
                                    )}
                                    <span className="text-xs truncate max-w-[120px]">{fileName}</span>
                                    <ExternalLink className="w-3 h-3 text-muted-foreground" />
                                  </a>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projects">
              <div className="glass-card p-4 sm:p-6">
                <ProjectsManager />
              </div>
            </TabsContent>

            {/* AI Tools Tab */}
            <TabsContent value="ai-tools">
              <div className="glass-card p-4 sm:p-6">
                <AIToolsManager />
              </div>
            </TabsContent>

            {/* Site Content Tab */}
            <TabsContent value="content">
              <div className="glass-card p-4 sm:p-6">
                <SiteContentManager />
              </div>
            </TabsContent>

            {/* Hero Section Tab */}
            <TabsContent value="hero" className="space-y-6">
              <div className="glass-card p-4 sm:p-6">
                <AvailabilityManager />
              </div>
              <div className="glass-card p-4 sm:p-6">
                <HeroStatsManager />
              </div>
              <div className="glass-card p-4 sm:p-6">
                <SocialLinksManager />
              </div>
            </TabsContent>

            {/* Calculator Tab */}
            <TabsContent value="calculator">
              <div className="glass-card p-4 sm:p-6 space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">Настройки калькулятора</h2>
                      <p className="text-sm text-muted-foreground">Цены и множители</p>
                    </div>
                  </div>
                  <Button onClick={handleSave} size="sm" className="gap-2 bg-gradient-violet hover:opacity-90" disabled={isSaving}>
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span className="hidden sm:inline">Сохранить</span>
                  </Button>
                </div>

                {config && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-muted-foreground border-b border-white/10 pb-2">
                        Базовые цены
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Цена за кадр (₽)</label>
                          <Input
                            type="number"
                            value={config.base_frame_price}
                            onChange={(e) => updateConfig('base_frame_price', Number(e.target.value))}
                            className="bg-white/5 border-white/10"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">AI Музыка (₽)</label>
                          <Input
                            type="number"
                            value={config.music_price}
                            onChange={(e) => updateConfig('music_price', Number(e.target.value))}
                            className="bg-white/5 border-white/10"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Сценарий / мин (₽)</label>
                          <Input
                            type="number"
                            value={config.scenario_price_per_min}
                            onChange={(e) => updateConfig('scenario_price_per_min', Number(e.target.value))}
                            className="bg-white/5 border-white/10"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-muted-foreground border-b border-white/10 pb-2">
                        Дополнительные услуги
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Липсинк / 30 сек (₽)</label>
                          <Input
                            type="number"
                            value={config.lipsync_price_per_30s}
                            onChange={(e) => updateConfig('lipsync_price_per_30s', Number(e.target.value))}
                            className="bg-white/5 border-white/10"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">4 круга правок (₽)</label>
                          <Input
                            type="number"
                            value={config.revisions_4_price}
                            onChange={(e) => updateConfig('revisions_4_price', Number(e.target.value))}
                            className="bg-white/5 border-white/10"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">8 кругов правок (₽)</label>
                          <Input
                            type="number"
                            value={config.revisions_8_price}
                            onChange={(e) => updateConfig('revisions_8_price', Number(e.target.value))}
                            className="bg-white/5 border-white/10"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-muted-foreground border-b border-white/10 pb-2">
                        Множители срочности
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">20 дней (×)</label>
                          <Input
                            type="number"
                            step="0.1"
                            value={config.deadline_20_multiplier}
                            onChange={(e) => updateConfig('deadline_20_multiplier', Number(e.target.value))}
                            className="bg-white/5 border-white/10"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">10 дней (×)</label>
                          <Input
                            type="number"
                            step="0.1"
                            value={config.deadline_10_multiplier}
                            onChange={(e) => updateConfig('deadline_10_multiplier', Number(e.target.value))}
                            className="bg-white/5 border-white/10"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-muted-foreground border-b border-white/10 pb-2">
                        Множители NDA
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Частичный NDA (×)</label>
                          <Input
                            type="number"
                            step="0.1"
                            value={config.nda_partial_multiplier}
                            onChange={(e) => updateConfig('nda_partial_multiplier', Number(e.target.value))}
                            className="bg-white/5 border-white/10"
                          />
                          <p className="text-xs text-muted-foreground">+{Math.round((config.nda_partial_multiplier - 1) * 100)}% к цене</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Полный NDA (×)</label>
                          <Input
                            type="number"
                            step="0.1"
                            value={config.nda_full_multiplier}
                            onChange={(e) => updateConfig('nda_full_multiplier', Number(e.target.value))}
                            className="bg-white/5 border-white/10"
                          />
                          <p className="text-xs text-muted-foreground">+{Math.round((config.nda_full_multiplier - 1) * 100)}% к цене</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
