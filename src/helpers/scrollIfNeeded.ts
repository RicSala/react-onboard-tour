export const scrollIfNeeded = (
  element: HTMLElement,
  padding = 100
): Promise<void> => {
  return new Promise((resolve) => {
    const rect = element.getBoundingClientRect();
    const isInView =
      rect.top >= padding && rect.bottom <= window.innerHeight - padding;

    if (!isInView) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Just wait for a reasonable amount of time for smooth scroll to complete
      setTimeout(resolve, 500);
    } else {
      resolve();
    }
  });
};
