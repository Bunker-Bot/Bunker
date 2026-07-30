export const springPhysics = {
  type: 'spring' as const,
  stiffness: 320,
  damping: 30,
  mass: 0.8,
};

export const pageTransitionVariants = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.18 } },
};

export const drawerVariants = {
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.18 } },
  },
  panel: {
    initial: { x: 40, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: springPhysics },
    exit: { x: 40, opacity: 0, transition: { duration: 0.2 } },
  },
};

export const dialogVariants = {
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.18 } },
  },
  content: {
    initial: { opacity: 0, scale: 0.98, y: 4 },
    animate: { opacity: 1, scale: 1, y: 0, transition: springPhysics },
    exit: { opacity: 0, scale: 0.98, y: 4, transition: { duration: 0.15 } },
  },
};

export const cardContainerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const cardItemVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: springPhysics },
};

export const motionPresets = {
  springPhysics,
  pageTransitionVariants,
  drawerVariants,
  dialogVariants,
  cardContainerVariants,
  cardItemVariants,
};

export default motionPresets;
