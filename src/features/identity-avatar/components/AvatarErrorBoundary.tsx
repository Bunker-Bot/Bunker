import { Component, type ReactNode, type ErrorInfo } from 'react';
import type { BunkerAvatarConfig } from '../types/avatar.types';
import { AvatarPoster } from './AvatarPoster';

interface AvatarErrorBoundaryProps {
  config: BunkerAvatarConfig;
  className?: string;
  size?: number | string;
  badgeLogoUrl?: string | null;
  badgeText?: string | null;
  children: ReactNode;
}

interface AvatarErrorBoundaryState {
  hasError: boolean;
}

export class AvatarErrorBoundary extends Component<
  AvatarErrorBoundaryProps,
  AvatarErrorBoundaryState
> {
  constructor(props: AvatarErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error): AvatarErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Sanitized non-disruptive diagnostic logging
    if (import.meta.env.DEV) {
      console.warn('[AvatarErrorBoundary] Falling back to SVG Poster:', error.message, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <AvatarPoster
          config={this.props.config}
          className={this.props.className}
          size={this.props.size}
          badgeLogoUrl={this.props.badgeLogoUrl}
          badgeText={this.props.badgeText}
        />
      );
    }

    return this.props.children;
  }
}

export default AvatarErrorBoundary;
