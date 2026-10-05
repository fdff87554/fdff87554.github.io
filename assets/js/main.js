"use strict";

/*
 * 首頁的語系切換與段落抽屜。
 *
 * 兩個狀態、兩個位置：
 *   - 段落在 hash（#about…）。它是位置，上一頁 / 下一頁要能開關抽屜。
 *   - 語系在 query（?lang=）。它是檢視偏好，用 replaceState 不進 history——
 *     否則「開段落 → 切語系 → 切回 → 關閉」要按四次上一頁。
 *   兩者互不干擾，所以切換語系會停在同一段落。
 *   localStorage 只是「上次選過什麼」的記憶，不是來源：別人收到連結時
 *   看到的語系要和寄出的人一樣，所以 ?lang= 優先。
 *
 * 設計上只有一個寫入點：render() 讀網址與 currentLang，算出目標畫面再套用。
 * 它是同步的、可重複呼叫、而且不帶任何 setTimeout——進退場的時間全部留在
 * CSS（見 site.css 的 --drawer-in / --drawer-out 與 visibility 的延遲切換）。
 * 事件處理器只改網址或 currentLang，不直接動畫面。
 *
 * <head> 的 inline script 已在第一次 paint 前決定語系並寫進 html[data-lang]，
 * 這支檔案只讀回來，不重算。
 */

const LANGS = ["en", "zh-TW"];
const STORAGE_KEY = "lang";

// 舊版的兩個語系連結。沒有 JS 時它們是 #about 裡的真實錨點，有 JS 時轉成帶語系的網址。
const ALIASES = {
  intro_en: ["en", "about"],
  intro_zhtw: ["zh-TW", "about"],
};

