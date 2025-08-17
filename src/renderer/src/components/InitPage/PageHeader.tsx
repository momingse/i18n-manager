import { Rocket } from "lucide-react";

export function PageHeader() {
  return (
    <div className="text-center mb-6 animate-in fade-in slide-in-from-top duration-600">
      <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
        <Rocket className="w-6 h-6 text-primary" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold mb-1">
        Create Translation Project
      </h1>
      <p className="text-sm text-muted-foreground">
        Set up your i18n workflow in 3 simple steps
      </p>
    </div>
  );
}