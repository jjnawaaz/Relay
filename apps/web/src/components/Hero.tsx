import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import gsap from "gsap";
import { useEffect, useRef } from "react";

export function Hero() {
  const typingRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const textElement = typingRef.current;
    const cursorElement = cursorRef.current;

    if (!textElement || !cursorElement) return;

    const text = "Chat.";

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline();

      // Type: C → Ch → Cha → Chat
      text.split("").forEach((_, index) => {
        timeline.call(() => {
          textElement.textContent = text.slice(0, index + 1);
        });

        timeline.to({}, { duration: 0.18 });
      });

      // Small pause with "Chat"
      timeline.to({}, { duration: 0.8 });

      // Delete: Chat → Cha → Ch → C → ""
      [...text].reverse().forEach((_, index) => {
        timeline.call(() => {
          textElement.textContent = text.slice(0, text.length - index - 1);
        });

        timeline.to({}, { duration: 0.14 });
      });

      // Type it again: C → Ch → Cha → Chat
      text.split("").forEach((_, index) => {
        timeline.call(() => {
          textElement.textContent = text.slice(0, index + 1);
        });

        timeline.to({}, { duration: 0.18 });
      });

      // Keep "Chat" permanently
      timeline.call(() => {
        textElement.textContent = text;
      });

      // Cursor keeps blinking forever independently
      gsap.to(cursorElement, {
        opacity: 0,
        duration: 0.5,
        repeat: -1,
        yoyo: true,
        ease: "steps(1)",
      });
    });

    return () => ctx.revert();
  }, []);
  return (
    <section className="relative isolate overflow-hidden">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[500px] w-[700px]
        -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]"
      />

      <div
        className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl
        items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:gap-20"
      >
        {/* Left */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex flex-col items-center text-center lg:items-start lg:text-left"
        >
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="
              mb-5
              w-fit
              rounded-full
              border border-border
              bg-muted/50
              px-4 py-1.5
              text-sm text-muted-foreground
              sm:self-center
            "
          >
            Built for conversations that matter
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="
              mx-auto
              max-w-2xl
              text-5xl font-bold tracking-tight
              leading-[0.95]
              text-center
              sm:text-6xl
              lg:text-7xl
            "
          >
            <span className="inline-flex items-baseline">
              <span ref={typingRef} />

              <span
                ref={cursorRef}
                className="
                ml-1
                inline-block
                h-[0.8em]
                w-[3px]
                translate-y-[0.05em]
                rounded-full
                bg-accent
              "
              />
            </span>
            <span className="text-accent"> Connect.</span>
            <br />
            Create.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground"
          >
            A fast, simple and real-time way to connect with people. Start
            conversations, share ideas and stay connected without getting in the
            way.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Button
              size="lg"
              className="h-12 rounded-full px-8 text-base transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent/80 dark:hover:bg-accent dark:hover:text-accent-foreground"
            >
              Get started
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-full px-8 text-base transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:bg-accent hover:text-accent-foreground dark:hover:border-accent dark:hover:bg-accent dark:hover:text-accent-foreground"
            >
              Learn more
            </Button>
          </motion.div>
        </motion.div>

        {/* Right - SVG */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: 30 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{
            delay: 0.25,
            duration: 0.8,
            ease: "easeOut",
          }}
          className="relative flex items-center justify-center"
        >
          <div
            className="
      pointer-events-none absolute inset-10 -z-10
      rounded-full bg-green-500/10 blur-[90px]
    "
          />

          <motion.img
            src="/hero.svg"
            alt="Real-time chat illustration"
            className="w-full max-w-[500px]"
            animate={{
              y: [0, -10, 0],
              rotate: [0, 0.4, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </div>
    </section>
  );
}
