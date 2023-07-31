var emptyColour = "black";
var colours = ["rgb(255, 179, 0)", "rgb(128, 62, 117)", "rgb(255, 104, 0)", "rgb(166, 189, 215)", "rgb(193, 0, 32)", "rgb(206, 162, 98)", "rgb(129, 112, 102)", "rgb(0, 125, 52)", "rgb(246, 118, 142)", "rgb(0, 83, 138)", "rgb(255, 122, 92)", "rgb(83, 55, 122)", "rgb(255, 142, 0)", "rgb(179, 40, 81)", "rgb(244, 200, 0)", "rgb(127, 24, 13)", "rgb(147, 170, 0)", "rgb(89, 51, 21)", "rgb(241, 58, 19)", "rgb(35, 44, 22)"];

var x = -10;
var y = -10;
var width = 20; //also height
var fineness = 8;
var iters = 100; //maximum iterations used of Newton's method
var prec = 0.05; //precision
var pixelSize = 2;



//the polynomial roots
var roots = [[2, 2], [2, -2], [-2, -2], [-2, 2]];
var rootElements = [];
var generalizationConstant = [1, 0];

var isRootSelected = false;
var selectedRoot;
var zoomSpeed = 2; //The factor by which the view changes when the mouse wheel is scrolled

var polynomialCoefficients = [];
var derivativeCoefficients = [];

var equationDisplayPrecision = 3; //number of decimal places

var randomRoots = function (deg) {
    roots = [];
    for (var i = 0; i < deg; i++) {
        roots.push([x + Math.random() * width, y + Math.random() * width]);
    }
}

