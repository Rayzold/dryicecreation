import { HugeiconsIcon } from "@hugeicons/react";
import {
  Call02Icon,
  Mail01Icon,
  Location01Icon,
  Clock01Icon,
  Menu01Icon,
  Cancel01Icon,
  ArrowRight01Icon,
  ArrowDown01Icon,
  ArrowUpRight01Icon,
  PlayIcon,
  Facebook01Icon,
  YoutubeIcon,
  Linkedin01Icon,
  NewTwitterIcon,
  Tick02Icon,
  Navigation03Icon,
} from "@hugeicons/core-free-icons";

const icons = {
  phone: Call02Icon,
  mail: Mail01Icon,
  pin: Location01Icon,
  clock: Clock01Icon,
  menu: Menu01Icon,
  close: Cancel01Icon,
  arrow: ArrowRight01Icon,
  down: ArrowDown01Icon,
  external: ArrowUpRight01Icon,
  play: PlayIcon,
  facebook: Facebook01Icon,
  youtube: YoutubeIcon,
  linkedin: Linkedin01Icon,
  x: NewTwitterIcon,
  tick: Tick02Icon,
  directions: Navigation03Icon,
};

export type IconName = keyof typeof icons;

export function Icon({ name, size = 20, className, strokeWidth = 1.6 }: { name: IconName; size?: number; className?: string; strokeWidth?: number }) {
  return <HugeiconsIcon icon={icons[name]} size={size} strokeWidth={strokeWidth} className={className} aria-hidden="true" />;
}

export const socialIcon: Record<string, IconName> = {
  Facebook: "facebook",
  YouTube: "youtube",
  LinkedIn: "linkedin",
  "X / Twitter": "x",
};
