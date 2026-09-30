import { motion } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  MessagesSquare,
  Plus,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/axios";

type Room = {
  id: number;
  room_name: string;
};

type Pagination = {
  page: number;
  limit: number;
  totalRooms: number;
  totalPages: number;
};

const ROOM_DESCRIPTION =
  "A place to connect, share ideas, and have conversations with others.";

const ROOMS_PER_PAGE = 6;

export function Dashboard() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: ROOMS_PER_PAGE,
    totalRooms: 0,
    totalPages: 0,
  });

  const [roomName, setRoomName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Used to refetch rooms after creating a room.
  const [refreshKey, setRefreshKey] = useState(0);

  /*
   * Debounce search input.
   *
   * The API won't be called for every character typed.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  /*
   * Fetch rooms whenever:
   *
   * - page changes
   * - debounced search changes
   * - refreshKey changes
   */
  useEffect(() => {
    const getRooms = async () => {
      try {
        setIsLoading(true);

        console.log("SEARCH:", debouncedSearch);

        const response = await api.get("/room/get-room", {
          params: {
            page,
            limit: ROOMS_PER_PAGE,
            search: debouncedSearch,
          },
        });

        console.log("ROOM RESPONSE:", response.data);

        setRooms(response.data.rooms ?? []);

        setPagination(
          response.data.pagination ?? {
            page,
            limit: ROOMS_PER_PAGE,
            totalRooms: 0,
            totalPages: 0,
          },
        );
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getRooms();
  }, [page, debouncedSearch, refreshKey]);

  const handleCreateRoom = async () => {
    const trimmedRoomName = roomName.trim();

    if (!trimmedRoomName) {
      toast.error("Please enter a room name");
      return;
    }

    try {
      setIsCreating(true);

      await api.post("/room/create-room", {
        room_name: trimmedRoomName,
      });

      /*
       * Trigger the room-fetching effect again.
       */
      setRefreshKey((current) => current + 1);

      setRoomName("");
      setDialogOpen(false);

      toast.success("Room created successfully");
    } catch (error) {
      console.error("Failed to create room:", error);

      toast.error("Failed to create room");
    } finally {
      setIsCreating(false);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage((currentPage) => currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (page < pagination.totalPages) {
      setPage((currentPage) => currentPage + 1);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 pb-10 pt-28 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
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

          {/* Create Room */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              render={
                <Button className="gap-2 rounded-xl">
                  <Plus className="size-4" />
                  Create room
                </Button>
              }
            />

            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create a room</DialogTitle>

                <DialogDescription>
                  Give your room a name and start a conversation.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label htmlFor="room-name" className="text-sm font-medium">
                    Room name
                  </label>

                  <Input
                    id="room-name"
                    value={roomName}
                    onChange={(event) => setRoomName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        handleCreateRoom();
                      }
                    }}
                    placeholder="e.g. Developers"
                    disabled={isCreating}
                    autoFocus
                  />
                </div>

                <Button
                  onClick={handleCreateRoom}
                  disabled={isCreating}
                  className="w-full rounded-xl"
                >
                  {isCreating ? "Creating room..." : "Create room"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Search */}
        <div className="mb-8 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search rooms..."
              className="h-11 rounded-xl pl-10"
            />
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(ROOMS_PER_PAGE)].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.05,
                }}
                className="relative h-56 overflow-hidden rounded-2xl border border-border bg-card p-6"
              >
                {/* Shimmer */}
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    ease: "linear",
                    delay: index * 0.1,
                  }}
                  className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-foreground/[0.04] to-transparent"
                />

                {/* Icon */}
                <div className="relative mb-5 size-11 rounded-xl bg-muted" />

                {/* Title */}
                <div className="relative h-5 w-2/3 rounded-md bg-muted" />

                {/* Description */}
                <div className="relative mt-3 space-y-2">
                  <div className="h-3 w-full rounded-md bg-muted" />
                  <div className="h-3 w-5/6 rounded-md bg-muted" />
                  <div className="h-3 w-2/3 rounded-md bg-muted" />
                </div>

                {/* Button */}
                <div className="relative mt-6 h-10 w-full rounded-md bg-muted" />
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && rooms.length === 0 && (
          <div className="flex min-h-56 items-center justify-center rounded-2xl border border-dashed border-border">
            <p className="text-sm text-muted-foreground">
              {debouncedSearch ? "No rooms found." : "No rooms available yet."}
            </p>
          </div>
        )}

        {/* Rooms */}
        {!isLoading && rooms.length > 0 && (
          <>
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
                    </div>

                    <div className="flex-1">
                      <h2 className="text-lg font-semibold">
                        {room.room_name}
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {ROOM_DESCRIPTION}
                      </p>
                    </div>

                    <Link
                      to={`/rooms/${room.id}`}
                      className="
                        mt-6 flex h-10 w-full items-center justify-center
                        rounded-md px-4 py-2 text-sm font-medium
                        bg-primary text-primary-foreground
                        transition-all duration-300
                        hover:-translate-y-0.5
                        hover:bg-primary/90
                        dark:hover:bg-accent
                        dark:hover:text-accent-foreground
                        dark:hover:shadow-[0_0_20px_hsl(var(--accent)/0.2)]
                      "
                    >
                      Join room
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePreviousPage}
                  disabled={page === 1 || isLoading}
                  className="rounded-xl"
                >
                  <ChevronLeft className="size-4" />
                </Button>

                <span className="min-w-24 text-center text-sm text-muted-foreground">
                  Page {page} of {pagination.totalPages}
                </span>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextPage}
                  disabled={page === pagination.totalPages || isLoading}
                  className="rounded-xl"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
