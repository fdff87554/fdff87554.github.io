/**
 * Simplified Portfolio Main JavaScript
 * Focused on core functionality only
 */

"use strict";

// Animation timing constants
const ANIMATION = {
  PRELOAD_DELAY: 100,
  SHOW_DELAY: 50,
  HIDE_DURATION: 325,
};

// Main application
const PortfolioApp = {
  // State
  currentArticle: null,
  isAnimating: false,

  // Initialize
  init() {
    try {
      // Cache elements
      this.body = document.body;
      this.wrapper = document.getElementById("wrapper");
      this.header = document.getElementById("header");
      this.footer = document.getElementById("footer");
      this.main = document.getElementById("main");
      this.articles = document.querySelectorAll("#main article");

      // Hide main and articles initially
      if (this.main) this.main.style.display = "none";
      this.articles.forEach((article) => {
        article.style.display = "none";
        article.setAttribute("aria-hidden", "true");
      });

      // Setup
      this.setupPageLoad();
      this.setupNavigation();
      this.setupArticleHandlers();
      this.handleInitialHash();
    } catch (error) {
      console.error("PortfolioApp initialization failed:", error);
    }
  },

  // Remove preload class after page loads
  setupPageLoad() {
    window.addEventListener("load", () => {
      setTimeout(
        () => this.body.classList.remove("is-preload"),
        ANIMATION.PRELOAD_DELAY
      );
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

    // Set ARIA states for hidden articles
    this.articles.forEach((a) => {
      if (a !== article) {
        a.setAttribute("aria-hidden", "true");
      }
    });

    // Activate after brief delay for animation
    setTimeout(() => {
      article.classList.add("active");
      this.currentArticle = article;
      window.scrollTo(0, 0);
      this.isAnimating = false;

      // Focus management for accessibility
      const heading = article.querySelector("h2, h3");
      if (heading) {
        heading.setAttribute("tabindex", "-1");
        heading.focus();
      }

      // Set ARIA state for active article
      article.setAttribute("aria-hidden", "false");
    }, ANIMATION.SHOW_DELAY);
  },

  // Hide article
  hideArticle() {
    if (this.isAnimating || !this.currentArticle) return;

    this.isAnimating = true;

    // Remember trigger element for focus return
    const triggerLink = document.querySelector(
      `a[href="#${this.currentArticle?.id}"]`
    );

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

      // Return focus to navigation for accessibility
      if (triggerLink) {
        triggerLink.focus();
      }

      // Reset ARIA states
      this.articles.forEach((a) => {
        a.setAttribute("aria-hidden", "true");
      });
    }, ANIMATION.HIDE_DURATION);
  },
};

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => PortfolioApp.init());
} else {
  PortfolioApp.init();
}
