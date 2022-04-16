function select(selector) {
  return document.querySelector(selector);
}
function selectAll(selector) {
  return document.querySelectorAll(selector);
}
function setDarkTheme(tf) {
  document.body.classList.toggle("DARKTHEME", tf);
}
function showItem(element) {
  element.style.opacity = 1;
}
function showFooterLoading(tf) {
  const element = select("#footer-loading--container");
  if (tf) {
    element.style.display = "flex";
    setTimeout(() => {
      element.classList.toggle("hide", false);
    }, 100);
  } else {
    element.style.display = "none";
  }
}
function hideMainItem(id, isElement = false) {
  const el = isElement ? id : document.getElementById(id);
  if (el.classList.contains("hide")) return;
  el.classList.add("hide");
  el.style.opacity = 0;
}
function showMainItem(id) {
  const el = document.getElementById(id);
  if (!el.classList.contains("hide")) return;
  el.classList.remove("hide");
  // el.style.display = "flex";
  setTimeout(() => {
    el.style.opacity = 1;
  }, 50);
}
