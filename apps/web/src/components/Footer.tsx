import { Mail } from "lucide-react";
import {
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
} from "react-icons/fa6";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          {/* Brand */}
          <div className="max-w-sm">
            <div className="text-xl font-bold tracking-tight">
              <span>Relay</span>
              <span className="text-accent">.</span>
            </div>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Fast, simple and real-time conversations built for people who want
              to stay connected.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-x-16 gap-y-8 sm:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Product</h3>

              <ul className="mt-4 space-y-3">
                <li>
                  <button
                    type="button"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Features
                  </button>
                </li>

                <li>
                  <button
                    type="button"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Pricing
                  </button>
                </li>

                <li>
                  <button
                    type="button"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Changelog
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground">Company</h3>

              <ul className="mt-4 space-y-3">
                <li>
                  <button
                    type="button"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    About
                  </button>
                </li>

                <li>
                  <button
                    type="button"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Contact
                  </button>
                </li>

                <li>
                  <button
                    type="button"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    GitHub
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground">Legal</h3>

              <ul className="mt-4 space-y-3">
                <li>
                  <button
                    type="button"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Privacy
                  </button>
                </li>

                <li>
                  <button
                    type="button"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Terms
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Relay. All rights reserved.
          </p>

          {/* Socials */}
          <div className="flex items-center gap-2">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <FaGithub className="h-4 w-4" />
            </a>

            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <FaXTwitter className="h-4 w-4" />
            </a>

            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <FaInstagram className="h-4 w-4" />
            </a>

            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <FaLinkedinIn className="h-4 w-4" />
            </a>

            <a
              href="mailto:"
              aria-label="Email"
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
