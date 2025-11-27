'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'

// Spinner Component
export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary' | 'accent'
}

const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  const colorClasses = {
    primary: 'text-[#C1502E]',
    secondary: 'text-[#D4A574]',
    accent: 'text-[#3E2723]',
  }

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      {...props}
    >
      <Loader2
        className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
      />
    </div>
  )
}

// Loading Button Component
export interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean
  children: React.ReactNode
  loadingText?: string
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading,
  children,
  className = '',
  loadingText = 'Loading...',
  ...props
}) => {
  return (
    <button
      {...props}
      disabled={isLoading || props.disabled}
      className={`
        inline-flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {isLoading && <Spinner size="sm" />}
      {isLoading ? loadingText : children}
    </button>
  )
}

// Skeleton Components
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number
  height?: string | number
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  style,
  ...props
}) => {
  const inlineStyles = {
    width,
    height,
    ...style,
  }

  return (
    <div
      className={`
        animate-pulse rounded-md bg-[#D4A574]/20
        ${className}
      `}
      style={inlineStyles}
      {...props}
    />
  )
}

// Skeleton Text Component
export interface SkeletonTextProps {
  lines?: number
  className?: string
}

const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height="1rem"
          width={
            index === lines - 1
              ? `${60 + Math.random() * 30}%`
              : `${80 + Math.random() * 20}%`
          }
        />
      ))}
    </div>
  )
}

// Skeleton Card Component
export interface SkeletonCardProps {
  showAvatar?: boolean
  showImage?: boolean
  className?: string
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({
  showAvatar = false,
  showImage = false,
  className = '',
}) => {
  return (
    <div
      className={`
        rounded-lg border border-[#D4A574] bg-[#FAF6F1] p-6 shadow-sm
        ${className}
      `}
    >
      {/* Header with optional avatar */}
      <div className="flex items-center space-x-4 mb-4">
        {showAvatar && <Skeleton width="2.5rem" height="2.5rem" className="rounded-full" />}
        <div className="flex-1">
          <Skeleton width="60%" height="1rem" className="mb-2" />
          <Skeleton width="40%" height="0.75rem" />
        </div>
      </div>

      {/* Optional image */}
      {showImage && (
        <Skeleton width="100%" height="12rem" className="mb-4 rounded" />
      )}

      {/* Content */}
      <SkeletonText lines={3} />

      {/* Footer */}
      <div className="flex items-center justify-between mt-4">
        <Skeleton width="5rem" height="1.5rem" className="rounded" />
        <Skeleton width="4rem" height="1.5rem" className="rounded" />
      </div>
    </div>
  )
}

// Page Loading Component
export interface PageLoadingProps {
  text?: string
  className?: string
}

const PageLoading: React.FC<PageLoadingProps> = ({
  text = 'Loading...',
  className = '',
}) => {
  return (
    <div
      className={`
        flex flex-col items-center justify-center min-h-[200px] space-y-4
        ${className}
      `}
    >
      <Spinner size="lg" />
      <p className="text-[#8B6F47] text-sm">{text}</p>
    </div>
  )
}

export {
  Spinner,
  LoadingButton,
  Skeleton,
  SkeletonText,
  SkeletonCard,
  PageLoading,
}