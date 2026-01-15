import { Heart } from 'lucide-react';
import { artistInfo } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-white/10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-muted-foreground text-sm">
          © {new Date().getFullYear()} {artistInfo.name}. All rights reserved.
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          Made with <Heart className="w-4 h-4 text-red-500 mx-1" fill="currentColor" /> using AI
        </div>
        <a
          href="/admin"
          className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        >
          Admin
        </a>
      </div>
    </footer>
  );
}
