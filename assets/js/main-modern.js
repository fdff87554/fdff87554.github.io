/**
 * Portfolio Main JavaScript - Modern ES6+ Version
 * Replaces jQuery with native JavaScript
 * Includes error handling and modern syntax
 */

"use strict";

class PortfolioApp {
  constructor() {
    // Cache DOM elements
    this.elements = {
      window: window,
      body: document.body,
      wrapper: document.getElementById("wrapper"),
      header: document.getElementById("header"),
      footer: document.getElementById("footer"),
      main: document.getElementById("main"),
      bg: document.getElementById("bg"),
    };

    // Get all articles
    this.articles = this.elements.main
      ? Array.from(this.elements.main.querySelectorAll("article"))
      : [];

    // Configuration
    this.config = {
      animationDelay: 325,
      introArticleId: "intro_en",
      breakpoints: {
        xlarge: [1281, 1680],
        large: [981, 1280],
        medium: [737, 980],
        small: [481, 736],
        xsmall: [361, 480],
        xxsmall: [null, 360],
      },
    };

    // State
    this.locked = false;
    this.currentArticle = null;

    // Initialize
    this.init();
  }

  /**
   * Initialize the application
   */
  init() {
    try {
      // Setup event listeners
      this.setupPageLoad();
      this.setupNavigation();
      this.setupArticleHandlers();
      this.setupKeyboardHandlers();
      this.setupHashHandler();

      // Check initial hash
      this.handleInitialHash();

      console.log("Portfolio app initialized successfully");
    } catch (error) {
      console.error("Failed to initialize portfolio app:", error);
      this.handleError(error);
    }
  }

  /**
   * Setup page load animations
   */
  setupPageLoad() {
    // Remove preload class after page loads
    window.addEventListener("load", () => {
      setTimeout(() => {
        this.elements.body.classList.remove("is-preload");
      }, 100);
    });
  }

  /**
   * Setup navigation
   */
  setupNavigation() {
    const nav = this.elements.header?.querySelector("nav");
    if (!nav) return;

    const navItems = nav.querySelectorAll("li");

    // Add middle alignment for even number of items
    if (navItems.length % 2 === 0) {
      nav.classList.add("use-middle");
      const middleIndex = Math.floor(navItems.length / 2);
      navItems[middleIndex]?.classList.add("is-middle");
    }

    // Handle navigation clicks
    nav.addEventListener("click", (e) => {
      const link = e.target.closest("a");
      if (!link) return;

      const href = link.getAttribute("href");
      if (href && href.startsWith("#")) {
        e.preventDefault();
        const articleId = href.substring(1);

        if (articleId) {
          this.showArticle(articleId);
          // Update URL without triggering hashchange
          history.pushState(null, null, href);
        } else {
          this.hideArticle();
          history.pushState(null, null, "#");
        }
      }
    });
  }

  /**
   * Setup article handlers
   */
  setupArticleHandlers() {
    // Handle clicks on wrapper/background to close article
    this.elements.wrapper?.addEventListener("click", (e) => {
      // Check if clicked on wrapper background (not on article content)
      if (
        e.target === this.elements.wrapper ||
        e.target === this.elements.main
      ) {
        if (this.currentArticle) {
          e.preventDefault();
          this.hideArticle();
          history.pushState(null, null, "#");
        }
      }
    });

    // Handle clicks on BG element to close article
    this.elements.bg?.addEventListener("click", (e) => {
      if (this.currentArticle) {
        e.preventDefault();
        this.hideArticle();
        history.pushState(null, null, "#");
      }
    });

    // Prevent article content clicks from bubbling up
    this.articles.forEach((article) => {
      article.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    });
  }

  /**
   * Setup keyboard handlers
   */
  setupKeyboardHandlers() {
    document.addEventListener("keydown", (e) => {
      // Close article on ESC
      if (e.key === "Escape" && this.currentArticle) {
        this.hideArticle();
        history.pushState(null, null, "#");
      }
    });
  }

  /**
   * Setup hash change handler
   */
  setupHashHandler() {
    window.addEventListener("hashchange", () => {
      this.handleHashChange();
    });

    // Handle browser back/forward buttons
    window.addEventListener("popstate", () => {
      this.handleHashChange();
    });
  }

  /**
   * Handle initial hash on page load
   */
  handleInitialHash() {
    const hash = window.location.hash;
    if (hash && hash.length > 1) {
      const articleId = hash.substring(1);
      // Use setTimeout to ensure DOM is ready
      setTimeout(() => {
        this.showArticle(articleId, true);
      }, 0);
    }
  }

  /**
   * Handle hash changes
   */
  handleHashChange() {
    const hash = window.location.hash;

    if (hash && hash.length > 1) {
      const articleId = hash.substring(1);
      this.showArticle(articleId);
    } else {
      this.hideArticle();
    }
  }

