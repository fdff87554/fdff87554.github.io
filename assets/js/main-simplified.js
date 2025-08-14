/**
 * Simplified Portfolio Main JavaScript
 * Focused on core functionality only
 */

"use strict";

// Main application
const PortfolioApp = {
  // State
  currentArticle: null,
  isAnimating: false,

  // Initialize
  init() {
    // Cache elements
    this.body = document.body;
    this.wrapper = document.getElementById("wrapper");
    this.header = document.getElementById("header");
    this.footer = document.getElementById("footer");
    this.main = document.getElementById("main");
    this.articles = document.querySelectorAll("#main article");

    // Setup
    this.setupPageLoad();
    this.setupNavigation();
    this.setupArticleHandlers();
    this.handleInitialHash();
  },

  // Remove preload class after page loads
  setupPageLoad() {
    window.addEventListener("load", () => {
      setTimeout(() => this.body.classList.remove("is-preload"), 100);
    });
  },

  // Handle navigation clicks
  setupNavigation() {
    const nav = this.header?.querySelector("nav");
    if (!nav) return;

    nav.addEventListener("click", (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      e.preventDefault();
      const targetId = link.getAttribute("href").substring(1);

      if (targetId) {
        this.showArticle(targetId);
        history.pushState(null, null, `#${targetId}`);
      } else {
        this.hideArticle();
        history.pushState(null, null, "#");
      }
    });
  },

  // Handle article interactions
  setupArticleHandlers() {
    // Close on background click
    this.wrapper?.addEventListener("click", (e) => {
      if (e.target === this.wrapper || e.target === this.main) {
        if (this.currentArticle) {
          this.hideArticle();
          history.pushState(null, null, "#");
        }
      }
    });

    // Close on ESC key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.currentArticle) {
        this.hideArticle();
        history.pushState(null, null, "#");
      }
    });

    // Handle browser back/forward
    window.addEventListener("popstate", () => {
      const hash = window.location.hash;
      if (hash && hash.length > 1) {
        this.showArticle(hash.substring(1));
      } else {
        this.hideArticle();
      }
    });

    // Prevent article content clicks from bubbling
    this.articles.forEach((article) => {
      article.addEventListener("click", (e) => e.stopPropagation());
    });
  },

  // Handle initial URL hash
  handleInitialHash() {
    const hash = window.location.hash;
    if (hash && hash.length > 1) {
      setTimeout(() => this.showArticle(hash.substring(1)), 0);
    }
  },

  // Show article
  showArticle(id) {
    if (this.isAnimating) return;

    const article = document.getElementById(id);
    if (!article || article.tagName !== "ARTICLE") return;
    if (this.currentArticle === article) return;

    this.isAnimating = true;

    // Hide all articles first
    this.articles.forEach((a) => {
      a.style.display = "none";
      a.classList.remove("active");
    });

    // Setup for display
    this.body.classList.add("is-article-visible");
    if (this.header) this.header.style.display = "none";
    if (this.footer) this.footer.style.display = "none";
    if (this.main) this.main.style.display = "";

    // Show target article
    article.style.display = "";

    // Activate after brief delay for animation
    setTimeout(() => {
      article.classList.add("active");
      this.currentArticle = article;
      window.scrollTo(0, 0);
      this.isAnimating = false;
    }, 50);
  },

  // Hide article
  hideArticle() {
    if (this.isAnimating || !this.currentArticle) return;

    this.isAnimating = true;

    // Deactivate article
    this.currentArticle.classList.remove("active");

    // Hide after animation
    setTimeout(() => {
      if (this.currentArticle) {
        this.currentArticle.style.display = "none";
        this.currentArticle = null;
      }

      if (this.main) this.main.style.display = "none";
      if (this.header) this.header.style.display = "";
      if (this.footer) this.footer.style.display = "";

      this.body.classList.remove("is-article-visible");
      this.isAnimating = false;
    }, 325);
  },
};

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => PortfolioApp.init());
} else {
  PortfolioApp.init();
}

// Hide articles initially
document.addEventListener("DOMContentLoaded", () => {
  const main = document.getElementById("main");
  if (main) main.style.display = "none";

  document.querySelectorAll("#main article").forEach((article) => {
    article.style.display = "none";
  });
});
