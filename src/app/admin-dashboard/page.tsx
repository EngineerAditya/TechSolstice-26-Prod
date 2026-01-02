"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Search,
  Trophy,
  Users
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { EventForm } from "@/components/admin/event-form";
// Note: Ensure your EventForm handles the new 'starts_at' field logic

// Define the exact shape of your Event for Admin
export type AdminEvent = {
  id: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  category: string;
  venue: string;
  imageUrl: string;
  prize_pool: string;
  starts_at: string | null; // ISO String
  ends_at: string | null;   // ISO String
  min_team_size: number;
  max_team_size: number;
  is_reg_open: boolean;
};

export default function AdminDashboard() {
  const supabase = createClient();

  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AdminEvent | null>(null);

  // --- 1. FETCH DATA ---
  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("starts_at", { ascending: true });

    if (error) {
      console.error("Error fetching events:", error);
      alert("Failed to load events.");
    } else {
      setEvents(data as AdminEvent[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // --- 2. ACTIONS ---

  // Toggle Registration Open/Closed instantly
  const handleToggleReg = async (id: string, currentStatus: boolean) => {
    // Optimistic Update (Update UI before DB responds)
    setEvents(events.map(e => e.id === id ? { ...e, is_reg_open: !currentStatus } : e));

    const { error } = await supabase
      .from("events")
      .update({ is_reg_open: !currentStatus })
      .eq("id", id);

    if (error) {
      alert("Failed to update status");
      fetchEvents(); // Revert on error
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will delete the event and all associated teams.")) return;

    // Optimistic Delete
    const previousEvents = [...events];
    setEvents(events.filter(e => e.id !== id));

    const { error } = await supabase.from("events").delete().eq("id", id);

    if (error) {
      alert("Error deleting event: " + error.message);
      setEvents(previousEvents); // Revert
    }
  };

  const handleSave = async (formData: any) => {
    // This function is passed to your EventForm. 
    // It assumes EventForm returns a clean object ready for insertion.

    try {
      const payload = {
        ...formData,
        // Ensure dates are ISO strings or null
        starts_at: formData.starts_at ? new Date(formData.starts_at).toISOString() : null,
        ends_at: formData.ends_at ? new Date(formData.ends_at).toISOString() : null,
      };

      if (selectedEvent) {
        // UPDATE
        const { error } = await supabase
          .from("events")
          .update(payload)
          .eq("id", selectedEvent.id);
        if (error) throw error;
      } else {
        // CREATE
        const { error } = await supabase
          .from("events")
          .insert([payload]);
        if (error) throw error;
      }

      await fetchEvents();
      setIsFormOpen(false);
      setSelectedEvent(null);
    } catch (error: any) {
      alert("Save failed: " + error.message);
    }
  };

  // --- 3. FILTERING ---
  const filteredEvents = events.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const totalEvents = events.length;
  const activeEvents = events.filter(e => e.is_reg_open).length;

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-cyan-400">
      <Loader2 className="animate-spin h-8 w-8" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12 font-sans">
      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">
            Event Control Center
          </h1>
          <p className="text-neutral-500 mt-1">Manage events, registrations, and schedules.</p>
        </div>

        <div className="flex gap-4">
          {/* Quick Stats */}
          <div className="hidden md:flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
            <Trophy size={16} className="text-yellow-500" />
            <span className="text-sm font-bold">{totalEvents} <span className="text-neutral-500 font-normal">Total</span></span>
          </div>
          <div className="hidden md:flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
            <Users size={16} className="text-green-500" />
            <span className="text-sm font-bold">{activeEvents} <span className="text-neutral-500 font-normal">Active</span></span>
          </div>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 focus:border-cyan-500/50 rounded-xl"
          />
        </div>
        <Button
          onClick={() => { setSelectedEvent(null); setIsFormOpen(true); }}
          className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-xl"
        >
          <Plus className="mr-2 h-4 w-4" /> Create Event
        </Button>
      </div>

      {/* TABLE */}
      <div className="max-w-7xl mx-auto bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-neutral-400 font-medium">Event Name</TableHead>
              <TableHead className="text-neutral-400 font-medium">Category</TableHead>
              <TableHead className="text-neutral-400 font-medium">Date & Time</TableHead>
              <TableHead className="text-neutral-400 font-medium">Reg. Status</TableHead>
              <TableHead className="text-right text-neutral-400 font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-neutral-500">
                  No events found.
                </TableCell>
              </TableRow>
            ) : (
              filteredEvents.map((event) => (
                <TableRow key={event.id} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell className="font-medium text-white">
                    {event.name}
                    {event.max_team_size === 1 && (
                      <span className="ml-2 text-[10px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded border border-neutral-700">SOLO</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className="bg-white/5 text-neutral-300 border-white/10 hover:bg-white/10">
                      {event.category}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-neutral-400 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-cyan-500/70" />
                      {event.starts_at
                        ? new Date(event.starts_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                        : <span className="text-neutral-600 italic">TBA</span>}
                    </div>
                  </TableCell>

                  {/* TOGGLE SWITCH */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={event.is_reg_open}
                        onCheckedChange={() => handleToggleReg(event.id, event.is_reg_open)}
                        className="data-[state=checked]:bg-cyan-500"
                      />
                      <span className={`text-xs font-bold tracking-wide ${event.is_reg_open ? "text-green-400" : "text-red-400"}`}>
                        {event.is_reg_open ? "OPEN" : "CLOSED"}
                      </span>
                    </div>
                  </TableCell>

                  {/* ACTIONS */}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setSelectedEvent(event); setIsFormOpen(true); }}
                        className="hover:bg-cyan-500/10 hover:text-cyan-400 text-neutral-400"
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(event.id)}
                        className="hover:bg-red-500/10 hover:text-red-400 text-neutral-400"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* MODAL */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px] bg-[#111] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-cyan-400">
              {selectedEvent ? "Edit Event" : "Create New Event"}
            </DialogTitle>
          </DialogHeader>

          {/* Ensure your EventForm supports the new dark theme/props */}
          <EventForm
            onCancel={() => { setIsFormOpen(false); setSelectedEvent(null); }}
            onSave={handleSave}
            // @ts-ignore (We map the types inside the form usually, or update EventForm type)
            event={selectedEvent}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}