import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="flex w-full flex-1 items-center justify-center py-16">
      <div className="glass-panel mx-auto max-w-lg space-y-6 px-8 py-10 text-center">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/70">
            Alert
          </p>
          <h1 className="text-4xl font-semibold text-foreground">404</h1>
          <p className="text-sm text-muted-foreground">
            The flight path you attempted to reach is unavailable. Return to the dashboard to
            continue monitoring subsystem health.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-primary transition hover:border-primary hover:bg-primary/20"
        >
          <ArrowLeft className="size-4" strokeWidth={1.6} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
