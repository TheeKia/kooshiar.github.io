// TODO: save default theme
// TODO: history on search
const searchDelay = 400;
const minColWidth = 250;
/**
 * * Variables
 */

//    Loading
let isLoading = true;
let addedItems = 0;
let searchResultsCount = 0;
let isSearching = false;
let isShowingFavorites = false;
//    Timouts
let loadingTimeout, refreshTimeout, similarsTimeout;
//    Fetch data
let data;
let offset = 60;
//    Columns
let columns = [];
let numberOfCols = Math.floor((window.innerWidth * 0.8) / minColWidth);
// History
let preserveHistory = false;
let backHistory = false;
let expandHistory = [];
// Likes
let likes = [];
if (
  window.localStorage.getItem("likes") &&
  window.localStorage.getItem("likes").length > 0
) {
  likes = window.localStorage.getItem("likes").split(",");
} else {
  likes = [];
}

/**
 * * Elements
 */

// Header
const header = select("#header");
const El_searchInput = select("#searchInput");
const El_toggleTheme = select("#toggleTheme");
const Btn_favorites = select("#favorites");
// Body
const overlay = select("#overlay");
const mainContainer = select("#mainContainer");
const resultsInfo = select("#resultsInfo");
const nothing = select("#nothing");
const prevHistory = select("#prevHistory");
// Footer
const footerLoading = select("#footer-loading--container");

/**
 * * Toggle Theme
 */

El_toggleTheme.addEventListener("click", () => {
  icon = El_toggleTheme.dataset.icon;
  if (icon === "brightness_3") {
    El_toggleTheme.style.color = "transparent";
    setTimeout(() => {
      El_toggleTheme.style.color = "#bbb";
      El_toggleTheme.dataset.icon = "light_mode";
    }, 300);
    setDarkTheme(true);
  } else {
    El_toggleTheme.style.color = "transparent";
    setTimeout(() => {
      El_toggleTheme.style.color = "#222";
      El_toggleTheme.dataset.icon = "brightness_3";
    }, 300);
    setDarkTheme(false);
  }
});

/**
 * * Favorites List
 */
Btn_favorites.addEventListener("click", () => {
  let newData;
  showFooterLoading(true);
  isLoading = true;
  columns.forEach((col) => {
    col.querySelectorAll(".item").forEach((item) => {
      item.remove();
    });
    col.innerHTML = "";
  });
  if (Btn_favorites.classList.contains("active")) {
    isShowingFavorites = false;
    document.body.classList.remove("FAVORITES");
    Btn_favorites.classList.remove("active");
    Btn_favorites.dataset.icon = "favorite_border";
    Btn_favorites.innerHTML = "Show favorites";
    newData = data;
  } else {
    isShowingFavorites = true;
    document.body.classList.add("FAVORITES");
    Btn_favorites.classList.add("active");
    Btn_favorites.dataset.icon = "favorite";
    Btn_favorites.innerHTML = "Hide favorites";
    newData = data.filter((item) => likes.includes(item["page_id"]));
  }
  if (newData.length > 0) {
    resultsInfo.innerHTML = "";
    addItem(newData, columns, searchResultsCount);
    nothing.style.display = "none";
  } else {
    resultsInfo.innerHTML =
      '<p style="margin-top: 5%; margin-bottom: -5%;width: 100%; text-align: center">First add some products to favorites</p>';
    showFooterLoading(false);
    nothing.style.display = "flex";
  }
});

/**
 * * Populating the HTML
 */

// History Logic
function changeHistory(comand, id = null) {
  /**
   * @param comand add | remove | clear
   */
  if (comand === "add") {
    if (id === null) throw 'id not included in "add" mode';
    else expandHistory.push(id);
  } else if (comand === "remove") {
    expandHistory.pop();
  } else if (comand === "clear") {
    expandHistory = [];
  }

  if (expandHistory.length > 1) {
    document.body.classList.add("HISTORY");
  } else {
    document.body.classList.remove("HISTORY");
  }
}
prevHistory.addEventListener("click", (ev) => {
  changeHistory("remove");
  preserveHistory = true;
  document.querySelector(".item.expanded .closeBtn").click();
  setTimeout(() => {
    backHistory = true;
    document.getElementById(expandHistory[expandHistory.length - 1]).click();
  }, 300);
});

window.onresize = (ev) => {
  numberOfCols = Math.floor((window.innerWidth * 0.8) / minColWidth);
  columns = [];
  mainContainer.innerHTML = "";
  for (let i = 0; i < numberOfCols; i++) {
    const div_col = document.createElement("div");
    div_col.setAttribute("class", "col");
    div_col.style.width = 95 / numberOfCols + "%";
    columns.push(div_col);
    mainContainer.appendChild(div_col);
  }
  addItem(data, columns, addedItems);
};
// Creating Columns
for (let i = 0; i < numberOfCols; i++) {
  const div_col = document.createElement("div");
  div_col.setAttribute("class", "col");
  div_col.style.width = 95 / numberOfCols + "%";
  columns.push(div_col);
  mainContainer.appendChild(div_col);
}

