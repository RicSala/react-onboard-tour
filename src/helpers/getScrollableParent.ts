// Helper function to find the scrollable parent of an element
export const getScrollableParentOrBody = (element: Element): HTMLElement => {
  let parent: HTMLElement | null = element.parentElement;

  while (parent) {
    const computedStyle = getComputedStyle(parent);
    const overflowY = computedStyle.overflowY;
    const overflowX = computedStyle.overflowX;
    const isScrollableY = overflowY === 'scroll' || overflowY === 'auto';
    const isScrollableX = overflowX === 'scroll' || overflowX === 'auto';

    const parentHasScroll =
      (isScrollableY && parent.scrollHeight > parent.clientHeight) ||
      (isScrollableX && parent.scrollWidth > parent.clientWidth);

    if (parentHasScroll) return parent; // Found a scrollable parent

    parent = parent.parentElement;
  }

  // No scrollable parent found, return document.body
  return document.body;
};
