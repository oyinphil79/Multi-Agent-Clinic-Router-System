import { CalendarDays, CreditCard, FileText, Siren, type LucideIcon } from "lucide-react";
import type { Lane } from "@/lib/types";

export const LANE_META: Record<Lane, { label: string; icon: LucideIcon; dot: string; chip: string; lit: string }> = {
  appointment: {
    label: "Appointment",
    icon: CalendarDays,
    dot: "bg-emerald-400",
    chip: "bg-emerald-50 text-emerald-800",
    lit: "ring-emerald-300 bg-emerald-50/60",
  },
  reports: {
    label: "Reports",
    icon: FileText,
    dot: "bg-sky-400",
    chip: "bg-sky-50 text-sky-800",
    lit: "ring-sky-300 bg-sky-50/60",
  },
  billing: {
    label: "Billing",
    icon: CreditCard,
    dot: "bg-amber-400",
    chip: "bg-amber-50 text-amber-800",
    lit: "ring-amber-300 bg-amber-50/60",
  },
  emergency: {
    label: "Emergency",
    icon: Siren,
    dot: "bg-rose-500",
    chip: "bg-rose-50 text-rose-700",
    lit: "ring-rose-400 bg-rose-50",
  },
};