// Add Similars
function addSimilars(container, data, closeElement) {
  let interval;
  let i = 0;
  let elements = [];
  let scrollX = 0;
  const div_grid = document.createElement("div");
  div_grid.setAttribute("class", "similar-grid");
  const div_scrollLeft = document.createElement("div");
  div_scrollLeft.setAttribute("class", "similar-scrollLeft");
  const div_scrollRight = document.createElement("div");
  div_scrollRight.setAttribute("class", "similar-scrollRight");
  div_grid.appendChild(div_scrollLeft);
  div_grid.appendChild(div_scrollRight);
  div_scrollRight.addEventListener("click", () => {
    if (scrollX + 320 > div_grid.scrollWidth - div_grid.offsetWidth)
      scrollX = div_grid.scrollWidth - div_grid.offsetWidth;
    else scrollX += 320;
    div_grid.scrollLeft = scrollX;
  });
  div_scrollLeft.addEventListener("click", () => {
    if (scrollX - 320 < 0) scrollX = 0;
    else scrollX -= 320;
    div_grid.scrollLeft = scrollX;
  });

  data.forEach((item) => {
    const div_element = document.createElement("div");
    div_element.setAttribute("class", "similar-item");
    div_element.setAttribute("title", item["name"]);
    div_element.style.backgroundImage = `url(${item["image_url"]})`;
    div_element.style.backgroundSize = "cover";
    div_element.style.backgroundPosition = "center";
    div_element.addEventListener("click", () => {
      div_element.style.transform = "scale(2)";
      preserveHistory = true;
      closeElement.click();
      setTimeout(() => {
        document.getElementById(item["page_id"]).click();
      }, 300);
    });

    elements.push(div_element);
    div_grid.appendChild(div_element);
  });
  container.appendChild(div_grid);
  interval = setInterval(() => {
    if (i === elements.length - 1) clearInterval(interval);
    elements[i].classList.add("active");
    i++;
  }, 100);
}
// Load Similar Products
function loadSimilars(container, refrence, closeElement) {
  /**
   * @param container     :element  |   section_similar element
   * @param refrence      :object   |   single data object
   * @param closeElement  :element  |   close button for container element
   */
  let similars;

  const pInfo = productType(refrence);

  let similar = { 0: [], 1: [], 2: [], 3: [] };
  //-----------------
  data.map((item) => {
    let score = 0;
    let isType = false;
    let isColor = false;
    let isMaterial = false;
    let isStyle = false;
    let itemInfo = productType(item);
    itemInfo["type"].forEach((word) => {
      if (pInfo["type"].includes(word)) {
        isType = true;
      }
    });
    if (isType) {
      itemInfo["color"].forEach((word) => {
        if (pInfo["color"].includes(word)) {
          isColor = true;
        }
      });
      itemInfo["material"].forEach((word) => {
        if (pInfo["material"].includes(word)) {
          isMaterial = true;
        }
      });
      itemInfo["styleType"].forEach((word) => {
        if (pInfo["styleType"].includes(word)) {
          isStyle = true;
        }
      });

      if (isColor) score++;
      if (isMaterial) score++;
      if (isStyle) score++;

      if (score === 3) {
        similar[3].push(item);
      } else if (score === 2) {
        similar[2].push(item);
      } else if (score === 1) {
        similar[1].push(item);
      } else {
        similar[0].push(item);
      }
    }

    similars = similar[3].concat(similar[2], similar[1], similar[0]);
    if (similars.length > 8) similars = similars.slice(0, 8);
  });
  // TODO: Accuracy (length of similars)
  if (similars.length > 0) {
    addSimilars(container, similars, closeElement);
    container.classList.add("active");
  }
}

