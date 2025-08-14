/**
 * Utility Functions - Modern ES6+ Version
 * Replaces jQuery-based utilities with native JavaScript
 */

"use strict";

/**
 * Breakpoint Manager - Handles responsive breakpoints
 */
class BreakpointManager {
  constructor(breakpoints = {}) {
    this.breakpoints = breakpoints;
    this.currentBreakpoint = null;
    this.listeners = new Map();

    this.init();
  }

  init() {
    // Setup resize listener
    window.addEventListener(
      "resize",
      this.debounce(() => {
        this.checkBreakpoint();
      }, 250)
    );

    // Initial check
    this.checkBreakpoint();
  }

  /**
   * Check current breakpoint
   */
  checkBreakpoint() {
    const width = window.innerWidth;
    let newBreakpoint = "default";

    for (const [name, [min, max]] of Object.entries(this.breakpoints)) {
      const minWidth = min || 0;
      const maxWidth = max || Infinity;

      if (width >= minWidth && width <= maxWidth) {
        newBreakpoint = name;
        break;
      }
    }

    if (newBreakpoint !== this.currentBreakpoint) {
      const oldBreakpoint = this.currentBreakpoint;
      this.currentBreakpoint = newBreakpoint;
      this.triggerListeners(newBreakpoint, oldBreakpoint);
    }
  }

  /**
   * Add breakpoint change listener
   */
  on(callback) {
    const id = Symbol();
    this.listeners.set(id, callback);
    return () => this.listeners.delete(id);
  }

  /**
   * Trigger all listeners
   */
  triggerListeners(newBreakpoint, oldBreakpoint) {
    this.listeners.forEach((callback) => {
      try {
        callback(newBreakpoint, oldBreakpoint);
      } catch (error) {
        console.error("Breakpoint listener error:", error);
      }
    });
  }

  /**
   * Check if current breakpoint matches
   */
  is(breakpoint) {
    return this.currentBreakpoint === breakpoint;
  }

  /**
   * Check if current width is less than or equal to breakpoint
   */
  lte(breakpoint) {
    const width = window.innerWidth;
    const [min, max] = this.breakpoints[breakpoint] || [0, 0];
    return width <= (max || Infinity);
  }

  /**
   * Check if current width is greater than or equal to breakpoint
   */
  gte(breakpoint) {
    const width = window.innerWidth;
    const [min] = this.breakpoints[breakpoint] || [0, 0];
    return width >= (min || 0);
  }

  /**
   * Debounce utility
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

/**
 * Browser Detection - Modern replacement for browser.js
 */
class BrowserDetection {
  constructor() {
    this.userAgent = navigator.userAgent.toLowerCase();
    this.platform = navigator.platform.toLowerCase();

    // Detect browser
    this.browser = this.detectBrowser();

    // Detect OS
    this.os = this.detectOS();

    // Detect features
    this.features = this.detectFeatures();
  }

  detectBrowser() {
    const ua = this.userAgent;

    if (ua.includes("firefox")) return "firefox";
    if (ua.includes("edg/")) return "edge";
    if (ua.includes("chrome")) return "chrome";
    if (ua.includes("safari") && !ua.includes("chrome")) return "safari";
    if (ua.includes("opera") || ua.includes("opr/")) return "opera";

    return "unknown";
  }

  detectOS() {
    const ua = this.userAgent;
    const platform = this.platform;

    if (platform.includes("win")) return "windows";
    if (platform.includes("mac")) return "macos";
    if (platform.includes("linux")) return "linux";
    if (/android/.test(ua)) return "android";
    if (/iphone|ipad|ipod/.test(ua)) return "ios";

    return "unknown";
  }

  detectFeatures() {
    return {
      touch: "ontouchstart" in window || navigator.maxTouchPoints > 0,
      webp: this.supportsWebP(),
      smoothScroll: "scrollBehavior" in document.documentElement.style,
      grid: CSS.supports("display", "grid"),
      flexbox: CSS.supports("display", "flex"),
      customProperties: CSS.supports("--custom", "property"),
    };
  }