  /**
   * Show an article
   * @param {string} id - Article ID
   * @param {boolean} initial - Is this the initial load?
   */
  showArticle(id, initial = false) {
    try {
      const article = document.getElementById(id);

      // Article doesn't exist? Bail
      if (!article || article.tagName !== "ARTICLE") {
        console.warn(`Article with id "${id}" not found`);
        return;
      }

      // Already showing this article? Bail
      if (this.currentArticle === article && !initial) {
        return;
      }

      // Handle lock
      if (this.locked || initial) {
        // Speed through steps without delays
        this.elements.body.classList.add("is-switching");
        this.elements.body.classList.add("is-article-visible");

        // Hide all articles first
        this.articles.forEach((a) => {
          a.classList.remove("active");
          a.style.display = "none";
        });

        // Hide header and footer
        if (this.elements.header) this.elements.header.style.display = "none";
        if (this.elements.footer) this.elements.footer.style.display = "none";

        // Show main
        if (this.elements.main) this.elements.main.style.display = "";

        // Show only the target article
        article.style.display = "";

        // Activate article
        article.classList.add("active");

        // Update current article
        this.currentArticle = article;

        // Unlock
        this.locked = false;

        // Remove switching class
        setTimeout(
          () => {
            this.elements.body.classList.remove("is-switching");
          },
          initial ? 1000 : 0
        );

        return;
      }

      // Lock
      this.locked = true;

      // Article already visible? Swap articles
      if (this.elements.body.classList.contains("is-article-visible")) {
        // Deactivate current article
        if (this.currentArticle) {
          this.currentArticle.classList.remove("active");

          // Show new article after delay
          setTimeout(() => {
            // Hide all articles
            this.articles.forEach((a) => {
              a.style.display = "none";
            });

            // Show only the new article
            article.style.display = "";

            // Activate new article after another delay
            setTimeout(() => {
              article.classList.add("active");
              this.currentArticle = article;

              // Scroll to top
              window.scrollTo(0, 0);

              // Unlock after final delay
              setTimeout(() => {
                this.locked = false;
              }, this.config.animationDelay);
            }, 25);
          }, this.config.animationDelay);
        }
      } else {
        // Mark as visible
        this.elements.body.classList.add("is-article-visible");

        // Show article after delay
        setTimeout(() => {
          // Hide header and footer
          if (this.elements.header) this.elements.header.style.display = "none";
          if (this.elements.footer) this.elements.footer.style.display = "none";

          // Show main
          if (this.elements.main) this.elements.main.style.display = "";

          // Hide all articles first
          this.articles.forEach((a) => {
            a.style.display = "none";
          });

          // Show only the target article
          article.style.display = "";

          // Activate article after another delay
          setTimeout(() => {
            article.classList.add("active");
            this.currentArticle = article;

            // Scroll to top
            window.scrollTo(0, 0);

            // Unlock after final delay
            setTimeout(() => {
              this.locked = false;
            }, this.config.animationDelay);
          }, 25);
        }, this.config.animationDelay);
      }
    } catch (error) {
      console.error("Error showing article:", error);
      this.handleError(error);
      this.locked = false;
    }
  }

  /**
   * Hide the current article
   */
  hideArticle() {
    try {
      // Article not visible? Bail
      if (!this.elements.body.classList.contains("is-article-visible")) {
        return;
      }

      // Already locked? Bail
      if (this.locked) {
        return;
      }

      // Lock
      this.locked = true;

      // Deactivate current article
      if (this.currentArticle) {
        this.currentArticle.classList.remove("active");
      }

      // Hide article after delay
      setTimeout(() => {
        // Hide all articles
        this.articles.forEach((a) => {
          a.style.display = "none";
        });

        this.currentArticle = null;

        // Hide main
        if (this.elements.main) this.elements.main.style.display = "none";

        // Show header and footer after another delay
        setTimeout(() => {
          if (this.elements.header) this.elements.header.style.display = "";
          if (this.elements.footer) this.elements.footer.style.display = "";

          // Mark as not visible
          this.elements.body.classList.remove("is-article-visible");

          // Unlock after final delay
          setTimeout(() => {
            this.locked = false;
          }, this.config.animationDelay);
        }, 25);
      }, this.config.animationDelay);
    } catch (error) {
      console.error("Error hiding article:", error);
      this.handleError(error);
      this.locked = false;
    }
  }

  /**
   * Handle errors
   * @param {Error} error - The error object
   */
  handleError(error) {
    // Log to console (already done in catch blocks)
    // Could also send to error tracking service

    // Show user-friendly message if needed
    if (error.message && error.message.includes("article")) {
      console.info("Article navigation error handled gracefully");
    }
  }
}

// Initialize when DOM is ready
function initPortfolioApp() {
  // Wait a bit for portfolio-render.js to finish
  setTimeout(() => {
    window.portfolioApp = new PortfolioApp();

    // Initially hide all articles
    const articles = document.querySelectorAll("#main article");
    articles.forEach((article) => {
      article.style.display = "none";
    });

    // Hide main initially
    const main = document.getElementById("main");
    if (main) {
      main.style.display = "none";
    }
  }, 100);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPortfolioApp);
} else {
  // DOM is already ready
  initPortfolioApp();
}
