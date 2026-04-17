import { type IconSvgElement } from '@hugeicons/react';
import {
  SpoonAndForkIcon,
  Car01Icon,
  ShoppingBag01Icon,
  Invoice01Icon,
  Joystick01Icon,
  FavouriteIcon,
  Certificate01Icon,
  PackageIcon,
  Coffee01Icon,
  Home01Icon,
  FlashIcon,
  Airplane01Icon,
  GiftIcon,
  Dumbbell01Icon,
  Pizza01Icon,
  Briefcase01Icon,
  Camera01Icon,
  MusicNote01Icon,
  GlobeIcon,
  Tag01Icon,
} from '@hugeicons/core-free-icons';

export const ICON_MAP: Record<string, IconSvgElement> = {
  Utensils: SpoonAndForkIcon,
  Car: Car01Icon,
  ShoppingBag: ShoppingBag01Icon,
  Receipt: Invoice01Icon,
  Gamepad2: Joystick01Icon,
  HeartPulse: FavouriteIcon,
  GraduationCap: Certificate01Icon,
  Heart: FavouriteIcon,
  Box: PackageIcon,
  Coffee: Coffee01Icon,
  Home: Home01Icon,
  Zap: FlashIcon,
  Plane: Airplane01Icon,
  Gift: GiftIcon,
  Dumbbell: Dumbbell01Icon,
  Pizza: Pizza01Icon,
  Briefcase: Briefcase01Icon,
  Camera: Camera01Icon,
  Music: MusicNote01Icon,
  Globe: GlobeIcon,
};

export const AVAILABLE_ICONS = Object.entries(ICON_MAP).map(([name, icon]) => ({
  name,
  icon,
}));

export const DEFAULT_ICON = Tag01Icon;
