'use client'
import Image from "next/image";
import { ModeToggle } from "@/components/ModeToggle";
import { useTheme } from "next-themes";
import { useEffect, useState, useRef, useMemo, Suspense } from "react";
import StarButton from "@/components/StarButton";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Dynamically import Spline for client-side only
const Spline = dynamic(() => import("@splinetool/react-spline"), { ssr: false });

export default function Home() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const splineRef = useRef<any>(null);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (splineRef.current && splineRef.current.findObjectByName) {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = scrollY / totalHeight;

      try {
        const camera = splineRef.current.findObjectByName("Camera");
        const mainObject = splineRef.current.findObjectByName("Scene");
        if (camera) {
          camera.rotation.y = scrollProgress * Math.PI * 2;
          camera.position.z = 5 + scrollProgress * 3;
        }
        if (mainObject) {
          mainObject.rotation.y = scrollProgress * Math.PI * 4;
          mainObject.position.y = Math.sin(scrollProgress * Math.PI * 2) * 2;
        }
      } catch {}
    }
  }, [scrollY]);

  const onSplineLoad = (spline: any) => {
    splineRef.current = spline;
  };

  // Features = gameplay mechanics
  const features = useMemo(
    () => [
      {
        title: "Global Exploration",
        description:
          "Wander anywhere in the world through Street View and discover hidden gems without leaving home.",
        delay: 0,
      },
      {
        title: "AI Beauty Ranker",
        description:
          "Our AI model scores how visually stunning your photos are, and ranks them among other explorers.",
        delay: 0.2,
      },
      {
        title: "Community World Map",
        description:
          "Leave your photos behind on the global map and explore beautiful shots from players everywhere.",
        delay: 0.4,
      },
    ],
    []
  );

  // Gameplay flow (instead of tech buzzwords)
  const flow = useMemo(
    () => ["Explore", "Snap", "AI Rank", "Share"],
    []
  );

  const heroStyles = useMemo(
    () => ({
      h1: {
        transform: `translateY(${scrollY * 0.3}px)`,
        opacity: Math.max(0, 1 - scrollY / 800),
      },
      p: {
        transform: `translateY(${scrollY * 0.5}px)`,
        opacity: Math.max(0, 1 - scrollY / 600),
      },
      button: {
        transform: `translateY(${scrollY * 0.4}px)`,
        opacity: Math.max(0, 1 - scrollY / 700),
      },
    }),
    [scrollY]
  );

  if (!mounted) return null;

  return (
    <div className="relative">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="px-8 lg:px-60 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 overflow-hidden rounded-full inline-block align-middle">
              {theme && resolvedTheme && (
                <Image
                  src={
                    resolvedTheme === "light"
                      ? "/photoeye-light.png"
                      : "/photoeye.png"
                  }
                  alt="PhotoEye Logo"
                  width={48}
                  height={48}
                  className="object-cover w-full h-full"
                  priority
                />
              )}
            </div>
            <span className="ml-3 text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent font-mono">
              PhotoEye
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <StarButton />
            <Link href="/login">
              <Button className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:opacity-90">
                Log In
              </Button>
            </Link>
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Background 3D Scene */}
      <div className="fixed top-0 left-0 w-full h-full z-0">
        <Suspense fallback={null}>
          <Spline
            scene="https://prod.spline.design/cQL7zcFxCElzaoG8/scene.splinecode"
            onLoad={onSplineLoad}
          />
        </Suspense>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero */}
        <section className="h-screen flex items-center justify-center px-8 lg:px-60 pt-20">
          <div className="text-center max-w-4xl">
            <h1
              className="text-6xl lg:text-8xl font-extrabold mb-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
              style={heroStyles.h1}
            >
              Explore. Capture. Compete.
            </h1>
            <p
              className="text-xl lg:text-2xl mb-8 text-muted-foreground max-w-2xl mx-auto"
              style={heroStyles.p}
            >
              Travel the world through Street View, snap breathtaking shots, and
              see how your eye stacks up against others.
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:opacity-90 text-lg px-8 py-4"
              style={heroStyles.button}
            >
              Start Exploring
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="min-h-screen flex items-center px-8 lg:px-60 bg-background/90 backdrop-blur-sm">
          <div className="w-full">
            <h2
              className="text-5xl font-bold mb-16 text-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
              style={{
                transform: `translateX(${Math.max(
                  -100,
                  (scrollY - 800) * 0.3
                )}px)`,
                opacity: Math.min(1, Math.max(0, (scrollY - 600) / 400)),
              }}
            >
              Game Features
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300"
                  style={{
                    transform: `translateY(${Math.max(
                      50,
                      (scrollY - 1000 - index * 200) * -0.3
                    )}px)`,
                    opacity: Math.min(
                      1,
                      Math.max(0, (scrollY - 800 - index * 100) / 300)
                    ),
                  }}
                >
                  <h3 className="text-2xl font-bold mb-4 text-primary">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="min-h-screen flex items-center px-8 lg:px-60">
          <div className="w-full text-center">
            <h2
              className="text-5xl font-bold mb-8 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent"
              style={{
                transform: `scale(${Math.min(
                  1.2,
                  Math.max(0.8, 1 + (scrollY - 1800) * 0.0002)
                )})`,
                opacity: Math.min(1, Math.max(0, (scrollY - 1600) / 400)),
              }}
            >
              How It Works
            </h2>
            <p
              className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12"
              style={{
                transform: `translateY(${Math.max(
                  30,
                  (scrollY - 2000) * -0.2
                )}px)`,
                opacity: Math.min(1, Math.max(0, (scrollY - 1800) / 300)),
              }}
            >
              Explore any corner of the globe in Street View. Snap your shot.
              Let AI score its beauty. Share it with the community world map.
            </p>
            <div
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16"
              style={{
                opacity: Math.min(1, Math.max(0, (scrollY - 2200) / 400)),
              }}
            >
              {flow.map((step, index) => (
                <div
                  key={step}
                  className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20"
                  style={{
                    transform: `translateY(${Math.max(
                      40,
                      (scrollY - 2400 - index * 100) * -0.3
                    )}px) rotate(${(scrollY - 2400) * 0.02}deg)`,
                  }}
                >
                  <span className="text-lg font-semibold text-primary">
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="min-h-screen flex items-center justify-center px-8 lg:px-60 bg-gradient-to-br from-background/95 to-primary/5 backdrop-blur-sm">
          <div className="text-center max-w-4xl">
            <h2
              className="text-6xl font-extrabold mb-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
              style={{
                transform: `translateY(${Math.max(
                  50,
                  (scrollY - 3000) * -0.3
                )}px)`,
                opacity: Math.min(1, Math.max(0, (scrollY - 2800) / 400)),
              }}
            >
              Join the Global Photography Hunt
            </h2>
            <p
              className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto"
              style={{
                transform: `translateY(${Math.max(
                  30,
                  (scrollY - 3200) * -0.2
                )}px)`,
                opacity: Math.min(1, Math.max(0, (scrollY - 3000) / 300)),
              }}
            >
              Fill up the world map with your shots and see if your eye for
              beauty makes you a top explorer.
            </p>
            <div
              className="space-x-4"
              style={{
                opacity: Math.min(1, Math.max(0, (scrollY - 3400) / 300)),
              }}
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:opacity-90 text-lg px-8 py-4"
              >
                Start Exploring
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4 border-primary/30 hover:border-primary"
              >
                View World Map
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-16 px-8 lg:px-60 bg-background/90 backdrop-blur-sm border-t">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2025 PhotoEye. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
