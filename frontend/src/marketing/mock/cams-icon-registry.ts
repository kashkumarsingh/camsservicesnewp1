import type { ComponentProps, ComponentType } from "react";
import {
  Activity,
  BarChart3,
  BookOpen,
  Brain,
  Briefcase,
  Calendar,
  Circle,
  CircleDot,
  CircleHelp,
  ClipboardList,
  Clock,
  Cloud,
  Dumbbell,
  Flame,
  Globe2,
  GraduationCap,
  HeartHandshake,
  LineChart,
  ListChecks,
  ListTodo,
  Mail,
  MapPin,
  MessageCircle,
  Orbit,
  Phone,
  PhoneCall,
  Puzzle,
  Sparkles,
  Star,
  Target,
  Timer,
  Trees,
  TrendingDown,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
  Waves,
  Zap
} from "lucide-react";
import type { InterventionPackageId } from "@/marketing/mock/intervention-packages";

type LucideIcon = ComponentType<ComponentProps<typeof Activity>>;

/** Planet / tier glyphs for intervention packages; single source for `InterventionPackageIcon`. */
export const CAMS_PACKAGE_ICONS: Readonly<Record<InterventionPackageId, LucideIcon>> = {
  mercury: CircleDot,
  venus: Sparkles,
  earth: Globe2,
  mars: Flame,
  jupiter: Circle,
  saturn: Orbit,
  uranus: Cloud,
  neptune: Waves
};

/** Named Lucide icons; single registry consumed by `CamsIcon` (mirrors `cams-unsplash.ts` / `cams-videos.ts`). */
export const CAMS_ICON_MAP = {
  activity: Activity,
  barChart: BarChart3,
  bookOpen: BookOpen,
  brain: Brain,
  briefcase: Briefcase,
  calendar: Calendar,
  circleHelp: CircleHelp,
  clipboardList: ClipboardList,
  clock: Clock,
  dumbbell: Dumbbell,
  graduationCap: GraduationCap,
  heartHandshake: HeartHandshake,
  lineChart: LineChart,
  listChecks: ListChecks,
  listTodo: ListTodo,
  mail: Mail,
  mapPin: MapPin,
  messageCircle: MessageCircle,
  phone: Phone,
  phoneCall: PhoneCall,
  puzzle: Puzzle,
  sparkles: Sparkles,
  star: Star,
  target: Target,
  timer: Timer,
  trees: Trees,
  trendingDown: TrendingDown,
  trendingUp: TrendingUp,
  trophy: Trophy,
  users: Users,
  wallet: Wallet,
  zap: Zap
} as const satisfies Record<string, LucideIcon>;

export type CamsIconName = keyof typeof CAMS_ICON_MAP;
