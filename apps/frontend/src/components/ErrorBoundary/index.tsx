import { Component, ErrorInfo, ReactNode } from "react";

import { WarningTriangle } from "iconoir-react";

import { Boundary } from "@repo/theme";

import styles from "./ErrorBoundary.module.scss";

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Called once per caught error, before the fallback renders. */
  onError?: (error: Error, info: ErrorInfo) => void;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches render errors in its subtree so a bug in one part of the page
 * doesn't blank out the whole app. Class component because
 * getDerivedStateFromError/componentDidCatch have no hook equivalent.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    if (this.props.fallback !== undefined) {
      return this.props.fallback;
    }

    return (
      <Boundary>
        <div className={styles.placeholder}>
          <WarningTriangle width={32} height={32} />
          <p className={styles.heading}>Something went wrong</p>
          <p>Try reloading the page. If this keeps happening, let us know.</p>
        </div>
      </Boundary>
    );
  }
}
