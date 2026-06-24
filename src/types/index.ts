import type { ComponentType } from "react";

export interface NavItem {
  name: string;
  path: string;
  icon: ComponentType<{ className?: string }>;
}