// Adding items to #mainContainer
function addItem(ref, columns, count) {
  /**
   * @param ref         :array    |   the data to display
   * @param columns     :array    |   columns array to select automatically
   * @param count       :integer  |   displayed elements count
   */

  // * Creating div.item
  let img = new Image();
  img.src = ref[count]["image_url"];
  img.setAttribute("class", "mainImage");

  const div_item = document.createElement("div");
  div_item.id = ref[count]["page_id"];
  div_item.setAttribute("class", "item");
  // * Article Container
  const article_container = document.createElement("article");
  article_container.setAttribute("class", "container");
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
  // * Similar Products
  const section_similar = document.createElement("section");
  section_similar.setAttribute("class", "similar-container");
  section_similar.innerHTML = "<h4>Similar Products</h4>";
  // * Domain
  const a_domain = document.createElement("a");
  a_domain.setAttribute("class", "domain");
  a_domain.href = ref[count]["canonical_url"];
  a_domain.innerHTML = `<span>${ref[count]["domain"]}</span>`;
  // * Domain
  const btn_like = document.createElement("button");
  btn_like.setAttribute("class", "like");
  if (likes.includes(ref[count]["page_id"])) btn_like.classList.add("LIKED");

  div_info.appendChild(h3_title);
  div_info.appendChild(div_close);
  div_info.appendChild(p_des);
  div_info.appendChild(p_price);
  div_info.appendChild(div_more);
  div_info.appendChild(section_similar);
  div_info.appendChild(a_domain);
  div_info.appendChild(btn_like);
  article_container.appendChild(img);
  article_container.appendChild(div_info);
  div_item.appendChild(article_container);

  // * Like Event
  btn_like.addEventListener("click", (ev) => {
    ev.preventDefault();
    if (btn_like.classList.contains("LIKED")) {
      if (likes.includes(ref[count - 1]["page_id"])) {
        likes.splice(likes.indexOf(ref[count - 1]["page_id"]), 1);
        window.localStorage.setItem("likes", likes);
        btn_like.classList.remove("LIKED");
      }
    } else {
      if (!likes.includes(ref[count - 1]["page_id"])) {
        likes.push(ref[count - 1]["page_id"]);
        window.localStorage.setItem("likes", likes);
        btn_like.classList.add("LIKED");
      }
    }
  });

  // * On Click | Expand
  div_item.addEventListener("click", (ev) => {
    if (div_item.classList.contains("expanded")) return; // return if already expanded
    if (ev.target.classList.contains("domain")) return; // return if link
    else if (ev.target.classList.contains("like")) return; // return if like

    clearTimeout(similarsTimeout);
    document.body.classList.add("EXPANDED");
    if (!backHistory) changeHistory("add", ref[count - 1]["page_id"]);
    backHistory = false;

    img.style.opacity = 0;
    div_info.style.opacity = 0;

    setTimeout(() => {
      div_item.classList.add("expanded");

      img.style.transition = "all 0s";
      img.style.transform = "translateX(-25px)";
      div_info.style.transition = "all 0s";
      div_info.style.transform = "translateX(25px)";

      setTimeout(() => {
        img.style.transition = "all 0.3s ease-in-out";
        div_info.style.transition = "all 0.3s ease-in-out";

        img.style.opacity = 1;
        img.style.transform = "translateX(0)";
        div_info.style.transform = "translateX(0)";
        div_info.style.opacity = 1;

        similarsTimeout = setTimeout(() => {
          loadSimilars(section_similar, ref[count - 1], div_close);
        }, 300);
      }, 50);
    }, 300);
  });
  // * Close
  div_close.addEventListener("click", () => {
    if (!preserveHistory) changeHistory("clear");
    preserveHistory = false;
    document.body.classList.remove("EXPANDED");
    img.style.opacity = 0;
    img.style.transform = "translateX(-25px)";
    div_info.style.opacity = 0;
    div_info.style.transform = "translateX(25px)";

    setTimeout(() => {
      div_item.classList.remove("expanded");

      img.style.transition = "all 0s";
      div_info.style.transition = "all 0s";

      img.style.transform = "translateX(0)";
      div_info.style.transform = "translateX(0)";

      setTimeout(() => {
        img.style.transition = "all 0.3s ease-in-out";
        div_info.style.transition = "all 0.3s ease-in-out";
        img.style.opacity = 1;
        div_info.style.opacity = "";
      }, 50);
      section_similar.classList.remove("active");
      section_similar.querySelectorAll(".similar-item").forEach((item) => {
        item.remove();
      });
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
    } else if (isShowingFavorites) {
      if (likes.includes(ref[count]["page_id"])) {
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
    document.body.classList.remove("SEARCHING");
  }
});
El_searchInput.addEventListener("input", (ev) => {
  isSearching = true;
  document.body.classList.add("SEARCHING");
  if (ev.target.value == "") {
    isSearching = false;
    document.body.classList.remove("SEARCHING");
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
  }, searchDelay);
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
    !isShowingFavorites &&
    !isLoading &&
    bodyHeight - window.scrollY < window.innerHeight + 200
  ) {
    isLoading = true;
    showFooterLoading(true);
    fetch(`http://xoosha.com/ws/1/test.php?offset=${offset}`)
      .then((res) => res.json())
      .then((newData) => {
        data = data.concat(newData);
        addItem(data, columns, addedItems);
        offset += 60;
      });
  }
});
