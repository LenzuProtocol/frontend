/**
 * Subtle Loading Indicator Components
 *
 * Non-intrusive loading indicators for data refresh states
 */

import React from "react";
import { Loader2, RefreshCw } from "lucide-react";

interface LoadingIndicatorProps {
  isLoading: boolean;
  hasData: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrapper that shows subtle loading states without disrupting content
 */
export const LoadingWrapper: React.FC<LoadingIndicatorProps> = ({
  isLoading,
  hasData,
  children,
  className = "",
}) => {
  if (isLoading && !hasData) {
    return (
      <div
        className={`animate-pulse bg-gray-200/50 dark:bg-gray-700/50 rounded ${className}`}
      >
        <div className="h-6 w-24 bg-current opacity-20 rounded" />
      </div>
    );
  }

  return (
    <div
      className={`relative ${className} ${isLoading ? "opacity-80 transition-opacity" : ""}`}
    >
      {children}
      {isLoading && hasData && (
        <div className="absolute -top-1 -right-1">
          <RefreshCw className="w-3 h-3 animate-spin opacity-50 text-blue-500" />
        </div>
      )}
    </div>
  );
};

/**
 * Text component with subtle loading state
 */
export const LoadingText: React.FC<{
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
}> = ({ isLoading, children, className = "" }) => {
  return (
    <span
      className={`${className} ${isLoading ? "opacity-75 transition-opacity" : ""}`}
    >
      {children}
    </span>
  );
};

/**
 * Inline spinner for very subtle loading indication
 */
export const InlineSpinner: React.FC<{
  visible: boolean;
  className?: string;
}> = ({ visible, className = "" }) => {
  if (!visible) return null;

  return (
    <Loader2
      className={`w-3 h-3 animate-spin opacity-50 inline ml-1 ${className}`}
    />
  );
};

/**
 * Dot indicator for minimal loading feedback
 */
export const DotIndicator: React.FC<{
  visible: boolean;
  className?: string;
}> = ({ visible, className = "" }) => {
  if (!visible) return null;

  return (
    <span className={`inline-flex ml-1 ${className}`}>
      <span className="w-1 h-1 bg-current opacity-50 rounded-full animate-pulse" />
    </span>
  );
};

/**
 * Subtle refresh button
 */
export const RefreshButton: React.FC<{
  onRefresh: () => void;
  isLoading: boolean;
  className?: string;
}> = ({ onRefresh, isLoading, className = "" }) => {
  return (
    <button
      className={`p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors ${className}`}
      disabled={isLoading}
      title="Refresh data"
      onClick={onRefresh}
    >
      <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
    </button>
  );
};
