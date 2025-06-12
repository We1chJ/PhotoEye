'use client'
import { useEffect, useState, useRef } from 'react';
import { useTheme } from 'next-themes';

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const { theme, resolvedTheme } = useTheme();

  // Get the current theme color
  const currentTheme = resolvedTheme || theme;
  const isLightTheme = currentTheme === 'light';
  const cursorColor = isLightTheme ? '#000000' : '#ffffff';
  const crosshairColor = isLightTheme ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)';
  const shadowColor = isLightTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  useEffect(() => {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const updateMousePosition = (e: { clientX: number; clientY: number; }) => {
      targetX = e.clientX;
      targetY = e.clientY;
      // Show cursor immediately when mouse moves
      if (!isVisible) {
        setIsVisible(true);
      }
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    // Check if mouse is already in the window on component mount
    const checkInitialMousePosition = () => {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        setIsVisible(true);
      }, 100);
    };
    
    const handleMouseDown = () => {
      setIsClicked(true);
      setTimeout(() => setIsClicked(false), 50);
    };

    // Smooth animation loop - change ease value to control speed
    const animate = () => {
      const ease = 0.95; // Increased from 0.12 for faster following (higher = faster)
      currentX += (targetX - currentX) * ease;
      currentY += (targetY - currentY) * ease;
      
      setMousePosition({ x: currentX, y: currentY });
      animationRef.current = requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', updateMousePosition);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mousedown', handleMouseDown);
    
    // Check initial state
    checkInitialMousePosition();
    
    animate();

    return () => {
      document.removeEventListener('mousemove', updateMousePosition);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mousedown', handleMouseDown);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className={`custom-cursor ${isVisible ? 'visible' : ''} ${isClicked ? 'clicked' : ''}`}
        style={{
          left: mousePosition.x,
          top: mousePosition.y,
        }}
      >
        {/* Corner elements for the frame effect */}
        <div className="corner corner-tl"></div>
        <div className="corner corner-tr"></div>
        <div className="corner corner-bl"></div>
        <div className="corner corner-br"></div>
        
        {/* Center crosshair */}
        <div className="crosshair-h"></div>
        <div className="crosshair-v"></div>
        
        {/* Scanning line effect */}
        <div className="scan-line"></div>
      </div>
    </>
  );
};

export default CustomCursor;