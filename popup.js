const CATEGORY_WEIGHTS = {
  contentClarity: 20,
  entityRecognition: 20,
  structuredData: 20,
  aiAccessibility: 15,
  citationReadiness: 15,
  geoSignals: 10
};

const categoryLabels = {
  contentClarity: "Content Clarity",
  entityRecognition: "Entity Recognition",
  structuredData: "Structured Data",
  aiAccessibility: "AI Accessibility",
  citationReadiness: "Citation Readiness",
  geoSignals: "Geo Signals"
};

const categoryDefinitions = {
  contentClarity: "Measures whether the page is easy for AI systems to parse: clear headings, enough useful text, readable paragraph length, and organized structure.",
  entityRecognition: "Measures how clearly the page identifies important names and concepts such as brands, products, people, places, services, and technologies.",
  structuredData: "Measures whether the page provides machine-readable Schema.org data such as Organization, Article, FAQ, Product, Medical, or Local Business schema.",
  aiAccessibility: "Measures whether basic discovery signals are available to AI and search systems, including title, meta description, canonical URL, OpenGraph, Twitter card, and language tags.",
  citationReadiness: "Measures how likely the page is to be cited by AI systems based on trust signals such as author information, publication date, source links, and FAQ structure.",
  geoSignals: "Measures AI-search-specific signals such as llms.txt visibility, FAQ coverage, and schema types that help generative engines understand and recommend the page."
};

const CATEGORY_ORDER = [
  "aiAccessibility",
  "citationReadiness",
  "contentClarity",
  "entityRecognition",
  "geoSignals",
  "structuredData"
];

const tabButtons = document.querySelectorAll(".tab");
const tabPanels = document.querySelectorAll(".tab-panel");
const rescanButton = document.querySelector("#rescanButton");

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    tabButtons.forEach((tab) => tab.classList.remove("is-active"));
    tabPanels.forEach((panel) => panel.classList.remove("is-active"));
    button.classList.add("is-active");
    document.querySelector(`#${button.dataset.tab}`).classList.add("is-active");
  });
});

rescanButton.addEventListener("click", scanCurrentTab);
document.addEventListener("DOMContentLoaded", scanCurrentTab);

async function scanCurrentTab() {
  if (typeof chrome === "undefined" || !chrome.tabs || !chrome.scripting) {
    renderReport(createPreviewReport());
    return;
  }

  setLoadingState();

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab?.id || !tab.url?.startsWith("http")) {
      renderError("Open a regular webpage to generate a GEO report.");
      return;
    }

    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: analyzePage
    });

    renderReport(result);
  } catch (error) {
    renderError(`Chrome could not scan this page: ${error?.message || "unknown error"}`);
  }
}

function createPreviewReport() {
  return {
    title: "Vizzhy",
    score: 58,
    summary: "1029 words scanned with 24 detected entities and 0 structured data types",
    categories: {
      contentClarity: 15,
      entityRecognition: 20,
      structuredData: 0,
      aiAccessibility: 13,
      citationReadiness: 7,
      geoSignals: 3
    },
    issues: [
      { title: "Missing OpenGraph description", description: "Social and AI preview systems may not receive a consistent page description.", impact: "-2", tone: "warning" },
      { title: "Publication date missing", description: "Freshness is harder to assess without a visible date signal.", impact: "-4", tone: "warning" }
    ],
    opportunities: [
      { title: "Create llms.txt", description: "Publish /llms.txt and link to it so AI systems can understand preferred content paths.", impact: "+10", tone: "success" },
      { title: "Add FAQ schema", description: "Expose common questions and answers in JSON-LD for stronger answer extraction.", impact: "+8", tone: "success" }
    ],
    entities: ["GEO Inspector", "AI Search Visibility", "Schema.org", "ChatGPT", "Gemini", "Claude", "Perplexity"],
    schemaItems: [
      { title: "Organization", description: "Structured data type detected on this page.", impact: "Found", tone: "success" },
      { title: "Article", description: "Structured data type detected on this page.", impact: "Found", tone: "success" }
    ]
  };
}

function setLoadingState() {
  document.querySelector("#scoreValue").textContent = "--";
  document.querySelector("#scoreRing").style.setProperty("--score-color", "#d99d2b");
  document.querySelector("#scoreRingProgress").style.strokeDashoffset = "351.86";
  document.querySelector("#scoreStatus").textContent = "Scanning";
  document.querySelector("#scoreStatus").className = "status-chip";
  document.querySelector("#pageTitle").textContent = "Reading current page";
  document.querySelector("#summaryText").textContent = "Checking content clarity, entities, schema, AI accessibility, citation readiness, and GEO signals.";
}

