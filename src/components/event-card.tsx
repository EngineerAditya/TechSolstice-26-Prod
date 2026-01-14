"use client";

import { useState } from "react";
import ExpandableCard from "@/components/ui/expandable-card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Trophy, CheckCircle2, Lock, Hourglass } from "lucide-react";
import TeamRegistrationForm from "@/components/ui/TeamRegistrationForm";
import TeamDashboard from "@/components/ui/TeamDashboard";

export type Event = {
  id: string;
  name: string;
  shortDescription: string | null;
  longDescription: string | null;
  category: string;
  starts_at: string | null;
  ends_at: string | null;
  venue: string | null;
  imageUrl: string | null;
  prize_pool: string | null;
  min_team_size: number;
  max_team_size: number;
  is_reg_open: boolean;
  registration_starts_at: string | null;
};

interface EventCardProps {
  event: Event;
  isRegistered: boolean;
  hasAccess: boolean;
}

export function EventCard({ event, isRegistered, hasAccess }: EventCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const now = new Date();
  const regStart = event.registration_starts_at ? new Date(event.registration_starts_at) : new Date(0);
  const isComingSoon = now < regStart;
  const isLocked = !event.is_reg_open;

  const isPassLocked = !hasAccess && !isRegistered;

  const eventDate = event.starts_at
    ? new Date(event.starts_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    : "TBA";

  const eventTime = event.starts_at
    ? new Date(event.starts_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : "TBA";

  let buttonText = "Register Now";
  let buttonIcon = null;
  let isDisabled = false;

  if (isRegistered) {
    buttonText = isLocked ? "View Team (Locked)" : "Manage Team";
  } else if (isPassLocked) {
    buttonText = "Buy Pass";
    buttonIcon = <Lock size={16} className="mr-2" />;
  } else {
    if (isComingSoon) {
      buttonText = "Coming Soon";
      buttonIcon = <Hourglass size={16} className="mr-2" />;
      isDisabled = true;
    } else if (isLocked) {
      buttonText = "Registration Closed";
      buttonIcon = <Lock size={16} className="mr-2" />;
      isDisabled = true;
    }
  }

  return (
    <ExpandableCard
      title={event.name}
      description=""
      isFlipped={isFlipped}
      // THEME UPDATE: Pure minimalist black. No blur/noise. Sharp hairlines.
      className="w-full h-full bg-black border border-white/10 hover:border-red-500/50 transition-colors duration-300 group rounded-lg"
      collapsedChildren={
        <div className="space-y-4 w-full">
          {/* Meta Grid - Dividers instead of boxes */}
          <div className="grid grid-cols-3 divide-x divide-white/10 border-t border-white/10 pt-4 w-full">
            <div className="flex flex-col items-center gap-1 px-1">
              <span className="text-neutral-500 text-[9px] uppercase tracking-widest">Date</span>
              <span className="text-neutral-200 text-[10px] sm:text-xs font-medium truncate w-full text-center">
                {eventDate}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 px-1">
              <span className="text-neutral-500 text-[9px] uppercase tracking-widest">Time</span>
              <span className="text-neutral-200 text-[10px] sm:text-xs font-medium truncate w-full text-center">
                {eventTime}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 px-1">
              <span className="text-neutral-500 text-[9px] uppercase tracking-widest">Venue</span>
              <span className="text-neutral-200 text-[10px] sm:text-xs font-medium truncate w-full text-center" title={event.venue || "TBA"}>
                {event.venue || "TBA"}
              </span>
            </div>
          </div>

          {/* Prize Pool - Minimal Text Only */}
          <div className="flex items-center justify-center pt-1">
            {event.prize_pool && (
              <div className="flex items-baseline gap-2 text-red-500">
                <Trophy size={10} className="opacity-80" />
                <span className="text-[11px] font-mono font-bold tracking-tight">
                  ₹{event.prize_pool}
                </span>
              </div>
            )}
          </div>
        </div>
      }
      backContent={
        isRegistered ? (
          <TeamDashboard
            eventId={event.id}
            eventName={event.name}
            minSize={event.min_team_size}
            maxSize={event.max_team_size}
            isLocked={isLocked}
            onBack={() => setIsFlipped(false)}
          />
        ) : hasAccess ? (
          <TeamRegistrationForm
            eventId={event.id}
            eventName={event.name}
            minSize={event.min_team_size}
            maxSize={event.max_team_size}
            onBack={() => setIsFlipped(false)}
            onSuccess={() => setIsFlipped(false)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-center p-6 bg-neutral-950 rounded-lg border border-white/5">
            <Lock size={32} className="text-red-500/80" />
            <div className="space-y-2">
              <p className="text-lg font-medium text-white tracking-tight">Pass Required</p>
              <p className="text-neutral-500 text-xs sm:text-sm max-w-[200px] mx-auto leading-relaxed">
                Access to this event is restricted to pass holders.
              </p>
            </div>
            <Button
              onClick={() => {
                setIsFlipped(false);
                window.dispatchEvent(new CustomEvent("open-pass-modal", { detail: event.id }));
              }}
              variant="outline"
              className="border-white/20 text-white hover:bg-white hover:text-black font-medium text-xs uppercase tracking-wider"
            >
              Get Access
            </Button>
          </div>
        )
      }
    >
      <div className="flex flex-col items-center justify-start sm:justify-center space-y-6 w-full h-full py-4">

        {/* Prize Pool - Sharp Industrial Look */}
        {event.prize_pool && (
          <div className="flex items-center gap-3 px-4 py-2 border border-red-900/30 rounded-md bg-red-950/5">
            <Trophy size={14} className="text-red-500" />
            <div className="w-px h-3 bg-red-900/30"></div>
            <span className="text-sm sm:text-base font-bold text-red-100 font-mono tracking-tight">₹{event.prize_pool}</span>
          </div>
        )}

        {/* Meta Grid - Clean Dividers, No Boxes */}
        <div className="grid grid-cols-3 w-full divide-x divide-white/10 mt-2">
          <div className="flex flex-col items-center justify-center px-2 gap-1">
            <p className="text-[9px] text-neutral-600 uppercase tracking-[0.2em]">Date</p>
            <p className="text-xs sm:text-sm font-medium text-neutral-200 text-center">
              {eventDate}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center px-2 gap-1">
            <p className="text-[9px] text-neutral-600 uppercase tracking-[0.2em]">Time</p>
            <p className="text-xs sm:text-sm font-medium text-neutral-200 text-center">
              {eventTime}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center px-2 gap-1">
            <p className="text-[9px] text-neutral-600 uppercase tracking-[0.2em]">Venue</p>
            <p className="text-xs sm:text-sm font-medium text-neutral-200 truncate w-full text-center px-1" title={event.venue || "TBA"}>
              {event.venue || "TBA"}
            </p>
          </div>
        </div>

        {/* Description - Left Aligned with Red Accent Line */}
        {event.longDescription && (
          <div className="w-full px-4 sm:px-6">
            <div className="border-l-2 border-red-500/50 pl-4 py-1">
              <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed line-clamp-4 text-left">
                {event.longDescription}
              </p>
            </div>
          </div>
        )}

        {/* STATUS BADGES - Outlines Only */}
        {(isRegistered || isPassLocked || (isLocked && !isRegistered && !isComingSoon)) && (
          <div className="flex flex-wrap gap-2 justify-center pt-2">
            {isRegistered && (
              <div className="flex items-center gap-2 px-3 py-1 rounded border border-white/30">
                <CheckCircle2 className="text-white" size={12} />
                <span className="text-white font-medium text-[10px] uppercase tracking-wider">Registered</span>
              </div>
            )}

            {isPassLocked && (
              <div className="flex items-center gap-2 px-3 py-1 rounded border border-red-500/40">
                <Lock className="text-red-500" size={12} />
                <span className="text-red-400 font-medium text-[10px] uppercase tracking-wider">Pass Required</span>
              </div>
            )}

            {isLocked && !isRegistered && !isComingSoon && (
              <div className="flex items-center gap-2 px-3 py-1 rounded border border-neutral-700">
                <Lock className="text-neutral-500" size={12} />
                <span className="text-neutral-500 font-medium text-[10px] uppercase tracking-wider">Closed</span>
              </div>
            )}
          </div>
        )}

        {/* Action Button - Centered */}
        {/* TEMPORARILY DISABLED - Registration and Pass Purchase */}
        {/* <div className="w-full flex items-center justify-center pt-2">
          <Button
            onClick={() => !isDisabled && setIsFlipped(true)}
            size="lg"
            disabled={isDisabled}
            variant={isRegistered ? "outline" : "default"}
            className={`font-bold text-sm sm:text-base px-8 py-6 w-full sm:w-auto transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider ${isRegistered
                ? "border border-white/20 text-white hover:bg-white hover:text-black rounded-none"
                : "bg-red-600 hover:bg-red-700 text-white border border-transparent rounded-none"
              }`}
          >
            {buttonIcon}
            {buttonText}
          </Button>
        </div> */}
      </div>
    </ExpandableCard>
  );
}