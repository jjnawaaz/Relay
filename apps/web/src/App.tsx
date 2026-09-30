import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";

import { Dashboard } from "@/pages/Dashboard";
import { Room } from "@/pages/Room";
import { SignIn } from "@/pages/SignIn";
import { SignUp } from "@/pages/SignUp";

function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/signin" element={<SignIn />} />

        <Route path="/signup" element={<SignUp />} />

        {/* Public for now */}
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/rooms/:roomId" element={<Room />} />
      </Routes>
    </BrowserRouter>
  );
}
