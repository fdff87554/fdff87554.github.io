/**
 * Portfolio Renderer - Dynamic content rendering based on portfolio data
 * Handles both English and Chinese versions
 */

class PortfolioRenderer {
  constructor(data) {
    this.data = data;
    this.currentLang = "en";
  }

  /**
   * Initialize the portfolio rendering
   */
  init() {
    try {
      // Wait for DOM to be ready
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => this.render());
      } else {
        this.render();
      }
    } catch (error) {
      console.error("Failed to initialize portfolio renderer:", error);
    }
  }

  /**
   * Main render function
   */
  render() {
    try {
      this.renderHeader();
      this.renderContent("en", "intro_en");
      this.renderContent("zh", "intro_zhtw");
    } catch (error) {
      console.error("Failed to render portfolio content:", error);
    }
  }

  /**
   * Render header section with profile and navigation
   */
  renderHeader() {
    const header = document.getElementById("header");
    if (!header) return;

    // Determine language based on document lang attribute
    // Default to English, only use Chinese if explicitly set to zh-*
    const lang = document.documentElement.lang.startsWith("zh") ? "zh" : "en";

    // Update profile information
    const logoImg = header.querySelector(".logo img");
    if (logoImg) {
      logoImg.src = this.data.profile.avatar;
      logoImg.alt = `${this.data.profile.name} 的個人照片`;
    }

    const nameElement = header.querySelector("h1");
    if (nameElement) {
      nameElement.textContent = this.data.profile.name;
    }

    // Update location and expertise from data source (DRY principle)
    const descElement = header.querySelector(".content .inner p");
    if (descElement) {
      descElement.innerHTML = `${this.data.profile.location[lang]} <br />
        ${this.data.profile.expertise[lang]}`;
    }

    // Render navigation
    const nav = header.querySelector("nav ul");
    if (nav) {
      nav.innerHTML = "";

      // Add internal navigation links
      this.data.navigation.internal.forEach((link) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = link.href;
        a.textContent = link.text;
        li.appendChild(a);
        nav.appendChild(li);
      });

      // Add external navigation links
      this.data.navigation.external.forEach((link) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = link.href;
        a.textContent = link.text;
        if (link.href.startsWith("http") || link.href.startsWith("mailto:")) {
          a.target = "_blank";
          a.rel = "noopener noreferrer";
        }
        li.appendChild(a);
        nav.appendChild(li);
      });
    }
  }

  /**
   * Render content for specific language version
   */
  renderContent(lang, articleId) {
    const article = document.getElementById(articleId);
    if (!article) return;

    // Clear existing content
    article.innerHTML = "";

    // Add title
    const title = document.createElement("h2");
    title.className = "major";
    title.textContent = this.data.sectionTitles.about[lang];
    article.appendChild(title);

    // Render sections
    this.renderExperienceSection(article, lang);
    this.renderEducationSection(article, lang);
    this.renderSkillsSection(article, lang);
    this.renderProjectsSection(article, lang);
    this.renderSpeakingSection(article, lang);
  }

  /**
   * Generic list item renderer (DRY principle)
   * @param {HTMLElement} parent - Parent element to append items to
   * @param {Array} items - Array of items to render
   * @param {string} lang - Language code
   * @param {Object} config - Configuration for field mapping
   */
  renderListItems(parent, items, lang, config) {
    items.forEach((item) => {
      const div = document.createElement("div");
      div.className = config.className;

      const title = document.createElement("h4");
      title.textContent = item[config.titleKey][lang];
      div.appendChild(title);

      const subtitle = document.createElement("div");
      subtitle.className = config.subtitleClassName;
      subtitle.textContent = item[config.subtitleKey][lang];
      div.appendChild(subtitle);

      const date = document.createElement("div");
      date.className = "date";
      date.textContent = item.period[lang];
      div.appendChild(date);

      parent.appendChild(div);
    });
  }

  /**
   * Render experience section (jobs and activities)
   */
  renderExperienceSection(parent, lang) {
    const section = document.createElement("section");
    section.className = "section experience";
    section.setAttribute(
      "aria-label",
      this.data.sectionTitles.experience[lang]
    );

    // Jobs subsection
    const jobsTitle = document.createElement("h3");
    jobsTitle.textContent = this.data.sectionTitles.experience[lang];
    section.appendChild(jobsTitle);

    this.renderListItems(section, this.data.experience.jobs, lang, {
      className: "job",
      titleKey: "title",
      subtitleClassName: "company",
      subtitleKey: "company",
    });

    // Activities subsection
    const activitiesTitle = document.createElement("h3");
    activitiesTitle.textContent = this.data.sectionTitles.activities[lang];
    section.appendChild(activitiesTitle);

    this.renderListItems(section, this.data.experience.activities, lang, {
      className: "job",
      titleKey: "title",
      subtitleClassName: "company",
      subtitleKey: "role",
    });

    parent.appendChild(section);
  }

  /**
   * Render education section
   */
  renderEducationSection(parent, lang) {
    const section = document.createElement("section");
    section.className = "section education";
    section.setAttribute("aria-label", this.data.sectionTitles.education[lang]);

    const title = document.createElement("h3");
    title.textContent = this.data.sectionTitles.education[lang];
    section.appendChild(title);

    this.data.education.forEach((edu) => {
      const eduDiv = document.createElement("div");
      eduDiv.className = "education-item";

      const degree = document.createElement("h4");
      degree.textContent = edu.degree[lang];
      eduDiv.appendChild(degree);

      const institution = document.createElement("div");
      institution.className = "institution";
      institution.textContent = edu.institution[lang];
      eduDiv.appendChild(institution);

      const date = document.createElement("div");
      date.className = "date";
      date.textContent = edu.period[lang];
      eduDiv.appendChild(date);

      section.appendChild(eduDiv);
    });

    parent.appendChild(section);
  }

  /**
   * Render skills section
   */
  renderSkillsSection(parent, lang) {
    const section = document.createElement("section");
    section.className = "section skills";
    section.setAttribute("aria-label", this.data.sectionTitles.skills[lang]);

    const title = document.createElement("h3");
    title.textContent = this.data.sectionTitles.skills[lang];
    section.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "skills-grid";

    this.data.skills.forEach((skill) => {
      const skillDiv = document.createElement("div");
      skillDiv.className = "skill-category";

      const categoryTitle = document.createElement("h4");
      categoryTitle.textContent = skill.category[lang];
      skillDiv.appendChild(categoryTitle);

      const list = document.createElement("ul");
      skill.items.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        list.appendChild(li);
      });
      skillDiv.appendChild(list);

      grid.appendChild(skillDiv);
    });

    section.appendChild(grid);
    parent.appendChild(section);
  }

  /**
   * Render projects section
   */
  renderProjectsSection(parent, lang) {
    const section = document.createElement("section");
    section.className = "section projects";
    section.setAttribute("aria-label", this.data.sectionTitles.projects[lang]);

    const title = document.createElement("h3");
    title.textContent = this.data.sectionTitles.projects[lang];
    section.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "projects-grid";

    this.data.projects.forEach((project) => {
      const projectDiv = document.createElement("div");
      projectDiv.className = "project-item";

      const projectTitle = document.createElement("h4");
      projectTitle.textContent = project.title[lang];
      projectDiv.appendChild(projectTitle);

      const org = document.createElement("div");
      org.className = "institution";
      org.textContent = project.organization[lang];
      projectDiv.appendChild(org);

      grid.appendChild(projectDiv);
    });

    section.appendChild(grid);
    parent.appendChild(section);
  }

  /**
   * Render speaking section
   */
  renderSpeakingSection(parent, lang) {
    const section = document.createElement("section");
    section.className = "section presentations";
    section.setAttribute("aria-label", this.data.sectionTitles.speaking[lang]);

    const title = document.createElement("h3");
    title.textContent = this.data.sectionTitles.speaking[lang];
    section.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "presentations-grid";

    this.data.speaking.forEach((item) => {
      const presentationDiv = document.createElement("div");
      presentationDiv.className = "presentation-item";

      const presentationTitle = document.createElement("h4");
      presentationTitle.textContent = item.title[lang];
      presentationDiv.appendChild(presentationTitle);

      if (item.event) {
        const event = document.createElement("div");
        event.className = "event";
        event.textContent = item.event[lang];
        presentationDiv.appendChild(event);
      }

      const role = document.createElement("div");
      role.className = "role";
      role.textContent = item.role[lang];
      presentationDiv.appendChild(role);

      const date = document.createElement("div");
      date.className = "date";
      date.textContent = item.date;
      presentationDiv.appendChild(date);

      grid.appendChild(presentationDiv);
    });

    section.appendChild(grid);
    parent.appendChild(section);
  }
}

// Initialize renderer when data is available
if (typeof portfolioData !== "undefined") {
  const renderer = new PortfolioRenderer(portfolioData);
  renderer.init();
}
