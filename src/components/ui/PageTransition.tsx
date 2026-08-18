"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function PageTransition({ children, className, delay = 0 }: PageTransitionProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!isMounted) {
    return <div className={cn("animate-fade-in-up", className)}>{children}</div>;
  }

  return (
    <div
      className={cn(
        "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
        className
      )}
    >
      {children}
    </div>
  );
}

export function StaggeredContainer({ children, className, baseDelay = 50, stagger = 80 }: {
  children: React.ReactNode;
  className?: string;
  baseDelay?: number;
  stagger?: number;
}) {
  const childArray = React.Children.toArray(children);
  
  return (
    <div className={className}>
      {childArray.map((child, index) => {
        if (!React.isValidElement(child)) return child;
        
        return (
          <PageTransition key={child.key || index} delay={baseDelay + index * stagger}>
            {child}
          </PageTransition>
        );
      })}
    </div>
  );
}

export function FadeInUp({ children, delay = 0, className }: { 
  children: React.ReactNode; 
  delay?: number; 
  className?: string 
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn(
        "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SlideInFromLeft({ children, delay = 0, className }: { 
  children: React.ReactNode; 
  delay?: number; 
  className?: string 
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn(
        "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6",
        className
      )}
    >
      {children}
    </div>
  );
}

export function ScaleIn({ children, delay = 0, className }: { 
  children: React.ReactNode; 
  delay?: number; 
  className?: string 
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn(
        "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95",
        className
      )}
    >
      {children}
    </div>
  );
}