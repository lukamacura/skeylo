"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
    role: "Full‑stack marketer",
    avatarUrl: "/luka.webp", // replace if available
    email: "luka.xzy@gmail.com",
    linkedin: "https://www.linkedin.com/in/example",
    Instagram: "https://www.instagram.com/macura.fullstack/",
    location: "Belgrade, RS",
    bio: "Oduvek me pokreće preduzetnički način razmišljanja - kako da ideje pretvorim u konkretne rezultate. Danas mi je fokus na web aplikacijama, AI automatizacijama i kreiranju RAG modela (AI botovi koji imaju svoju bazu znanja). Verujem da je pravi i jedini smisao tehnologije i marketinga rast i profit.",
    skills: [
      "Next.js",
      "TypeScript",
      "AI",
      "RAG",
      "Tailwind",
      "Marketing",
      "Automations",
      "Funnel building",
    ],
    focus: ["Web & AI developing", "Funnel research", "Marketing strategies"],
  },
  {
    id: "filip",
    name: "Filip Ruvčeski",
    role: "Growth & Media Strategist",
    avatarUrl: "/filip.webp",
    email: "ana@example.com",
    Instagram: "https://www.instagram.com/filipruvceski/",
    location: "Novi Sad, RS",
    bio: "Dolazim iz sveta marketinga i prodaje, gde svaka odluka mora imati cilj - profit. Kroz kreativne i promišljene strategije pomogao sam brojnim brendovima da rastu i postanu lideri svog tržišta. Verujem da svaka uspešna prodaja počinje poverenjem publike i iskrenim razumevanjem njihovih potreba. Moj zadatak je da to poverenje pretvorim u rezultat - kroz kreativnost, timski rad i strategije prilagođene svakom klijentu.",
    skills: [
      "Digital Marketing",
      "Growth Strategy",
      "Media Buying",
      "Content Strategy",
      "Brand Development",
      "Meta ads",
    ],
    focus: ["Brand Growth", "Creative Campaign Strategy", "Audience Research"],
  },
  {
    id: "mihac",
    name: "Mihajlo Obradović",
    role: "Content production & Edit",
    avatarUrl: "/mihac.webp",
    email: "marko@example.com",
    Instagram: "https://Instagram.com/justmihac",
    location: "Remote",
    bio: "Sa preko 5 godina iskustva u profesionalnoj video produkciji svoje znanje usmeravam na to da svaki kadar ima svoju priču. Verujem da emocija, estetika i ritam čine srž svake uspešne video kampanje. Uz moj rad Vaš brend će da se odvoji od većine i u očima publike ostavi utisak za pamćenje.",
    skills: [
      "Video Production",
      "Cinematography",
      "Editing",
      "Storytelling",
      "Creative Direction",
    ],
    focus: ["Brand Identity", "Marketing Content", "Post-Production Workflow"],
  },
];

// ------------------------------------------------------------
// Motion variants (scroll-reveal + subtle hover)
// ------------------------------------------------------------
const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

// ------------------------------------------------------------
// Utilities
// ------------------------------------------------------------
function Portrait({ name, src }: { name: string; src?: string }) {
  // Large, portrait (3:4-ish) image container that works without the Tailwind aspect plugin
  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-transparent ring-1 ring-foreground/10"
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
      layout
      variants={cardVariants}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card className="group relative h-full gap-2 rounded-2xl bg-transparent p-4 shadow-sm border border-foreground/20  transition hover:shadow-lg">
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
            <p className="text-md leading-relaxed text-foreground/80">
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
            {(member.skills ?? []).slice(0, 8).map((s) => (
              <Tooltip key={s}>
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

          {/* Quick bio dialog with trigger */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" className="px-3 py-1 text-xs">
                Bio
              </Button>
            </DialogTrigger>
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
                {(member.skills?.length ?? 0) > 0 && (
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
// Main section (scroll-reveal on container; TooltipProvider moved up)
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
    <section id="team" className="mx-auto max-w-screen px-4 py-10 md:py-14">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          {title}
        </h2>
        <p className="mt-2 text-muted-foreground">{subtitle}</p>
      </div>

      <TooltipProvider delayDuration={150}>
        {/* Scroll-reveal grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 gap-6 lg:grid-cols-3"
        >
          {ordered.map((member) => (
            <TeamMemberCard key={member.id} member={member} />
          ))}
        </motion.div>
      </TooltipProvider>
    </section>
  );
}
