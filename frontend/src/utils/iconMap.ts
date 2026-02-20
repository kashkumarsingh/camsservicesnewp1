/**
 * Shared icon map for CMS public pages.
 * Maps string keys (e.g. from API or config) to Lucide icon components.
 * Use this in all CMS pages — never define per-page.
 */

import type React from 'react';
import {
  Sparkles,
  CheckCircle2,
  Star,
  Award,
  Shield,
  Phone,
  Users,
  Calendar,
  Target,
  FileText,
  Clock,
  MessageCircle,
  Heart,
  Gift,
} from 'lucide-react';

export const ICON_COMPONENT_MAP: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  users: Users,
  user: Users,
  clock: Clock,
  calendar: Calendar,
  star: Star,
  award: Award,
  shield: Shield,
  target: Target,
  heart: Heart,
  gift: Gift,
  phone: Phone,
  sparkles: Sparkles,
  check: CheckCircle2,
  'file-text': FileText,
  'message-circle': MessageCircle,
};
