class Input {
  static DRS_INPUTS = [];

  constructor(parent, isInput = false) {
    try {
      this.parent = isInput ? parent.parentElement : parent;
      this.input = this.parent.querySelector("input")
        ? this.parent.querySelector("input")
        : this.parent.querySelector("button");
      this.label = this.parent.querySelector("label");
    } catch (err) {
      console.log(err);
      return;
    }
    Input.DRS_INPUTS.push(this);
  }

  static darkThemeAll(TF = true) {
    Input.DRS_INPUTS.forEach((input) => {
      input.parent.classList.toggle("drs-darkTheme", TF);
    });
  }

  darkTheme(TF = true) {
    this.parent.classList.toggle("drs-darkTheme", TF);
    return this;
  }
}

class SRC extends Input {
  constructor(parent, isInput = false) {
    super(parent, isInput);

    this.checkBox = document.createElement("div");
    this.checkBox.setAttribute("class", "drs-check-box");
    this.label.prepend(this.checkBox);

    // Add pending element
    this.pendEl = document.createElement("div");
    this.pendEl.setAttribute("class", "PEND_EL");
    this.pendEl.innerHTML = "autorenew";
  }
  pend() {
    this.parent.classList.add("PENDING");
  }
  unpend() {
    this.parent.classList.remove("PENDING");
  }
  setChecked(status) {
    this.input.checked = status;
    this.unpend();
  }

  onClick(fn, pend = false) {
    this.input.addEventListener("click", (ev) => {
      ev.preventDefault();
      if (pend) this.pend();
      fn();
    });
    return this;
  }
}

class TInput extends Input {
  constructor(parent, isInput = false) {
    super(parent, isInput);

    this.parent.classList.add("tInput");

    if (!this.input) {
      console.warn("Something went wrong in Input Class", this.parent);
      return;
    } else if (!this.label) {
      this.parent.classList.add("NOLABEL");
    }

    if (this.input.value.length > 0) {
      this.active();
    }
    this.input.addEventListener("focus", () => {
      this.active();
    });
    this.input.addEventListener("focusout", () => {
      this.deactive();
    });

    // Detecting if Autofilled
    this.input.addEventListener("animationstart", (e) => {
      if (e.animationName === "autofilled") {
        this.autofill();
      }
    });
    this.input.addEventListener("animationstart", (e) => {
      if (e.animationName === "noAutofill") {
        this.removeAutofill();
      }
    });
    this.input.addEventListener("input", () => {
      if (this.input.value.length > 0) {
        this.active();
      }
    });
  }

  active() {
    this.parent.classList.add("ACTIVE");
    return this;
  }
  deactive() {
    if (this.input.value.length === 0) {
      this.parent.classList.remove("ACTIVE", "AUTOFILL");
    }
    return this;
  }
  autofill(value = null) {
    this.active();
    this.parent.classList.add("AUTOFILL");
    if (value) {
      this.input.value = value;
    }
    return this;
  }
  removeAutofill() {
    this.parent.classList.remove("AUTOFILL");
    return this;
  }
}

class SInput extends SRC {
  constructor(parent, isInput = false) {
    super(parent, isInput);

    this.parent.classList.add("switchInput");
    this.checkBox.appendChild(this.pendEl);
  }
}

class CInput extends SRC {
  constructor(parent, isInput = false) {
    super(parent, isInput);

    this.parent.classList.add("cInput");

    this.checkBox.innerHTML =
      '<svg viewBox="0 0 78.6 62.85"><polyline pathLength="50" points="4.95 32.25 25.65 52.95 73.65 4.95"/></svg>';
    this.checkBox.appendChild(this.pendEl);
  }
}
class RInput extends SRC {
  constructor(parent, isInput = false) {
    super(parent, isInput);

    this.parent.classList.add("rInput");
    this.checkBox.appendChild(this.pendEl);
  }

  onClick(fn, pend = false) {
    this.input.addEventListener("click", (ev) => {
      ev.preventDefault();
      setTimeout(() => {
        if (!this.input.checked) {
          if (pend) this.pend();
          fn();
        }
      }, 0);
    });
    return this;
  }
}

