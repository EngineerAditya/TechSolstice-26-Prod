"use client";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

export type Event = {
  id: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  category: "tech" | "workshop" | "flagship" | "gaming";
  date: string;
  time: string;
  venue: string;
  imageUrl: string;
};

export function EventCard({ event }: { event: Event }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          whileHover={{
            scale: 1.03,
            boxShadow: "0 0 30px rgba(0, 200, 255, 0.4)",
            y: -5,
          }}
          className="cursor-pointer"
        >
          <Card className="h-full bg-white/5 border-white/10 rounded-2xl backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-cyan-500/50">
            <CardHeader>
              <div className="relative h-40 w-full mb-4">
                <Image
                  src={event.imageUrl}
                  alt={event.name}
                  fill
                  className="object-cover rounded-t-2xl"
                />
              </div>
              <Badge
                variant="outline"
                className="absolute top-6 right-6 bg-black/50 text-white border-white/20"
              >
                {event.category}
              </Badge>
              <CardTitle className="text-2xl font-bold tracking-tight text-white">
                {event.name}
              </CardTitle>
              <CardDescription className="text-neutral-300">
                {event.shortDescription}
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-between items-center text-sm text-neutral-400">
              <div className="flex items-center">
                <Calendar size={14} className="mr-2" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center">
                <MapPin size={14} className="mr-2" />
                <span>{event.venue}</span>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="bg-[#020617]/80 backdrop-blur-md border-cyan-500/50 text-white max-w-2xl">
        <DialogHeader>
          <div className="relative h-60 w-full mb-4">
            <Image
              src={event.imageUrl}
              alt={event.name}
              fill
              className="object-cover rounded-lg"
            />
          </div>
          <DialogTitle className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-cyan-400 to-purple-500">
            {event.name}
          </DialogTitle>
          <DialogDescription className="text-neutral-300 text-left">
            {event.longDescription}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4 text-sm">
          <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
            <Calendar size={16} className="text-cyan-400" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
            <Clock size={16} className="text-cyan-400" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
            <MapPin size={16} className="text-cyan-400" />
            <span>{event.venue}</span>
          </div>
        </div>
        <Button
          size="lg"
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold"
        >
          Register Now
        </Button>
      </DialogContent>
    </Dialog>
  );
}
