'use client'
import Image from "next/image";
import { ModeToggle } from "@/components/ModeToggle";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import StarButton from "@/components/StarButton";
import Spline from "@splinetool/react-spline";
export default function Home() {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return null
  return (
    <div className="w-screen h-screen px-60">
      <div className="py-2 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-20 h-20 overflow-hidden rounded-full inline-block align-middle">
            {theme && resolvedTheme && <Image
              src={resolvedTheme === "light" ? "/photoeye-light.png" : "/photoeye.png"}
              alt="PhotoEye Logo"
              width={128}
              height={128}
              className="object-cover w-full h-full"
            />}
          </div>
          <span className="ml-4 text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent font-mono">
            PhotoEye
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <StarButton />
          <ModeToggle />
        </div>
      </div>

      <div style={{ position: 'relative', height: '500px', overflow: 'hidden' }}>
        {/* <ShapeBlur
          variation={0}
          pixelRatioProp={window.devicePixelRatio || 1}
          shapeSize={1}
          roundness={0.5}
          borderSize={0.05}
          circleSize={0.5}
          circleEdge={1}
        /> */}
        <Spline scene="https://prod.spline.design/cQL7zcFxCElzaoG8/scene.splinecode"/>
      </div>
    </div>
  );
}