// 只給輔助技術讀，不會顯示在畫面上，所以不影響字型子集
const UI = {
  en: { close: "Close", prev: "Previous section", next: "Next section" },
  "zh-TW": { close: "關閉", prev: "上一段", next: "下一段" },
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

const root = document.documentElement;

// 目前的語系。畫面狀態的唯一來源，不直接讀 root.dataset.lang——那是輸出，可能被外部改掉。
let currentLang = "en";
// 目前打開的段落 id，null = 停在首頁
let openId = null;
// 觸發開啟的那一列，關閉時把焦點還回去
let lastTrigger = null;
let rows = [];
let locked = false;
// enhance() 註冊過的監聽器，初始化失敗時要全部移除（見 resetToFallback）
const bound = [];
// 初始化失敗之後就停在 fallback，不讓殘留的事件處理器把畫面改回來
let disabled = false;

/**
 * 所有監聽器都要經過這裡註冊。
 *
 * 初始化失敗時要讓頁面回到「main.js 根本沒載到」的狀態，而殘留的 handler 會
 * 破壞那個狀態——最明顯的是語系連結：onLangClick 會 preventDefault()，
 * 但 render() 已經因為 disabled 直接 return，於是連結既不換頁也不更新畫面。
 * 逐一加 disabled 守衛也能修，但那要記得替每個新 handler 補；集中註冊、
 * 集中移除，漏掉時是立刻看得出來，不是靜默失效。
 */
function on(target, type, fn, options) {
  target.addEventListener(type, fn, options);
  bound.push([target, type, fn, options]);
}

/* ========================================
   Model：開機時讀一次 DOM，之後都是純函式
   ======================================== */

function buildModel() {
  rows = [...document.querySelectorAll(".index__item")].map((item) => {
    const id = item.dataset.section || "";
    return {
      id,
      item,
      link: item.querySelector(".index__link"),
      section: id ? document.getElementById(id) : null,
      external: item.hasAttribute("data-external"),
    };
  });

  // 目錄列指向不存在的段落時整列藏起來：半成品的編輯不該留下點不開的列
  for (const row of rows) {
    if (!row.external && !row.section) row.item.hidden = true;
  }
}

/** 目前語系下真的看得到的目錄列，順序就是文件順序 */
function visibleRows() {
  return rows.filter(
    (row) => !row.item.hidden && getComputedStyle(row.item).display !== "none",
  );
}

/** 可以開抽屜的段落（扣掉外部連結那一列），也就是上一段 / 下一段的範圍 */
function drawerSections() {
  return visibleRows().filter((row) => !row.external);
}

function rowOf(id) {
  return drawerSections().find((row) => row.id === id) || null;
}

/* ========================================
   網址
   ======================================== */

/** 語系是檢視偏好不是位置，所以用 replaceState：上一頁不該用來還原語系 */
function writeLangToUrl(lang) {
  const url = new URL(location.href);
  url.searchParams.set("lang", lang);
  history.replaceState(history.state, "", url);
}

function persist(lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch (e) {
    // 無痕模式或關掉儲存權限時寫不進去，不影響當下這一頁
  }
}

/**
 * 開機時把舊連結轉成現在的寫法。只做一次 replaceState，不新增 history entry，
 * 所以從舊連結進站的人按一次上一頁就會離開本站，不會卡在轉址的中間狀態。
 */
function normalizeOnBoot() {
  // Object.hasOwn 而不是直接查：ALIASES 是一般物件，#constructor、#toString
  // 這類 hash 會查到繼承來的函式，解構時丟 TypeError: alias is not iterable，
  // 被 init() 的 catch 吞掉之後整頁無聲退回 fallback，還留著已經加上的 dialog 語意。
  const key = location.hash.slice(1);
  const alias = Object.hasOwn(ALIASES, key) ? ALIASES[key] : null;
  if (alias) {
    const [lang, target] = alias;
    currentLang = lang;
    persist(lang);
    const url = new URL(location.href);
    url.searchParams.set("lang", lang);
    url.hash = target;
    history.replaceState(history.state, "", url);
    return;
  }

  // 網址結尾只有一個 # 時把它清掉，但不動其他不認得的 hash：
  // 那可能是跳過導覽的連結或瀏覽器的文字片段指令，不該被我們吃掉
  if (location.href.endsWith("#")) {
    history.replaceState(
      history.state,
      "",
      location.pathname + location.search,
    );
  }
  writeLangToUrl(currentLang);
}

/* ========================================
   Render：畫面狀態的唯一寫入點
   ======================================== */

function render() {
  // enhance() 綁的監聽器在初始化失敗之後仍然在，pageshow 之類的事件會再呼叫
  // 一次 render()，把剛還原好的 fallback 又改回「JS 可用」的樣子
  if (disabled) return;

  applyLang(currentLang);

  const id = location.hash.slice(1);
  const target = id ? rowOf(id) : null;

  // 抽屜沒開著時整個 .sections 都不能操作。
  // 退場的 200ms 內 visibility 還沒真的切成 hidden，少了這一行就點得到正在
  // 滑走的面板——而那時 openId 已經是 null，按「下一段」會把第一段開起來。
  //
  // 必須在 openPanel() 之前解除：對 inert 元素呼叫 focus() 會直接返回
  // （HTML focusing steps），閘門還鎖著的話 openPanel() 裡的 section.focus()
  // 就是空轉。!target 等價於分支之後的 openId === null。
  setSectionsInert(!target);

  // 認不得的 hash、或 Now 這種當下不存在的段落：停在首頁、不開抽屜、不改網址。
  // 不存在的段落不需要特別判斷——buildModel 早就沒把它放進來，查不到就是查不到。
  if (!target) {
    closePanel();
  } else {
    openPanel(target);
  }
}

function applyLang(lang) {
  currentLang = lang;
  root.dataset.lang = lang;
  root.lang = lang;

  for (const option of document.querySelectorAll("[data-lang-option]")) {
    const selected = option.dataset.langOption === lang;
    // aria-current 同時是樣式的鉤子（見 site.css）與給輔助技術的狀態
    if (selected) option.setAttribute("aria-current", "true");
    else option.removeAttribute("aria-current");
  }

  syncIndex();
}

/**
 * 編號、快捷鍵與頁尾提示都從「目前看得到的列」算出來，不寫死：
 * Now 沒有資料時整列不存在，GitHub 與文章自動遞補成 04 / 05。
 */
function syncIndex() {
  const visible = visibleRows();
  visible.forEach((row, i) => {
    row.link.setAttribute("aria-keyshortcuts", String(i + 1));
  });
  for (const row of rows) {
    if (!visible.includes(row)) row.link.removeAttribute("aria-keyshortcuts");
  }

  const hint = document.querySelector(".colophon__range");
  if (hint) hint.textContent = visible.length > 1 ? `1–${visible.length}` : "1";
}

function openPanel(target) {
  const section = target.section;
  const sections = drawerSections();
  const at = sections.indexOf(target);

  if (openId !== target.id) {
    for (const row of rows) {
      if (row.section && row.section !== section) {
        row.section.removeAttribute("data-open");
        // aria-modal 也要一起清：只留在目前打開的那一段，
        // 否則換過幾段之後會有好幾個元素同時宣告自己是 modal
        row.section.removeAttribute("aria-modal");
      }
      if (row.link) row.link.removeAttribute("aria-current");
    }
    section.setAttribute("data-open", "");
    section.setAttribute("aria-modal", "true");
    target.link.setAttribute("aria-current", "true");
    // 換段落時內容要從頭看起，舊的捲動位置對新內容沒有意義
    const panelBody = section.querySelector(".panel__body");
    if (panelBody) panelBody.scrollTop = 0;
  }

  // 頁首的編號取「目錄列的序號」而不是 drawerSections 的序號：
  // 外部連結那一列夾在中間時兩者會不同
  const num = section.querySelector(".panel__num");
  if (num) {
    num.textContent = String(visibleRows().indexOf(target) + 1).padStart(
      2,
      "0",
    );
  }

  const label = section.querySelector(".panel__label");
  const title = section.querySelector(".panel__title");
  if (label && title && !label.firstChild) {
    // 從 <h2> 複製過來，不在 HTML 裡寫第二份：兩邊的字不可能走鐘
    for (const node of title.childNodes)
      label.appendChild(node.cloneNode(true));
  }

  syncSteps(section, sections, at);

  const closeBtn = section.querySelector(".panel__close");
  if (closeBtn) closeBtn.setAttribute("aria-label", UI[currentLang].close);

  openId = target.id;
  // 順序有意義：setScrollLock 量的是捲軸寬度，而 .drawer-open 會套上
  // body { overflow: hidden }。先加 class 的話，讀 clientWidth 觸發 layout 時
  // 捲軸已經收起來，量到 0、補償失效，背景就會橫向跳一下。
  setScrollLock(true);
  root.classList.add("drawer-open");
  setBackgroundInert(true);

  // 焦點一定要進抽屜：背景已經 inert，留在外面會被瀏覽器移開、使用者就迷路了。
  // 焦點給 section 而不是 <h2>，輔助技術才會同時念出名稱與 dialog 角色。
  if (!section.contains(document.activeElement)) {
    section.focus({ preventScroll: true });
  }
}

/** 上一段 / 下一段到頭就停，不繞回去：只有幾個段落，繞回去會讓人分不清在哪裡 */
function syncSteps(section, sections, at) {
  const visible = visibleRows();
  for (const step of section.querySelectorAll(".panel__step")) {
    const isPrev = step.dataset.step === "prev";
    const neighbour = sections[isPrev ? at - 1 : at + 1];
    const numEl = step.querySelector(".panel__stepnum");

    step.disabled = !neighbour;
    step.setAttribute(
      "aria-label",
      isPrev ? UI[currentLang].prev : UI[currentLang].next,
    );
    if (numEl) {
      numEl.textContent = neighbour
        ? String(visible.indexOf(neighbour) + 1).padStart(2, "0")
        : "";
    }
  }
}

/*
 * 關閉時刻意「不」移除 data-open。
 *
 * 退場的 200ms 是 .sections 整體在淡出與位移，而 data-open 一拿掉，
 * 裡面的 panel 立刻變成 display: none——滑出去的就只剩一塊空面板。
 * 留著它、只拿掉 <html> 的 drawer-open，內容就會跟著整個面板一起滑走。
 *
 * 殘留的 data-open 不會外洩：.sections 的 visibility: hidden 會讓它
 * 退出 tab 順序與無障礙樹，aria-modal 也在這裡清掉。下次開別的段落時，
 * openPanel() 的迴圈會把它清乾淨，而那時抽屜本來就是隱藏的。
 */
function closePanel() {
  if (openId === null) return;

  const section = document.getElementById(openId);
  if (section) section.removeAttribute("aria-modal");
  const row = rowOf(openId);
  if (row) row.link.removeAttribute("aria-current");

  openId = null;
  root.classList.remove("drawer-open");
  setScrollLock(false);
  setBackgroundInert(false);
  restoreFocus(section);
}

/* ========================================
   段落內分頁（目前只有 About 用）
   ======================================== */

/*
 * 一般的 tabs 模式：方向鍵在分頁之間移動、roving tabindex 讓整列只有一個
 * tab stop。方向鍵和「上一段 / 下一段」撞在一起，所以 onKeydown 以焦點位置
 * 分流——焦點在分頁列裡就換分頁，否則換段落。
 *
 * 沒有 JS 時分頁列整列不顯示（.js-only），四組內容照原樣依序排開，
 * 每組自己的 <h3> 就是標題，所以這裡不需要任何退路處理。
 */

function tabsOf(tablist) {
  return [...tablist.querySelectorAll('[role="tab"]')];
}

function selectTab(tab) {
  const tablist = tab.closest('[role="tablist"]');
  if (!tablist) return;

  for (const other of tabsOf(tablist)) {
    const selected = other === tab;
    other.setAttribute("aria-selected", String(selected));
    // roving tabindex：整列只留一個 tab stop
    other.tabIndex = selected ? 0 : -1;
    const panel = document.getElementById(other.getAttribute("aria-controls"));
    if (panel) panel.hidden = !selected;
  }
}

function initTabs() {
  for (const tablist of document.querySelectorAll('[role="tablist"]')) {
    const tabs = tabsOf(tablist);
    if (tabs.length === 0) continue;
    selectTab(tabs[0]);

    on(tablist, "click", (event) => {
      const tab = event.target.closest('[role="tab"]');
      if (tab) selectTab(tab);
    });
  }
}

/** 回傳 true 代表這個按鍵已經由分頁列處理掉 */
function handleTabKey(event) {
  const tab = event.target.closest('[role="tab"]');
  if (!tab) return false;

  const tabs = tabsOf(tab.closest('[role="tablist"]'));
  const at = tabs.indexOf(tab);
  let next = null;

  if (event.key === "ArrowRight") next = tabs[(at + 1) % tabs.length];
  else if (event.key === "ArrowLeft")
    next = tabs[(at - 1 + tabs.length) % tabs.length];
  else if (event.key === "Home") next = tabs[0];
  else if (event.key === "End") next = tabs[tabs.length - 1];
  else return false;

  event.preventDefault();
  selectTab(next);
  next.focus();
  return true;
}

/* ========================================
   Modality
   ======================================== */

function setScrollLock(on) {
  if (locked === on) return;
  locked = on;
  if (on) {
    // 一定要在加上 overflow: hidden 之前量，否則捲軸已經消失、量到 0
    root.style.setProperty(
      "--sbw",
      `${window.innerWidth - root.clientWidth}px`,
    );
  } else {
    root.style.removeProperty("--sbw");
  }
}

/**
 * inert 一次給到模態、焦點隔離與擋住點擊，不用再補 aria-hidden
 * （兩者並用會產生「焦點在 aria-hidden 裡」的警告）。
 * 只 inert .home：遮罩是它的兄弟節點，一起 inert 的話就點不到、關不掉了。
 */
function setBackgroundInert(on) {
  const home = document.querySelector(".home");
  if (home) home.inert = on;
}

/** 抽屜本身的隔離。由 render() 統一設定，開機 / 開啟 / 關閉 / 退場四種情況一次涵蓋 */
function setSectionsInert(on) {
  const sections = document.querySelector(".sections");
  if (sections) sections.inert = on;
}

function focusables(scope) {
  return [...scope.querySelectorAll(FOCUSABLE)].filter(
    (el) => el.offsetParent !== null,
  );
}

function trapTab(event) {
  if (openId === null) return;
  const section = document.getElementById(openId);
  if (!section) return;

  const items = focusables(section);
  if (items.length === 0) {
    event.preventDefault();
    section.focus({ preventScroll: true });
    return;
  }

  const first = items[0];
  const last = items[items.length - 1];

  // 剛開啟時焦點在 <section> 本身（tabindex="-1"，不在 items 裡）。
  // 不處理的話 Shift+Tab 不會被攔截，焦點會掉到抽屜外的 <body>——
  // 背景已經 inert，使用者就卡在一個按 Tab 也回不來的地方了。
  // W3C APG 的 modal dialog 要求正反向都留在對話框內。
  if (!items.includes(document.activeElement)) {
    event.preventDefault();
    (event.shiftKey ? last : first).focus();
    return;
  }

  if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  } else if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  }
}

