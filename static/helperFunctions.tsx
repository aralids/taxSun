function createPalette(colorOffset:number = 7):string[] {
    let newColors:string[] = []
    for (let i=0; i<7; i++) {
        var r = Math.sin(0.3 * colorOffset + 4) * 55 + 200;
        var g = Math.sin(0.3 * colorOffset + 2) * 55 + 200;
        var b = Math.sin(0.3 * colorOffset) * 55 + 200;
        var newColor = `rgb(${round(r,0)}, ${round(g,0)}, ${round(b,0)})`;
        newColors.push(newColor);
        colorOffset += 3;
    }
    return newColors;
}

function round(number, decimal=3):number {
    return (Math.round(number * Math.pow(10, decimal)) / Math.pow(10, decimal));
}

function radians(degrees):number {
    degrees = 270 - degrees;
    var pi = Math.PI;
    return degrees * (pi/180);
}

function cos(number):number {
    return Math.cos(radians(number));
}

function sin(number):number {
    return Math.sin(radians(number));
}

function handleMouseMove(event):void {
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
            (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
            (doc && doc.clientTop  || body && body.clientTop  || 0 );
    }
    
    console.log("cursorX, cursorY: ", event.pageX, event.pageY);
}

function hexToRGB(hex):string {
    var aRgbHex = hex.match(/.{1,2}/g);
    var aRgb = [
        parseInt(aRgbHex[0], 16),
        parseInt(aRgbHex[1], 16),
        parseInt(aRgbHex[2], 16)
    ];
    return `rgb(${aRgb[0]}, ${aRgb[1]}, ${aRgb[2]})`;
}

function midColor(rgb1:string, rgb2:string, coef:number):string {
    var coef = coef / 2;
    var rgb1List:number[] = rgb1.match(/\d+/g)?.map(item => parseInt(item)) ?? [];
    var rgb2List:number[] = rgb2.match(/\d+/g)?.map(item => parseInt(item)) ?? [];
    var newRgb:number[] = [];
    for (let i = 0; i < 3; i++) {
        var newNum = rgb1List[i] < rgb2List[i] ? rgb1List[i] + (coef * (rgb2List[i] - rgb1List[i])) : rgb1List[i] - (coef * (rgb1List[i] - rgb2List[i]));
        newRgb.push(Math.round(newNum));
    }
    return `rgb(${newRgb[0]}, ${newRgb[1]}, ${newRgb[2]})`;
}

function tintify(rgb:string, tintFactor:number):string {
    var rgbList:number[] = rgb.match(/\d+/g)?.map(item => parseInt(item)) ?? [];
    var newRgb:number[] = [];
    for (let i = 0; i < 3; i++) {
        var newNum = rgbList[i] + ((255 - rgbList[i]) * tintFactor);
        newRgb.push(Math.round(newNum));
    }
    return `rgb(${newRgb[0]}, ${newRgb[1]}, ${newRgb[2]})`;
}

function lineIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
    var ua, ub, denom = (y4 - y3)*(x2 - x1) - (x4 - x3)*(y2 - y1);
    if (denom == 0) {
        return null;
    }
    ua = ((x4 - x3)*(y1 - y3) - (y4 - y3)*(x1 - x3))/denom;
    ub = ((x2 - x1)*(y1 - y3) - (y2 - y1)*(x1 - x3))/denom;
    
    return {
        x: x1 + ua * (x2 - x1),
        y: y1 + ua * (y2 - y1)
    };
}

function lineLength(x1, y1,x2, y2) {
    return Math.sqrt(Math.pow(x2-x1,2) + Math.pow(y2-y1,2));
}

