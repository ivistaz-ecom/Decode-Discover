import gsap from "gsap";

export const EASE_OUT = "power3.out";
export const EASE_ELASTIC = "back.out(1.4)";

export function fadeUp(
  target: gsap.TweenTarget,
  options?: { delay?: number; y?: number; duration?: number; stagger?: number }
) {
  const { delay = 0, y = 28, duration = 0.65, stagger = 0 } = options ?? {};
  return gsap.from(target, {
    opacity: 0,
    y,
    duration,
    delay,
    stagger,
    ease: EASE_OUT,
  });
}

export function fadeIn(
  target: gsap.TweenTarget,
  options?: { delay?: number; duration?: number }
) {
  const { delay = 0, duration = 0.5 } = options ?? {};
  return gsap.from(target, { opacity: 0, duration, delay, ease: EASE_OUT });
}

export function scaleIn(
  target: gsap.TweenTarget,
  options?: { delay?: number; duration?: number }
) {
  const { delay = 0, duration = 0.55 } = options ?? {};
  return gsap.from(target, {
    opacity: 0,
    scale: 0.92,
    duration,
    delay,
    ease: EASE_ELASTIC,
  });
}

export function countUp(
  element: HTMLElement,
  endValue: number,
  options?: { duration?: number; delay?: number }
) {
  const { duration = 1.4, delay = 0 } = options ?? {};
  const counter = { value: 0 };
  return gsap.to(counter, {
    value: endValue,
    duration,
    delay,
    ease: "power2.out",
    onUpdate: () => {
      element.textContent = String(Math.round(counter.value));
    },
  });
}

export function attachHoverLift(element: HTMLElement) {
  const onEnter = () =>
    gsap.to(element, { y: -2, scale: 1.02, duration: 0.25, ease: EASE_OUT });
  const onLeave = () =>
    gsap.to(element, { y: 0, scale: 1, duration: 0.3, ease: EASE_OUT });

  element.addEventListener("mouseenter", onEnter);
  element.addEventListener("mouseleave", onLeave);

  return () => {
    element.removeEventListener("mouseenter", onEnter);
    element.removeEventListener("mouseleave", onLeave);
  };
}