/**
 * 關閉後焦點回到原本的那一列。從上一頁 / 下一頁開啟時沒有來源元素，
 * 退而求其次用「剛關掉的那一段」的目錄列——那正是使用者會去找的位置。
 */
function restoreFocus(closedSection) {
  const candidates = [
    lastTrigger,
    closedSection ? (rowOf(closedSection.id) || {}).link : null,
    (visibleRows()[0] || {}).link,
  ];
  lastTrigger = null;

  for (const el of candidates) {
    // 切換語系可能已經把來源那一列藏起來，所以要確認它還在畫面上
    if (el && el.isConnected && el.offsetParent !== null) {
      el.focus({ preventScroll: true });
      return;
    }
  }
}

/* ========================================
   網址操作
   ======================================== */

function openSection(id) {
  if (location.hash === `#${id}`) {
    // hash 沒變就不會有 hashchange；焦點可能已經飄走，補回抽屜裡
    const section = document.getElementById(id);
    if (section) section.focus({ preventScroll: true });
    return;
  }
  location.hash = id;
}

/**
 * 關閉一律往前推一個沒有 hash 的網址，不用 history.back()。
 *
 * back() 只有在「剛剛才開啟」時才等於關閉：用 ← / → 連走幾段之後，上一筆
 * history 是上一個段落而不是首頁，back() 會變成跳回上一段、關不掉。
 * pushState 的行為則不管走過幾段都一致，而且直接開著 #about 進站的人按 Esc
 * 也不會被丟出站外。代價是上一頁會重新打開剛關掉的段落——那正是使用者的預期。
 */
