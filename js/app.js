let isLoading = true;
let addedItems = 0;

// * Header Elements
const El_searchInput = select("#searchInput");
const Di_searchInput = new TInput(El_searchInput, true);
const El_toggleTheme = select("#toggleTheme");
const Di_toggleTheme = new BInput(El_toggleTheme, true);

// * Footer Elements
const footerLoading = select("#footer-loading--container");

Di_toggleTheme.onClick(() => {
  icon = Di_toggleTheme.label.dataset.icon;
  if (icon === "brightness_3") {
    Di_toggleTheme.label.style.color = "transparent";
    setTimeout(() => {
      Di_toggleTheme.label.style.color = "#bbb";
      Di_toggleTheme.label.dataset.icon = "light_mode";
    }, 300);
    Input.darkThemeAll();
    setDarkTheme(true);
  } else {
    Di_toggleTheme.label.style.color = "transparent";
    setTimeout(() => {
      Di_toggleTheme.label.style.color = "#222";
      Di_toggleTheme.label.dataset.icon = "brightness_3";
    }, 300);
    Input.darkThemeAll(false);
    setDarkTheme(false);
  }
});

// Fetch
const mainContainer = select("#mainContainer");
const columns = [];
const numberOfCols = Math.floor((window.innerWidth * 0.8) / 300);
for (let i = 0; i < numberOfCols; i++) {
  const div_col = document.createElement("div");
  div_col.setAttribute("class", "col");
  columns.push(div_col);
  mainContainer.appendChild(div_col);
}

function addItem() {
  const div_item = document.createElement("div");
  div_item.setAttribute("class", "item");
  let img = new Image();
  img.src = data[addedItems]["image_url"];
  div_item.appendChild(img);

  addedItems++;
  let minHeight = null;
  let theCol;
  img.onload = function () {
    columns.forEach((col) => {
      if (minHeight === null) {
        minHeight = col.offsetHeight;
        theCol = col;
      } else {
        if (col.offsetHeight < minHeight) {
          minHeight = col.offsetHeight;
          theCol = col;
        }
      }
    });

    //*
    theCol.appendChild(div_item);
    setTimeout(() => {
      showItem(div_item);
    }, 500);
    setTimeout(() => {
      if (addedItems < data.length) addItem();
      else {
        showFooterLoading(false);
        isLoading = false;
        // footerLoading.style.opacity = 0;
        // setTimeout(() => {
        //   footerLoading.style.display = "none";
        // }, 1500);
      }
    }, 100);
  };
}
addItem();

document.addEventListener("scroll", (ev) => {
  let bodyHeight = document.body.offsetHeight;
  if (!isLoading && bodyHeight - window.scrollY < window.innerHeight + 200) {
    console.log("now");
    data = data.concat(data2);
    isLoading = true;
    if (isLoading) {
      showFooterLoading(true);
    }
    addItem();
  }
});
