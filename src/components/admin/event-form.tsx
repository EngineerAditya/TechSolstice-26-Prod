"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

// Helper to format ISO date for datetime-local input (YYYY-MM-DDTHH:mm)
const formatDateForInput = (isoString: string | null) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  // Adjust for timezone offset to show local time in input
  const offset = date.getTimezoneOffset() * 60000;
  const localISOTime = new Date(date.getTime() - offset).toISOString().slice(0, 16);
  return localISOTime;
};

interface EventFormProps {
  onCancel: () => void;
  onSave: (data: any) => void;
  event?: any; // We use 'any' here to be flexible, or you can import the AdminEvent type
}

export function EventForm({ onCancel, onSave, event }: EventFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    shortDescription: "",
    longDescription: "",
    category: "Flagship",
    venue: "",
    imageUrl: "",
    prize_pool: "",
    min_team_size: 1,
    max_team_size: 1,
    starts_at: "",
    ends_at: "",
    registration_starts_at: "",
  });

  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name || "",
        shortDescription: event.shortDescription || "",
        longDescription: event.longDescription || "",
        category: event.category || "Flagship",
        venue: event.venue || "",
        imageUrl: event.imageUrl || "",
        prize_pool: event.prize_pool || "",
        min_team_size: event.min_team_size || 1,
        max_team_size: event.max_team_size || 1,
        starts_at: formatDateForInput(event.starts_at),
        ends_at: formatDateForInput(event.ends_at),
        registration_starts_at: formatDateForInput(event.registration_starts_at),
      });
    }
  }, [event]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Pass data back to parent
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-white">

      {/* Name & Category */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Event Name</Label>
          <Input
            id="name" name="name"
            value={formData.name} onChange={handleChange} required
            className="bg-white/5 border-white/10"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
          >
            <SelectTrigger className="bg-white/5 border-white/10">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Flagship">Flagship</SelectItem>
              <SelectItem value="Technology">Technology</SelectItem>
              <SelectItem value="Gaming">Gaming</SelectItem>
              <SelectItem value="Conference">Conference</SelectItem>
              <SelectItem value="Sports">Sports</SelectItem>
              <SelectItem value="Cultural">Cultural</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Team Size Logic */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="min_team_size">Min Team Size</Label>
          <Input
            type="number" id="min_team_size" name="min_team_size"
            value={formData.min_team_size} onChange={handleChange} min={1} required
            className="bg-white/5 border-white/10"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max_team_size">Max Team Size</Label>
          <Input
            type="number" id="max_team_size" name="max_team_size"
            value={formData.max_team_size} onChange={handleChange} min={1} required
            className="bg-white/5 border-white/10"
          />
        </div>
      </div>

      {/* Descriptions */}
      <div className="space-y-2">
        <Label htmlFor="shortDescription">Short Description (Card)</Label>
        <Input
          id="shortDescription" name="shortDescription"
          value={formData.shortDescription} onChange={handleChange}
          className="bg-white/5 border-white/10"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="longDescription">Long Description (Details)</Label>
        <Textarea
          id="longDescription" name="longDescription"
          value={formData.longDescription} onChange={handleChange} rows={4}
          className="bg-white/5 border-white/10"
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="starts_at">Event Start Time</Label>
          <Input
            type="datetime-local" id="starts_at" name="starts_at"
            value={formData.starts_at} onChange={handleChange} required
            className="bg-white/5 border-white/10 text-neutral-400"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ends_at">Event End Time</Label>
          <Input
            type="datetime-local" id="ends_at" name="ends_at"
            value={formData.ends_at} onChange={handleChange} required
            className="bg-white/5 border-white/10 text-neutral-400"
          />
        </div>
      </div>

      {/* Reg Start & Prize */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="registration_starts_at">Registration Starts</Label>
          <Input
            type="datetime-local" id="registration_starts_at" name="registration_starts_at"
            value={formData.registration_starts_at} onChange={handleChange}
            className="bg-white/5 border-white/10 text-neutral-400"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="prize_pool">Prize Pool (e.g. 5000)</Label>
          <Input
            id="prize_pool" name="prize_pool"
            value={formData.prize_pool} onChange={handleChange}
            className="bg-white/5 border-white/10"
          />
        </div>
      </div>

      {/* Venue & Image */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="venue">Venue</Label>
          <Input
            id="venue" name="venue"
            value={formData.venue} onChange={handleChange} required
            className="bg-white/5 border-white/10"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input
            id="imageUrl" name="imageUrl"
            value={formData.imageUrl} onChange={handleChange}
            className="bg-white/5 border-white/10"
            placeholder="/events/hackathon.jpg"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t border-white/10">
        <Button type="button" variant="ghost" onClick={onCancel} className="hover:bg-white/10">
          Cancel
        </Button>
        <Button type="submit" className="bg-cyan-500 text-black hover:bg-cyan-600 font-bold">
          {event ? "Update Event" : "Create Event"}
        </Button>
      </div>
    </form>
  );
}