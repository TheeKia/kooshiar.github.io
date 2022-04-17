/**
 * * Variables
 */

//    Loading
let isLoading = true;
let addedItems = 0;
let searchResultsCount = 0;
let isSearching = false;
//    Timouts
let loadingTimeout, refreshTimeout;
//    Fetch data
let data;
let offset = 60;
//    Columns
let columns = [];
let numberOfCols = Math.floor((window.innerWidth * 0.8) / 300);

/**
 * * Elements
 */

// Header
const header = select("#header");
const El_searchInput = select("#searchInput");
const Di_searchInput = new TInput(El_searchInput, true);
const El_toggleTheme = select("#toggleTheme");
const Di_toggleTheme = new BInput(El_toggleTheme, true);
// Body
const overlay = select("#overlay");
const mainContainer = select("#mainContainer");
const resultsInfo = select("#resultsInfo");
const nothing = select("#nothing");
// Footer
const footerLoading = select("#footer-loading--container");

/**
 * * Toggle Theme
 */

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

/**
 * * Populating the HTML
 */

// Creating Columns
for (let i = 0; i < numberOfCols; i++) {
  const div_col = document.createElement("div");
  div_col.setAttribute("class", "col");
  columns.push(div_col);
  mainContainer.appendChild(div_col);
}

// Adding items to #mainContainer
function addItem(ref, columns, count) {
  /**
   * @param ref       :array    | the data to display
   * @param columns   :array    | columns array to select automatically
   * @param count     :integer  | displayed elements count
   */

  // * Creating div.item
  let img = new Image();
  img.src = ref[count]["image_url"];

  const div_item = document.createElement("div");
  div_item.id = ref[count]["page_id"];
  div_item.setAttribute("class", "item");
  // * Info Container
  const div_info = document.createElement("div");
  div_info.setAttribute("class", "info");
  // * Title
  const h3_title = document.createElement("h3");
  h3_title.setAttribute("class", "title");
  h3_title.innerHTML = ref[count]["name"];
  // * Description
  const p_des = document.createElement("p");
  p_des.setAttribute("class", "description");
  p_des.innerHTML = ref[count]["description"];
  // * Click to Expand text
  const div_more = document.createElement("div");
  div_more.setAttribute("class", "readMore");
  div_more.innerHTML = "Click to expand";
  // * Close Button
  const div_close = document.createElement("div");
  div_close.setAttribute("class", "closeBtn");
  div_close.innerHTML = "close";
  // * Price
  const p_price = document.createElement("p");
  p_price.setAttribute("class", "price");
  p_price.innerHTML = ref[count]["price"];
  // * Domain
  const a_domain = document.createElement("a");
  a_domain.setAttribute("class", "domain");
  a_domain.href = ref[count]["canonical_url"];
  a_domain.innerHTML = ref[count]["domain"];

  div_info.appendChild(h3_title);
  div_info.appendChild(div_close);
  div_info.appendChild(p_des);
  div_info.appendChild(p_price);
  div_info.appendChild(div_more);
  div_info.appendChild(a_domain);
  div_item.appendChild(div_info);
  div_item.appendChild(img);

  // * On Click | Expand
  div_item.addEventListener("click", () => {
    if (div_item.classList.contains("expanded")) return;
    div_info.style.opacity = 0;

    img.style.opacity = 0;
    img.style.left = 0;

    setTimeout(() => {
      div_item.classList.add("expanded");
      div_info.style.transition = "all 0s";
      img.style.transition = "all 0s";

      img.style.width = "auto";
      img.style.position = "fixed";
      img.style.height = window.innerHeight - header.offsetHeight + "px";

      div_info.style.position = "fixed";
      div_info.style.right = 0;
      div_info.style.width = mainContainer.offsetWidth - img.width + "px";
      div_info.style.height = window.innerHeight - header.offsetHeight + "px";
      setTimeout(() => {
        div_info.style.transition = "all 0.3s ease-in-out";
        img.style.transition = "all 0.3s ease-in-out";

        img.style.opacity = 1;
        img.style.left = mainContainer.offsetLeft + "px";

        div_info.style.right = mainContainer.offsetLeft + "px";
        div_info.style.opacity = 1;
      }, 50);
    }, 300);
  });
  // * Close
  div_close.addEventListener("click", () => {
    img.style.opacity = 0;
    img.style.left = 0;

    div_info.style.opacity = 0;
    div_info.style.right = 0;

    setTimeout(() => {
      div_item.classList.remove("expanded");
      div_info.style.transition = "all 0s";
      img.style.transition = "all 0s";

      img.style.width = "100%";
      img.style.position = "static";
      img.style.height = "unset";

      div_info.style.position = "absolute";
      div_info.style.width = "100%";
      div_info.style.height = "100%";
      setTimeout(() => {
        img.style.transition = "all 0.3s ease-in-out";
        div_info.style.transition = "all 0.3s ease-in-out";
        img.style.opacity = 1;
        div_info.style.opacity = "";
      }, 50);
    }, 300);
  });

  // * Select Column
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

    // Repeat
    count++;
    if (count < ref.length) addItem(ref, columns, count);
    else {
      clearTimeout(loadingTimeout);
      loadingTimeout = setTimeout(() => {
        showFooterLoading(false);
      }, 500);
      isLoading = false;
    }
    // Show item
    setTimeout(() => {
      showItem(div_item);
      div_item.style.minHeight = div_item.offsetHeight + "px"; // So the height doesn't depend on the image anymore
    }, 300);
  };
}

/**
 * * First Data Fetch
 */

fetch("http://xoosha.com/ws/1/test.php?offset=0")
  .then((res) => res.json())
  .then((newData) => {
    data = newData;
    addItem(data, columns, addedItems);
  });

/**
 * * Search
 */

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
// Ctrl+K
document.addEventListener("keydown", (ev) => {
  if (ev.ctrlKey && ev.key === "k") {
    ev.preventDefault();
    El_searchInput.focus();
  }
});

/**
 * * Infinite Scroll
 */

document.addEventListener("scroll", (ev) => {
  let bodyHeight = document.body.offsetHeight;
  if (
    !isSearching &&
    !isLoading &&
    bodyHeight - window.scrollY < window.innerHeight + 200
  ) {
    isLoading = true;
    showFooterLoading(true);
    fetch(`http://xoosha.com/ws/1/test.php?offset=${offset}`)
      .then((res) => res.json())
      .then((newData) => {
        console.log(`http://xoosha.com/ws/1/test.php?offset=${offset}`);
        data = data.concat(newData);
        addItem(data, columns, addedItems);
        offset += 60;
      });
  }
});
