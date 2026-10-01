import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignupSchema, type SignupType } from "@repo/api_contracts";
import { ThemeToggle } from "@/components/ThemeToggle";
import { api } from "@/lib/axios";

export function SignUp() {
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupType>({
    resolver: zodResolver(SignupSchema),
  });

  const onSubmit = async (data: SignupType) => {
    try {
      await api.post("/user/signup", data);

      toast.success("Account created successfully");

      navigate("/signin");
    } catch (error) {
      console.error("Signup failed:", error);

      toast.error("Failed to create account");
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-8">
        {/* Logo */}
        <div className="flex items-center justify-between">
          <Link to="/" className="relative z-50 flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <span className="text-sm font-bold">R</span>
            </div>

            <span className="text-xl font-semibold tracking-tight">Relay</span>
          </Link>

          <ThemeToggle />
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="my-auto py-10"
        >
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Create your account
            </h1>

            <p className="mt-3 text-sm text-muted-foreground">
              Start connecting with people on Relay.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>

              <Input
                id="name"
                type="text"
                placeholder="Your name"
                autoComplete="name"
                {...register("name")}
                className="h-12 rounded-xl"
              />

              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>

              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                {...register("email")}
                className="h-12 rounded-xl"
              />

              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="new-password"
                  {...register("password")}
                  className="h-12 rounded-xl pr-12"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="size-5" />
                  ) : (
                    <Eye className="size-5" />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 w-full rounded-xl text-base transition-colors dark:hover:bg-accent dark:hover:text-accent-foreground"
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>
          </form>

          {/* Sign in */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/signin"
              className="font-semibold text-accent hover:underline"
            >
              Sign in
            </Link>
          </p>
        </motion.div>

        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Relay
        </p>
      </div>
    </main>
  );
}
