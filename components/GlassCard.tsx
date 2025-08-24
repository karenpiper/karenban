"use client"

import { forwardRef, HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "subtle" | "dark"
  padding?: "none" | "sm" | "md" | "lg" | "xl"
  border?: "none" | "hairline" | "subtle" | "glow"
  shadow?: "none" | "soft" | "medium" | "strong"
  backdrop?: "light" | "medium" | "heavy"
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ 
    className, 
    variant = "default", 
    padding = "md", 
    border = "hairline", 
    shadow = "soft", 
    backdrop = "medium",
    children, 
    ...props 
  }, ref) => {
    const variantClasses = {
      default: "glass-card",
      elevated: "glass-card shadow-2xl",
      subtle: "bg-white/10 backdrop-blur-sm border-white/20",
      dark: "glass-card-dark"
    }

    const paddingClasses = {
      none: "",
      sm: "p-2",
      md: "p-4",
      lg: "p-6",
      xl: "p-8"
    }

    const borderClasses = {
      none: "border-0",
      hairline: "hairline-border",
      subtle: "border border-white/30",
      glow: "hairline-border glass-glow"
    }

    const shadowClasses = {
      none: "shadow-none",
      soft: "soft-shadow",
      medium: "shadow-xl",
      strong: "shadow-2xl"
    }

    const backdropClasses = {
      light: "backdrop-blur-sm",
      medium: "backdrop-blur-md",
      heavy: "backdrop-blur-xl"
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl transition-all duration-300 ease-out",
          variantClasses[variant],
          paddingClasses[padding],
          borderClasses[border],
          shadowClasses[shadow],
          backdropClasses[backdrop],
          "hover:scale-[1.02] hover:shadow-2xl",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

GlassCard.displayName = "GlassCard"

export { GlassCard } 