import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types
export interface AITool {
  id: string;
  name: string;
  logo: string;
  category: 'video' | 'image';
  sort_order: number;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  thumbnail: string | null;
  video_preview: string | null;
  tags: string[];
  year: string | null;
  duration: string | null;
  ai_tools: string[];
  content_blocks: ContentBlock[];
  sort_order: number;
  is_published: boolean;
}

export interface ContentBlock {
  type: 'text' | 'image' | 'video' | 'comparison';
  content?: string;
  src?: string;
  beforeSrc?: string;
  afterSrc?: string;
  caption?: string;
}

export interface SiteContent {
  id: string;
  value: string;
  description: string | null;
}

// Fetch AI Tools
export function useAITools() {
  return useQuery({
    queryKey: ['ai-tools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_tools')
        .select('*')
        .order('category')
        .order('sort_order');
      
      if (error) throw error;
      return data as AITool[];
    },
    staleTime: 0, // Always fetch fresh data
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
}

// Fetch Projects
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('sort_order');
      
      if (error) throw error;
      return (data || []).map(p => ({
        ...p,
        tags: p.tags || [],
        ai_tools: p.ai_tools || [],
        content_blocks: (p.content_blocks as unknown as ContentBlock[]) || [],
      })) as Project[];
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  });
}

// Fetch Site Content
export function useSiteContent() {
  return useQuery({
    queryKey: ['site-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_content')
        .select('*');
      
      if (error) throw error;
      return data as SiteContent[];
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  });
}

// Helper to get site content value
export function useSiteContentValue(id: string, fallback: string = '') {
  const { data } = useSiteContent();
  return data?.find(c => c.id === id)?.value || fallback;
}

// Mutations for AI Tools
export function useAIToolMutations() {
  const queryClient = useQueryClient();
  
  const upsert = useMutation({
    mutationFn: async (tool: Partial<AITool> & { name: string; logo: string; category: 'video' | 'image' }) => {
      const { error } = await supabase
        .from('ai_tools')
        .upsert(tool, { onConflict: 'id' });
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['ai-tools'] });
      await queryClient.refetchQueries({ queryKey: ['ai-tools'] });
      toast.success('Инструмент сохранён');
    },
    onError: (error: Error) => {
      toast.error('Ошибка: ' + error.message);
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('ai_tools').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['ai-tools'] });
      await queryClient.refetchQueries({ queryKey: ['ai-tools'] });
      toast.success('Инструмент удалён');
    },
    onError: (error: Error) => {
      toast.error('Ошибка: ' + error.message);
    },
  });

  return { upsert, remove };
}

// Mutations for Projects
export function useProjectMutations() {
  const queryClient = useQueryClient();
  
  const upsert = useMutation({
    mutationFn: async (project: Partial<Project> & { title: string; slug: string }) => {
      const { error } = await supabase
        .from('projects')
        .upsert(project as any, { onConflict: 'id' });
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
      await queryClient.refetchQueries({ queryKey: ['projects'] });
      toast.success('Проект сохранён');
    },
    onError: (error: Error) => {
      toast.error('Ошибка: ' + error.message);
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
      await queryClient.refetchQueries({ queryKey: ['projects'] });
      toast.success('Проект удалён');
    },
    onError: (error: Error) => {
      toast.error('Ошибка: ' + error.message);
    },
  });

  return { upsert, remove };
}

// Mutations for Site Content
export function useSiteContentMutations() {
  const queryClient = useQueryClient();
  
  const update = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: string }) => {
      // UPDATE может «тихо» не затронуть строки (0 rows affected) —
      // поэтому делаем UPSERT, чтобы гарантировать запись.
      const { error } = await supabase
        .from('site_content')
        .upsert({ id, value }, { onConflict: 'id' });
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['site-content'] });
      await queryClient.refetchQueries({ queryKey: ['site-content'] });
      toast.success('Контент обновлён');
    },
    onError: (error: Error) => {
      toast.error('Ошибка: ' + error.message);
    },
  });

  return { update };
}