function renderReport(report) {
  const scoreStatus = getScoreStatus(report.score);
  const statusElement = document.querySelector("#scoreStatus");

  document.querySelector("#scoreValue").textContent = report.score;
  document.querySelector("#scoreRing").style.setProperty("--score-color", scoreStatus.scoreColor);
  document.querySelector("#scoreRingProgress").style.strokeDashoffset = String(351.86 - (351.86 * report.score / 100));
  statusElement.textContent = scoreStatus.label;
  statusElement.className = `status-chip ${scoreStatus.className}`;
  document.querySelector("#pageTitle").textContent = report.title || "Untitled page";
  document.querySelector("#summaryText").textContent = report.summary;

  renderMetrics(report.categories);
  renderList("#issuesList", report.issues, "No major issues detected.");
  renderList("#opportunitiesList", report.opportunities, "No immediate opportunities found.");
  renderEntities(report.entities);
  renderList("#schemaList", report.schemaItems, "No structured data detected.");
}

function renderMetrics(categories) {
  const metricGrid = document.querySelector("#metricGrid");
  metricGrid.innerHTML = CATEGORY_ORDER.map((key) => {
    const value = categories[key];
    const weight = CATEGORY_WEIGHTS[key];
    const percent = Math.round((value / weight) * 100);

    return `
      <article class="metric-card">
        <header class="metric-card-header">
          <strong>${value}/${weight}</strong>
          <button class="info-button" title="${escapeHtml(categoryDefinitions[key])}" aria-label="${escapeHtml(`${categoryLabels[key]} definition`)}" type="button">i</button>
        </header>
        <span>${categoryLabels[key]}</span>
        <div class="bar" aria-hidden="true"><i style="width: ${percent}%"></i></div>
      </article>
    `;
  }).join("");
}

function renderList(selector, items, emptyMessage) {
  const list = document.querySelector(selector);

  if (!items.length) {
    list.innerHTML = `<div class="empty-state">${emptyMessage}</div>`;
    return;
  }

  list.innerHTML = items.map((item) => `
    <article class="list-item">
      <header>
        <h3>${escapeHtml(item.title)}</h3>
        ${item.impact ? `<span class="chip ${item.tone || ""}">${escapeHtml(item.impact)}</span>` : ""}
      </header>
      <p>${escapeHtml(item.description)}</p>
    </article>
  `).join("");
}

function renderEntities(entities) {
  const entityList = document.querySelector("#entityList");

  if (!entities.length) {
    entityList.innerHTML = '<div class="empty-state">No clear entities detected.</div>';
    return;
  }

  entityList.innerHTML = entities.map((entity) => `<span class="chip">${escapeHtml(entity)}</span>`).join("");
}

function renderError(message) {
  document.querySelector("#scoreStatus").textContent = "Unavailable";
  document.querySelector("#scoreStatus").className = "status-chip poor";
  document.querySelector("#pageTitle").textContent = "Scan unavailable";
  document.querySelector("#summaryText").textContent = message;
  document.querySelector("#metricGrid").innerHTML = "";
  renderList("#issuesList", [{ title: "Scan blocked", description: message, impact: "Error", tone: "error" }], "");
  renderList("#opportunitiesList", [], "Scan the page again once it is available.");
  renderEntities([]);
  renderList("#schemaList", [], "No schema data available.");
}

