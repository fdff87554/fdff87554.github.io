"use strict";

/*
 * 首頁的語系切換。
 *
 * 語系存在 query（?lang=），段落存在 hash，兩者互不干擾，所以切換語系會停在同一段落。
 * localStorage 只是「上次選過什麼」的記憶，不是來源：別人收到連結時看到的語系要和
 * 寄出的人一樣，所以 ?lang= 優先。
 *
 * <head> 裡的 inline script 已經在第一次 paint 前決定好語系並寫進 html[data-lang]，
 * 這支檔案只讀回來，不重算一次。
 */

const LANGS = ["en", "zh-TW"];
const STORAGE_KEY = "lang";

const root = document.documentElement;

// 目前的語系。畫面狀態的唯一來源，popstate 要用它把網址改回來，
// 所以不直接讀 root.dataset.lang——那是輸出，可能被外部改掉。
let currentLang = "en";

function persist(lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch (e) {
    // 無痕模式或關掉儲存權限時寫不進去，不影響當下這一頁
  }
}

/** 語系是檢視偏好不是位置，所以用 replaceState：上一頁不該用來還原語系 */
function writeLangToUrl(lang) {
  const url = new URL(location.href);
  url.searchParams.set("lang", lang);
  history.replaceState(history.state, "", url);
}

function applyLang(lang) {
  currentLang = lang;
  root.dataset.lang = lang;
  root.lang = lang;

  document.querySelectorAll("[data-lang-option]").forEach((option) => {
    const selected = option.dataset.langOption === lang;
    // aria-current 同時是樣式的鉤子（見 site.css）與給輔助技術的狀態
    if (selected) option.setAttribute("aria-current", "true");
    else option.removeAttribute("aria-current");
  });

  syncShortcutHint();
}

/** 快捷鍵範圍跟著可見的目錄列走：Now 沒有資料時是 1–5，有資料時是 1–6 */
function syncShortcutHint() {
  const hint = document.querySelector(".colophon__range");
  if (!hint) return;

  const visible = [...document.querySelectorAll(".index__item")].filter(
    (item) => getComputedStyle(item).display !== "none",
  );
  hint.textContent = visible.length > 1 ? `1–${visible.length}` : "1";
}

function onLangClick(event) {
  const option = event.target.closest("[data-lang-option]");
  if (!option) return;

  const lang = option.dataset.langOption;
  if (!LANGS.includes(lang)) return;

  // 切換是就地換字，不是換頁；讓 <a> 的 href 留著當作沒有 JS 時的退路
  event.preventDefault();
  persist(lang);
  writeLangToUrl(lang);
  applyLang(lang);
}

/*
 * 上一頁 / 下一頁會還原到別的 history entry，而那個 entry 的 ?lang= 是當時寫進去的值，
 * 不一定等於目前畫面的語系。語系刻意不進 history（見 writeLangToUrl），所以這裡不改畫面，
 * 改網址：把還原出來的網址改寫成目前的語系。
 *
 * 不這樣做的話，「?lang=en 開段落 → 切中文 → 上一頁」會停在網址寫 en、畫面是中文的狀態，
 * 這時候把網址分享出去，收件人看到的語系和寄件人不同。
 */
function onPopState() {
  writeLangToUrl(currentLang);
}

function init() {
  const lang = LANGS.includes(root.dataset.lang) ? root.dataset.lang : "en";
  applyLang(lang);
  writeLangToUrl(lang);

  const langswitch = document.querySelector(".langswitch");
  if (langswitch) langswitch.addEventListener("click", onLangClick);

  window.addEventListener("popstate", onPopState);
}

// 這支檔案沒載到、被擋下或丟例外時，拿掉 js 旗標退回「段落依序排列、兩個語系並陳」的版面，
// 不要留下一個看起來有互動、實際上動不了的頁面
try {
  init();
} catch (e) {
  root.classList.remove("js");
}
