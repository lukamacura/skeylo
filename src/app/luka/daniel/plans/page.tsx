import type { Metadata } from "next";
import PlansDeck from "@/components/site/vizel/PlansDeck";

export const metadata: Metadata = {
  title: "Private presentation",
  description: "Pass required.",
  robots: { index: false, follow: false, nocache: true },
};

export default function VizelPlansPage() {
  return <PlansDeck />;
}
