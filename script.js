let emptyColour = "black";
let colours = ["rgb(255, 179, 0)", "rgb(128, 62, 117)", "rgb(255, 104, 0)", "rgb(166, 189, 215)", "rgb(193, 0, 32)", "rgb(206, 162, 98)", "rgb(129, 112, 102)", "rgb(0, 125, 52)", "rgb(246, 118, 142)", "rgb(0, 83, 138)", "rgb(255, 122, 92)", "rgb(83, 55, 122)", "rgb(255, 142, 0)", "rgb(179, 40, 81)", "rgb(244, 200, 0)", "rgb(127, 24, 13)", "rgb(147, 170, 0)", "rgb(89, 51, 21)", "rgb(241, 58, 19)", "rgb(35, 44, 22)"];

let x = -10;
let y = -10;
let width = 20; //also height
let fineness = 24;
let pixelSize = 1;

const iters = 100; //maximum iterations used of Newton's method
const prec = 0.05; //precision

//the polynomial roots
let roots = [[2, 2], [2, -2], [-2, -2], [-2, 2]];
let rootElements = [];
let generalizationConstant = [1, 0];

let isRootSelected = false;
let selectedRoot;
const zoomSpeed = 2; //The factor by which the view changes when the mouse wheel is scrolled

let polynomialCoefficients = [];
let derivativeCoefficients = [];

const equationDisplayPrecision = 3; //number of decimal places

function randomRoots(deg) {
    roots = [];
    for (let i = 0; i < deg; i++) {
        roots.push([x + Math.random() * width, y + Math.random() * width]);
    }
}

//Someone else's function to find all combinations of length k of a set
function k_combinations(set, k) {
    let i, j, combs, head, tailcombs;
    if (k == 1) {
        combs = [];
        for (i = 0; i < set.length; i++) {
            combs.push([set[i]]);
        }
        return combs;
    }
    combs = [];
    for (i = 0; i < set.length - k + 1; i++) {
        head = set.slice(i, i + 1);
        tailcombs = k_combinations(set.slice(i + 1), k - 1);
        for (j = 0; j < tailcombs.length; j++) {
            combs.push(head.concat(tailcombs[j]));
        }
    }
    return combs;
}

function ac(a, b) {
    return [a[0] + b[0], a[1] + b[1]];
};

function acs(nums) {
    let sum = [0, 0];
    for (let i = 0; i < nums.length; i++) {
        sum = ac(sum, nums[i]);
    }
    return sum;
};