function closeToHome() {
  if (openId === null) return;
  history.pushState(history.state, "", location.pathname + location.search);
  render();
}

/* ========================================
   Events
   ======================================== */

function isTyping(el) {
  if (!el) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    el.isContentEditable
  );
}

function onIndexClick(event) {
  const link = event.target.closest(".index__link");
  if (!link) return;
  // 不 preventDefault：<a href="#about"> 的導覽交給瀏覽器，history 才會自然累積。
  // 這裡只記下來源，供關閉時把焦點還回去。
  lastTrigger = link;
}

function onKeydown(event) {
  if (disabled || event.defaultPrevented) return;
  // 先擋掉不該觸發的情境：輸入中、組字中（中文輸入法在組字時也會送 keydown）、
  // 按著修飾鍵（L 會撞到 Ctrl+L / Cmd+L 的網址列）
  if (isTyping(event.target) || event.isComposing || event.keyCode === 229) {
    return;
  }
  if (event.ctrlKey || event.metaKey || event.altKey) return;

  if (event.key === "Tab") {
    trapTab(event);
    return;
  }

  if (event.key === "Escape") {
    if (openId === null) return;
    event.preventDefault();
    closeToHome();
    return;
  }

  if (event.key === "l" || event.key === "L") {
    if (event.repeat) return;
    event.preventDefault();
    toggleLang();
    return;
  }

  // 焦點在分頁列裡時，方向鍵屬於分頁；其餘情況才是「上一段 / 下一段」
  if (handleTabKey(event)) return;

  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    // 抽屜關著時不攔截左右鍵，橫向捲動還是要能用
    if (openId === null) return;
    event.preventDefault();
    step(event.key === "ArrowLeft" ? -1 : 1);
    return;
  }

  if (event.key >= "1" && event.key <= "9") {
    const row = visibleRows()[Number(event.key) - 1];
    if (!row) return;
    event.preventDefault();
    lastTrigger = row.link;
    if (row.external) {
      // 讓瀏覽器自己走 target="_blank" rel="noopener noreferrer"，
      // 不用 window.open（會被彈窗阻擋，也等於把網址再抄一份進 JS）
      row.link.click();
      return;
    }
    openSection(row.id);
  }
}

