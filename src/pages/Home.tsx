import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { getLoginUrl } from "@/const";
import { Streamdown } from "streamdown";

/**
 * Example page. Replace with your own feature implementation.
 * When building pages, remember: Frontend Workflow, Best Practices, Design Guide and Common Pitfalls.
 */
export default function Home() {
  const { user, loading, error, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <main className="container py-8 space-y-4">
        {/* Example: lucide-react for icons */}
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-lg font-medium">Example Page</p>
        {/* Example: Streamdown for markdown rendering */}
        <div className="prose dark:prose-invert max-w-none">
          <Streamdown>Any **markdown** content</Streamdown>
        </div>
        <Button variant="default">Example Button</Button>
      </main>
    </div>
  );
}
