// ui/Teamregform.tsx
"use client";

import React, { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { X } from "lucide-react";
import ASMRStaticBackground from "./asmr-static-background";
type TeamregformProps = {
  eventId: string;
  captainId: string;
  captainName?: string | null;
  minSize?: number;
  maxSize?: number;
  onSuccess?: (teamId: string) => void;
  actionPath?: string;
  useEmails?: boolean;
  onBack?: () => void;
};

export default function Teamregform({
  eventId,
  captainId,
  captainName,
  minSize = 1,
  maxSize,
  onSuccess,
  actionPath,
  useEmails = true,
  onBack,
}: TeamregformProps) {
  const endpoint =
    actionPath || (useEmails ? "/api/teams/createWithEmails" : "/api/teams/create");
  const createAsCaptainEndpoint = "/api/teams/createWithEmailsAsCaptain";

  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState<string[]>(
    Array.from({ length: minSize }, () => ""),
  );
  const [leaderEmail, setLeaderEmail] = useState<string>(""); // no default "Your Name"
  const [leaderValidation, setLeaderValidation] =
    useState<{ ok: boolean; message?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Optional: fetch captain email by id
  React.useEffect(() => {
    let mounted = true;
    async function fetchEmail() {
      try {
        if (!captainId) return;
        const res = await fetch(
          `/api/users/byId?userId=${encodeURIComponent(captainId)}`,
        );
        const json = await res.json();
        if (!mounted) return;
        if (res.ok && json.ok && json.data?.email) {
          setLeaderEmail(json.data.email);
        } else if (captainName) {
          // If you want name as fallback, uncomment:
          // setLeaderEmail(captainName);
        }
      } catch {
        // ignore
      }
    }
    fetchEmail();
    return () => {
      mounted = false;
    };
  }, [captainId, captainName]);

  function updateMember(i: number, val: string) {
    setMembers((prev) => prev.map((m, idx) => (idx === i ? val : m)));
  }

  function addMember() {
    setMembers((prev) => {
      if (maxSize && prev.length >= maxSize) {
        toast.error(`Maximum team size is ${maxSize}`);
        return prev;
      }
      return [...prev, ""];
    });
  }

  function removeMember(i: number) {
    setMembers((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const filtered = members.map((m) => m.trim()).filter(Boolean);

    if (!teamName.trim()) {
      toast.error("Team name required");
      return;
    }
    if (filtered.length < minSize) {
      toast.error(`Need at least ${minSize} member${minSize > 1 ? "s" : ""}`);
      return;
    }
    if (maxSize && filtered.length > maxSize) {
      toast.error(`Cannot exceed ${maxSize} members`);
      return;
    }

    if (useEmails) {
      const payload: Record<string, unknown> = {
        eventId,
        name: teamName.trim(),
        memberEmails: filtered,
      };
      if (leaderEmail && leaderEmail.trim()) {
        payload["captainEmail"] = leaderEmail.trim().toLowerCase();
      }

      startTransition(async () => {
        try {
          const res = await fetch(createAsCaptainEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const json = await res.json();
          if (!res.ok || !json.ok) {
            toast.error(json.error || "Failed to create team");
          } else {
            toast.success("Team registered");
            onSuccess?.(json.data.teamId);
          }
        } catch (err) {
          const msg =
            err instanceof Error ? err.message : "Network error";
          toast.error(msg);
        }
      });
    } else {
      const payload = {
        eventId,
        captainId,
        name: teamName.trim(),
        memberIds: filtered,
      };

      startTransition(async () => {
        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const json = await res.json();
          if (!res.ok || !json.ok) {
            toast.error(json.error || "Failed to create team");
          } else {
            toast.success("Team registered");
            onSuccess?.(json.data.teamId);
          }
        } catch (err) {
          const msg =
            err instanceof Error ? err.message : "Network error";
          toast.error(msg);
        }
      });
    }
  }

  return (
    <div className="h-full flex flex-col bg-transparent text-white">
      
      {onBack && (
          <Button
            variant="ghost"
            size="sm"
            className="border-white/40 text-white hover:bg-white/10 w-15"
            onClick={onBack}
          >
          <ArrowLeft className="mr-2 size-max" />
          </Button>
        )}
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <h2 className="text-2xl font-semibold">Team Registration</h2>
        
      </div>

      {/* Scrollable form area, nothing above it with pointer-events */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 px-6 pb-8 pt-2 overflow-y-auto space-y-4"
      >
        <ASMRStaticBackground />
        {/* Team name */}
        <div className="space-y-1 text-left">
          <label className="text-base font-medium">Team Name</label>
          <input
            className="w-full border border-white/20 bg-black/20 rounded px-3 py-2 text-sm outline-none focus:border-cyan-400"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Enter Team Name"
            required
          />
        </div>

        {/* Leader email */}
        <div className="space-y-1 text-left">
          <label className="text-base font-medium">Team Leader (Email)</label>
          <input
            className="w-full border border-white/20 bg-black/20 rounded px-3 py-2 text-sm outline-none focus:border-cyan-400"
            value={leaderEmail}
            placeholder="Team Leader's Email"
            onChange={(e) => {
              setLeaderEmail(e.target.value);
              setLeaderValidation(null);
            }}
            onBlur={async () => {
              const v = (leaderEmail || "").trim().toLowerCase();
              if (!v) {
                setLeaderValidation({
                  ok: false,
                  message: "Leader email required",
                });
                return;
              }
              if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) {
                setLeaderValidation({
                  ok: false,
                  message: "Invalid email format",
                });
                return;
              }
              try {
                const res = await fetch(
                  `/api/users/byEmail?email=${encodeURIComponent(v)}`,
                );
                const json = await res.json();
                if (!res.ok || !json.ok) {
                  setLeaderValidation({
                    ok: false,
                    message: "User not found",
                  });
                } else {
                  setLeaderValidation({ ok: true });
                }
              } catch {
                setLeaderValidation({
                  ok: false,
                  message: "Lookup failed",
                });
              }
            }}
          />
          {leaderValidation && !leaderValidation.ok && (
            <div className="text-xs text-red-400">
              {leaderValidation.message}
            </div>
          )}
        </div>

        {/* Members */}
        {maxSize === 0 && minSize === 0 ? (
          <div className="text-sm text-gray-300">
            Solo event – no additional members required.
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between">
              <label className="text-base font-medium">
                Team Members (Emails)
              </label>
              </div>
            {members.map((m, i) => (
              <div key={i} className="flex items-center gap-2 mb-3">
                <input
                  className="w-full border border-white/20 bg-black/20 rounded px-3 py-2 text-base outline-none focus:border-cyan-400"
                  value={m}
                  onChange={(e) => updateMember(i, e.target.value)}
                  placeholder={`Member #${i + 1} Email`}
                />
                <button
                  type="button"
                  onClick={() => removeMember(i)}
                  className="text-xs px-1 py-1 rounded-full  text-white disabled:opacity-50 hover:rotate-90 ease-linear transition-all duration-250"
                  disabled={members.length <= minSize}
                >
                  <X size={17} className="text-red-600"/>
                </button>
              </div>
            ))}
              <div className="">
                <button
                  type="button"
                  onClick={addMember}
                  className="relative left-1/2 top-7 -translate-x-1/2 -translate-y-1/2 h-10 inline-flex items-center text-sm px-4 rounded-full border border-white bg-transparent text-white hover:bg-gray-600 box-border cursor-pointer"
                >
                  Add Member
                </button>
              </div>
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          disabled={isPending}
          className="mt-4 w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold disabled:opacity-50"
        >
          {isPending ? "Registering..." : "Register"}
        </Button>

      </form>
    </div>
  );
}
