// TODO: back button
/**
 * * Variables
 */

//    Loading
let isLoading = true;
let addedItems = 0;
let searchResultsCount = 0;
let isSearching = false;
//    Timouts
let loadingTimeout, refreshTimeout, similarsTimeout;
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
// Add Similars
function addSimilars(container, data, closeElement) {
  let interval;
  let i = 0;
  let elements = [];
  data.forEach((item) => {
    const div_element = document.createElement("div");
    div_element.setAttribute("class", "similar-item");
    div_element.setAttribute("title", item["name"]);
    div_element.style.backgroundImage = `url(${item["image_url"]})`;
    div_element.style.backgroundSize = "cover";
    div_element.style.backgroundPosition = "center";
    div_element.addEventListener("click", () => {
      div_element.style.transform = "scale(2)";
      closeElement.click();
      setTimeout(() => {
        document.getElementById(item["page_id"]).click();
      }, 300);
    });

    elements.push(div_element);
    container.appendChild(div_element);
  });
  interval = setInterval(() => {
    if (i === elements.length - 1) clearInterval(interval);
    elements[i].classList.add("active");
    i++;
  }, 100);
}
// Load Similar Posts
function loadSimilars(container, refrence, closeElement) {
  // TODO: refrence
  /**
   * @param container     :element  |   section_similar element
   * @param refrence      :object   |   single data object
   * @param closeElement  :element  |   close button for container element
   */
  let count = 0;
  const similars = data.filter((item) => {
    if (item["tags"] === null) return false;
    if (count > 7) return false;
    if (item["tags"].includes("white")) {
      count++;
      return true;
    } else {
      return false;
    }
  });
  if (similars.length > 0) {
    addSimilars(container, similars, closeElement);
    container.classList.add("active");
  }
  console.log(similars);
}

// Adding items to #mainContainer
function addItem(ref, columns, count) {
  //TODO: Optional ID
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
  // * Similar Posts
  const section_similar = document.createElement("section");
  section_similar.setAttribute("class", "similar-container");
  section_similar.innerHTML = "<h4>Similar Posts</h4>";
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
  div_info.appendChild(section_similar);
  div_info.appendChild(a_domain);
  article_container.appendChild(img);
  article_container.appendChild(div_info);
  div_item.appendChild(article_container);

  // * On Click | Expand
  div_item.addEventListener("click", () => {
    if (div_item.classList.contains("expanded")) return;
    clearTimeout(similarsTimeout);

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
          loadSimilars(section_similar, ref[count], div_close);
        }, 300);
      }, 50);
    }, 300);
  });
  // * Close
  div_close.addEventListener("click", () => {
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