function mc(a, b) {
    return [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
};

function neg(a) {
    return [-a[0], -a[1]]
}

function mcs(nums) {
    let product = [1, 0];
    for (let i = 0; i < nums.length; i++) {
        product = mc(product, nums[i]);
    }
    return product;
};

function dc(a, b) { // a divided by b
    return [(a[0] * b[0] + a[1] * b[1]) / (b[0] * b[0] + b[1] * b[1]), (a[1] * b[0] - a[0] * b[1]) / (b[0] * b[0] + b[1] * b[1])];
};

function ec(a, p) {
    let product = [1, 0];
    for (let i = 0; i < p; i++) {
        product = mc(product, a);
    }
    return product;
};

function sumOfProducts(n) {
    let s = [0, 0];
    let combs = k_combinations(roots, n);
    for (let i = 0; i < combs.length; i++) {
        s = ac(s, mcs(combs[i]));
    }
    return s;
};

function getPolynomial() {
    polynomialCoefficients = [];
    for (let i = 0; i < roots.length; i++) {
        if ((i + roots.length) % 2 == 0) {
            polynomialCoefficients.push(sumOfProducts(roots.length - i));
        } else {
            polynomialCoefficients.push(neg(sumOfProducts(roots.length - i)));
        }
    }
    polynomialCoefficients.push([1, 0]);
    derivativeCoefficients = [];
    for (let i = 1; i <= roots.length; i++) {
        derivativeCoefficients.push(mc(polynomialCoefficients[i], [i, 0]));
    }
    derivativeCoefficients.push([0, 0]);
}

function pOfX(n) {
    let ps = polynomialCoefficients[roots.length];
    for (let i = roots.length - 1; i >= 0; i--) {
        ps = ac(mc(ps, n), polynomialCoefficients[i]);
    }
    return ps;
};

function pPrimeOfX(n) {
    let ps = derivativeCoefficients[roots.length];
    for (let i = roots.length - 1; i >= 0; i--) {
        ps = ac(mc(ps, n), derivativeCoefficients[i]);
    }
    return ps;
};

function newtonsMethod(num, iterations, precision) {
    let result = num;
    for (let i = 0; i < iterations; i++) {
        result = ac(result, mc(generalizationConstant, neg(dc(pOfX(result), pPrimeOfX(result)))));
        let c = getColour(result, precision);
        if (c != emptyColour) {
            return c;
        }
    }
    return emptyColour;
};

function distance(a, b) {
    return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
};

function getColour(n, precision) {
    for (let i = 0; i < roots.length; i++) {
        if (distance(n, roots[i]) <= precision) {
            return colours[i]
        }
    }
    return emptyColour;
};

function getBracket(r) {
    let b = "(z";
    if (r[0] < 0) {
        b += " + " + (-r[0].toFixed(equationDisplayPrecision))
    } else if (r[0] > 0) {
        b += " - " + r[0].toFixed(equationDisplayPrecision)
    } if (r[1] == -1) {
        b += " + " + "i)"
    } else if (r[1] == 1) {
        b += " - " + "i)"
    } else if (r[1] < 0) {
        b += " + " + (-r[1].toFixed(equationDisplayPrecision)) + "i)"
    } else if (r[1] > 0) {
        b += " - " + r[1].toFixed(equationDisplayPrecision) + "i)"
    }
    return b
};

function getTerm(coeff, exp) {
    t = ""
    if (coeff[0] > 0) {
        if (coeff[1] != 0) {
            t += " + (" + coeff[0].toFixed(equationDisplayPrecision)
        } else {
            t += " + " + coeff[0].toFixed(equationDisplayPrecision)
        }
    } else if (coeff[0] < 0) {
        if (coeff[1] != 0) {
            t += " - (" + (-coeff[0]).toFixed(equationDisplayPrecision)
        } else {
            t += " - " + (-coeff[0]).toFixed(equationDisplayPrecision)
        }
    }
    if (coeff[1] == 1) {
        t += " + i";
    } else if (coeff[1] == -1) {
        t += " - i";
    } else if (coeff[1] > 0) {
        t += " + " + coeff[1].toFixed(equationDisplayPrecision) + "i";
    } else if (coeff[1] < 0) {
        t += " - " + (-coeff[1]).toFixed(equationDisplayPrecision) + "i";
    } else {
        if (coeff[0] == 0) {
            return "";
        }
    }
    if (coeff[0] != 0 && coeff[1] != 0) {
        t += ")"
    } if (exp > 0) {
        t += "z";
    } if (exp > 1) {
        t += "<sup>" + exp + "</sup>";
    }
    return t;
}

let cells = [];
const canvas = document.getElementById("canvas");
canvas.style.position = "absolute";
canvas.style.left = "0px";
canvas.style.top = "0px";
const info = document.getElementById("info");
info.style.position = "absolute";
info.style.left = width * fineness * pixelSize * 1.1 + "px";
info.style.top = "0px";
const newFractalSlider = document.getElementById("new-fractal-slider");
newFractalSlider.value = 4;
const newFractalButton = document.getElementById("new-fractal-button");
const newFractalText = document.getElementById("new-fractal-text");
const poly1 = document.getElementById("poly1");
const poly2 = document.getElementById("poly2");
const mouseCoordsText = document.getElementById("mousecoords");
const finenessSlider = document.getElementById("fineness-slider");
finenessSlider.value = 24;
const finenessText = document.getElementById("fineness-text");
const finenessButton = document.getElementById("fineness-button");
const sizeSlider = document.getElementById("size-slider");
sizeSlider.value = 1;
const sizeText = document.getElementById("size-text");
const rootsDiv = document.getElementById("roots-div");
const coloursButton = document.getElementById("colours-button");

const magnitudeText = document.getElementById("magnitude-text");
const magnitudeSlider = document.getElementById("magnitude-slider");
magnitudeSlider.value = 0;
const angleText = document.getElementById("angle-text");
const angleSlider = document.getElementById("angle-slider");
angleSlider.value = 0;
const extendedButton = document.getElementById("extended-button");

finenessSlider.oninput = () => {
    finenessText.textContent = "Resolution: " + finenessSlider.value;
};
newFractalSlider.oninput = () => {
    newFractalText.textContent = "Degree: " + newFractalSlider.value;
};
sizeSlider.oninput = () => {
    sizeText.textContent = "Size: " + sizeSlider.value;
};
angleSlider.oninput = () => {
    angleText.textContent = "Angle: " + angleSlider.value + "°";
};
magnitudeSlider.oninput = () => {
    magnitudeText.textContent = "Magnitude: " + (0.01 * magnitudeSlider.value).toFixed(2);
};

function update() {
    fineness = finenessSlider.value * (20 / width);
    pixelSize = sizeSlider.value;
    info.style.left = width * fineness * pixelSize * 1.1 + "px";
    drawFractal();
};

function extendedUpdate() {
    generalizationConstant = [1 + magnitudeSlider.value * 0.01 * Math.cos(Math.PI * angleSlider.value / 180), magnitudeSlider.value * 0.01 * Math.sin(Math.PI * angleSlider.value / 180)];
    drawFractal();
};

function newRandomFractal() {
    randomRoots(newFractalSlider.value);
    drawFractal();
};

function drawFractal() {
    let d = new Date();
    drawRoots();
    getPolynomial();
    let ctx = canvas.getContext("2d");
    let s = fineness * width;
    canvas.width = s * pixelSize;
    canvas.height = s * pixelSize;
    for (let i = 0; i < s; i++) {
        for (let j = 0; j < s; j++) {
            ctx.fillStyle = newtonsMethod([x + i / fineness, y + j / fineness], iters, prec);
            ctx.fillRect(i * pixelSize, j * pixelSize, pixelSize, pixelSize);
        }
    }
    let p1 = "P(z) = ";
    let p2 = "&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp= z<sup>" + roots.length + "</sup>";
    for (let i = 0; i < roots.length; i++) {
        p1 += getBracket(roots[i]);
        p2 += getTerm(polynomialCoefficients[roots.length - i - 1], roots.length - i - 1)
    }
    poly1.innerHTML = p1;
    poly2.innerHTML = p2;
    let e = new Date();
    console.log(e.getTime() - d.getTime());
}

function drawRoots() {
    rootsDiv.innerHTML = "";
    rootElements = [];
    for (let i = 0; i < roots.length; i++) {
        if (roots[i][0] < x + width && roots[i][1] < y + width) {
            let newRoot = document.createElement("div");
            newRoot.style.position = "absolute";
            newRoot.className = "root";
            rootsDiv.appendChild(newRoot);
            rootElements.push(newRoot);
            newRoot.style.left = (roots[i][0] - x) * fineness * pixelSize + "px";
            newRoot.style.top = (roots[i][1] - y) * fineness * pixelSize + "px";
            newRoot.style.backgroundColor = colours[i];
        }
    }
}

function moveRoot(e) {
    let mousePos = [(e.clientX) / (fineness * pixelSize) + x, (e.clientY) / (fineness * pixelSize) + y];
    if (isRootSelected == false) {
        for (let i = 0; i < roots.length; i++) {
            if (distance(mousePos, roots[i]) < width / 60) {
                selectedRoot = i;
                isRootSelected = true;
            }
        }
    } else {
        roots[selectedRoot] = mousePos;
        isRootSelected = false;
        drawFractal();
    }
};

function moveRoot2(e) {
    if ((e.clientY) / (fineness * pixelSize) + y > 0) {
        mouseCoordsText.textContent = "Mouse position: " + ((e.clientX) / (fineness * 2) + x).toFixed(equationDisplayPrecision) + " + " + ((e.clientY) / (fineness * 2) + y).toFixed(equationDisplayPrecision) + "i";
    } else if ((e.clientY) / (fineness * pixelSize) + y < 0) {
        mouseCoordsText.textContent = "Mouse position: " + ((e.clientX) / (fineness * 2) + x).toFixed(equationDisplayPrecision) + " - " + ((-e.clientY) / (fineness * 2) - y).toFixed(equationDisplayPrecision) + "i";
    } else {
        mouseCoordsText.textContent = "Mouse position: " + ((e.clientX) / (fineness * 2) + x).toFixed(equationDisplayPrecision);
    }
    if (isRootSelected) {
        rootElements[selectedRoot].style.left = e.clientX + "px";
        rootElements[selectedRoot].style.top = e.clientY + "px";
    }
};

function newColours() {
    for (let i = colours.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = colours[i];
        colours[i] = colours[j];
        colours[j] = temp;
    }
    drawFractal();
}

function zoom(e) {
    console.log(e.clientX, e.clientY);
    if (e.deltaY > 0) {
        x = (x + (1 - zoomSpeed) * (e.clientX) / (fineness * pixelSize));
        y = (y + (1 - zoomSpeed) * (e.clientY) / (fineness * pixelSize));
        width *= zoomSpeed;
        fineness /= zoomSpeed;
    } else {
        x = (x + (1 - 1 / zoomSpeed) * (e.clientX) / (fineness * pixelSize));
        y = (y + (1 - 1 / zoomSpeed) * (e.clientY) / (fineness * pixelSize));
        width /= zoomSpeed;
        fineness *= zoomSpeed;
    }
    drawFractal();
};

newColours();

finenessButton.addEventListener("click", update);
coloursButton.addEventListener("click", newColours);
newFractalButton.addEventListener("click", newRandomFractal);
extendedButton.addEventListener("click", extendedUpdate);
window.addEventListener("click", moveRoot);
window.addEventListener("mousemove", moveRoot2);
canvas.addEventListener("wheel", zoom);