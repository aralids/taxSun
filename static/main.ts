import * as React from "react";
import * as ReactDOM from "react-dom";
var path = "C:/Users/PC/Desktop/krona/krona.tsv"
var allTaxa:object;
var taxonList:Taxon[] = [];
var lineagesNamesOnlyArray:string[][] = [];

loadDataFromTSV(path);
$(document).ajaxStop(function() {
    var taxName:string;
    for (taxName of Object.keys(allTaxa)) {
        var newTaxon:Taxon = new Taxon(taxName);
        taxonList.push(newTaxon);
        lineagesNamesOnlyArray.push(newTaxon.lineage.map(item => item[1]));
    }
    lineagesNamesOnlyArray.sort();
    console.log("taxNames: ", lineagesNamesOnlyArray);
    // var fullPlot:Plot = new Plot();
    // var partialPlot:Plot = new Plot("Bacteria", 0);
    var screenDimensionsinMM = getScreenDimensionsInMM();
    var mycosphaerellalesPlot:Plot = new Plot("Mycosphaerellales", 8, true, screenDimensionsinMM);
    console.log("screenDimensions: ", screenDimensionsinMM["cx"]);
})

function loadDataFromTSV(tsv_path) {
    $.ajax({
        type: "GET",
        url: "/load_tsv_data",
        data: {"tsv_path": tsv_path},
        success: function (response) {
            allTaxa = response["taxDict"];
            console.log("SUCCESS: ", allTaxa)
        },
        error: function (response) {
            console.log("ERROR", response);
        }
    });
}

// 1 extra Talaromyces sect. Talaromyces

class Taxon {
    name:string;
    taxID:string;
    rank:string;
    lineage:string[][];
    unassignedCount:number;
    totalCount:number;

    constructor (name:string) {
        this.name = name;
        this.getData();
    }

    getData():void {
        this.taxID = allTaxa[this.name].taxID;
        this.rank = allTaxa[this.name].rank;
        this.lineage = allTaxa[this.name].lineageNames;
        this.totalCount = allTaxa[this.name].totalCount;
        this.unassignedCount = allTaxa[this.name].unassignedCount;
    }
}

class Plot {
    root:string;
    layer:number;
    screenDimensions:object;
    lineages:string[][];
    structure:object = {};
    svgPaths:object = {};

    constructor (root:string = "", layer:number = -1, collapse:boolean = true, screenDimensionsInMM:object = {}) {
        this.root = root;
        this.layer = layer;
        this.screenDimensions = screenDimensionsInMM;
        this.getOnlyNecessaryLineages();
        if (collapse) {
            this.collapse();
        }
        console.log("this.screenDimensions: ", this.screenDimensions);
        console.log("this.lineages: ", this.lineages);
        this.assignDegrees();
        console.log("this.structure: ", this.structure);
        this.calculateSVGPaths();
        console.log("this.svgPaths: ", this.svgPaths);
    }

    getOnlyNecessaryLineages():void {
        if (this.root === "" && this.layer === -1) {
            this.lineages = lineagesNamesOnlyArray;
            this.lineages = JSON.parse(JSON.stringify(this.lineages));
            this.lineages.map(item => item.indexOf("root") > -1 ? item : item.unshift("root"));
        } else {
            this.lineages = lineagesNamesOnlyArray.filter(item => item[this.layer] === this.root);
            this.lineages = this.lineages.map(item => item.slice(this.layer));
        }
    }

    assignDegrees():void {
        var lineageCounts:number[] = this.lineages.map(item => allTaxa[item[item.length - 1]]["unassignedCount"]);
        var lineageCountsSum:number = lineageCounts.reduce((accumulator, current) => {return accumulator + current;}, 0);
        var sectionStart:number = 0;
        var sectionEnd:number;
        var key:string;
        for (var i=0; i<this.lineages.length; i++) {
            sectionEnd = sectionStart + lineageCounts[i]*360 / lineageCountsSum;
            key = `${sectionStart}-${sectionEnd} deg`
            this.structure[key] = this.lineages[i];
            sectionStart = sectionEnd;
        }
    }

    collapse():void {
        var lineagesCopy:string[][] = JSON.parse(JSON.stringify(this.lineages));
        var layers = this.getLayers(lineagesCopy);

        for (let i=0; i<layers.length-1; i++) {
            for (let j=0; j<layers[i].length; j++) {
                if (layers[i].filter(item => item === layers[i][j]).length === 1 && Boolean(layers[i+1][j])) {
                    lineagesCopy[j].splice(i,1, "toBeDeleted");
                }
            }
        }

        for (let i=0; i<lineagesCopy.length; i++) {
            lineagesCopy[i] = lineagesCopy[i].filter(item => item !== "toBeDeleted");
        }

        this.lineages = lineagesCopy;
    }

