type BadgeVariant = "default" | "success" | "warning" | "error" | "accent";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-ve-bg-muted text-ve-text-muted",
  success: "bg-emerald-50 text-ve-success",
  warning: "bg-amber-50 text-ve-warning",
  error: "bg-red-50 text-ve-error",
  accent: "bg-ve-accent-light text-ve-accent",
};

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
