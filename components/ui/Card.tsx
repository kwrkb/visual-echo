interface CardProps {
  children: React.ReactNode;
  hover?: boolean;
  className?: string;
}

export function Card({ children, hover = false, className = "" }: CardProps) {
  return (
    <div
      className={`bg-ve-surface rounded-2xl border border-ve-border shadow-ve-sm ${
        hover
          ? "transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-ve-md hover:border-ve-border-hover"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