function step(delta) {
  // 鍵盤路徑在 onKeydown 就擋掉了，點擊路徑沒有：退場期間 openId 已是 null，
  // 少了這個守衛 findIndex 會回 -1，sections[-1 + delta] 就是第一段
  if (openId === null) return;
  const sections = drawerSections();
  const at = sections.findIndex((row) => row.id === openId);
  const next = sections[at + delta];
  if (!next) return;
  // 換段落之後 Esc 不該跳回三段之前點的那一列
  lastTrigger = null;
  openSection(next.id);
}

function onDrawerClick(event) {
  const closer = event.target.closest("[data-close]");
  if (closer) {
    event.preventDefault();
    closeToHome();
    return;
  }
  const stepBtn = event.target.closest(".panel__step");
  if (stepBtn && !stepBtn.disabled) {
    event.preventDefault();
    step(stepBtn.dataset.step === "prev" ? -1 : 1);
  }
}

function toggleLang(next) {
  const lang = next || (currentLang === "en" ? "zh-TW" : "en");
  if (!LANGS.includes(lang)) return;

  // 切換語系時焦點可能停在即將被藏起來的那一半內容上。
  // 先把焦點收回抽屜，否則瀏覽器會把它丟回 <body>、Tab 會從 inert 的文件頂端重來。
  const section = openId ? document.getElementById(openId) : null;
  if (section && section.contains(document.activeElement)) {
    section.focus({ preventScroll: true });
  }

  persist(lang);
  currentLang = lang;
  writeLangToUrl(lang);
  render();
}

