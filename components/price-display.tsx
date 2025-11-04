/**
 * Price Display Component
 *
 * Reusable component for displaying cryptocurrency prices with real-time data
 */

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

import { useFormattedPrice } from "@/hooks/use-prices";
import { Skeleton } from "@/components/ui/skeleton";

interface PriceDisplayProps {
  symbol: string;
  showChange?: boolean;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  fallbackPrice?: number;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({
  symbol,
  showChange = false,
  showIcon = false,
  size = "md",
  className = "",
  fallbackPrice,
}) => {
  const { formatted, isLoading, error } = useFormattedPrice(symbol);

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg font-semibold",
  };

  const iconSizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  if (isLoading && !formatted) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Skeleton className={`h-4 w-16 ${sizeClasses[size]}`} />
        {showChange && <Skeleton className="h-3 w-12" />}
      </div>
    );
  }

  if (error || !formatted) {
    const fallback = fallbackPrice
      ? `$${fallbackPrice.toFixed(2)}`
      : "Price unavailable";

    return (
      <div
        className={`text-muted-foreground ${sizeClasses[size]} ${className}`}
      >
        {fallback}
      </div>
    );
  }

  const changeColor = formatted.isPositive ? "text-green-600" : "text-red-600";

  const ChangeIcon = formatted.isPositive ? TrendingUp : TrendingDown;

  return (
    <div
      className={`flex items-center gap-2 ${sizeClasses[size]} ${className} ${isLoading ? "opacity-75 transition-opacity" : ""}`}
    >
      <span className="font-medium">{formatted.price}</span>

      {showChange && formatted.change && (
        <div className={`flex items-center gap-1 text-xs ${changeColor}`}>
          {showIcon && <ChangeIcon className={iconSizeClasses[size]} />}
          <span>{formatted.change}</span>
        </div>
      )}
    </div>
  );
};

export default PriceDisplay;

/**
 * Simple price text component (no change indicator)
 */
export const PriceText: React.FC<{
  symbol: string;
  className?: string;
  fallbackPrice?: number;
}> = ({ symbol, className, fallbackPrice }) => {
  const { formatted, isLoading, error } = useFormattedPrice(symbol);

  if (isLoading && !formatted) {
    return <Skeleton className={`h-4 w-16 ${className}`} />;
  }

  if (error || !formatted) {
    const fallback = fallbackPrice ? `$${fallbackPrice.toFixed(2)}` : "N/A";

    return (
      <span className={`text-muted-foreground ${className}`}>{fallback}</span>
    );
  }

  return (
    <span className={`${className} ${isLoading ? "opacity-75" : ""}`}>
      {formatted.price}
    </span>
  );
};

/**
 * Price badge component with background
 */
export const PriceBadge: React.FC<{
  symbol: string;
  showChange?: boolean;
  className?: string;
}> = ({ symbol, showChange = false, className = "" }) => {
  const { formatted, isLoading, error } = useFormattedPrice(symbol);

  if (isLoading) {
    return (
      <div
        className={`px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 ${className}`}
      >
        <Skeleton className="h-4 w-16" />
      </div>
    );
  }

  if (error || !formatted) {
    return (
      <div
        className={`px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-muted-foreground ${className}`}
      >
        Price unavailable
      </div>
    );
  }

  const bgColor =
    showChange && formatted.change
      ? formatted.isPositive
        ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300"
        : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300"
      : "bg-gray-100 dark:bg-gray-800";

  return (
    <div className={`px-3 py-1 rounded-full ${bgColor} ${className}`}>
      <div className="flex items-center gap-2 text-sm font-medium">
        <span>{formatted.price}</span>
        {showChange && formatted.change && (
          <span className="text-xs">{formatted.change}</span>
        )}
      </div>
    </div>
  );
};

/**
 * Large price display for dashboards
 */
export const LargePriceDisplay: React.FC<{
  symbol: string;
  showChange?: boolean;
  className?: string;
}> = ({ symbol, showChange = true, className = "" }) => {
  const { formatted, isLoading, error } = useFormattedPrice(symbol);

  if (isLoading) {
    return (
      <div className={`space-y-2 ${className}`}>
        <Skeleton className="h-8 w-32" />
        {showChange && <Skeleton className="h-4 w-20" />}
      </div>
    );
  }

  if (error || !formatted) {
    return (
      <div className={`text-muted-foreground ${className}`}>
        <div className="text-2xl font-bold">Price unavailable</div>
        {showChange && <div className="text-sm">Change unavailable</div>}
      </div>
    );
  }

  const changeColor = formatted.isPositive
    ? "text-green-600 dark:text-green-400"
    : "text-red-600 dark:text-red-400";

  return (
    <div className={className}>
      <div className="text-2xl font-bold">{formatted.price}</div>

      {showChange && formatted.change && (
        <div className={`flex items-center gap-1 text-sm ${changeColor} mt-1`}>
          <TrendingUp className="w-4 h-4" />
          <span>{formatted.change} 24h</span>
        </div>
      )}

      {formatted.lastUpdated && (
        <div className="text-xs text-muted-foreground mt-1">
          Updated {formatted.lastUpdated.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};
