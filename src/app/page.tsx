'use client'
import Image from "next/image";
import ShapeBlur from "@/components/ShapeBlur";
import { ModeToggle } from "@/components/ModeToggle";
import Magnet from "@/components/Magnet";
import { Button } from "@/components/ui/button";
import { Link, Star } from "lucide-react";

export default function Home() {
  return (
    <div className="w-screen h-screen px-60">
      <div className="py-2 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-20 h-20 overflow-hidden rounded-full inline-block align-middle">
            <Image
              src="/photoeye.png"
              alt="PhotoEye Logo"
              width={128}
              height={128}
              className="object-cover w-full h-full"
            />
          </div>
          <span className="ml-4 text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent font-mono">
            PhotoEye
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <Magnet padding={200} disabled={false} magnetStrength={80}>
            <a href="https://github.com/We1chJ/PhotoEye" target="_blank" rel="noopener noreferrer">
              <Button variant="outline">
                Star on GitHub
                <Star />
              </Button>
            </a>
          </Magnet>
          <ModeToggle />
        </div>
      </div>

      <div style={{ position: 'relative', height: '500px', overflow: 'hidden' }}>
        <ShapeBlur
          variation={0}
          pixelRatioProp={window.devicePixelRatio || 1}
          shapeSize={1}
          roundness={0.5}
          borderSize={0.05}
          circleSize={0.5}
          circleEdge={1}
        />
      </div>
    </div>
  );
}
