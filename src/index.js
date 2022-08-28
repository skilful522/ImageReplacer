import "./styles.css";

const canvas = document.querySelector("canvas");
const previewButton = document.querySelector(".preview");
const controlsContainer = document.querySelector(".controls");
const ctx = canvas.getContext("2d");

ctx.fillStyle = "white";
ctx.font = "24px serif";
ctx.fillText("Add image into me", 60, Math.floor(canvas.height / 2));

let isInverted = false;
const symbols = [
  "@",
  "$",
  "+",
  "#",
  "&",
  "%",
  "_",
  ":",
  "$",
  "/",
  "-",
  "W",
  "S",
  "Z",
];

const getSymbol = (averageColor) => {
  if (averageColor > 250) {
    return symbols[0];
  } else if (isInverted ? averageColor > 240 : averageColor < 240) {
    return symbols[1];
  } else if (isInverted ? averageColor > 220 : averageColor < 220) {
    return symbols[2];
  } else if (isInverted ? averageColor > 200 : averageColor < 200) {
    return symbols[3];
  } else if (isInverted ? averageColor > 180 : averageColor < 180) {
    return symbols[4];
  } else if (isInverted ? averageColor > 160 : averageColor < 160) {
    return symbols[5];
  } else if (isInverted ? averageColor > 140 : averageColor < 140) {
    return symbols[6];
  } else if (isInverted ? averageColor > 120 : averageColor < 120) {
    return symbols[7];
  } else if (isInverted ? averageColor > 100 : averageColor < 100) {
    return symbols[8];
  } else if (isInverted ? averageColor > 80 : averageColor < 80) {
    return symbols[9];
  } else if (isInverted ? averageColor > 60 : averageColor < 60) {
    return symbols[10];
  } else if (isInverted ? averageColor > 40 : averageColor < 40) {
    return symbols[11];
  } else if (isInverted ? averageColor > 20 : averageColor < 20) {
    return symbols[12];
  }
  return symbols[13];
};

class Cell {
  constructor(x, y, symbol, color) {
    this.x = x;
    this.y = y;
    this.symbol = symbol;
    this.color = color;
  }

  draw(context) {
    context.fillStyle = this.color;
    context.fillText(this.symbol, this.x, this.y);
  }
}

const drawImage = (img, resolution = 5) => {
  canvas.width = 500;
  canvas.height = 500;
  const imageCells = [];
  ctx.drawImage(img, 0, 0, 500, 500);
  const imgData = ctx.getImageData(0, 0, 500, 500);

  for (let y = 0; y < imgData.height; y += resolution) {
    for (let x = 0; x < imgData.width; x += resolution) {
      const posX = x * 4;
      const posY = y * 4;
      const pos = posY * imgData.width + posX;
      if (imgData.data[pos + 3] > 128) {
        const red = imgData.data[pos];
        const green = imgData.data[pos + 1];
        const blue = imgData.data[pos + 2];
        const total = red + green + blue;
        const averageColor = total / 3;
        const color = `rgb(${red},${green},${blue})`;
        const symbol = getSymbol(averageColor);
        if (total > 200) {
          imageCells.push(new Cell(x, y, symbol, color));
        }
      }
    }
  }
  ctx.clearRect(0, 0, img.width, img.height);
  imageCells.forEach((imageCell) => imageCell.draw(ctx));
};

const label = document.querySelector("#resolutionLabel");

let img;
let resolution = 5;

document.querySelector("#resolution").addEventListener("change", (event) => {
  resolution = event.target.value;
  if (+resolution === 1) {
    label.innerHTML = `Original image`;
    ctx.drawImage(img, 0, 0, 500, 500);
    return;
  }
  label.innerHTML = `Resolution ${resolution}px`;
  drawImage(img, +resolution);
});

document.querySelector("#upload").addEventListener("change", (event) => {
  resolution = 5;
  const uploadedImage = event.target.files[0];
  const reader = new FileReader();
  img = new Image();
  reader.onload = function (event) {
    img.src = event.target.result;
    img.onload = function () {
      drawImage(img, 5);
    };
  };
  reader.readAsDataURL(uploadedImage);
});

const loadImage = (blobImage) => {
  const reader = new FileReader();
  img = new Image();
  reader.onload = function (event) {
    img.src = event.target.result;
    img.onload = function () {
      drawImage(img, 5);
    };
  };
  reader.readAsDataURL(blobImage);
};

document.querySelector("#upload").addEventListener("paste", (event) => {
  const uploadedImage = event.target.files[0];
  loadImage(uploadedImage);
});

document.querySelector("#isInverted").addEventListener("change", (event) => {
  const { checked } = event.target;
  isInverted = checked;
  drawImage(img, +resolution);
});

function retrieveImageFromClipboardAsBlob(pasteEvent, callback) {
  if (pasteEvent.clipboardData === false) {
    if (typeof callback == "function") {
      callback(undefined);
    }
  }

  const items = pasteEvent.clipboardData.items;

  if (items === undefined) {
    if (typeof callback == "function") {
      callback(undefined);
    }
  }

  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf("image") == -1) continue;

    const blob = items[i].getAsFile();

    if (typeof callback == "function") {
      callback(blob);
    }
  }
}

window.addEventListener(
  "paste",
  function (e) {
    retrieveImageFromClipboardAsBlob(e, function (imageBlob) {
      if (imageBlob) {
        loadImage(imageBlob);
      }
    });
  },
  false
);
