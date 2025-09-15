export const scrollIfNeeded = (
  element: HTMLElement,
  padding = 100
): Promise<void> => {
  return new Promise((resolve) => {
    const rect = element.getBoundingClientRect();
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    });
    setTimeout(resolve, 500);
  });
};
