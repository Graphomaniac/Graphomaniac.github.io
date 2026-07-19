(() => {
  const links = [...document.querySelectorAll(".footnote-link[data-footnote]")];
  if (!links.length) {
    return;
  }

  const tooltip = document.createElement("div");
  tooltip.id = "footnote-tooltip";
  tooltip.className = "footnote-tooltip";
  tooltip.setAttribute("role", "tooltip");
  tooltip.hidden = true;
  document.body.append(tooltip);

  let activeLink = null;

  const positionTooltip = () => {
    if (!activeLink || tooltip.hidden) {
      return;
    }

    const margin = 12;
    const gap = 8;
    const anchor = activeLink.getBoundingClientRect();
    const bounds = tooltip.getBoundingClientRect();
    const centered = anchor.left + anchor.width / 2 - bounds.width / 2;
    const left = Math.min(
      Math.max(centered, margin),
      window.innerWidth - bounds.width - margin,
    );
    let top = anchor.top - bounds.height - gap;
    if (top < margin) {
      top = anchor.bottom + gap;
    }
    top = Math.min(
      Math.max(top, margin),
      window.innerHeight - bounds.height - margin,
    );

    tooltip.style.left = `${Math.round(left)}px`;
    tooltip.style.top = `${Math.round(top)}px`;
    tooltip.style.visibility = "visible";
  };

  const showTooltip = (link) => {
    activeLink = link;
    tooltip.textContent = link.dataset.footnote;
    tooltip.hidden = false;
    tooltip.style.visibility = "hidden";
    link.setAttribute("aria-describedby", tooltip.id);
    positionTooltip();
  };

  const hideTooltip = () => {
    if (activeLink) {
      activeLink.removeAttribute("aria-describedby");
    }
    activeLink = null;
    tooltip.hidden = true;
  };

  for (const link of links) {
    link.addEventListener("pointerenter", () => showTooltip(link));
    link.addEventListener("pointerleave", hideTooltip);
    link.addEventListener("focus", () => showTooltip(link));
    link.addEventListener("blur", hideTooltip);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      hideTooltip();
    }
  });
  window.addEventListener("resize", positionTooltip);
  window.addEventListener("scroll", positionTooltip, true);
})();
