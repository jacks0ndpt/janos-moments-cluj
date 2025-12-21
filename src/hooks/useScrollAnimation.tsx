import { useScroll, useTransform, useSpring, MotionValue } from 'framer-motion';
import { useRef } from 'react';

interface ScrollAnimationOptions {
  offset?: [string, string];
  smooth?: number;
}

export const useParallax = (
  distance: number = 100,
  options: ScrollAnimationOptions = {}
) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: (options.offset as any) || ['start end', 'end start'],
  });

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const y = useSpring(
    useTransform(scrollYProgress, [0, 1], [distance, -distance]),
    springConfig
  );

  return { ref, y, scrollYProgress };
};

export const useParallaxRange = (
  inputRange: [number, number] = [0, 1],
  outputRange: [number, number] = [0, -100],
  options: ScrollAnimationOptions = {}
) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: (options.offset as any) || ['start end', 'end start'],
  });

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const value = useSpring(
    useTransform(scrollYProgress, inputRange, outputRange),
    springConfig
  );

  return { ref, value, scrollYProgress };
};

export const useFadeOnScroll = (options: ScrollAnimationOptions = {}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: (options.offset as any) || ['start end', 'center center'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0.8]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [0.95, 1]);

  return { ref, opacity, scale, scrollYProgress };
};

export const useScrollScale = (
  scaleRange: [number, number] = [0.8, 1],
  options: ScrollAnimationOptions = {}
) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: (options.offset as any) || ['start end', 'center center'],
  });

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const scale = useSpring(
    useTransform(scrollYProgress, [0, 1], scaleRange),
    springConfig
  );

  return { ref, scale, scrollYProgress };
};

export default useParallax;