    calculateSVGPaths(cx:number=this.screenDimensions["cx"], cy:number=this.screenDimensions["cy"]):void {
        var layerWidthMM:number = 10;
        var structureByTaxon:object = {};
        var lineagesCopy:string[][] = JSON.parse(JSON.stringify(this.lineages));
        var layers = this.getLayers(lineagesCopy);
        var layersUnique = this.getLayers(lineagesCopy, true);

        for (let i=1; i<layersUnique.length; i++) {
            for (let j=0; j<layersUnique[i].length; j++) {
                var key:string = layersUnique[i][j];
                var firstOccurrenceInLayer:number = layers[i].indexOf(key);
                var lastOccurrenceInLayer:number = layers[i].lastIndexOf(key);
                var structureSectionsArray:string[] = Object.keys(this.structure);
                var startDegrees:number = Number(structureSectionsArray[firstOccurrenceInLayer].slice(0,structureSectionsArray[firstOccurrenceInLayer].length-4).split("-")[0]);
                var potentialMidDegrees:number = Number(structureSectionsArray[firstOccurrenceInLayer].slice(0,structureSectionsArray[firstOccurrenceInLayer].length-4).split("-")[1]);
                var endDegrees:number = Number(structureSectionsArray[lastOccurrenceInLayer].slice(0,structureSectionsArray[lastOccurrenceInLayer].length-4).split("-")[1]);
                var verticalMin:number = i;
                var verticalMax:number;
                if (i != layersUnique.length-1) {
                        if (!Boolean(layers[i+1][firstOccurrenceInLayer])) {
                            verticalMax = layers.length;
                        } else {
                            verticalMax = i+1;
                        }
                } else {
                    verticalMax = i+1;
                }
                
                var breakingPoint:any = verticalMax === verticalMin + 1 || potentialMidDegrees === endDegrees ? null : potentialMidDegrees;
                structureByTaxon[key] = {
                    "horizontalWidthInDeg": [startDegrees, endDegrees],
                    "verticalWidthInLayerIndices": [verticalMin, verticalMax],
                    "breakingPoint": breakingPoint
                }; 
            }
        }


        var svgPaths:object = {};
        for (var key of Object.keys(structureByTaxon)) {
            var innerArcX1:number = structureByTaxon[key].verticalWidthInLayerIndices[0] * layerWidthMM * Math.cos(radians(structureByTaxon[key].horizontalWidthInDeg[0]));
            innerArcX1 = (Math.round(innerArcX1 * 1000) / 1000) + cx;
            var innerArcY1:number = - structureByTaxon[key].verticalWidthInLayerIndices[0] * layerWidthMM * Math.sin(radians(structureByTaxon[key].horizontalWidthInDeg[0]));
            innerArcY1 = (Math.round(innerArcY1 * 1000) / 1000) + cy;
            var innerArcX2:number = structureByTaxon[key].verticalWidthInLayerIndices[0] * layerWidthMM * Math.cos(radians(structureByTaxon[key].horizontalWidthInDeg[1]));
            innerArcX2 = (Math.round(innerArcX2 * 1000) / 1000) + cx;
            var innerArcY2:number = - structureByTaxon[key].verticalWidthInLayerIndices[0] * layerWidthMM * Math.sin(radians(structureByTaxon[key].horizontalWidthInDeg[1]));
            innerArcY2 = (Math.round(innerArcY2 * 1000) / 1000) + cy;
            var innerArc:string = `M ${innerArcX1},${innerArcY1} A ${structureByTaxon[key].verticalWidthInLayerIndices[0]*layerWidthMM},${structureByTaxon[key].verticalWidthInLayerIndices[0]*layerWidthMM} 0 0 1 ${innerArcX2},${innerArcY2}`;

            var allMs:string[] = [innerArc];

            if (Boolean(structureByTaxon[key].breakingPoint)) {
                var outerArcX1:number = structureByTaxon[key].verticalWidthInLayerIndices[1] * layerWidthMM * Math.cos(radians(structureByTaxon[key].horizontalWidthInDeg[0]));
                outerArcX1 = (Math.round(outerArcX1 * 1000) / 1000) + cx;
                var outerArcY1:number = - structureByTaxon[key].verticalWidthInLayerIndices[1] * layerWidthMM * Math.sin(radians(structureByTaxon[key].horizontalWidthInDeg[0]));
                outerArcY1 = (Math.round(outerArcY1 * 1000) / 1000) + cy;
                var outerArcX2:number = structureByTaxon[key].verticalWidthInLayerIndices[1] * layerWidthMM * Math.cos(radians(structureByTaxon[key].breakingPoint));
                outerArcX2 = (Math.round(outerArcX2 * 1000) / 1000) + cx;
                var outerArcY2:number = - structureByTaxon[key].verticalWidthInLayerIndices[1] * layerWidthMM * Math.sin(radians(structureByTaxon[key].breakingPoint));
                outerArcY2 = (Math.round(outerArcY2 * 1000) / 1000) + cy;
                var outerArc:string = `M ${outerArcX1},${outerArcY1} A ${structureByTaxon[key].verticalWidthInLayerIndices[1]*layerWidthMM},${structureByTaxon[key].verticalWidthInLayerIndices[1]*layerWidthMM} 0 0 1 ${outerArcX2},${outerArcY2}`;

                allMs.push(outerArc);

                var midArcX1:number = (structureByTaxon[key].verticalWidthInLayerIndices[0]+1) * layerWidthMM * Math.cos(radians(structureByTaxon[key].breakingPoint));
                midArcX1 = (Math.round(midArcX1 * 1000) / 1000) + cx;
                var midArcY1:number = - (structureByTaxon[key].verticalWidthInLayerIndices[0]+1) * layerWidthMM * Math.sin(radians(structureByTaxon[key].breakingPoint));
                midArcY1 = (Math.round(midArcY1 * 1000) / 1000) + cy;
                var midArcX2:number = (structureByTaxon[key].verticalWidthInLayerIndices[0]+1) * layerWidthMM * Math.cos(radians(structureByTaxon[key].horizontalWidthInDeg[1]));
                midArcX2 = (Math.round(midArcX2 * 1000) / 1000) + cx;
                var midArcY2:number = - (structureByTaxon[key].verticalWidthInLayerIndices[0]+1) * layerWidthMM * Math.sin(radians(structureByTaxon[key].horizontalWidthInDeg[1]));
                midArcY2 = (Math.round(midArcY2 * 1000) / 1000) + cy;
                var midArc:string = `M ${midArcX1},${midArcY1} A ${(structureByTaxon[key].verticalWidthInLayerIndices[0]+1)*layerWidthMM},${(structureByTaxon[key].verticalWidthInLayerIndices[0]+1)*layerWidthMM} 0 0 1 ${midArcX2},${midArcY2}`;

                allMs.push(midArc);

                var lineOuterToMid = `M ${outerArcX2},${outerArcY2} ${midArcX1},${midArcY1}`

                allMs.push(lineOuterToMid);

                var lineMidToInner = `M ${midArcX2},${midArcY2} ${innerArcX2},${innerArcY2}`

                allMs.push(lineMidToInner);
            } else {
                var outerArcX1:number = structureByTaxon[key].verticalWidthInLayerIndices[1] * layerWidthMM * Math.cos(radians(structureByTaxon[key].horizontalWidthInDeg[0]));
                outerArcX1 = (Math.round(outerArcX1 * 1000) / 1000) + cx;
                var outerArcY1:number = - structureByTaxon[key].verticalWidthInLayerIndices[1] * layerWidthMM * Math.sin(radians(structureByTaxon[key].horizontalWidthInDeg[0]));
                outerArcY1 = (Math.round(outerArcY1 * 1000) / 1000) + cy;
                var outerArcX2:number = structureByTaxon[key].verticalWidthInLayerIndices[1] * layerWidthMM * Math.cos(radians(structureByTaxon[key].horizontalWidthInDeg[1]));
                outerArcX2 = (Math.round(outerArcX2 * 1000) / 1000) + cx;
                var outerArcY2:number = - structureByTaxon[key].verticalWidthInLayerIndices[1] * layerWidthMM * Math.sin(radians(structureByTaxon[key].horizontalWidthInDeg[1]));
                outerArcY2 = (Math.round(outerArcY2 * 1000) / 1000) + cy;
                var outerArc:string = `M ${outerArcX1},${outerArcY1} A ${structureByTaxon[key].verticalWidthInLayerIndices[1]*layerWidthMM},${structureByTaxon[key].verticalWidthInLayerIndices[1]*layerWidthMM} 0 0 1 ${outerArcX2},${outerArcY2}`;

                var lineOuterToInner = `M ${outerArcX2},${outerArcY2} ${innerArcX2},${innerArcY2}`
                allMs.push(outerArc);
                allMs.push(lineOuterToInner);
            }

            var lineInnertoOuter = `M ${innerArcX1},${innerArcY1} ${outerArcX1},${outerArcY1}`
            allMs.push(lineInnertoOuter);

            var d:string = allMs.join(" ");
            
            this.svgPaths[key] = d;
        }


    }

    



