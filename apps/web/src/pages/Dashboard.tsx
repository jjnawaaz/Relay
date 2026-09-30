import { motion } from "motion/react";
import { MessageCircle, Users, MessagesSquare } from "lucide-react";
import { Link } from "react-router-dom";

import { Navbar } from "@/components/Navbar";

const rooms = [
  {
    id: "general",
    name: "General",
    description: "Talk about anything and everything.",
    members: 128,
  },
  {
    id: "developers",
    name: "Developers",
    description: "Discuss programming, projects and technology.",
    members: 84,
  },
  {
    id: "gaming",
    name: "Gaming",
    description: "Games, setups, releases and everything gaming.",
    members: 56,
  },
  {
    id: "random",
    name: "Random",
    description: "Casual conversations and random thoughts.",
    members: 42,
  },
  {
    id: "music",
    name: "Music",
    description: "Share music and talk about your favorite artists.",
    members: 31,
  },
  {
    id: "movies",
    name: "Movies & Shows",
    description: "Talk about movies, shows and recommendations.",
    members: 27,
  },
];

export function Dashboard() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 pb-10 pt-28 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <MessagesSquare className="size-6" />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight">Rooms</h1>

              <p className="text-sm text-muted-foreground">
                Find a conversation and join in.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Rooms */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: index * 0.06,
              }}
              className="group"
            >
              <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <MessageCircle className="size-5" />
                  </div>

                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Users className="size-4" />
                    {room.members}
                  </div>
                </div>

                <div className="flex-1">
                  <h2 className="text-lg font-semibold">{room.name}</h2>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {room.description}
                  </p>
                </div>

                <Link
                  to={`/rooms/${room.id}`}
                  className="mt-6 flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Join room
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
