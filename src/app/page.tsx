'use client'
import Image from "next/image";
import ShapeBlur from "@/components/ShapeBlur";

export default function Home() {
  return (
    <div className="w-screen h-screen px-64">
      <div className="py-4 flex items-center">
        <div className="ml-2 w-20 h-20 overflow-hidden rounded-full inline-block align-middle">
          <Image
            src="/photoeye.png"
            alt="PhotoEye Logo"
            width={128}
            height={128}
            className="object-cover w-full h-full"
          />
        </div>
        <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent font-mono">
          PhotoEye
        </span>
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
