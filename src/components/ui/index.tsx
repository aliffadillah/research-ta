import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/helpers";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white hover:bg-primary-light active:scale-95 shadow-sm hover:shadow-md",
        secondary: "bg-white text-primary border border-border hover:bg-bg hover:border-primary",
        ghost: "text-text-muted hover:bg-bg hover:text-primary",
        danger: "bg-red-600 text-white hover:bg-red-700 active:scale-95",
      },
      size: {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3",
        lg: "px-8 py-4 text-lg",
        icon: "p-3",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  className,
  variant,
  size,
  loading,
  icon,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      ) : icon ? (
        icon
      ) : null}
      {children}
    </button>
  );
}

export function Card({
  className,
  children,
  hover = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { hover?: boolean }) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl shadow-card p-6",
        hover && "transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full px-4 py-3 rounded-xl border border-border bg-white",
        "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
        "placeholder:text-text-muted transition-all duration-200",
        className
      )}
      {...props}
    />
  );
}

export function Label({
  className,
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("block text-sm font-medium text-text mb-2", className)}
      {...props}
    >
      {children}
    </label>
  );
}

export function ProgressBar({
  value,
  max = 100,
  className,
  showLabel = false,
}: {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
}) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={className}>
      <div className="h-2 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-text-muted mt-1 text-right">
          {Math.round(percentage)}%
        </p>
      )}
    </div>
  );
}

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "primary" | "accent" | "success" }) {
  const variants = {
    default: "bg-bg text-text-muted",
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/20 text-accent-dark",
    success: "bg-green-100 text-green-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-10 h-10",
  };

  return (
    <div
      className={cn(
        "border-2 border-primary/20 border-t-primary rounded-full animate-spin",
        sizes[size]
      )}
    />
  );
}

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("bg-border/50 animate-pulse rounded", className)}
      {...props}
    />
  );
}