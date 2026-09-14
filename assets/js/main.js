"use strict";

// Lets the article paint before .active starts its opacity transition.
const SHOW_DELAY = 50;
// Matches the 0.325s article transition in main.css.
const HIDE_DELAY = 325;
const PRELOAD_DELAY = 100;

const body = document.body;
const articles = [...document.querySelectorAll("#main article")];
let current = null;
let timer;

function showArticle(article) {
  if (article === current) return;
  clearTimeout(timer);

  articles.forEach((a) => {
    a.hidden = a !== article;
    a.classList.remove("active");
  });
  body.classList.add("is-article-visible");
  current = article;

  timer = setTimeout(() => {
    article.classList.add("active");
    window.scrollTo(0, 0);
    article.querySelector("h2").focus();
  }, SHOW_DELAY);
}

function hideArticle() {
  if (!current) return;
  clearTimeout(timer);

  const trigger = document.querySelector(`#header a[href="#${current.id}"]`);
  current.classList.remove("active");
  current = null;

  timer = setTimeout(() => {
    body.classList.remove("is-article-visible");
    trigger?.focus();
  }, HIDE_DELAY);
}

// The URL hash is the single source of truth: nav links, the close links,
// back / forward and closeArticle() all change it and end up here.
function route() {
  const target = articles.find((a) => `#${a.id}` === location.hash);
  if (target) showArticle(target);
  else hideArticle();

  if (location.href.endsWith("#")) {
    history.replaceState(null, "", location.pathname + location.search);
  }
}

function closeArticle() {
  if (current) location.hash = "";
}

window.addEventListener("hashchange", route);
window.addEventListener("load", () => {
  setTimeout(() => body.classList.remove("is-preload"), PRELOAD_DELAY);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeArticle();
});
document.getElementById("wrapper").addEventListener("click", (e) => {
  if (e.target.id === "wrapper" || e.target.id === "main") closeArticle();
});

route();
