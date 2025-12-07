import { Suspense } from "react";
import { motion } from "framer-motion";
import { type Event } from "@/components/event-card";
import { EventsClient } from "@/components/events-client";
import { StarfieldBackground } from "@/components/starfield-bg";

// MOCK DATA FOR NOW
// In a real app, you'd fetch this from Supabase or your backend
async function getEvents(): Promise<Event[]> {
  return [
    {
      id: "evt-001",
      name: "Quantum Entanglement Workshop",
      shortDescription: "A hands-on workshop on quantum computing principles.",
      longDescription:
        "Dive deep into the world of quantum mechanics. This workshop covers qubits, superposition, and entanglement with live demos on a quantum simulator. No prior quantum physics knowledge required, but a strong foundation in linear algebra is recommended.",
      category: "workshop",
      date: "Stardate 7812.4",
      time: "14:00-16:00 ZT",
      venue: "Holodeck 3, Starship Enterprise",
      imageUrl: "/events/quantum-workshop.png",
    },
    {
      id: "evt-002",
      name: "Project Chimera: The AI Revolution",
      shortDescription: "The flagship event showcasing the future of AGI.",
      longDescription:
        "Witness the unveiling of Project Chimera, a revolutionary step towards Artificial General Intelligence. Our keynote speakers will discuss the ethical implications, potential, and the future of human-AI collaboration.",
      category: "flagship",
      date: "Stardate 7810.2",
      time: "09:00 ZT",
      venue: "Celestial Arena",
      imageUrl: "/events/ai-revolution.png",
    },
    {
      id: "evt-003",
      name: "Cybernetic Augmentation Expo",
      shortDescription: "Explore the latest in human-machine interfaces.",
      longDescription:
        "From neural laces to bionic limbs, the Cybernetic Augmentation Expo is the premier event for transhumanist technology. Interact with pioneers and see the latest breakthroughs that are blurring the lines between human and machine.",
      category: "tech",
      date: "Stardate 7811.8",
      time: "10:00-18:00 ZT",
      venue: "Titan Station, Engineering Deck",
      imageUrl: "/events/cybernetics-expo.png",
    },
    {
      id: "evt-004",
      name: "Zero-G Robotics Tournament",
      shortDescription: "High-speed drone racing and combat in zero gravity.",
      longDescription:
        "Teams from across the galaxy will compete in a high-stakes robotics tournament. Events include zero-gravity drone racing, autonomous bot battles, and a grand finale that you won't want to miss.",
      category: "gaming",
      date: "Stardate 7812.1",
      time: "12:00 ZT",
      venue: "The Void",
      imageUrl: "/events/robotics-tournament.png",
    },
  ];
}


const EventsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const params = await searchParams;
  
  const allEvents = await getEvents();

  const category =
    typeof params?.category === "string"
      ? params.category.toLowerCase()
      : "all";
  const searchTerm =
    typeof params?.q === "string" ? params.q.toLowerCase() : "";

  const filteredEvents = allEvents
    .filter((event) => {
      if (category === "all") return true;
      return event.category.toLowerCase() === category;
    })
    .filter((event) => event.name.toLowerCase().includes(searchTerm));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
      {/* Starfield Background */}
      {/* <StarfieldBackground /> */}

      {/* Client Component handles filtering UI and display */}
      <Suspense fallback={<div className="p-8">Loading events...</div>}>
        <EventsClient
          initialEvents={filteredEvents}
          initialCategory={category}
          initialSearch={searchTerm}
        />
      </Suspense>
    </div>
  );
};

export default EventsPage;



