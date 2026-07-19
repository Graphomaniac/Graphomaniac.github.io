(() => {
  "use strict";

  const API_HEADERS = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const DATE_FORMAT = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  function normalize(value) {
    return value
      .normalize("NFKD")
      .toLowerCase()
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[@4]/g, "a")
      .replace(/3/g, "e")
      .replace(/[1|]/g, "i")
      .replace(/0/g, "o")
      .replace(/[$5]/g, "s")
      .replace(/7/g, "t")
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .replace(/\s+/g, " ");
  }

  function containsBlockedLanguage(body, terms) {
    const normalizedBody = ` ${normalize(body)} `;
    return terms.some((term) => normalizedBody.includes(` ${normalize(term)} `));
  }

  async function fetchJson(url, options = {}) {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    return response.json();
  }

  function renderComment(comment) {
    const article = document.createElement("article");
    article.className = "blog-comment";
    const user = comment.user || {};

    const header = document.createElement("header");
    header.className = "blog-comment-header";

    if (user.avatar_url && user.html_url) {
      const profile = document.createElement("a");
      profile.href = user.html_url;
      profile.target = "_blank";
      profile.rel = "noopener noreferrer";

      const avatar = document.createElement("img");
      avatar.className = "blog-comment-avatar";
      avatar.src = user.avatar_url;
      avatar.alt = "";
      avatar.width = 32;
      avatar.height = 32;
      avatar.loading = "lazy";
      profile.append(avatar);
      header.append(profile);
    }

    const author = document.createElement(user.html_url ? "a" : "span");
    author.className = "blog-comment-author";
    if (user.html_url) {
      author.href = user.html_url;
      author.target = "_blank";
      author.rel = "noopener noreferrer";
    }
    author.textContent = user.login || "Deleted user";

    const timestamp = document.createElement("time");
    timestamp.className = "blog-comment-time";
    timestamp.dateTime = comment.created_at;
    timestamp.textContent = DATE_FORMAT.format(new Date(comment.created_at));

    const body = document.createElement("p");
    body.className = "blog-comment-body";
    body.textContent = comment.body;

    header.append(author, timestamp);
    article.append(header, body);
    return article;
  }

  async function loadComments(section) {
    const status = section.querySelector("[data-comments-status]");
    const list = section.querySelector("[data-comments-list]");
    const action = section.querySelector("[data-comments-action]");

    if (section.dataset.commentsPublished !== "true") {
      status.textContent = "Comments will be available when this post is published.";
      return;
    }

    const repository = section.dataset.commentsRepository || "";
    const [owner, repo] = repository.split("/");
    const label = section.dataset.commentsLabel;
    const key = section.dataset.commentsKey;
    if (!owner || !repo || !label || !key) {
      status.textContent = "Comments are unavailable.";
      return;
    }

    try {
      const filter = await fetchJson(section.dataset.commentsFilterUrl, {
        cache: "no-cache",
      });
      const issuesUrl = new URL(`https://api.github.com/repos/${owner}/${repo}/issues`);
      issuesUrl.searchParams.set("state", "all");
      issuesUrl.searchParams.set("labels", label);
      issuesUrl.searchParams.set("per_page", "100");
      const issues = await fetchJson(issuesUrl, { headers: API_HEADERS });
      const marker = `<!-- blog-comment-key: ${key} -->`;
      const issue = issues.find((candidate) => (candidate.body || "").includes(marker));

      if (!issue) {
        status.textContent = "Comments are being prepared.";
        return;
      }

      action.href = issue.html_url;
      action.hidden = false;
      if (issue.comments === 0) {
        status.textContent = "No comments yet.";
        return;
      }

      const comments = await fetchJson(`${issue.comments_url}?per_page=100`, {
        headers: API_HEADERS,
      });
      let hidden = 0;
      for (const comment of comments) {
        if (containsBlockedLanguage(comment.body || "", filter.terms || [])) {
          hidden += 1;
          continue;
        }
        list.append(renderComment(comment));
      }

      const visible = list.childElementCount;
      const countLabel = `${visible} comment${visible === 1 ? "" : "s"}`;
      if (hidden > 0) {
        status.textContent = `${countLabel}. ${hidden} hidden by the language filter.`;
      } else if (visible > 0) {
        status.textContent = countLabel;
      } else {
        status.textContent = "No visible comments.";
      }
    } catch (error) {
      console.error("Could not load Blog comments", error);
      status.textContent = "Comments are temporarily unavailable.";
    }
  }

  document.querySelectorAll("[data-comments]").forEach(loadComments);
})();
