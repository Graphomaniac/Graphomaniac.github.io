(() => {
  const progress = document.querySelector("[data-reading-progress]");
  const layers = progress?.querySelector("[data-reading-progress-layers]");
  const article = document.querySelector(".blog-article");
  if (!progress || !layers || !article) {
    return;
  }

  const headingElements = [...article.querySelectorAll([
    ".sectionHead[id]",
    ".likesectionHead[id]",
    ".subsectionHead[id]",
    ".likesubsectionHead[id]",
    ".subsubsectionHead[id]",
    ".likesubsubsectionHead[id]",
  ].join(","))].filter((heading) => heading.id !== "contents");
  if (!headingElements.length) {
    return;
  }

  const entries = [];
  const ancestors = [];

  const headingDepth = (heading) => {
    if (
      heading.classList.contains("subsubsectionHead")
      || heading.classList.contains("likesubsubsectionHead")
    ) {
      return 3;
    }
    if (
      heading.classList.contains("subsectionHead")
      || heading.classList.contains("likesubsectionHead")
    ) {
      return 2;
    }
    return 1;
  };

  const levelName = (depth) => {
    if (depth === 1) {
      return "Section";
    }
    if (depth === 2) {
      return "Subsection";
    }
    return "Subsubsection";
  };

  for (const heading of headingElements) {
    const depth = headingDepth(heading);
    const title = heading.textContent.replace(/\s+/g, " ").trim();
    let parent = null;
    for (let parentDepth = depth - 1; parentDepth >= 1; parentDepth -= 1) {
      if (ancestors[parentDepth]) {
        parent = ancestors[parentDepth];
        break;
      }
    }

    const item = document.createElement("li");
    item.className = "blog-reading-progress-item";
    item.dataset.depth = String(depth);
    item.dataset.state = "upcoming";
    item.dataset.targetId = heading.id;

    const link = document.createElement("a");
    link.className = "blog-reading-progress-link";
    link.setAttribute("href", `#${encodeURIComponent(heading.id)}`);
    link.setAttribute("aria-label", `${levelName(depth)}: ${title}`);
    link.title = title;

    const marker = document.createElement("span");
    marker.className = "blog-reading-progress-marker";
    marker.setAttribute("aria-hidden", "true");

    const label = document.createElement("span");
    label.className = "blog-reading-progress-title";
    label.textContent = title;

    link.append(marker, label);
    item.append(link);

    if (parent) {
      if (!parent.childrenList) {
        parent.childrenList = document.createElement("ol");
        parent.childrenList.className = "blog-reading-progress-sublist";
        parent.item.append(parent.childrenList);
      }
      parent.childrenList.append(item);
    } else {
      layers.append(item);
    }

    const entry = {
      heading,
      depth,
      title,
      parent,
      item,
      link,
      childrenList: null,
    };
    entries.push(entry);
    ancestors[depth] = entry;
    ancestors.length = depth + 1;
  }

  const compactViewport = window.matchMedia("(max-width: 1199px)");
  let animationFrame = 0;
  let lastActiveIndex = -2;

  const revealCompactEntry = (entry) => {
    if (!compactViewport.matches || !entry) {
      return;
    }
    const containerBounds = layers.getBoundingClientRect();
    const linkBounds = entry.link.getBoundingClientRect();
    const inset = 8;
    if (linkBounds.left < containerBounds.left + inset) {
      layers.scrollLeft += linkBounds.left - containerBounds.left - inset;
    } else if (linkBounds.right > containerBounds.right - inset) {
      layers.scrollLeft += linkBounds.right - containerBounds.right + inset;
    }
  };

  const update = () => {
    animationFrame = 0;
    const bounds = article.getBoundingClientRect();
    const readingLine = Math.min(window.innerHeight / 3, 240);
    let activeIndex = -1;

    for (const [index, entry] of entries.entries()) {
      if (entry.heading.getBoundingClientRect().top <= readingLine) {
        activeIndex = index;
      } else {
        break;
      }
    }
    if (bounds.bottom <= window.innerHeight + 1) {
      activeIndex = entries.length - 1;
    }

    const activeLineage = new Set();
    if (activeIndex >= 0) {
      let current = entries[activeIndex];
      while (current) {
        activeLineage.add(current);
        current = current.parent;
      }
    }

    for (const [index, entry] of entries.entries()) {
      let state = "upcoming";
      if (activeLineage.has(entry)) {
        state = "active";
      } else if (index < activeIndex) {
        state = "complete";
      }
      if (entry.item.dataset.state !== state) {
        entry.item.dataset.state = state;
      }
      if (index === activeIndex) {
        entry.link.setAttribute("aria-current", "location");
      } else {
        entry.link.removeAttribute("aria-current");
      }
    }

    progress.dataset.activeTarget = activeIndex >= 0 ? entries[activeIndex].heading.id : "";
    progress.hidden = false;

    if (activeIndex !== lastActiveIndex) {
      revealCompactEntry(activeIndex >= 0 ? entries[activeIndex] : null);
      lastActiveIndex = activeIndex;
    }
  };

  const scheduleUpdate = () => {
    if (!animationFrame) {
      animationFrame = window.requestAnimationFrame(update);
    }
  };

  const updateOrientation = () => {
    progress.dataset.orientation = compactViewport.matches ? "horizontal" : "vertical";
    lastActiveIndex = -2;
    scheduleUpdate();
  };

  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate, { passive: true });
  window.addEventListener("hashchange", scheduleUpdate);
  window.addEventListener("load", scheduleUpdate);
  window.addEventListener("pageshow", scheduleUpdate);
  compactViewport.addEventListener("change", updateOrientation);

  if ("ResizeObserver" in window) {
    new ResizeObserver(scheduleUpdate).observe(article);
  }
  if (document.fonts?.ready) {
    document.fonts.ready.then(scheduleUpdate);
  }

  updateOrientation();
})();