function getFourCorners(top:number, bottom:number, left:number, right:number, cx:number, cy:number, angle:number):object {
    if (!angle && navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
        angle = 0;
    }
    var topLeft:number[] = [((left-cx)*Math.cos(angle* (Math.PI/180)) - (top-cy)*Math.sin(angle* (Math.PI/180))) + cx, ((left-cx)*Math.sin(angle* (Math.PI/180)) + (top-cy)*Math.cos(angle* (Math.PI/180))) + cy];
    var topRight:number[] = [((right-cx)*Math.cos(angle* (Math.PI/180)) - (top-cy)*Math.sin(angle* (Math.PI/180))) + cx, ((right-cx)*Math.sin(angle* (Math.PI/180)) + (top-cy)*Math.cos(angle* (Math.PI/180))) + cy];
    var bottomLeft:number[] = [((left-cx)*Math.cos(angle* (Math.PI/180)) - (bottom-cy)*Math.sin(angle* (Math.PI/180))) + cx, ((left-cx)*Math.sin(angle* (Math.PI/180)) + (bottom-cy)*Math.cos(angle* (Math.PI/180))) + cy];
    var bottomRight:number[] = [((right-cx)*Math.cos(angle* (Math.PI/180)) - (bottom-cy)*Math.sin(angle* (Math.PI/180))) + cx, ((right-cx)*Math.sin(angle* (Math.PI/180)) + (bottom-cy)*Math.cos(angle* (Math.PI/180))) + cy];
    return {topLeft: topLeft, topRight: topRight, bottomLeft: bottomLeft, bottomRight: bottomRight};
}

function getViewportDimensions():object {
    var dpmm:number = document.getElementById('dpmm')!.offsetWidth; // returns the div's width in px, thereby telling us how many px equal 1mm for our particular screen
    var cx:number = window.innerWidth / 2;
    var cy:number = window.innerHeight / 2;
    var twoVMin:number = window.innerHeight < window.innerWidth ? window.innerHeight / 50 : window.innerWidth / 50;
    return {
        "cx": cx,
        "cy": cy,
        "dpmm": dpmm,
        "2vmin": twoVMin
    }
}