function getScoreStatus(score) {
  if (score >= 85) return { label: "Excellent", className: "excellent", scoreColor: "#10b981" };
  if (score >= 70) return { label: "Good", className: "good", scoreColor: "#6748c6" };
  if (score >= 50) return { label: "Needs improvement", className: "needs-improvement", scoreColor: "#d99d2b" };
  return { label: "Poor", className: "poor", scoreColor: "#ef4444" };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function analyzePage() {
  function extractSchemaTypes(jsonLdNodes) {
    const types = new Set();

    jsonLdNodes.forEach((node) => {
      try {
        const parsed = JSON.parse(node.textContent);
        collectTypes(parsed, types);
      } catch {
        types.add("Invalid JSON-LD");
      }
    });

    document.querySelectorAll("[itemscope][itemtype]").forEach((node) => {
      const itemType = node.getAttribute("itemtype").split("/").pop();
      if (itemType) types.add(itemType);
    });

    return Array.from(types);
  }

  function collectTypes(value, types) {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach((item) => collectTypes(item, types));
      return;
    }

    const type = value["@type"];
    if (Array.isArray(type)) type.forEach((entry) => types.add(entry));
    if (typeof type === "string") types.add(type);

    Object.values(value).forEach((entry) => collectTypes(entry, types));
  }

  function extractEntities(source) {
    const stopwords = new Set(["The", "This", "That", "With", "From", "Your", "About", "Contact", "Privacy", "Terms", "Cookie", "Home", "Blog", "Learn", "More"]);
    const matches = source.match(/\b[A-Z][A-Za-z0-9&.+-]*(?:\s+[A-Z][A-Za-z0-9&.+-]*){0,3}\b/g) || [];
    const counts = new Map();

    matches.forEach((match) => {
      const cleaned = match.trim().replace(/\s+/g, " ");
      if (cleaned.length < 3 || stopwords.has(cleaned)) return;
      counts.set(cleaned, (counts.get(cleaned) || 0) + 1);
    });

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([entity]) => entity);
  }

  function scoreContentClarity({ words, headings, paragraphs, longParagraphCount }) {
    let score = 0;
    if (words.length >= 300) score += 6;
    if (headings.length >= 3) score += 5;
    if (paragraphs.length >= 3) score += 4;
    if (longParagraphCount === 0) score += 5;
    return Math.min(score, 20);
  }

  function scoreEntityRecognition(entities) {
    if (entities.length >= 12) return 20;
    if (entities.length >= 8) return 16;
    if (entities.length >= 4) return 11;
    if (entities.length >= 1) return 6;
    return 0;
  }

  function scoreStructuredData(schemaTypes) {
    if (schemaTypes.length >= 4) return 20;
    if (schemaTypes.length >= 2) return 15;
    if (schemaTypes.length === 1) return 10;
    return 0;
  }

  function scoreAiAccessibility({ title, metaDescription, canonical, ogDescription, twitterCard, language }) {
    let score = 0;
    if (title) score += 3;
    if (metaDescription) score += 3;
    if (canonical) score += 3;
    if (ogDescription) score += 2;
    if (twitterCard) score += 2;
    if (language) score += 2;
    return Math.min(score, 15);
  }

  function scoreCitationReadiness({ author, publishDate, links, hasFaq }) {
    let score = 0;
    if (author) score += 4;
    if (publishDate) score += 4;
    if (links.filter((link) => /^https?:/i.test(link.href)).length >= 3) score += 4;
    if (hasFaq) score += 3;
    return Math.min(score, 15);
  }

  function scoreGeoSignals({ llmsLink, hasFaq, schemaTypes }) {
    let score = 0;
    if (llmsLink) score += 4;
    if (hasFaq) score += 3;
    if (schemaTypes.some((type) => /organization|article|product|faq|localbusiness/i.test(type))) score += 3;
    return Math.min(score, 10);
  }

  function buildIssues(context) {
    const issues = [];

    if (!context.metaDescription) issues.push({ title: "Missing meta description", description: "AI systems lose a compact summary signal when the page has no meta description.", impact: "-3", tone: "warning" });
    if (!context.ogDescription) issues.push({ title: "Missing OpenGraph description", description: "Social and AI preview systems may not receive a consistent page description.", impact: "-2", tone: "warning" });
    if (!context.schemaTypes.length) issues.push({ title: "No structured data detected", description: "Add Schema.org JSON-LD so AI systems can classify the page with higher confidence.", impact: "-20", tone: "error" });
    if (context.entities.length < 4) issues.push({ title: "Few explicit entities", description: "The page does not repeat enough clear brands, products, people, locations, or services.", impact: "-9", tone: "warning" });
    if (context.longParagraphCount > 0) issues.push({ title: "Long paragraphs", description: `${context.longParagraphCount} paragraph${context.longParagraphCount === 1 ? "" : "s"} may be too dense for fast extraction.`, impact: "-5", tone: "warning" });
    if (!context.author) issues.push({ title: "Author signal missing", description: "Citation readiness improves when a visible author or organization is present.", impact: "-4", tone: "warning" });
    if (!context.publishDate) issues.push({ title: "Publication date missing", description: "Freshness is harder to assess without a visible date signal.", impact: "-4", tone: "warning" });
    if (!context.llmsLink) issues.push({ title: "llms.txt not surfaced", description: "No visible link to /llms.txt was found on the page.", impact: "-4", tone: "warning" });

    return issues;
  }

  function buildOpportunities(context) {
    const opportunities = [];

    if (!context.schemaTypes.some((type) => /faq/i.test(type))) opportunities.push({ title: "Add FAQ schema", description: "Expose common questions and answers in JSON-LD for stronger answer extraction.", impact: "+8", tone: "success" });
    if (!context.schemaTypes.some((type) => /organization/i.test(type))) opportunities.push({ title: "Add Organization schema", description: "Clarify brand identity, official URL, logo, and social profiles.", impact: "+6", tone: "success" });
    if (!context.author) opportunities.push({ title: "Add author information", description: "Show the author or reviewing organization to improve trust and citation readiness.", impact: "+4", tone: "success" });
    if (!context.publishDate) opportunities.push({ title: "Add publication date", description: "Include a visible date or article metadata so AI systems can judge freshness.", impact: "+4", tone: "success" });
    if (!context.llmsLink) opportunities.push({ title: "Create llms.txt", description: "Publish /llms.txt and link to it so AI systems can understand preferred content paths.", impact: "+10", tone: "success" });
    if (context.entities.length < 8) opportunities.push({ title: "Strengthen entity coverage", description: "Mention core brands, products, services, and locations explicitly in headings and body copy.", impact: "+5", tone: "success" });
    if (!context.metaDescription) opportunities.push({ title: "Write a precise meta description", description: "Summarize the page in one clear sentence with the primary entity and user outcome.", impact: "+3", tone: "success" });

    return opportunities;
  }

  function buildSchemaItems(schemaTypes) {
    return schemaTypes.map((type) => ({
      title: type,
      description: type === "Invalid JSON-LD" ? "A JSON-LD block was found but could not be parsed." : "Structured data type detected on this page.",
      impact: type === "Invalid JSON-LD" ? "Invalid" : "Found",
      tone: type === "Invalid JSON-LD" ? "error" : "success"
    }));
  }

  const text = document.body?.innerText?.replace(/\s+/g, " ").trim() || "";
  const words = text ? text.split(/\s+/) : [];
  const title = document.title || document.querySelector("h1")?.textContent?.trim() || "";
  const metaDescription = document.querySelector('meta[name="description"]')?.content?.trim() || "";
  const headings = Array.from(document.querySelectorAll("h1,h2,h3")).map((heading) => heading.textContent.trim()).filter(Boolean);
  const paragraphs = Array.from(document.querySelectorAll("p")).map((paragraph) => paragraph.textContent.trim()).filter(Boolean);
  const jsonLd = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
  const schemaTypes = extractSchemaTypes(jsonLd);
  const links = Array.from(document.querySelectorAll("a[href]"));
  const author = document.querySelector('[rel="author"], meta[name="author"], [itemprop="author"]');
  const publishDate = document.querySelector('time[datetime], meta[property="article:published_time"], meta[name="date"]');
  const canonical = document.querySelector('link[rel="canonical"]');
  const ogDescription = document.querySelector('meta[property="og:description"]');
  const twitterCard = document.querySelector('meta[name="twitter:card"]');
  const language = document.documentElement.lang;
  const hasFaq = /frequently asked questions|faq/i.test(text) || schemaTypes.some((type) => /faq/i.test(type));
  const entities = extractEntities(`${title} ${metaDescription} ${headings.join(" ")} ${text}`).slice(0, 24);
  const longParagraphCount = paragraphs.filter((paragraph) => paragraph.split(/\s+/).length > 120).length;
  const llmsLink = links.find((link) => {
    try {
      return new URL(link.href, location.href).pathname.toLowerCase() === "/llms.txt";
    } catch {
      return false;
    }
  });

  const categories = {
    contentClarity: scoreContentClarity({ words, headings, paragraphs, longParagraphCount }),
    entityRecognition: scoreEntityRecognition(entities),
    structuredData: scoreStructuredData(schemaTypes),
    aiAccessibility: scoreAiAccessibility({ title, metaDescription, canonical, ogDescription, twitterCard, language }),
    citationReadiness: scoreCitationReadiness({ author, publishDate, links, hasFaq }),
    geoSignals: scoreGeoSignals({ llmsLink, hasFaq, schemaTypes })
  };

  const score = Object.values(categories).reduce((sum, value) => sum + value, 0);
  const issues = buildIssues({ categories, metaDescription, schemaTypes, entities, longParagraphCount, author, publishDate, llmsLink, ogDescription });
  const opportunities = buildOpportunities({ schemaTypes, entities, author, publishDate, llmsLink, hasFaq, metaDescription });
  const schemaItems = buildSchemaItems(schemaTypes);

  return {
    title,
    score,
    categories,
    issues,
    opportunities,
    entities,
    schemaItems,
    summary: `${words.length.toLocaleString()} words scanned with ${entities.length} detected entities and ${schemaTypes.length} structured data type${schemaTypes.length === 1 ? "" : "s"}.`
  };
}
