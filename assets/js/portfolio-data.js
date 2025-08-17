/**
 * Portfolio Data - Centralized data structure for portfolio content
 * Supports multilingual content (English and Traditional Chinese)
 */

const portfolioData = {
  // Personal Information
  profile: {
    name: "Crazyfire Lee",
    avatar:
      "https://s.gravatar.com/avatar/6f0afd73f9e68da18c23f56385a9759e?s=130",
    location: {
      en: "Taipei, Taiwan 🇹🇼",
      zh: "台北, 台灣 🇹🇼",
    },
    title: {
      en: "Software Engineer",
      zh: "軟體工程師",
    },
    expertise: {
      en: "Machine Learning / Web Development / Information Security",
      zh: "機器學習 / 網頁開發 / 資訊安全",
    },
  },

  // Navigation Links
  navigation: {
    internal: [
      { href: "#intro_en", text: "Intro" },
      { href: "#intro_zhtw", text: "簡介" },
    ],
    external: [
      { href: "https://blog.crazyfirelee.tw", text: "Blog" },
      { href: "https://github.com/fdff87554", text: "Github" },
      {
        href: "https://www.linkedin.com/in/darren-lee-69790b187/",
        text: "LinkedIn",
      },
      { href: "mailto:me@crazyfirelee.tw", text: "Email" },
    ],
  },

  // Experience Section
  experience: {
    jobs: [
      {
        title: {
          en: "Threat Research Team Software Engineer",
          zh: "威脅研究團隊軟體工程師",
        },
        company: {
          en: "TXOne Networks Inc.",
          zh: "睿控網安 (TXOne Networks)",
        },
        period: {
          en: "Apr. 2025 - Present",
          zh: "2025年4月 - 現在",
        },
      },
      {
        title: {
          en: "Threat Signature Research Team Intern",
          zh: "威脅情資研究實習生",
        },
        company: {
          en: "TXOne Networks Inc.",
          zh: "睿控網安 (TXOne Networks)",
        },
        period: {
          en: "Apr. 2023 - Sept. 2024",
          zh: "2023年4月 - 2024年9月",
        },
      },
      {
        title: {
          en: "AI Development Assistant Engineer (Intern)",
          zh: "AI開發助理工程師（實習）",
        },
        company: {
          en: "Wiwynn - AI & Data Development Department",
          zh: "緯穎科技服務 - AI與數據智慧開發部",
        },
        period: {
          en: "Mar. 2022 - Jul. 2022",
          zh: "2022年3月 - 2022年7月",
        },
      },
      {
        title: {
          en: "Deep Learning Teaching Assistant",
          zh: "深度學習課程助教",
        },
        company: {
          en: "Fu Jen Catholic University - Department of Computer Science",
          zh: "輔仁大學資訊工程學系",
        },
        period: {
          en: "Jun. 2021 - Feb. 2022",
          zh: "2021年6月 - 2022年2月",
        },
      },
      {
        title: {
          en: "Smart Manufacturing Transformation Intern",
          zh: "智慧製造轉型實習生",
        },
        company: {
          en: "AUO Corporation - A+ Summer Internship Program",
          zh: "友達光電 - A+ 暑期實習計畫",
        },
        period: {
          en: "Jul. 2020 - Aug. 2020",
          zh: "2020年7月 - 2020年8月",
        },
      },
    ],
    activities: [
      {
        title: {
          en: "AIS3 Junior (Advanced Information Security Summer School)",
          zh: "教育部資安人才培育計畫（AIS3 Junior）",
        },
        role: {
          en: "Speaker / Teaching Assistant",
          zh: "講師 / 助教",
        },
        period: {
          en: "2022 - 2024",
          zh: "2022 - 2024",
        },
      },
      {
        title: {
          en: "OPass Android",
          zh: "OPass Android 開源專案",
        },
        role: {
          en: "Co-maintainer",
          zh: "共同維護者",
        },
        period: {
          en: "2022 - Present",
          zh: "2022 - 至今",
        },
      },
      {
        title: {
          en: "NISRA (Networks and Information Security Research Association)",
          zh: "輔大資訊安全研究會（NISRA）",
        },
        role: {
          en: "Vice President",
          zh: "副會長",
        },
        period: {
          en: "2019 - 2020",
          zh: "2019 - 2020",
        },
      },
    ],
  },

  // Education Section
  education: [
    {
      degree: {
        en: "Master's Degree in Institute of Information Security",
        zh: "資訊安全研究所 碩士",
      },
      institution: {
        en: "National Tsing Hua University",
        zh: "國立清華大學",
      },
      period: {
        en: "Sept. 2022 - Jun. 2024",
        zh: "2022年9月 - 2024年6月",
      },
    },
    {
      degree: {
        en: "Bachelor's Degree in Computer Science and Information Engineering",
        zh: "資訊工程學系 學士",
      },
      institution: {
        en: "Fu Jen Catholic University",
        zh: "天主教輔仁大學",
      },
      period: {
        en: "Sept. 2018 - Jun. 2022",
        zh: "2018年9月 - 2022年6月",
      },
    },
  ],

  // Skills Section
  skills: [
    {
      category: {
        en: "Deep Learning",
        zh: "深度學習",
      },
      items: ["TensorFlow", "PyTorch"],
    },
    {
      category: {
        en: "Development & Project Management",
        zh: "開發與專案管理",
      },
      items: ["NextJS", "ReactJS", "Docker", "Kubernetes"],
    },
  ],

  // Projects Section
  projects: [
    {
      title: {
        en: "Enhancing AI Model Training Efficiency through Distributed GPU Management",
        zh: "透過分散式 GPU 管理提升 AI 模型訓練效率",
      },
      organization: {
        en: "Master's thesis from National Tsing Hua University 2024",
        zh: "國立清華大學 2024 碩士論文",
      },
    },
    {
      title: {
        en: "Evolutionary KMeans for Industrial Control Anomaly Detection",
        zh: "Evolutionary KMeans for Industrial Control Anomaly Detection",
      },
      organization: {
        en: "ARIS 2023 Research Paper",
        zh: "ARIS 2023 研究論文",
      },
    },
    {
      title: {
        en: "Classifier and Clusterer Combine Method Research",
        zh: "分類與分群模型結合方法研究",
      },
      organization: {
        en: "Wiwynn Corporation Internal Project",
        zh: "緯穎科技服務內部專案",
      },
    },
    {
      title: {
        en: "Unsupervised Learning in Industrial Control Security",
        zh: "工業控制安全之非監督式學習應用",
      },
      organization: {
        en: "AIS3 Critical Infrastructure Group Project, 2021",
        zh: "AIS3 關鍵基礎設施組專題, 2021",
      },
    },
    {
      title: {
        en: "Time Series Prediction for ICS Anomaly Detection",
        zh: "工控系統時序預測異常檢測研究",
      },
      organization: {
        en: "Bionic Computing Course Project, 2021",
        zh: "仿生計算課程專題, 2021",
      },
    },
    {
      title: {
        en: "Deep Learning for Hidden Watermarking",
        zh: "深度學習於隱藏式浮水印之應用",
      },
      organization: {
        en: "Fu Jen Catholic University Graduation Project",
        zh: "輔仁大學畢業專題",
      },
    },
    {
      title: {
        en: "Security Vulnerability Lab Environment",
        zh: "資安漏洞靶機環境建置",
      },
      organization: {
        en: "NISRA Training Platform",
        zh: "NISRA 教學平台",
      },
    },
  ],

  // Speaking Section
  speaking: [
    {
      title: {
        en: "Financial Industry Cybersecurity Workshop",
        zh: "金融業資安研習",
      },
      event: {
        en: "AI Cybersecurity for Everyone: New Generation Cybersecurity Challenges",
        zh: "AI 資安你我他，新世代的資安問題",
      },
      role: {
        en: "Speaker",
        zh: "講師",
      },
      date: "2025",
    },
    {
      title: {
        en: "AIS3 2025 Alumni Sharing Session",
        zh: "AIS3 2025 校友分享會",
      },
      event: {
        en: "The Path of Cybersecurity: Are You Ready?",
        zh: "資安這條路，你準備好了嗎？",
      },
      role: {
        en: "Speaker",
        zh: "講師",
      },
      date: "2025",
    },
    {
      title: {
        en: "CHJHS Cybersecurity Workshop",
        zh: "CHJHS 資安工作坊",
      },
      event: {
        en: "Unveiling the Mysteries of Hackers",
        zh: "揭開駭客的神秘面紗",
      },
      role: {
        en: "Speaker",
        zh: "講師",
      },
      date: "2025",
    },
    {
      title: {
        en: "Financial Industry Cybersecurity Workshop",
        zh: "金融業資安研習",
      },
      event: {
        en: "Introduction to AI and AI Security",
        zh: "AI 導論與 AI 資訊安全",
      },
      role: {
        en: "Speaker",
        zh: "講師",
      },
      date: "2024",
    },
    {
      title: {
        en: "AIS3 Junior Program",
        zh: "教育部資安人才培育計畫",
      },
      event: {
        en: "Introduction to Information Security and AI",
        zh: "資訊安全與人工智慧概論",
      },
      role: {
        en: "Speaker",
        zh: "講師",
      },
      date: "2024",
    },
    {
      title: {
        en: "Fushing Senior High School",
        zh: "復興實驗高級中學",
      },
      event: {
        en: "Network Security and Cybersecurity Workshop",
        zh: "資安與網路安全工作坊",
      },
      role: {
        en: "Speaker",
        zh: "講師",
      },
      date: "2024",
    },
    {
      title: {
        en: "Yungping High School",
        zh: "永平高級中學",
      },
      event: {
        en: "Introduction to Cybersecurity World",
        zh: "資訊安全世界導論",
      },
      role: {
        en: "Guest Speaker",
        zh: "講師",
      },
      date: "2024",
    },
    {
      title: {
        en: "NISRA Workshop",
        zh: "輔大資訊安全研究會",
      },
      event: {
        en: "VPN Security Challenge",
        zh: "VPN 資安挑戰賽",
      },
      role: {
        en: "Speaker",
        zh: "講師",
      },
      date: "2024",
    },
    {
      title: {
        en: "AIS3 Club",
        zh: "AIS3 社群講座",
      },
      event: {
        en: "Web Security Workshop",
        zh: "網頁安全實務工作坊",
      },
      role: {
        en: "Speaker",
        zh: "講師",
      },
      date: "2023",
    },
    {
      title: {
        en: "AIS3 Junior Program",
        zh: "教育部資安人才培育計畫",
      },
      event: null,
      role: {
        en: "Teaching Assistant",
        zh: "助教",
      },
      date: "2022 - 2023",
    },
  ],

  // Section Titles
  sectionTitles: {
    about: {
      en: "About Me",
      zh: "關於我",
    },
    experience: {
      en: "Experience",
      zh: "工作經歷",
    },
    activities: {
      en: "Activities",
      zh: "社群活動",
    },
    education: {
      en: "Education",
      zh: "學歷",
    },
    skills: {
      en: "Technical Skills",
      zh: "技術能力",
    },
    projects: {
      en: "Projects & Papers",
      zh: "專案研究與論文",
    },
    speaking: {
      en: "Speaking",
      zh: "演講與授課經驗",
    },
  },
};

// Export for use in other scripts
if (typeof module !== "undefined" && module.exports) {
  module.exports = portfolioData;
}
