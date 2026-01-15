import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, Ghost } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background mesh-background noise-overlay flex items-center justify-center px-6">
      <div className="relative z-10 text-center max-w-md">
        <div className="w-24 h-24 mx-auto mb-8 rounded-3xl glass flex items-center justify-center animate-float">
          <Ghost className="w-12 h-12 text-violet-400" />
        </div>
        
        <h1 className="text-8xl font-bold gradient-text mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          This page has vanished into the digital void
        </p>
        
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-violet rounded-xl font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" />
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;