//Someone else's function to find all combinations of length k of a set
var k_combinations = function (set, k) {
    var i, j, combs, head, tailcombs;
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

var ac = function (a, b) {
    return [a[0] + b[0], a[1] + b[1]];
};

var acs = function (nums) {
    var sum = [0, 0];
    for (var i = 0; i < nums.length; i++) {
        sum = ac(sum, nums[i]);
    }
    return sum;
};

var mc = function (a, b) {
    return [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
};

var neg = function (a) {
    return [-a[0], -a[1]]
}

var mcs = function (nums) {
    var product = [1, 0];
    for (var i = 0; i < nums.length; i++) {
        product = mc(product, nums[i]);
    }
    return product;
};

var dc = function (a, b) { // a divided by b
    return [(a[0] * b[0] + a[1] * b[1]) / (b[0] * b[0] + b[1] * b[1]), (a[1] * b[0] - a[0] * b[1]) / (b[0] * b[0] + b[1] * b[1])];
};

var ec = function (a, p) {
    var product = [1, 0];
    for (var i = 0; i < p; i++) {
        product = mc(product, a);
    }
    return product;
};

var sumOfProducts = function (n) {
    var s = [0, 0];
    var combs = k_combinations(roots, n);
    for (var i = 0; i < combs.length; i++) {
        s = ac(s, mcs(combs[i]));
    }
    return s;
};

var getPolynomial = function () {
    polynomialCoefficients = [];
    for (var i = 0; i < roots.length; i++) {
        if ((i + roots.length) % 2 == 0) {
            polynomialCoefficients.push(sumOfProducts(roots.length - i));
        } else {
            polynomialCoefficients.push(neg(sumOfProducts(roots.length - i)));
        }
    }
    polynomialCoefficients.push([1, 0]);
    derivativeCoefficients = [];
    for (var i = 1; i <= roots.length; i++) {
        derivativeCoefficients.push(mc(polynomialCoefficients[i], [i, 0]));
    }
    derivativeCoefficients.push([0, 0]);
}

var pOfX = function (n) {
    var ps = polynomialCoefficients[roots.length];
    for (var i = roots.length - 1; i >= 0; i--) {
        ps = ac(mc(ps, n), polynomialCoefficients[i]);
    }
    return ps;
};

var pPrimeOfX = function (n) {
    var ps = derivativeCoefficients[roots.length];
    for (var i = roots.length - 1; i >= 0; i--) {
        ps = ac(mc(ps, n), derivativeCoefficients[i]);
    }
    return ps;
};

var newtonsMethod = function (num, iterations, precision) {
    var result = num;
    for (var i = 0; i < iterations; i++) {
        result = ac(result, mc(generalizationConstant, neg(dc(pOfX(result), pPrimeOfX(result)))));
        var c = getColour(result, precision);
        if (c != emptyColour) {
            return c;
        }
    }
    return emptyColour;
};

var distance = function (a, b) {
    return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
};

var getColour = function (n, precision) {
    for (var i = 0; i < roots.length; i++) {
        if (distance(n, roots[i]) <= precision) {
            return colours[i]
        }
    }
    return emptyColour;
};

var getBracket = function (r) {
    var b = "(z";
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

var getTerm = function (coeff, exp) {
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

var cells = [];
var canvas = document.getElementById("canvas");
canvas.style.position = "absolute";
canvas.style.left = "0px";
canvas.style.top = "0px";
var info = document.getElementById("info");
info.style.position = "absolute";
info.style.left = width * fineness * pixelSize * 1.1 + "px";
info.style.top = "0px";
var newFractalSlider = document.getElementById("new-fractal-slider");
newFractalSlider.value = 4;
var newFractalButton = document.getElementById("new-fractal-button");
var newFractalText = document.getElementById("new-fractal-text");
var poly1 = document.getElementById("poly1");
var poly2 = document.getElementById("poly2");
var mouseCoordsText = document.getElementById("mousecoords");
var finenessSlider = document.getElementById("fineness-slider");
finenessSlider.value = 3;
var finenessText = document.getElementById("fineness-text");
var finenessButton = document.getElementById("fineness-button");
var sizeSlider = document.getElementById("size-slider");
sizeSlider.value = 2;
var sizeText = document.getElementById("size-text");
var rootsDiv = document.getElementById("roots-div");
var coloursButton = document.getElementById("colours-button");

var magnitudeText = document.getElementById("magnitude-text");
var magnitudeSlider = document.getElementById("magnitude-slider");
magnitudeSlider.value = 0;
var angleText = document.getElementById("angle-text");
var angleSlider = document.getElementById("angle-slider");
angleSlider.value = 0;
var extendedButton = document.getElementById("extended-button");

finenessSlider.oninput = function () {
    finenessText.textContent = "Resolution: " + Math.pow(2, finenessSlider.value);
};
newFractalSlider.oninput = function () {
    newFractalText.textContent = "Degree: " + newFractalSlider.value;
};
sizeSlider.oninput = function () {
    sizeText.textContent = "Size: " + sizeSlider.value;
};
angleSlider.oninput = function () {
    angleText.textContent = "Angle: " + angleSlider.value + "�";
};
magnitudeSlider.oninput = function () {
    magnitudeText.textContent = "Magnitude: " + (0.01 * magnitudeSlider.value).toFixed(2);
};

var update = function () {
    fineness = (Math.pow(2, finenessSlider.value)) * (20 / width);
    pixelSize = 8 * sizeSlider.value / Math.pow(2, finenessSlider.value);
    info.style.left = width * fineness * pixelSize * 1.1 + "px";
    drawFractal();
};

var extendedUpdate = function () {
    generalizationConstant = [1 + magnitudeSlider.value * 0.01 * Math.cos(Math.PI * angleSlider.value / 180), magnitudeSlider.value * 0.01 * Math.sin(Math.PI * angleSlider.value / 180)];
    console.log(generalizationConstant);
    drawFractal();
};

var newRandomFractal = function () {
    randomRoots(newFractalSlider.value);
    drawFractal();
};

var drawFractal = function () {
    var d = new Date();
    drawRoots();
    getPolynomial();
    var ctx = canvas.getContext("2d");
    var s = fineness * width;
    canvas.width = s * pixelSize;
    canvas.height = s * pixelSize;
    for (var i = 0; i < s; i++) {
        for (var j = 0; j < s; j++) {
            ctx.fillStyle = newtonsMethod([x + i / fineness, y + j / fineness], iters, prec);
            ctx.fillRect(i * pixelSize, j * pixelSize, pixelSize, pixelSize);
        }
    }
    var p1 = "P(z) = ";
    var p2 = "&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp= z<sup>" + roots.length + "</sup>";
    for (var i = 0; i < roots.length; i++) {
        p1 += getBracket(roots[i]);
        p2 += getTerm(polynomialCoefficients[roots.length - i - 1], roots.length - i - 1)
    }
    poly1.innerHTML = p1;
    poly2.innerHTML = p2;
    var e = new Date();
    console.log(e.getTime() - d.getTime());
}

var drawRoots = function () {
    rootsDiv.innerHTML = "";
    rootElements = [];
    for (var i = 0; i < roots.length; i++) {
        if (roots[i][0] < x + width && roots[i][1] < y + width) {
            var newRoot = document.createElement("div");
            newRoot.style.position = "absolute";
            newRoot.style.width = "2px";
            newRoot.style.height = "2px";
            rootsDiv.appendChild(newRoot);
            rootElements.push(newRoot);
            newRoot.style.left = (roots[i][0] - x) * fineness * pixelSize + "px";
            newRoot.style.top = (roots[i][1] - y) * fineness * pixelSize + "px";
            newRoot.style.backgroundColor = colours[i];
            newRoot.style.borderRadius = "1px";
            newRoot.style.border = "solid";
            newRoot.style.borderColor = "black";
        }
    }
}

var moveRoot = function (e) {
    var mousePos = [(e.clientX) / (fineness * pixelSize) + x, (e.clientY) / (fineness * pixelSize) + y];
    if (isRootSelected == false) {
        for (var i = 0; i < roots.length; i++) {
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

var moveRoot2 = function (e) {
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

var newColours = function () {
    for (var i = colours.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = colours[i];
        colours[i] = colours[j];
        colours[j] = temp;
    }
    drawFractal();
}

var zoom = function (e) {
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