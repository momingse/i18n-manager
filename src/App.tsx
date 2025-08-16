import { Navigation } from "@/components/navigation";
import InitPage from "@/pages/Init";
import { routes } from "@/routes";
import { useProjectStore } from "@/store/project";
import { HashRouter, Route, Routes } from "react-router-dom";

const App = () => {
  const { currentProjectId } = useProjectStore();

  if (!currentProjectId) return <InitPage />;

  return (
    <div className="flex h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <HashRouter>
        <Navigation />
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto overflow-x-hidden">
            <Routes>
              {routes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={route.element}
                  index={route.index}
                />
              ))}
            </Routes>
          </div>
        </main>
      </HashRouter>
    </div>
  );
};

export default App;
