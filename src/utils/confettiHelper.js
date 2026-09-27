import confetti from 'canvas-confetti';

export const triggerConfetti = {
  // Quick celebratory burst for quiz completion or lesson mark
  burst() {
    if (typeof window === 'undefined') return;
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#6366f1', '#ec4899', '#3b82f6', '#10b981', '#f59e0b']
    });
  },

  // Epic cannon for Level Up or Course Completion
  cannon() {
    if (typeof window === 'undefined') return;
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      colors: ['#ffd700', '#ff69b4', '#00ffff', '#7c3aed', '#10b981']
    };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  },

  // Star celebration for 100% quiz score
  stars() {
    if (typeof window === 'undefined') return;
    confetti({
      shapes: ['star'],
      particleCount: 80,
      spread: 360,
      ticks: 80,
      origin: { y: 0.5 },
      colors: ['#FFE400', '#FFBD00', '#E89400', '#FFCA3A']
    });
  }
};