  supportsWebP() {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    return canvas.toDataURL("image/webp").indexOf("image/webp") === 5;
  }

  is(browser) {
    return this.browser === browser;
  }

  isOS(os) {
    return this.os === os;
  }

  hasFeature(feature) {
    return this.features[feature] || false;
  }
}

/**
 * DOM Utilities
 */
class DOMUtils {
  /**
   * Query selector with error handling
   */
  static $(selector, context = document) {
    try {
      return context.querySelector(selector);
    } catch (error) {
      console.error(`Invalid selector: ${selector}`, error);
      return null;
    }
  }

  /**
   * Query selector all with error handling
   */
  static $$(selector, context = document) {
    try {
      return Array.from(context.querySelectorAll(selector));
    } catch (error) {
      console.error(`Invalid selector: ${selector}`, error);
      return [];
    }
  }

  /**
   * Add event listener with delegation support
   */
  static on(element, event, selectorOrHandler, handler) {
    if (typeof selectorOrHandler === "function") {
      // Direct event binding
      element.addEventListener(event, selectorOrHandler);
    } else {
      // Event delegation
      element.addEventListener(event, (e) => {
        const target = e.target.closest(selectorOrHandler);
        if (target && element.contains(target)) {
          handler.call(target, e);
        }
      });
    }
  }

  /**
   * Ready function
   */
  static ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  /**
   * Fade in element
   */
  static fadeIn(element, duration = 300) {
    return new Promise((resolve) => {
      element.style.opacity = "0";
      element.style.display = "";
      element.style.transition = `opacity ${duration}ms`;

      // Force reflow
      element.offsetHeight;

      element.style.opacity = "1";

      setTimeout(() => {
        element.style.transition = "";
        resolve();
      }, duration);
    });
  }

  /**
   * Fade out element
   */
  static fadeOut(element, duration = 300) {
    return new Promise((resolve) => {
      element.style.transition = `opacity ${duration}ms`;
      element.style.opacity = "0";

      setTimeout(() => {
        element.style.display = "none";
        element.style.transition = "";
        resolve();
      }, duration);
    });
  }

  /**
   * Slide toggle
   */
  static slideToggle(element, duration = 300) {
    if (window.getComputedStyle(element).display === "none") {
      return this.slideDown(element, duration);
    } else {
      return this.slideUp(element, duration);
    }
  }

  /**
   * Slide down
   */
  static slideDown(element, duration = 300) {
    return new Promise((resolve) => {
      element.style.display = "";
      const height = element.offsetHeight;
      element.style.overflow = "hidden";
      element.style.height = "0";
      element.style.transition = `height ${duration}ms`;

      // Force reflow
      element.offsetHeight;

      element.style.height = `${height}px`;

      setTimeout(() => {
        element.style.height = "";
        element.style.overflow = "";
        element.style.transition = "";
        resolve();
      }, duration);
    });
  }

  /**
   * Slide up
   */
  static slideUp(element, duration = 300) {
    return new Promise((resolve) => {
      const height = element.offsetHeight;
      element.style.overflow = "hidden";
      element.style.height = `${height}px`;
      element.style.transition = `height ${duration}ms`;

      // Force reflow
      element.offsetHeight;

      element.style.height = "0";

      setTimeout(() => {
        element.style.display = "none";
        element.style.height = "";
        element.style.overflow = "";
        element.style.transition = "";
        resolve();
      }, duration);
    });
  }

  /**
   * Check if element is in viewport
   */
  static isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
}

// Export utilities
window.BreakpointManager = BreakpointManager;
window.BrowserDetection = BrowserDetection;
window.DOMUtils = DOMUtils;

// Create shortcuts
window.$ = DOMUtils.$;
window.$$ = DOMUtils.$$;
