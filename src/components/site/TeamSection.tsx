"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Mail, Linkedin, Globe, Instagram, Users2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------
export type TeamMember = {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  email?: string;
  website?: string;
  Instagram?: string;
  linkedin?: string;
  location?: string;
  bio?: string;
  skills: string[];
  focus?: string[]; // interests / current focus
};

export type TeamSectionProps = {
  title?: string;
  subtitle?: string;
  members?: TeamMember[];
  featuredIds?: string[]; // show first in grid
};

// ------------------------------------------------------------
// Mock data (safe defaults if no props provided)
// ------------------------------------------------------------
const DEFAULT_MEMBERS: TeamMember[] = [
  {
    id: "luka",
    name: "Luka Macura",
    role: "Full‑stack & AI Developer",
    avatarUrl: "/luka.webp", // replace if available
    email: "luka@example.com",
    linkedin: "https://www.linkedin.com/in/example",
    Instagram: "https://Instagram.com/example",
    location: "Belgrade, RS",
    bio: "Radim na web aplikacijama i LLM integracijama, sa fokusom na Next.js i RAG sisteme. Zanimaju me načini na koje tehnologija i marketing zajedno doprinose razvoju biznisa, rastu i ostvarivanju profita.",
    skills: ["Next.js", "TypeScript", "AI", "RAG", "Tailwind", "Marketing"],
    focus: ["Web & AI developing", "Funnel research", "Marketing strategies"],
  },
  {
    id: "filip",
    name: "Filip Ruvčeski",
    role: "Full-stack",
    avatarUrl: "/filip.webp",
    email: "ana@example.com",
    linkedin: "https://www.linkedin.com/in/example",
    location: "Novi Sad, RS",
    bio: "UX istraživanje, prototipiranje i dizajn sistema. Voli da spaja brand i funkcionalnost.",
    skills: ["UX", "UI", "Figma", "Design Systems", "Illustration"],
    focus: ["User research", "Design systems"],
  },
  {
    id: "mihac",
    name: "Mihajlo Obradović",
    role: "Content production & edit",
    avatarUrl: "/mihac.webp",
    email: "marko@example.com",
    Instagram: "https://Instagram.com/example",
    location: "Remote",
    bio: "Eksperimenti, metrike i automatizacije. Spaja marketing i inženjering za brži rast.",
    skills: ["Analytics", "SEO", "Automation", "SQL", "Python"],
    focus: ["Experiment design", "Attribution"],
  },
];

// ------------------------------------------------------------
// Utilities
// ------------------------------------------------------------

function Portrait({ name, src }: { name: string; src?: string }) {
  // Large, portrait (3:4-ish) image container that works without the Tailwind aspect plugin
  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-transparent ring-1"
      style={{ width: "14rem", height: "19rem" }}
    >
      {src ? (
        <Image
          src={src}
          alt={name}
          fill
          sizes="(min-width: 1024px) 22rem, (min-width: 768px) 19rem, 14rem"
          className="object-cover object-center"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-4xl font-semibold">
          {name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")}
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------
// Card for single teammate
// ------------------------------------------------------------
function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <Card className="group relative h-full gap-2 rounded-2xl bg-transparent p-4 shadow-sm border-1 border-foreground/30 backdrop-blur-sm transition hover:shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex flex-col items-center gap-6">
            <Portrait name={member.name} src={member.avatarUrl} />
            <div className="min-w-0 text-center">
              <CardTitle className="text-2xl font-bold leading-tight text-foreground">
                {member.name}
              </CardTitle>
              <CardDescription className="mt-1 flex items-center justify-center gap-2 text-foreground/60 text-base">
                <Users2 className="h-4 w-4" />
                <span className="truncate">{member.role}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          {member.bio && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {member.bio}
            </p>
          )}

          {member.focus && member.focus.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {member.focus.map((f) => (
                <Badge
                  key={f}
                  variant="secondary"
                  className="rounded-full bg-primary/40 font-bold px-2 py-1 text-foreground text-xs"
                >
                  {f}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {member.skills.slice(0, 8).map((s) => (
              <TooltipProvider key={s}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className="cursor-default rounded-full px-2 border-primary/60 border-2 py-1 text-xs "
                    >
                      {s}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Veština: {s}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between gap-2 ">
          <div className="flex items-center gap-2 ">
            {member.email && (
              <IconLink href={`mailto:${member.email}`} label="Pošalji email">
                <Mail className="h-4 w-4" />
              </IconLink>
            )}
            {member.Instagram && (
              <IconLink href={member.Instagram} label="Instagram profil">
                <Instagram className="h-4 w-4" />
              </IconLink>
            )}
            {member.linkedin && (
              <IconLink href={member.linkedin} label="LinkedIn profil">
                <Linkedin className="h-4 w-4" />
              </IconLink>
            )}
            {member.website && (
              <IconLink href={member.website} label="Website">
                <Globe className="h-4 w-4" />
              </IconLink>
            )}
          </div>

          {/* Quick bio dialog */}
          <Dialog>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>{member.name}</DialogTitle>
                <DialogDescription>{member.role}</DialogDescription>
              </DialogHeader>
              <div className="mt-2 space-y-3">
                {member.bio && (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {member.bio}
                  </p>
                )}
                {member.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {member.skills.map((s) => (
                      <Badge
                        key={s}
                        variant="outline"
                        className="rounded-full px-2 py-1 text-xs"
                      >
                        {s}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

function IconLink({
  href,
  label,
  children,
}: React.PropsWithChildren<{ href: string; label: string }>) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center justify-center rounded-xl border border-transparent p-2 text-muted-foreground transition hover:text-primary/60"
    >
      {children}
    </a>
  );
}

// ------------------------------------------------------------
// Main section (filters removed — 3 members only)
// ------------------------------------------------------------
export default function TeamSection({
  title = "Naš tim",
  subtitle = "Full‑stack sistem za prikaz članova, veština i kontakata.",
  members = DEFAULT_MEMBERS,
  featuredIds = ["luka"],
}: TeamSectionProps) {
  // Sort with featured first
  const ordered = React.useMemo(() => {
    return [...members].sort(
      (a, b) =>
        Number(featuredIds.includes(b.id)) - Number(featuredIds.includes(a.id)),
    );
  }, [members, featuredIds]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <div className="mb-10">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">{subtitle}</p>
      </div>

      {/* Simple grid for 3 people */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {ordered.map((member) => (
          <TeamMemberCard key={member.id} member={member} />
        ))}
      </div>
    </section>
  );
}
