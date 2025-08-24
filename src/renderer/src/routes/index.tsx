import EditorPage from "@/pages/Editor";
import { SettingsPage } from "@/pages/Settings";
import UploadPage from "@/pages/Upload";
import { Edit3, LucideIcon, Settings, Upload } from "lucide-react";
import { ReactElement } from "react";

type RouteItem = {
  path: string;
  name: string;
  element: ReactElement;
  index?: boolean;
  icon: LucideIcon;
};

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
];