    draw():void {
        // remove GoL;


    }

    getLayers(lineagesCopy:string[][], unique:boolean=false):string[][] {
        var longestLineageLength:number = Math.max(...lineagesCopy.map(item => item.length));
        var layers:string[][] = [];
        for (let i=0; i<longestLineageLength; i++) {
            var layer:string[] = [];
            for (let j=0; j<lineagesCopy.length; j++) {
                layer.push(this.lineages[j][i]);
            }
            if (unique) {
                layer = layer.filter((value, index, self) => Boolean(value) && self.indexOf(value) === index);
            }
            layers.push(layer);
        }
        return layers;
    }


}

function radians(degrees):number {
    degrees = 270 - degrees;
    var pi = Math.PI;
    return degrees * (pi/180);
}



function getScreenDimensionsInMM():object {
    var dpcm_x:any = document.getElementById('dpi')?.offsetWidth;
    var dpcm_y:any = document.getElementById('dpi')?.offsetHeight;
    var screenWidth:number = screen.width / dpcm_x * 10;
    var screenHeight:number = screen.height / dpcm_y * 10;
    var cx:number = screenWidth / 2;
    var cy:number = screenHeight / 2;
    return {
        "screenWidth": screenWidth,
        "screenHeight": screenHeight,
        "cx": cx,
        "cy": cy
    }
}