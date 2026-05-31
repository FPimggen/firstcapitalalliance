import { Link } from "wouter";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const allItems = [{ label: "Home", href: "/" }, ...items];

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
      {allItems.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-50" />}
          {i === 0 && <Home className="w-3.5 h-3.5 shrink-0" />}
          {item.href && i < allItems.length - 1 ? (
            <Link href={item.href} className="hover:text-foreground hover:underline transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className={i === allItems.length - 1 ? "text-foreground font-medium" : ""}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
