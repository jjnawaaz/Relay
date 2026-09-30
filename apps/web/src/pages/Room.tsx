import { ArrowLeft, Send, Users } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const messages = [
  {
    id: 1,
    user: "Alex",
    message: "Hey everyone 👋",
    time: "3:12 PM",
  },
  {
    id: 2,
    user: "Sarah",
    message: "Hey! How's everyone doing?",
    time: "3:13 PM",
  },
  {
    id: 3,
    user: "Alex",
    message: "Pretty good! Just working on a new project.",
    time: "3:14 PM",
  },
];

export function Room() {
  const { roomId } = useParams();

  const roomName = roomId?.charAt(0).toUpperCase() + roomId?.slice(1);

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Room header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="rounded-full"
            >
              <Link to="/dashboard">
                <ArrowLeft className="size-5" />
              </Link>
            </Button>

            <div>
              <h1 className="font-semibold">{roomName}</h1>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="size-3.5" />
                128 members
              </div>
            </div>
          </div>

          <div className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <span className="text-sm font-bold">R</span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-6 py-8">
          {messages.map((message) => (
            <div key={message.id} className="flex gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
                {message.user.charAt(0)}
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold">{message.user}</span>

                  <span className="text-xs text-muted-foreground">
                    {message.time}
                  </span>
                </div>

                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {message.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message input */}
      <div className="border-t border-border bg-background">
        <div className="mx-auto w-full max-w-4xl px-6 py-4">
          <form className="flex items-center gap-3">
            <Input
              placeholder={`Message #${roomName?.toLowerCase()}`}
              className="h-12 rounded-xl"
            />

            <Button
              type="submit"
              size="icon"
              className="size-12 shrink-0 rounded-xl"
            >
              <Send className="size-5" />
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