function onLangClick(event) {
  const option = event.target.closest("[data-lang-option]");
  if (!option) return;
  // 切換是就地換字，不是換頁；讓 <a> 的 href 留著當作沒有 JS 時的退路
  event.preventDefault();
  toggleLang(option.dataset.langOption);
}

/*
 * 上一頁 / 下一頁會還原到別的 history entry，而那個 entry 的 ?lang= 是當時
 * 寫進去的值，不一定等於目前畫面的語系。語系刻意不進 history，所以這裡不改
 * 畫面、改網址：把還原出來的網址改寫成目前的語系。
 *
 * 不這樣做的話，「?lang=en 開段落 → 切中文 → 上一頁」會停在網址寫 en、
 * 畫面是中文的狀態，這時候把網址分享出去，收件人看到的語系和寄件人不同。
 */
function onPopState() {
  writeLangToUrl(currentLang);
  render();
}

/* ---------- 手機：左右滑動切換段落 ---------- */

let touchX = null;
let touchY = null;

function onTouchStart(event) {
  // 分頁列自己會橫向捲動（≤736px 的 overflow-x: auto），在上面滑不該換段落。
  // touchend 的 target 仍然是起始元素，所以在這裡擋掉就夠了；
  // 狀態要明確清空，否則會沿用上一次手勢的起點。
  if (event.target.closest(".tabs")) {
    touchX = null;
    touchY = null;
    return;
  }
  if (openId === null || event.touches.length !== 1) return;
  touchX = event.touches[0].clientX;
  touchY = event.touches[0].clientY;
}

