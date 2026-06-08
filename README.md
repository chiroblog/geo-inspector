# GEO Inspector

GEO Inspector is a Chrome extension that scans the current webpage and creates an AI visibility report for Generative Engine Optimization (GEO).

It helps you check whether a webpage is easy for AI systems such as ChatGPT, Gemini, Claude, Perplexity, Copilot, and AI-powered search engines to understand, cite, and recommend.

## Features

* GEO Score out of 100
* Content Clarity scoring
* Entity Recognition scoring
* Structured Data detection
* AI Accessibility checks
* Citation Readiness checks
* GEO Signals checks
* Entity extraction
* Schema detection
* Issues and opportunity recommendations
* Light mode popup UI
* Custom extension icon

## Download

1. Open the GitHub repository page.
2. Click the green `Code` button.
3. Click `Download ZIP`.
4. Extract the ZIP file to a folder on your computer.

You can also clone the repository if you use Git:

```bash
git clone <repository-url>
```

## Install in Chrome

1. Open Chrome.
2. Go to `chrome://extensions`.
3. Turn on `Developer mode` in the top-right corner.
4. Click `Load unpacked`.
5. Select the extracted project folder.
6. GEO Inspector should now appear in your Chrome extensions list.

If you do not see the extension icon in the toolbar:

1. Click the puzzle-piece Extensions icon in Chrome.
2. Find `GEO Inspector`.
3. Click the pin icon.

## How to Use

1. Open any regular webpage.
2. Click the GEO Inspector icon in the Chrome toolbar.
3. The extension will scan the active page.
4. Review the GEO Score, category cards, issues, opportunities, entities, and schema findings.
5. Click the refresh button in the popup to rescan the page.

## What the Score Means

| Category | Weight |
| --- | ---: |
| Content Clarity | 20 |
| Entity Recognition | 20 |
| Structured Data | 20 |
| AI Accessibility | 15 |
| Citation Readiness | 15 |
| Geo Signals | 10 |

Total score: 100

## Metric Definitions

* Content Clarity: Measures whether the page is easy for AI systems to parse through clear headings, enough useful text, readable paragraph length, and organized structure.
* Entity Recognition: Measures how clearly the page identifies important names and concepts such as brands, products, people, places, services, and technologies.
* Structured Data: Measures whether the page provides machine-readable Schema.org data such as Organization, Article, FAQ, Product, Medical, or Local Business schema.
* AI Accessibility: Measures whether basic discovery signals are available to AI and search systems, including title, meta description, canonical URL, OpenGraph, Twitter card, and language tags.
* Citation Readiness: Measures how likely the page is to be cited by AI systems based on trust signals such as author information, publication date, source links, and FAQ structure.
* Geo Signals: Measures AI-search-specific signals such as llms.txt visibility, FAQ coverage, and schema types that help generative engines understand and recommend the page.

## Pages That Cannot Be Scanned

Chrome extensions cannot scan every type of page.

GEO Inspector will not work on:

* `chrome://` pages
* Chrome Web Store pages
* Other extension pages
* Some browser-rendered PDF or internal pages
* Pages where Chrome blocks extension scripting

Use the extension on normal `http://` or `https://` webpages.

## Project Files

* `manifest.json`: Chrome extension configuration
* `popup.html`: Popup structure
* `popup.css`: Popup styling
* `popup.js`: Page scanning and report rendering
* `logo.svg`: Source logo
* `icons/`: Chrome extension icon sizes
* `GEO Inspector PRD.md`: Product requirements document
* `GEO Inspector End Product.md`: Current product summary

## Updating the Extension

After editing files locally:

1. Go to `chrome://extensions`.
2. Find `GEO Inspector`.
3. Click the reload icon.
4. Open a webpage and test the popup again.

## Privacy

GEO Inspector runs locally in your browser. The current version does not send page content to an external API.

## Version

Current version: `1.0.0`
