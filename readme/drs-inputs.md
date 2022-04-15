# Inputs

- When registering the inputs with JavaScript if the selected element is the `input` itself use `true` as the second parameter: `new XInput(element, isInput=true)`.
- To _disable_ any of the inputs, normally add `disabled` to the `<input>` or `<button>`.
- To switch to dark mode, add class `.drs-darkTheme` to element.
- It's better to **not use** the pre-defiend classes for adding the elements to instences of a class.

  `.tInput` | `.swInput` | `.rInput` | `.cInput` | `.fInput` | `.bInput`  
  It's Ok in some cases but not recommended. because the constructor adds these classes if they are missing. And in some cases referencing elements with pre-defined classes can introduce bugs.

  ```javascript
  // Ok in some cases but not always
  document.querySelectorAll(".cInput").forEach((parent) => {
    new CInput(parent);
  });
  ```

Check [Demo](https://drastraa.github.io/Inputs/).

- `data-icon` attribute is using [Material Icons](https://fonts.google.com/icons "Material icons reference")
- How to use:

  1. Add this code to `<head>` tag.

     ```html
     <script src="js/r-inputs.js"></script>
     <link rel="stylesheet" href="css/r-inputs.css" />
     ```

  2. Create instences of the class for each input.

## Input Class

All other classes extend this class

- It contains `DRS_INPUTS` property that saves all the instences of the subclasses.
- `Input.darkThemeAll(true/false)` can be called.
- `darkTheme(true/false)` method can be called on instences of the subclasses.

## Text Input

- `<label>` is optional

### Text Input Classes

- `tInput.rtlI`: when using rtl language

### Text Input Methods

```javascript
this.active();
this.deactive();
this.autofill(value[optional]);
this.removeAutofill();
```

### Text Input Implementation

```html
<p class="tInput">
  <input type="text" id="ID" name="" placeholder="" />
  <label for="ID" data-icon="">LABEL</label>
</p>
```

```javascript
new TInput(parent);
```

## Switch / Radio / Checkbox

### Switch Methods

```javascript
this.pend();
this.unpend();
this.setChecked(true / false);
this.onClick(fn, pend);
```

### SRC Implementation

```html
<p class="parent">
  <input type="checkbox" name="" id="ID" />
  <label for="ID"><span class="label">LABEL</span></label>
</p>
```

Switch input type can either be `checkbox` or `radio`.

```javascript
new SInput(parent);
new RInput(parent);
new CInput(parent);
```

## File Input

### File Input Futures

#### Expanded version of File Input

1. In **multiple** file select mode, `data-expand="ELEMENT-ID"` attribute can be added to `.fInput` for showing selected files in detail. _(optional)_

2. Then create the target element

   ```html
   <p id="ELEMENT-ID"></p>
   ```

Each item will be added to `p#ELEMENT-ID` with the following format:

```html
<p>FILE_NAME <span class="fI-detail">FILE_SIZE</span></p>
```

### File Input Implementation

```html
<p class="fInput">
  <input id="ID" type="file" name="" multiple />
  <label for="ID" data-icon="">Choose File</label>
</p>
```

```javascript
new FInput(parent);
```

## Button Input

- Add `.rtlI` to `.tInput` when using **rtl** input

### Button Class

#### BInput properties

- `this.type` set to either `input` or `button` depending on element type.
- `this.input` set to either `<input>` or `<button>` element. depending on element type.

#### BInput methods

- Method `this.onClick(function, pend=false)`

  - Pass the custom function to run on click.
  - Set `pend` to `true` to active PENDING mode on click. Unpend it by calling `this.unpend()`.

- Method `this.fetch(url, method = "GET", data = {}, contentType = "application/json")`

  - Returns the promise

- Method `this.progress(tenths)`
  - Shows the loading on the button

##### bInput.fetch() Use example

```javascript
let button = new BInput(parent);
button.onClick(() => {
  button
    .fetch("https://reqres.in/api/register", "POST", {
      email: "eve.holt@reqres.in",
      password: "pistol",
    })
    .then((response) => {
      if (response.ok && response.status === 200) {
        button.setStatus("success");
        return response.json();
      } else {
        button.setStatus("fail");
        return response.json();
      }
    })
    .then((result) => {
      // Result
    })
    .catch((err) => {
      button.setStatus("fail");
      // Error handling
    });
}, true);
```

#### BInput Usage

- Add `.drs-clickPend` class to `bInput` for activating PENDING mode on click.

- Buttons can be assigned with **Only Icon**. (automatic)

  - This can be done manually by adding `drs-bInput--IconOnly` to the `.bInput`.

- Using `<input>`:

  ```html
  <p class="bInput">
    <input id="ID" type="" value="" />
    <label for="ID" data-icon="">LABEL</label>
  </p>
  ```

- Using `<button>`:

  ```html
  <p class="bInput">
    <button id="ID" type=""></button>
    <label for="ID" data-icon="">LABEL</label>
  </p>
  ```

```javascript
new BInput(parent);
```

## Todo

- [x] `fetch` function on buttons
- [x] mixins
- [x] Only-Icon button
