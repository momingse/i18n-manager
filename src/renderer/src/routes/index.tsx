import EditorPage from "@/pages/Editor";
import { SettingsPage } from "@/pages/Settings";
import TranslationResultsPage from "@/pages/TranslationResult";
import UploadPage from "@/pages/Upload";
import { Edit3, LucideIcon, Settings, Upload } from "lucide-react";
import { ReactElement } from "react";

type BaseRouteItem = {
  path: string;
  name: string;
  element: ReactElement;
  index?: boolean;
};

type VisibleRouteItem = BaseRouteItem & {
  hidden?: false; // explicitly not hidden
  icon: LucideIcon;
};

type HiddenRouteItem = BaseRouteItem & {
  hidden: true;
  icon?: undefined; // explicitly forbidden
};

export type RouteItem = VisibleRouteItem | HiddenRouteItem;

export const routes: RouteItem[] = [
  {
    path: "/",
    name: "Upload",
    element: <UploadPage />,
    icon: Upload,
    index: true,
  },
  {
    path: "/editor",
    name: "Editor",
    element: <EditorPage />,
    icon: Edit3,
  },
  {
    path: "/settings",
    name: "Settings",
    element: <SettingsPage />,
    icon: Settings,
  },
  {
    path: "/translation-result",
    name: "Translation Result",
    element: <TranslationResultsPage />,
    hidden: true,
  },
];