function makeID(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

function enableEValue(median) {
    document.getElementById("e-input")!.removeAttribute("disabled");
    document.getElementById("e-label")!.style.color = "black";
    let eText:any = document.getElementById("e-text")!;
    eText.removeAttribute("disabled");
    eText.value = median;
}

function disableEValue() {
    document.getElementById("e-input")!.setAttribute("disabled", "disabled");
    document.getElementById("e-label")!.style.color = "grey";
    let eText:any = document.getElementById("e-text")!;
    eText.setAttribute("disabled", "disabled");
    eText.value = "";
}

function showContextMenu(e) {
    e.preventDefault();
    document.getElementById("context-menu")!.style.display = "block";
    positionContextMenu(e);
}

function hideContextMenu() {
    document.getElementById("context-menu")!.style.display = "none";
}

// Get the position of the right click in window and returns the X and Y coordinates
function getClickCoords(e) {
  var posx = 0;
  var posy = 0;

  if (!e) { var e:any = window.event; };

  if (e.pageX || e.pageY) {
    posx = e.pageX;
    posy = e.pageY;
  } 
  else if (e.clientX || e.clientY) {
    posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  };

  return { x: posx, y: posy };
}

// Position the Context Menu in right position.
function positionContextMenu(e) {
    let menu:any = document.getElementById("context-menu")!;
    let clickCoords = getClickCoords(e);
    let clickCoordsX = clickCoords.x;
    let clickCoordsY = clickCoords.y;

    let menuWidth = menu.offsetWidth;
    let menuHeight = menu.offsetHeight;
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;

    if (windowWidth - clickCoordsX < menuWidth) {
        menu.style.left = windowWidth - menuWidth + "px";
    } else {
        menu.style.left = clickCoordsX + "px";
    }

    if (windowHeight - clickCoordsY < menuHeight) {
        menu.style.top = windowHeight - menuHeight + "px";
    } else {
        menu.style.top = clickCoordsY - menuHeight + "px";
    }

    menu.setAttribute("taxon", e.target["id"]);
}

function findRealName(index, namesArray, name) {
    if (namesArray.length === 0) {
        return name;
    }
    for (let i=namesArray.length-2; i>=0; i--) {
        if (index > namesArray[i][1]) {
            return namesArray[i+1][0];
        }
    }
    return namesArray[0][0];
}

function downloadSVGasTextFile(fileName, taxonName, layerName, modeName, collapseName) {
    const base64doc = btoa(unescape(encodeURIComponent(document.querySelector('svg')!.outerHTML)));
    const a = document.createElement('a');
    const e = new MouseEvent('click');
  
    a.download = `${fileName}_${taxonName}${layerName}_${modeName}_${collapseName}.svg`;
    a.href = 'data:text/html;base64,' + base64doc;
    a.dispatchEvent(e);
}

function hoverHandler(id:string, fullLabel:string, root:string):void {
    if (id.indexOf("-labelBackground") > -1) {
        var hoverLabel = id.replace("-labelBackground", "-hoverLabel");
        var shape = id.replace("-labelBackground", "");
        var label = id.replace("-labelBackground", "-label");
        var labelBackground = id;
    } else if (id.indexOf("-hoverLabel") > -1) {
        var hoverLabel = id;
        var shape = id.replace("-hoverLabel", "");
        var label = id.replace("-hoverLabel", "-label");
        var labelBackground = id.replace("-hoverLabel", "-labelBackground");
    }
    else if (id.indexOf("-label") > -1) {
        var label = id;
        var shape = id.replace("-label", "");
        var hoverLabel = id.replace("-label", "-hoverLabel");
        var labelBackground = id.replace("-label", "-labelBackground");
    } else {
        var shape = id;
        var label = id + "-label";
        var hoverLabel = id + "-hoverLabel";
        var labelBackground = id + "-labelBackground";
    }

    document.getElementById(shape)!.style.strokeWidth = "0.4vmin";
    document.getElementById(hoverLabel)!.style.display = "unset";
    document.getElementById(label)!.style.display = "none";
    document.getElementById(labelBackground)!.style.display = "unset";
    document.getElementById("descendant-section")!.setAttribute('value', `${shape.split("_-_")[0]}*${shape.split("_-_")[1]}*${root}`);
    var evt = new CustomEvent('change');
    document.getElementById("descendant-section")!.dispatchEvent(evt);
}

function onMouseOutHandler(id:string, initialLabelDisplay:string):void {
    if (id.indexOf("-labelBackground") > -1) {
        var hoverLabel = id.replace("-labelBackground", "-hoverLabel");
        var shape = id.replace("-labelBackground", "");
        var label = id.replace("-labelBackground", "-label");
        var labelBackground = id;
    } else if (id.indexOf("-hoverLabel") > -1) {
        var hoverLabel = id;
        var shape = id.replace("-hoverLabel", "");
        var label = id.replace("-hoverLabel", "-label");
        var labelBackground = id.replace("-hoverLabel", "-labelBackground");
    }
    else if (id.indexOf("-label") > -1) {
        var label = id;
        var shape = id.replace("-label", "");
        var hoverLabel = id.replace("-label", "-hoverLabel");
        var labelBackground = id.replace("-label", "-labelBackground");
    } else {
        var shape = id;
        var label = id + "-label";
        var hoverLabel = id + "-hoverLabel";
        var labelBackground = id + "-labelBackground";
    }

    document.getElementById(shape)!.style.strokeWidth = "0.2vmin";
    document.getElementById(label)!.style.display = initialLabelDisplay;
    document.getElementById(hoverLabel)!.style.display = "none";
    document.getElementById(labelBackground)!.style.display = "none";
}


// Returns a set of arrays, where each array contains all elements that will be on the same level in the plot.
function getLayers(lineagesCopy:string[][], unique:boolean=false):string[][] {
    var longestLineageLength:number = Math.max(...lineagesCopy.map(item => item.length)); // get the length of the longest lineage, i.e. how many layers the plot will have
    var layers:string[][] = [];
    for (let i=0; i<longestLineageLength; i++) {
        var layer:string[] = [];
        for (let j=0; j<lineagesCopy.length; j++) {
            layer.push(lineagesCopy[j][i]);
        }
        if (unique) { 
            layer = layer.filter((value, index, self) => Boolean(value) && self.indexOf(value) === index);
        }
        layers.push(layer);
    }
    return layers;
}

export {createPalette, radians, round, sin, cos, handleMouseMove, hexToRGB, midColor, tintify, lineIntersect, lineLength, getFourCorners, getViewportDimensions, makeID, enableEValue, disableEValue, showContextMenu, hideContextMenu, findRealName, downloadSVGasTextFile, hoverHandler, onMouseOutHandler, getLayers};