function onTouchEnd(event) {
  if (touchX === null) return;
  const touch = event.changedTouches[0];
  const dx = touch.clientX - touchX;
  const dy = touch.clientY - touchY;
  touchX = null;
  touchY = null;

  // 橫向位移要夠大、而且明顯大於縱向，才不會把捲動誤判成換段落
  if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
  step(dx < 0 ? 1 : -1);
}

/* ========================================
   Boot
   ======================================== */

function enhance() {
  for (const row of rows) {
    if (!row.section) continue;
    // dialog 語意只在有 JS 時成立：沒有 JS 的段落只是一般內容，
    // 在 HTML 裡寫死會對輔助技術說謊（tests/content-parity-test.sh 擋著）
    row.section.setAttribute("role", "dialog");
    row.section.setAttribute("tabindex", "-1");
  }

  initTabs();

  const index = document.querySelector(".index");
  if (index) on(index, "click", onIndexClick);

  const langswitch = document.querySelector(".langswitch");
  if (langswitch) on(langswitch, "click", onLangClick);

  const sections = document.querySelector(".sections");
  if (sections) {
    on(sections, "click", onDrawerClick);
    on(sections, "touchstart", onTouchStart, { passive: true });
    on(sections, "touchend", onTouchEnd, { passive: true });
  }

  const scrim = document.querySelector(".scrim");
  if (scrim) on(scrim, "click", onDrawerClick);

  on(document, "keydown", onKeydown);
  on(window, "hashchange", render);
  on(window, "popstate", onPopState);
  // 從 bfcache 回來時不會有 hashchange；render 可重複呼叫，補一次很便宜
  on(window, "pageshow", render);
}

function init() {
  // 上一頁回到首頁時不要還原「抽屜開著時」記下的捲動位置
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  currentLang = LANGS.includes(root.dataset.lang) ? root.dataset.lang : "en";
  buildModel();
  enhance();
  normalizeOnBoot();
  render();

  // 走到這裡才代表抽屜真的動得了。藏段落的 CSS 掛在這個 class 之下，
  // 所以這支檔案載不到、解析失敗或上面任何一行丟例外時，段落都會維持
  // 「依序排在首頁下方」的樣子，而不是被藏起來、沒人放回來。
  root.classList.add("drawer-ready");
}

/*
 * 退回「沒有 JS」的版面。
 *
 * enhance() 與 initTabs() 已經改過 DOM，而那些改動都假設後面的程式還會跑：
 *   - tabpanel 的 hidden：只留一組可見，另外三組讀不到——退路本身就壞了
 *   - role="dialog" / aria-modal / tabindex：沒有 JS 的段落只是一般內容，
 *     留著等於對輔助技術說謊
 *   - aria-keyshortcuts：宣稱了不存在的快捷鍵
 * 所以不是只清一項，是把 init 期間所有這類改動一次還原。
 */
function resetToFallback() {
  disabled = true;

  // 先拆監聽器再還原 DOM：留著的話，語系連結會被 onLangClick 的
  // preventDefault() 擋住導覽，而 render() 又已經不做事，按了完全沒反應。
  // 拆乾淨之後，這個狀態和「main.js 根本沒載到」完全一樣——而那個狀態
  // 的行為（原生換頁 + inline script 套用語系）是驗證過正確的。
  for (const [target, type, fn, options] of bound) {
    target.removeEventListener(type, fn, options);
  }
  bound.length = 0;

  root.classList.remove("js");
  setSectionsInert(false);

  for (const panel of document.querySelectorAll('[role="tabpanel"]')) {
    panel.hidden = false;
  }
  for (const section of document.querySelectorAll(".panel")) {
    section.removeAttribute("role");
    section.removeAttribute("aria-modal");
    section.removeAttribute("tabindex");
  }
  for (const link of document.querySelectorAll(".index__link")) {
    link.removeAttribute("aria-keyshortcuts");
  }
}

// 這支檔案被擋下或丟例外時退回 fallback 版面，
// 不要留下一個看起來有互動、實際上動不了、而且有內容讀不到的頁面
try {
  init();
} catch (e) {
  resetToFallback();
}
