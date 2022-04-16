let isLoading = true;
let addedItems = 0;
let searchResultsCount = 0;
let isSearching = false;
let loadingTimeout, refreshTimeout;

// * Header Elements
const El_searchInput = select("#searchInput");
const Di_searchInput = new TInput(El_searchInput, true);
const El_toggleTheme = select("#toggleTheme");
const Di_toggleTheme = new BInput(El_toggleTheme, true);
// * Body Elements
const mainContainer = select("#mainContainer");
const resultsInfo = select("#resultsInfo");
const nothing = select("#nothing");
// * Footer Elements
const footerLoading = select("#footer-loading--container");

// * Search
document.addEventListener("keydown", (ev) => {
  if (ev.ctrlKey && ev.key === "k") {
    ev.preventDefault();
    El_searchInput.focus();
  }
});
El_searchInput.addEventListener("focusout", (ev) => {
  if (ev.target.value === "") {
    isSearching = false;
  }
});

El_searchInput.addEventListener("input", (ev) => {
  isSearching = true;
  if (ev.target.value == "") {
    isSearching = false;
  }
  clearTimeout(refreshTimeout);
  showFooterLoading(true);
  columns.forEach((col) => {
    col.querySelectorAll(".item").forEach((item) => {
      item.remove();
    });
    col.innerHTML = "";
  });
  refreshTimeout = setTimeout(() => {
    let newData = data.filter((item) =>
      item["description"].toLowerCase().includes(ev.target.value.toLowerCase())
    );
    if (newData.length > 0) {
      resultsInfo.innerHTML =
        ev.target.value == "" ? "" : `${newData.length} Results found`;

      addItem(newData, columns, searchResultsCount);
      nothing.style.display = "none";
    } else {
      resultsInfo.innerHTML = "";
      showFooterLoading(false);
      nothing.style.display = "flex";
    }
  }, 100);
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
  // * Creating div.item
  const div_item = document.createElement("div");
  div_item.id = ref[count]["page_id"];
  div_item.setAttribute("class", "item");

  const div_info = document.createElement("div");
  div_info.setAttribute("class", "info");

  const h3_title = document.createElement("h3");
  h3_title.setAttribute("class", "title");
  h3_title.innerHTML = ref[count]["name"];

  const p_des = document.createElement("p");
  p_des.setAttribute("class", "description");
  const span_des = document.createElement("span");
  span_des.innerHTML = ref[count]["description"];
  p_des.appendChild(span_des);

  const div_more = document.createElement("div");
  div_more.setAttribute("class", "readMore");
  div_more.innerHTML = "Click to expand";

  const a_domain = document.createElement("a");
  a_domain.setAttribute("class", "domain");
  a_domain.href = ref[count]["canonical_url"];
  a_domain.innerHTML = ref[count]["domain"];

  let img = new Image();
  img.src = ref[count]["image_url"];

  div_info.appendChild(h3_title);
  div_info.appendChild(p_des);
  div_info.appendChild(div_more);
  div_info.appendChild(a_domain);
  div_item.appendChild(img);
  div_item.appendChild(div_info);

  // *
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

    // * If search query exists
    if (isSearching) {
      if (
        ref[count]["description"]
          .toLowerCase()
          .includes(El_searchInput.value.toLowerCase())
      ) {
        theCol.appendChild(div_item);
      }
    } else {
      theCol.appendChild(div_item);
    }

    // *
    count++;
    if (count < ref.length) addItem(ref, output, count);
    else {
      clearTimeout(loadingTimeout);
      loadingTimeout = setTimeout(() => {
        showFooterLoading(false);
      }, 500);
      isLoading = false;
    }

    setTimeout(() => {
      showItem(div_item);
    }, 300);
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
    //// console.log("now");
    data = data.concat(data2);
    isLoading = true;
    showFooterLoading(true);
    addItem(data, columns, addedItems);
  }
});
