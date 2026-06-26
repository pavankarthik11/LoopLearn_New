import React from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import Footer from '../../components/student/Footer'
import { useNavigate } from 'react-router-dom';

// Simple Button Component
const Button = ({ children, variant, className = "", ...props }) => {
  const base =
    "px-6 py-2 rounded-xl font-medium transition duration-300";

  const styles =
    variant === "outline"
      ? "border border-indigo-600 text-indigo-600 bg-transparent hover:bg-indigo-100"
      : "bg-indigo-600 text-white hover:bg-indigo-700";

  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const particlesInit = async (main) => {
    console.log("Particles initialized");
    await loadFull(main);
  };

  return (
    <>
    <div className="relative w-full h-screen bg-white overflow-hidden">
      {/* Particle Background */}
      <Particles
        className="absolute inset-0 z-0"
        id="tsparticles"
        init={particlesInit}
        options={{
          fullScreen: false,
          background: {
            color: {
              value: "#f9fafb",
            },
          },
          fpsLimit: 60,
          interactivity: {
            events: {
              onHover: {
                enable: true,
                mode: "repulse",
              },
              resize: true,
            },
            modes: {
              repulse: {
                distance: 100,
                duration: 0.4,
              },
            },
          },
          particles: {
            color: {
              value: "#6366f1",
            },
            links: {
              color: "#6366f1",
              distance: 150,
              enable: true,
              opacity: 0.5,
              width: 1,
            },
            move: {
              direction: "none",
              enable: true,
              outMode: "bounce",
              random: false,
              speed: 2,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
              value: 50,
            },
            opacity: {
              value: 0.5,
            },
            shape: {
              type: "circle",
            },
            size: {
              value: 3,
            },
          },
          detectRetina: true,
        }}
      />

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6 md:px-12">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 leading-tight mb-6">
          Welcome to <span className="text-indigo-600">LoopLearn</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-8">
          A smart peer-to-peer skill exchange platform where you can teach,
          learn, and connect. Whether you're a pro or a beginner — LoopLearn matches
          you with the right partners.
        </p>
        <div className="flex gap-4">
          <Button onClick={() => navigate('/register')}>Get Started</Button>
          <Button variant="outline">Learn More</Button>
        </div>
      </div>
    </div>
      <Footer />
    </>
  );
};

export default LandingPage;
