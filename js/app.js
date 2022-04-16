let isLoading = true;
let addedItems = 0;
let isSearching = false;

// * Header Elements
const El_searchInput = select("#searchInput");
const Di_searchInput = new TInput(El_searchInput, true);
const El_toggleTheme = select("#toggleTheme");
const Di_toggleTheme = new BInput(El_toggleTheme, true);
// * Body Elements
const mainContainer = select("#mainContainer");
const searchResultsContainer = select("#searchResults");
// * Footer Elements
const footerLoading = select("#footer-loading--container");

// * Search
El_searchInput.addEventListener("focusout", (ev) => {
  if (ev.target.value === "") {
    isSearching = false;
  }
});
El_searchInput.addEventListener("input", (ev) => {
  if (ev.target.value === "") {
    isSearching = false;
  }
  isSearching = true;

  data.push(1);
  data.pop();
  data.map((item) => {
    if (
      !item["description"].toLowerCase().includes(ev.target.value.toLowerCase())
    ) {
      try {
        hideMainItem(item["page_id"]);
      } catch {
        //
      }
    } else {
      try {
        showMainItem(item["page_id"]);
      } catch {
        //
      }
    }
  });
});

// *
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

const columns = [];
const numberOfCols = Math.floor((window.innerWidth * 0.8) / 300);
for (let i = 0; i < numberOfCols; i++) {
  const div_col = document.createElement("div");
  div_col.setAttribute("class", "col");
  columns.push(div_col);
  mainContainer.appendChild(div_col);
}

function addItem(ref, output, count) {
  const div_item = document.createElement("div");
  div_item.id = ref[count]["page_id"];
  div_item.setAttribute("class", "item");
  let img = new Image();
  img.src = ref[count]["image_url"];
  div_item.appendChild(img);

  let minHeight = null;
  let theCol;
  img.onload = function () {
    output.forEach((col) => {
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
    count++;
    setTimeout(() => {
      if (count < ref.length) addItem(ref, output, count);
      else {
        showFooterLoading(false);
        isLoading = false;
      }
    }, 50);
    setTimeout(() => {
      try {
        if (
          ref[count - 1]["description"]
            .toLowerCase()
            .includes(El_searchInput.value.toLowerCase())
        ) {
          showItem(div_item);
        }
      } catch {
        console.log(count);
      }
    }, 500);
  };
}
addItem(data, columns, addedItems);

document.addEventListener("scroll", (ev) => {
  let bodyHeight = document.body.offsetHeight;
  if (
    !isSearching &&
    !isLoading &&
    bodyHeight - window.scrollY < window.innerHeight + 200
  ) {
    console.log("now");
    data = data.concat(data2);
    isLoading = true;
    showFooterLoading(true);
    addItem(data, columns, addedItems);
  }
});
