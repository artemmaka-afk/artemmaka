import { useState, useEffect } from 'react';
import { ArrowLeft, Save, DollarSign, Film, Loader2, RefreshCcw, LogIn, LogOut, Inbox, Eye, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { projects } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
}

type StatusFilter = 'all' | 'new' | 'in_progress' | 'done';

export default function Admin() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [config, setConfig] = useState<CalculatorConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [requests, setRequests] = useState<ProjectRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  
  // Auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  useEffect(() => {
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // Check if user is admin
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .maybeSingle();
        
        setIsAdmin(!!roles);
      } else {
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .maybeSingle();
        
        setIsAdmin(!!roles);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchConfig();
      fetchRequests();
    }
  }, [isAdmin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error('Ошибка входа: ' + error.message);
    } else {
      toast.success('Успешный вход!');
    }
    setIsAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.info('Вы вышли из системы');
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
        scenario_price_per_min: (data as any).scenario_price_per_min ?? 20000,
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
    if (statusFilter === 'all') return true;
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
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-500/20 text-gray-400 rounded-lg">{status}</span>;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background mesh-background noise-overlay flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
    );
  }

  // Login form
  if (!user) {
    return (
      <div className="min-h-screen bg-background mesh-background noise-overlay flex items-center justify-center px-4">
        <div className="w-full max-w-md glass-card p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-violet-500/20 flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-violet-400" />
            </div>
            <h1 className="text-2xl font-bold">Вход в админ-панель</h1>
            <p className="text-sm text-muted-foreground mt-2">Введите данные для входа</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
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
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-violet hover:opacity-90"
              disabled={isAuthLoading}
            >
              {isAuthLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Войти'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Вернуться на сайт
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Not admin
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
        {/* Header */}
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
            <TabsList className="bg-white/5 border border-white/10">
              <TabsTrigger value="requests" className="gap-2">
                <Inbox className="w-4 h-4" />
                Заявки
              </TabsTrigger>
              <TabsTrigger value="calculator" className="gap-2">
                <DollarSign className="w-4 h-4" />
                Калькулятор
              </TabsTrigger>
              <TabsTrigger value="projects" className="gap-2">
                <Film className="w-4 h-4" />
                Проекты
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
                  
                  {/* Status Filter */}
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
                          
                          {/* Status Change Buttons */}
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
                          </div>
                        </div>

                        {/* Contact Info */}
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

                        {/* Description */}
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {request.project_description}
                        </p>

                        {/* Budget */}
                        {request.budget_estimate && (
                          <div className="text-sm font-mono text-green-400">
                            Бюджет: {new Intl.NumberFormat('ru-RU').format(request.budget_estimate)} ₽
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
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
                    {/* Базовые цены */}
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
                      </div>
                    </div>

                    {/* Липсинк и правки */}
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

                    {/* Множители срочности */}
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
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projects">
              <div className="glass-card p-4 sm:p-6 space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                    <Film className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Проекты</h2>
                    <p className="text-sm text-muted-foreground">Управление портфолио</p>
                  </div>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10"
                    >
                      <img
                        src={project.thumbnail}
                        alt={project.title}
                        className="w-12 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{project.title}</h3>
                        <p className="text-xs text-muted-foreground truncate">{project.subtitle}</p>
                        <div className="flex gap-1.5 mt-1.5">
                          {project.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 text-[10px] font-mono bg-white/5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground text-center pt-4 border-t border-white/10">
                  Проекты загружаются из локальных данных. Для редактирования подключите CMS.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