class FInput extends Input {
  constructor(parent, isInput = false) {
    super(parent, isInput);

    this.parent.classList.add("fInput");

    this.defaultLabel = this.label.innerHTML;

    // Initiation
    this.input.addEventListener("input", () => {
      let files = this.input.files;

      if (this.expand) {
        this.expandElement.innerHTML = "";
      }

      if (files.length > 1) {
        // Multiple files selected
        this.activate();

        let totalSize = 0;
        for (let file of files) {
          totalSize += file.size;
        }
        totalSize = this.formatSize(totalSize);

        this.label.innerHTML = `${files.length} files <span class='fI-detail'>${totalSize}</span>`;

        if (this.expand) {
          for (let file of files) {
            let p = document.createElement("p");
            let size = this.formatSize(file.size);
            p.innerHTML = `${file.name} <span class='fI-detail'>${size}</span>`;
            this.expandElement.appendChild(p);
          }
        }
      } else if (files.length === 1) {
        // One file selected
        this.activate();

        let originalName = files[0].name;
        // Size handling
        let size = this.formatSize(files[0].size);

        if (this.expand) {
          let p = document.createElement("p");
          p.innerHTML = `${originalName} <span class='fI-detail'>${size}</span>`;
          this.expandElement.innerHTML = "";
          this.expandElement.appendChild(p);

          this.label.innerHTML = `1 file <span class='fI-detail'>${size}</span>`;
        } else {
          // Short name handling
          let name = "";
          this.label.title = originalName;
          if (originalName.length > 25) {
            name =
              originalName.slice(0, 16) +
              "..." +
              originalName.slice(name.length - 6);
          } else {
            name = originalName;
          }

          this.label.innerHTML = `${name} <span class='fI-detail'>${size}</span>`;
        }
      } else {
        // Nothing selected
        this.deactivate();
        this.label.innerHTML = this.defaultLabel;
        if (this.expand) {
          this.expandElement.innerHTML = "";
        }
      }
    });

    if (
      this.parent.dataset.expand &&
      document.getElementById(this.parent.dataset.expand)
    ) {
      this.expand = true;
      this.expandElement = document.getElementById(this.parent.dataset.expand);
      this.expandElement.classList.add("fI-expand");
      this.expandElement.innerHTML = "";
    } else {
      if (this.parent.dataset.expand) {
        console.warn(
          `The expand element of File Input not exists. No element by ID: ${this.parent.dataset.expand}`
        );
      }
      this.expand = false;
      this.expandElement = null;
    }
  }

  formatSize(size) {
    const unit = ["B", "KB", "MB", "GB", "TB"];
    let unitIndex = 0;
    while (size >= 1000) {
      size /= 1000;
      unitIndex++;
    }
    size = size.toString().slice(0, 3);
    return size + unit[unitIndex];
  }

  activate() {
    this.parent.classList.add("active");
    return this;
  }
  deactivate() {
    this.parent.classList.remove("active");
    return this;
  }
}

class BInput extends Input {
  constructor(parent, isInput = false) {
    super(parent, isInput);

    this.parent.classList.add("bInput");

    this.isProgressSet = false;

    // Icon Only
    if (this.label.innerHTML === "" && this.label.dataset.icon.length > 0) {
      this.parent.classList.add("drs-bInput--IconOnly");
    }

    // Click Pend
    if (this.parent.classList.contains("drs-clickPend")) {
      this.input.addEventListener("click", () => {
        this.pend();
      });
    }
  }

  pend() {
    this.parent.classList.add("PENDING");
    this.input.disabled = true;
    return this;
  }
  unpend() {
    this.parent.classList.remove("PENDING");
    this.input.disabled = false;
    return this;
  }

  progress(tenths) {
    if (tenths !== false) {
      if (this.isProgressSet === false) {
        this.progressElement = document.createElement("div");
        this.progressElement.setAttribute("class", "bInput-progressbar");
        this.label.appendChild(this.progressElement);
        this.isProgressSet = true;
      }
      this.progressElement.style.transform = `scaleX(${tenths})`;
    } else {
      if (this.isProgressSet === true) {
        this.isProgressSet = false;
        this.progressElement.remove();
      }
      this.unpend();
    }
  }

  setStatus(status) {
    if (status != "success" && status != "fail") {
      console.log(`Wrong status code. ${status} status code does not exists.`);
      return;
    }
    status = status.toUpperCase();
    this.parent.classList.remove("PENDING");
    this.parent.classList.add(status);
    setTimeout(() => {
      this.parent.classList.remove(status);
      this.input.disabled = false;
    }, 1000);
    return this;
  }

  onClick(fn, pend = false) {
    this.input.addEventListener("click", (ev) => {
      if (pend) this.pend();
      fn();
    });
    return this;
  }

  async fetch(
    url,
    method = "GET",
    data = {},
    contentType = "application/json"
  ) {
    if (method === "GET" || method === "HEAD") {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": contentType,
        },
      });
      return response;
    } else {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": contentType,
        },
        body: JSON.stringify(data),
      });
      return response;
    }
  }
}
