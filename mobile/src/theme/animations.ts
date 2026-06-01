export const animations = {
  durations: {
    instant: 150,
    fast: 250,
    normal: 350,
    slow: 500,
    deliberate: 750,
  },
  easing: {
    easeOut: [0.25, 0.1, 0.25, 1],
    easeInOut: [0.42, 0, 0.58, 1],
    spring: [0.34, 1.56, 0.64, 1],
    gentle: [0.2, 0.8, 0.2, 1],
  },
  presets: {
    twinkle: {
      opacity: [0.4, 1, 0.4],
      duration: 3000,
      loop: true,
    },
    float: {
      translateY: [-4, 4, -4],
      duration: 4000,
      loop: true,
    },
    pulse: {
      scale: [1, 1.02, 1],
      duration: 2000,
      loop: true,
    },
    orbit: {
      rotate: '0deg',
      duration: 20000,
      loop: true,
    },
    glow: {
      opacity: [0.6, 1, 0.6],
      duration: 2500,
      loop: true,
    },
  },
} as const
