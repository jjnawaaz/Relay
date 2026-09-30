import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          className="relative z-50 flex items-center gap-2"
          onClick={closeMenu}
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <span className="text-sm font-bold">R</span>
          </div>

          <span className="text-xl font-semibold tracking-tight">Relay</span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-3 md:flex">
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            <Link to="/dashboard">Dashboard</Link>
          </Button>
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun /> : <Moon />}
          </Button>

          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            <Link to="/signin">Login</Link>
          </Button>

          <Button className="rounded-full px-5">
            <Link to="/signup">Signup</Link>
          </Button>
        </div>

        {/* Mobile controls */}
        <div className="relative z-50 flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun /> : <Moon />}
          </button>

          <button
            type="button"
            onClick={() => setIsOpen((current) => !current)}
            className="relative flex size-10 items-center justify-center rounded-full text-foreground"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            <motion.span
              className="absolute h-0.5 w-5 rounded-full bg-current"
              animate={
                isOpen
                  ? {
                      rotate: 45,
                      y: 0,
                    }
                  : {
                      rotate: 0,
                      y: -6,
                    }
              }
              transition={{
                duration: 0.2,
                ease: "easeInOut",
              }}
            />

            <motion.span
              className="absolute h-0.5 w-5 rounded-full bg-current"
              animate={
                isOpen
                  ? {
                      opacity: 0,
                    }
                  : {
                      opacity: 1,
                    }
              }
              transition={{
                duration: 0.15,
              }}
            />

            <motion.span
              className="absolute h-0.5 w-5 rounded-full bg-current"
              animate={
                isOpen
                  ? {
                      rotate: -45,
                      y: 0,
                    }
                  : {
                      rotate: 0,
                      y: 6,
                    }
              }
              transition={{
                duration: 0.2,
                ease: "easeInOut",
              }}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{
              opacity: 0,
              y: -20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -20,
            }}
            transition={{
              duration: 0.25,
              ease: "easeOut",
            }}
            className="
        absolute inset-x-0 top-0 -z-10
        border-b border-border
        bg-background/95
        px-6 pb-6 pt-24
        backdrop-blur-xl
        shadow-[0_8px_20px_rgba(0,0,0,0.12)]
        dark:shadow-[0_8px_20px_rgba(0,0,0,0.35)]
        md:hidden
      "
          >
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
              >
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button
                variant="ghost"
                className="h-12 justify-center text-base shadow-none"
                onClick={closeMenu}
              >
                <Link to="/signin">Login</Link>
              </Button>

              <Button
                className="h-12 justify-center rounded-full text-base shadow-none"
                onClick={closeMenu}
              >
                <Link to="/signup">Signup</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
