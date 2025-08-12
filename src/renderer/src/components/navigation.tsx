import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebar";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { routes } from "@/routes";
import { ProjectSelector } from "./ProjectSelector";

export function Navigation() {
  const { toggle, isOpen } = useSidebarStore();

  const { pathname } = useLocation();
  const navigation = useNavigate();

  const handleMobileNavigation = (href: string) => {
    toggle();
    navigation(href);
  };

  return (
    <>
      <nav
        className={cn(
          "hidden lg:flex lg:flex-col lg:bg-card/50 lg:backdrop-blur-sm lg:border-r lg:border-border/50 transition-all duration-300",
          !isOpen ? "lg:w-16" : "lg:w-64",
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-border/50">
          {isOpen && (
            <Button
              onClick={() => navigation("/")}
              className="font-bold text-xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
            >
              i18n Manager
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            className="hover:bg-primary/10 transition-colors duration-200"
          >
            {!isOpen ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>

        <ProjectSelector isOpen={isOpen} />

        <div className="flex-1 px-2 py-6 space-y-2">
          {routes.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <a
                key={item.name}
                onClick={() => navigation(item.path)}
                className={cn(
                  "group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 hover:bg-primary/10 relative",
                  isActive && "bg-primary/15 text-primary shadow-sm",
                  !isOpen && "justify-center",
                )}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: "slideInLeft 0.3s ease-out forwards",
                }}
                title={!isOpen ? item.name : undefined}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-transform duration-200 group-hover:scale-110",
                    isActive && "text-primary",
                  )}
                />
                {isOpen && (
                  <>
                    <span className="font-medium">{item.name}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-primary rounded-full animate-pulse" />
                    )}
                  </>
                )}
              </a>
            );
          })}
        </div>

        <div className="p-4 border-t border-border/50">
          {isOpen && (
            <div className="text-xs text-muted-foreground text-center">
              v2.0.0 • Modern i18n
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu */}
      {!isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border shadow-xl animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between h-16 px-6 border-b border-border/50">
              <span className="font-bold text-lg">Menu</span>
              <Button variant="ghost" size="sm" onClick={toggle}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="px-4">
              <ProjectSelector isOpen={true} />
            </div>

            <div className="px-4 py-6 space-y-2">
              {routes.map((item, index) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                return (
                  <a
                    key={item.name}
                    onClick={() => handleMobileNavigation(item.path)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-primary/10",
                      isActive && "bg-primary/15 text-primary",
                    )}
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animation: "slideInLeft 0.3s ease-out forwards",
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
