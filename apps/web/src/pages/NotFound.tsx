import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

export function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="flex max-w-md flex-col items-center text-center">
        <span className="text-8xl font-bold tracking-tight text-accent">
          404
        </span>

        <h1 className="mt-4 text-2xl font-semibold">Page not found</h1>

        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist. Redirecting you to the
          dashboard...
        </p>

        <Button className="mt-6 rounded-full px-6">
          <Link to="/">Go to Home</Link>
        </Button>
      </div>
    </main>
  );
}
