"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";

export const BackgroundBeamsWithCollision = ({
  className,
  position = "center",
  beamClassName,
  numberOfBeams = 30,
}: {
  className?: string;
  position?: "top" | "center" | "bottom";
  beamClassName?: string;
  numberOfBeams?: number;
}) => {
  const [beams, setBeams] = useState<
    Array<{
      x: number;
      y: number;
      width: number;
      height: number;
      speed: number;
      direction: number;
    }>
  >([]);

  const [particles, setParticles] = useState<
    Array<{
      x: number;
      y: number;
      size: number;
      opacity: number;
      speed: number;
    }>
  >([]);

  const positionClassName =
    position === "top"
      ? "top-0 left-0"
      : position === "center"
      ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      : "bottom-0 left-0";

  // Initial setup of beams
  useEffect(() => {
    const newBeams = Array(numberOfBeams)
      .fill(null)
      .map(() => {
        return {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          width: Math.random() * 20 + 150,
          height: 1.2,
          speed: Math.random() * 0.8 + 0.2,
          direction: Math.random() * 360, // direction in degrees
        };
      });

    setBeams(newBeams);

    return () => {};
  }, [numberOfBeams]);

  // Animate beams
  useEffect(() => {
    let animationId: number;
    let particleCreationInterval: NodeJS.Timeout;

    const checkCollision = (beam1: any, beam2: any) => {
      const dx = beam1.x - beam2.x;
      const dy = beam1.y - beam2.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < 20; // Collision distance threshold
    };

    const createParticles = (x: number, y: number) => {
      const newParticles = Array(5)
        .fill(null)
        .map(() => {
          return {
            x,
            y,
            size: Math.random() * 3 + 1,
            opacity: 1,
            speed: Math.random() * 2 + 1,
          };
        });

      setParticles((prevParticles) => [...prevParticles, ...newParticles]);
    };

    const animate = () => {
      setBeams((prevBeams) => {
        const updatedBeams = prevBeams.map((beam) => {
          const radians = (beam.direction * Math.PI) / 180;
          let newX = beam.x + Math.cos(radians) * beam.speed;
          let newY = beam.y + Math.sin(radians) * beam.speed;
          let newDirection = beam.direction;

          // Bounce off window edges
          if (newX < 0 || newX > window.innerWidth) {
            newDirection = 180 - newDirection;
          }
          if (newY < 0 || newY > window.innerHeight) {
            newDirection = 360 - newDirection;
          }

          return {
            ...beam,
            x: newX,
            y: newY,
            direction: newDirection,
          };
        });

        // Check for collisions
        for (let i = 0; i < updatedBeams.length; i++) {
          for (let j = i + 1; j < updatedBeams.length; j++) {
            if (checkCollision(updatedBeams[i], updatedBeams[j])) {
              // Create particles at collision point
              createParticles(
                (updatedBeams[i].x + updatedBeams[j].x) / 2,
                (updatedBeams[i].y + updatedBeams[j].y) / 2
              );

              // Adjust directions as if they "bounce" off each other
              const tempDir = updatedBeams[i].direction;
              updatedBeams[i].direction = updatedBeams[j].direction;
              updatedBeams[j].direction = tempDir;
            }
          }
        }

        return updatedBeams;
      });

      // Update particles
      setParticles((prevParticles) => {
        return prevParticles
          .map((particle) => ({
            ...particle,
            opacity: particle.opacity - 0.02,
            size: particle.size - 0.05,
          }))
          .filter((particle) => particle.opacity > 0 && particle.size > 0);
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    // Occasionally create particles at random spots
    particleCreationInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        createParticles(
          Math.random() * window.innerWidth,
          Math.random() * window.innerHeight
        );
      }
    }, 1000);

    return () => {
      cancelAnimationFrame(animationId);
      clearInterval(particleCreationInterval);
    };
  }, []);

  return (
    <div
      className={cn(
        "absolute h-full w-full overflow-hidden [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]",
        className
      )}
    >
      {/* Beams */}
      {beams.map((beam, idx) => (
        <div
          key={`beam-${idx}`}
          className={cn(
            "absolute opacity-[0.15] animate-pulse",
            beamClassName
          )}
          style={{
            top: `${beam.y}px`,
            left: `${beam.x}px`,
            width: `${beam.width}px`,
            height: `${beam.height}px`,
            transform: `rotate(${beam.direction}deg)`,
            background:
              "linear-gradient(to right, transparent, rgba(249, 115, 22, 0.6), transparent)",
          }}
        />
      ))}

      {/* Particles */}
      {particles.map((particle, idx) => (
        <div
          key={`particle-${idx}`}
          className="absolute rounded-full bg-orange-500"
          style={{
            top: `${particle.y}px`,
            left: `${particle.x}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
          }}
        />
      ))}
    </div>
  );
}; 