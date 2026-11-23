import {
  Bike,
  Car,
  Droplets,
  Fan,
  Home,
  Leaf,
  Recycle,
  ShieldCheck,
  Sun,
  Thermometer,
  TreePine,
  type LucideIcon,
} from "lucide-react";

/**
 * Maps the `iconKey` strings used in `lib/content.ts` onto lucide icons, so the
 * content module stays pure data and remains trivially testable.
 */
export const CONTENT_ICONS: Readonly<Record<string, LucideIcon>> = {
  fan: Fan,
  home: Home,
  droplets: Droplets,
  shield: ShieldCheck,
  thermometer: Thermometer,
  tree: TreePine,
  car: Car,
  bike: Bike,
  sun: Sun,
  leaf: Leaf,
  recycle: Recycle,
};
