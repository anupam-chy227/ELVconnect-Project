import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./Button";
import { Card } from "./Card";

export type ErrorCardProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
};

export function ErrorCard({
  title = "Unable to load data",
  message = "The API request could not be completed. Please try again.",
  onRetry,
}: ErrorCardProps) {
  return (
    <Card variant="danger-zone" padding="lg">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-rose-200 bg-white text-rose-600">
            <AlertCircle className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-black text-foreground">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{message}</p>
          </div>
        </div>
        {onRetry ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onRetry}
            leftIcon={<RefreshCw className="h-4 w-4" aria-hidden="true" />}
          >
            Retry
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
