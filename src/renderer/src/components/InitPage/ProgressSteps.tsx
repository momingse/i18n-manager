import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressStepsProps {
  currentStep: number;
}

export function ProgressSteps({ currentStep }: ProgressStepsProps) {
  return (
    <div className="flex items-center justify-center mb-6">
      <div className="flex items-center space-x-4">
        {[1, 2, 3].map((stepNum) => (
          <div key={stepNum} className="flex items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                stepNum <= currentStep
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {stepNum < currentStep ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                stepNum
              )}
            </div>
            {stepNum < 3 && (
              <div
                className={cn(
                  "w-12 h-0.5 mx-2 transition-all duration-300",
                  stepNum < currentStep ? "bg-primary" : "bg-muted",
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
