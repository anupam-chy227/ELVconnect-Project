"use client";

import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button, Card } from "@/components/ui";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  resetKey: number;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, resetKey: 0 };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // TODO: Integrate Sentry reporting here when the monitoring project is provisioned.
    console.error("ELV Connect render error", error, errorInfo);
  }

  private retry = () => {
    this.setState((current) => ({
      hasError: false,
      error: undefined,
      resetKey: current.resetKey + 1,
    }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,rgba(225,29,72,0.12),transparent_30%),linear-gradient(180deg,#fff7f9_0%,#ffffff_100%)] px-4 py-10">
          <Card variant="danger-zone" padding="lg" className="w-full max-w-lg">
            <div className="text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-rose-200 bg-white text-rose-600">
                <AlertCircle className="h-6 w-6" aria-hidden="true" />
              </span>
              <h1 className="mt-4 text-2xl font-black tracking-tight text-foreground">Something went wrong</h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {this.state.error?.message || "An unexpected interface error occurred. Retry the section to continue."}
              </p>
              <Button
                type="button"
                className="mt-5"
                onClick={this.retry}
                leftIcon={<RefreshCw className="h-4 w-4" aria-hidden="true" />}
              >
                Retry
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return <React.Fragment key={this.state.resetKey}>{this.props.children}</React.Fragment>;
  }
}
