"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

interface ErrorStateProps {
  error: Error;
  onRetry?: () => void;
  title?: string;
  description?: string;
}

export function ErrorState({ 
  error, 
  onRetry, 
  title = "Something went wrong",
  description 
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Alert className="max-w-md">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="mt-2">
          {description || error.message || "An unexpected error occurred. Please try again."}
        </AlertDescription>
        {onRetry && (
          <div className="mt-4">
            <Button onClick={onRetry} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}
      </Alert>
    </div>
  );
}