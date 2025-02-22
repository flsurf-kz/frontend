export function onClickOutside(
    node: HTMLElement,
    callback: () => void
  ): { destroy: () => void } {
    function handleClick(event: MouseEvent) {
      if (node && !node.contains(event.target as Node)) {
        callback(); // Run the provided callback function
      }
    }
  
    document.addEventListener("click", handleClick, true);
  
    return {
      destroy() {
        document.removeEventListener("click", handleClick, true);
      }
    };
  }
  