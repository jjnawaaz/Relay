import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

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
      </Routes>
    </BrowserRouter>
  );
}
