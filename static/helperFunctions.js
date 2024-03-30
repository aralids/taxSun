"use strict";
exports.__esModule = true;
exports.calculateArcEndpoints = exports.getLayers = exports.onMouseOutHandler = exports.hoverHandler = exports.downloadSVGasTextFile = exports.findRealName = exports.hideContextMenu = exports.showContextMenu = exports.disableEValue = exports.enableEValue = exports.makeID = exports.getViewportDimensions = exports.getFourCorners = exports.lineLength = exports.lineIntersect = exports.tintify = exports.midColor = exports.hexToRGB = exports.handleMouseMove = exports.cos = exports.sin = exports.round = exports.radians = exports.createPalette = void 0;
function createPalette(colorOffset) {
    if (colorOffset === void 0) { colorOffset = 7; }
    var newColors = [];
    for (var i = 0; i < 7; i++) {
        var r = Math.sin(0.3 * colorOffset + 4) * 55 + 200;
        var g = Math.sin(0.3 * colorOffset + 2) * 55 + 200;
        var b = Math.sin(0.3 * colorOffset) * 55 + 200;
        var newColor = "rgb(".concat(round(r, 0), ", ").concat(round(g, 0), ", ").concat(round(b, 0), ")");
        newColors.push(newColor);
        colorOffset += 3;
    }
    return newColors;
}
exports.createPalette = createPalette;
function round(number, decimal) {
    if (decimal === void 0) { decimal = 3; }
    return (Math.round(number * Math.pow(10, decimal)) / Math.pow(10, decimal));
}
exports.round = round;
function radians(degrees) {
    degrees = 270 - degrees;
    var pi = Math.PI;
    return degrees * (pi / 180);
}
exports.radians = radians;
function cos(number) {
    return Math.cos(radians(number));
}
exports.cos = cos;
function sin(number) {
    return Math.sin(radians(number));
}
exports.sin = sin;
function handleMouseMove(event) {
    var eventDoc, doc, body;
    event = event || window.event; // IE-ism
    if (event.pageX == null && event.clientX != null) {
        eventDoc = (event.target && event.target.ownerDocument) || document;
        doc = eventDoc.documentElement;
        body = eventDoc.body;
        event.pageX = event.clientX +
            (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
            (doc && doc.clientLeft || body && body.clientLeft || 0);
        event.pageY = event.clientY +
            (doc && doc.scrollTop || body && body.scrollTop || 0) -
            (doc && doc.clientTop || body && body.clientTop || 0);
    }
    console.log("cursorX, cursorY: ", event.pageX, event.pageY);
}
exports.handleMouseMove = handleMouseMove;
function hexToRGB(hex) {
    var aRgbHex = hex.match(/.{1,2}/g);
    var aRgb = [
        parseInt(aRgbHex[0], 16),
        parseInt(aRgbHex[1], 16),
        parseInt(aRgbHex[2], 16)
    ];
    return "rgb(".concat(aRgb[0], ", ").concat(aRgb[1], ", ").concat(aRgb[2], ")");
}
exports.hexToRGB = hexToRGB;
function midColor(rgb1, rgb2, coef) {
    var _a, _b, _c, _d;
    var coef = coef / 2;
    var rgb1List = (_b = (_a = rgb1.match(/\d+/g)) === null || _a === void 0 ? void 0 : _a.map(function (item) { return parseInt(item); })) !== null && _b !== void 0 ? _b : [];
    var rgb2List = (_d = (_c = rgb2.match(/\d+/g)) === null || _c === void 0 ? void 0 : _c.map(function (item) { return parseInt(item); })) !== null && _d !== void 0 ? _d : [];
    var newRgb = [];
    for (var i = 0; i < 3; i++) {
        var newNum = rgb1List[i] < rgb2List[i] ? rgb1List[i] + (coef * (rgb2List[i] - rgb1List[i])) : rgb1List[i] - (coef * (rgb1List[i] - rgb2List[i]));
        newRgb.push(Math.round(newNum));
    }
    return "rgb(".concat(newRgb[0], ", ").concat(newRgb[1], ", ").concat(newRgb[2], ")");
}
exports.midColor = midColor;
function tintify(rgb, tintFactor) {
    var _a, _b;
    var rgbList = (_b = (_a = rgb.match(/\d+/g)) === null || _a === void 0 ? void 0 : _a.map(function (item) { return parseInt(item); })) !== null && _b !== void 0 ? _b : [];
    var newRgb = [];
    for (var i = 0; i < 3; i++) {
        var newNum = rgbList[i] + ((255 - rgbList[i]) * tintFactor);
        newRgb.push(Math.round(newNum));
    }
    return "rgb(".concat(newRgb[0], ", ").concat(newRgb[1], ", ").concat(newRgb[2], ")");
}
exports.tintify = tintify;
function lineIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
    var ua, ub, denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
    if (denom == 0) {
        return null;
    }
    ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
    ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
    return {
        x: x1 + ua * (x2 - x1),
        y: y1 + ua * (y2 - y1)
    };
}
exports.lineIntersect = lineIntersect;
function lineLength(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}
exports.lineLength = lineLength;
function getFourCorners(top, bottom, left, right, cx, cy, angle) {
    if (!angle && navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
        angle = 0;
    }
    var topLeft = [((left - cx) * Math.cos(angle * (Math.PI / 180)) - (top - cy) * Math.sin(angle * (Math.PI / 180))) + cx, ((left - cx) * Math.sin(angle * (Math.PI / 180)) + (top - cy) * Math.cos(angle * (Math.PI / 180))) + cy];
    var topRight = [((right - cx) * Math.cos(angle * (Math.PI / 180)) - (top - cy) * Math.sin(angle * (Math.PI / 180))) + cx, ((right - cx) * Math.sin(angle * (Math.PI / 180)) + (top - cy) * Math.cos(angle * (Math.PI / 180))) + cy];
    var bottomLeft = [((left - cx) * Math.cos(angle * (Math.PI / 180)) - (bottom - cy) * Math.sin(angle * (Math.PI / 180))) + cx, ((left - cx) * Math.sin(angle * (Math.PI / 180)) + (bottom - cy) * Math.cos(angle * (Math.PI / 180))) + cy];
    var bottomRight = [((right - cx) * Math.cos(angle * (Math.PI / 180)) - (bottom - cy) * Math.sin(angle * (Math.PI / 180))) + cx, ((right - cx) * Math.sin(angle * (Math.PI / 180)) + (bottom - cy) * Math.cos(angle * (Math.PI / 180))) + cy];
    return { topLeft: topLeft, topRight: topRight, bottomLeft: bottomLeft, bottomRight: bottomRight };
}
exports.getFourCorners = getFourCorners;
function getViewportDimensions() {
    var plotC = document.getElementById("plot-container");
    var dpmm = document.getElementById("dpmm").offsetWidth; // returns the div's width in px, thereby telling us how many px equal 1mm for our particular screen
    var cx = plotC.offsetWidth / 2;
    var cy = plotC.offsetHeight / 2;
    var twoVMin = plotC.offsetHeight < plotC.offsetWidth ? plotC.offsetHeight / 50 : plotC.offsetWidth / 50;
    var leftColumnWidth = Number(getComputedStyle(document.body).getPropertyValue("--left-column-width"));
    var rightColumnWidth = Number(getComputedStyle(document.body).getPropertyValue("--right-column-width"));
    var sum = leftColumnWidth + rightColumnWidth;
    var smallerDimSize = Math.min(cx * (1 - sum), cy) - dpmm * 10;
    return {
        "cx": (-rightColumnWidth * cx + leftColumnWidth * cx) + cx,
        "cy": cy,
        "dpmm": dpmm,
        "2vmin": twoVMin,
        "smallerDimSize": smallerDimSize
    };
}
exports.getViewportDimensions = getViewportDimensions;
;
function makeID(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    var counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    ;
    return result;
}
exports.makeID = makeID;
;
function enableEValue(median) {
    document.getElementById("e-input").removeAttribute("disabled");
    document.getElementById("e-label").style.color = "black";
    var eText = document.getElementById("e-text");
    eText.removeAttribute("disabled");
    eText.value = median;
}
exports.enableEValue = enableEValue;
;
function disableEValue() {
    document.getElementById("e-input").setAttribute("disabled", "disabled");
    document.getElementById("e-label").style.color = "grey";
    var eText = document.getElementById("e-text");
    eText.setAttribute("disabled", "disabled");
    eText.value = "";
}
exports.disableEValue = disableEValue;
;
function showContextMenu(e) {
    e.preventDefault();
    document.getElementById("context-menu").style.display = "block";
    positionContextMenu(e);
}
exports.showContextMenu = showContextMenu;
;
function hideContextMenu() {
    document.getElementById("context-menu").style.display = "none";
}
exports.hideContextMenu = hideContextMenu;
;
// Get the position of the right click in window and returns the X and Y coordinates
function getClickCoords(e) {
    var posx = 0;
    var posy = 0;
    if (!e) {
        var e = window.event;
    }
    ;
    if (e.pageX || e.pageY) {
        posx = e.pageX;
        posy = e.pageY;
    }
    else if (e.clientX || e.clientY) {
        posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    ;
    return { x: posx, y: posy };
}
;
// Position the Context Menu in right position.
function positionContextMenu(e) {
    var menu = document.getElementById("context-menu");
    var clickCoords = getClickCoords(e);
    var clickCoordsX = clickCoords.x;
    var clickCoordsY = clickCoords.y;
    var menuWidth = menu.offsetWidth;
    var menuHeight = menu.offsetHeight;
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    if (windowWidth - clickCoordsX < menuWidth) {
        menu.style.left = windowWidth - menuWidth + "px";
    }
    else {
        menu.style.left = clickCoordsX + "px";
    }
    if (windowHeight - clickCoordsY < menuHeight) {
        menu.style.top = windowHeight - menuHeight + "px";
    }
    else {
        menu.style.top = clickCoordsY - menuHeight + "px";
    }
    menu.setAttribute("taxon", e.target["id"]);
}
function findRealName(index, namesArray, name) {
    if (namesArray.length === 0) {
        return name;
    }
    for (var i = namesArray.length - 2; i >= 0; i--) {
        if (index > namesArray[i][1]) {
            return namesArray[i + 1][0];
        }
    }
    return namesArray[0][0];
}
exports.findRealName = findRealName;
function downloadSVGasTextFile(fileName, taxonName, layerName, modeName, collapseName) {
    var base64doc = btoa(unescape(encodeURIComponent(document.querySelector('svg').outerHTML)));
    var a = document.createElement('a');
    var e = new MouseEvent('click');
    a.download = "".concat(fileName, "_").concat(taxonName).concat(layerName, "_").concat(modeName, "_").concat(collapseName, ".svg");
    a.href = 'data:text/html;base64,' + base64doc;
    a.dispatchEvent(e);
}
exports.downloadSVGasTextFile = downloadSVGasTextFile;
function hoverHandler(id, fullLabel, root, e) {
    var _a, _b;
    var newRoot = (_b = (_a = document.querySelector(".hoverable-object")) === null || _a === void 0 ? void 0 : _a.getAttribute("id")) === null || _b === void 0 ? void 0 : _b.split("_-_")[0];
    var target = Boolean(e.detail) ? e.detail.taxName : e.target.getAttribute("id").split("_-_")[0];
    if ($("path[id^=\"".concat(target, "\"]"))[0]) {
        var id_1 = $("path[id^=\"".concat(target, "\"]"))[0].getAttribute("id");
        var shape = id_1;
        var label = id_1 + "-label";
        var hoverLabel = id_1 + "-hoverLabel";
        var labelBackground = id_1 + "-labelBackground";
        var rank = $("path[id^=\"".concat(target, "\"]"))[0].getAttribute("data-taxrank");
        document.getElementById(shape).style.strokeWidth = "0.4vmin";
        document.getElementById(hoverLabel).style.display = "unset";
        document.getElementById(label).style.display = "none";
        document.getElementById(labelBackground).style.display = "unset";
        document.getElementById("descendant-section").setAttribute('value', "".concat(shape.split("_-_")[0], "*").concat(shape.split("_-_")[1], "*").concat(newRoot));
        var evt = new CustomEvent('change');
        document.getElementById("descendant-section").dispatchEvent(evt);
        window.mouseOverTaxsun2External(shape.split("_-_")[0], rank);
    }
}
exports.hoverHandler = hoverHandler;
;
function onMouseOutHandler(id, initialLabelDisplay, e) {
    var target = Boolean(e.detail) ? e.detail.taxName : e.target.getAttribute("id").split("_-_")[0];
    if ($("path[id^=\"".concat(target, "\"]"))[0]) {
        var id_2 = $("path[id^=\"".concat(target, "\"]"))[0].getAttribute("id");
        var shape = id_2;
        var label = id_2 + "-label";
        var hoverLabel = id_2 + "-hoverLabel";
        var labelBackground = id_2 + "-labelBackground";
        var labelDisplay = $("path[id^=\"".concat(target, "\"]"))[0].getAttribute("label-display");
        var rank = $("path[id^=\"".concat(target, "\"]"))[0].getAttribute("data-taxrank");
        document.getElementById(shape).style.strokeWidth = "0.2vmin";
        document.getElementById(label).style.display = labelDisplay;
        document.getElementById(hoverLabel).style.display = "none";
        document.getElementById(labelBackground).style.display = "none";
        window.mouseOutTaxsun2External(shape.split("_-_")[0], rank);
    }
}
exports.onMouseOutHandler = onMouseOutHandler;
// Returns a set of arrays, where each array contains all elements that will be on the same level in the plot.
function getLayers(lineagesCopy, unique) {
    if (unique === void 0) { unique = false; }
    var longestLineageLength = Math.max.apply(Math, lineagesCopy.map(function (item) { return item.length; })); // get the length of the longest lineage, i.e. how many layers the plot will have
    var layers = [];
    for (var i = 0; i < longestLineageLength; i++) {
        var layer = [];
        for (var j = 0; j < lineagesCopy.length; j++) {
            layer.push(lineagesCopy[j][i]);
        }
        ;
        if (unique) {
            layer = layer.filter(function (value, index, self) { return Boolean(value) && self.indexOf(value) === index; });
        }
        ;
        layers.push(layer);
    }
    return layers;
}
exports.getLayers = getLayers;
function calculateArcEndpoints(layer, layerWidthInPx, deg1, deg2, cx, cy) {
    var radius = layer * layerWidthInPx;
    var x1 = round(radius * cos(deg1) + cx);
    var y1 = round(-radius * sin(deg1) + cy);
    var x2 = round(radius * cos(deg2) + cx);
    var y2 = round(-radius * sin(deg2) + cy);
    return { x1: x1, y1: y1, x2: x2, y2: y2, radius: round(radius) };
}
exports.calculateArcEndpoints = calculateArcEndpoints;
;
