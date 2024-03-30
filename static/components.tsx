import * as React from "react";
import {ln, lr, atr, at} from "./predefinedObjects.js";
import {getViewportDimensions, handleMouseMove,
        createPalette, midColor, tintify,
        round, sin, cos,
        lineIntersect, lineLength, getFourCorners,
        enableEValue, disableEValue, showContextMenu, hideContextMenu, findRealName, downloadSVGasTextFile, 
        hoverHandler, onMouseOutHandler, getLayers, calculateArcEndpoints} from "./helperFunctions.js";



/* ===== VARIABLE DECLARATIONS/DEFINITIONS - all of which will ideally become either a prop or a part of the state of PlotDrawing. ===== */

let fileName = "lessSpontaneous2.tsv";
let taxonName = "Bacteria";
let layerName = 1;
let collapseName = "collapseFalse";
let modeName = "allEqual";

var skeletonColor:string = "#800080";
var viewportDimensions = getViewportDimensions();
var alreadyVisited:object = {};
var eThreshold:any = null;
let newDataLoaded:boolean = false;
var headerSeqObject:object = {};
let allTaxa:object = at;
let lineagesNames:string[][] = ln;
let lineagesRanks:string[][] = lr;
let allTaxaReduced:object = JSON.parse(JSON.stringify(atr));
let originalAllTaxaReduced:object = JSON.parse(JSON.stringify(atr));
let rankPatternFull:string[] = ["root","superkingdom","kingdom","subkingdom","superphylum","phylum","subphylum","superclass","class","subclass","superorder","order","suborder","superfamily","family","subfamily","supergenus","genus","subgenus","superspecies","species"];
let colorOffset;
let colors:string[] = createPalette();

let aTRKeys:string[] = Object.keys(allTaxaReduced);
let descendants:object = {};
for (let taxName of aTRKeys) {
    let lineage = allTaxaReduced[taxName]["lineageNames"];
    for (let predecessor of lineage) {
        if (!descendants[predecessor[1]]) { descendants[predecessor[1]] = [taxName]; }
        else { descendants[predecessor[1]].push(taxName); };
    };
};

/* ===== EVENT LISTENERS ===== */

document.addEventListener("click", () => { hideContextMenu(); });

/**
 * Get the gene identifiers that correspond to the right-clicked taxon shape, and copy them to clipboard.
 * @param  {boolean} copyAll Copy all sequences instead of just unspecified ones.
 * @return {void}         
 */
function copy2clipboard(copyAll:boolean = false):void {
    // Get the name of the clicked taxon.
    let name:string = document.getElementById("context-menu")!
                              .getAttribute("taxon")!
                              .split("_-_")[0];

    // Put the identifiers of all genes with appropriate e-value (if filtering was applied)
    // associated with the current taxon in the array seqIDsArray.
    let seqIDsArray:string[] = [];
    if (!allTaxaReduced[name]["successfulIndices"]) { seqIDsArray = allTaxaReduced[name]["geneNames"]; }
    else { seqIDsArray = allTaxaReduced[name]["successfulIndices"].map(item => allTaxaReduced[name]["geneNames"][item]); };

    // If all gene identifiers and not just the current taxon's own unspecified ones are required,
    // add the gene identifiers of the DESCENDANTS of the current taxon to seqIDsArray.
    // Again, only considering the ones with appropriate e-value.
    if (copyAll) {
        for (let child of allTaxaReduced[name]["descendants"]) {
            if (!allTaxaReduced[child]["successfulIndices"]) { seqIDsArray = seqIDsArray.concat(allTaxaReduced[child]["geneNames"]); }
            else { seqIDsArray = seqIDsArray.concat(allTaxaReduced[child]["successfulIndices"].map(item => allTaxaReduced[child]["geneNames"][item])); } 
        };
    };

    navigator.clipboard.writeText(seqIDsArray.join(" "));
};

document.getElementById("copy")!.addEventListener("click", () => {
    copy2clipboard();
});

document.getElementById("copy-all")!.addEventListener("click", () => {
    copy2clipboard(true);
});

document.getElementById("download-seq")!.addEventListener("click", () => {
    let name:string = document.getElementById("context-menu")!.getAttribute("taxon")!.split("_-_")[0];
    let seqIDsArray:string[] = [];
    if (!allTaxaReduced[name]["successfulIndices"]) {
        seqIDsArray = allTaxaReduced[name]["fastaHeaders"].map((item, index) => [item, allTaxaReduced[name]["eValues"][index], name, findRealName(index, allTaxaReduced[name]["names"], name)]);
    }
    else {
        seqIDsArray = allTaxaReduced[name]["successfulIndices"].map(item => [allTaxaReduced[name]["fastaHeaders"][item], allTaxaReduced[name]["eValues"][item], name, findRealName(item, allTaxaReduced[name]["names"], name)]);
    };
    let seqsArray = seqIDsArray.map(item => {
        if (!headerSeqObject[item[0]]) { console.log("missing item: ", item); }
        else {
            let thirdElement:string = item[2] === item[3] ? item[2] : `${item[2]} (${item[3]})`;
            return `*** ${item[0]} ${item[1]} ${thirdElement}\n${headerSeqObject[item[0]]}\n`;
        };
    });

    let eInput:any = document.getElementById("e-input")!;
    let firstLines:string;
    if (eInput.checked) { firstLines = `${name} | ${allTaxaReduced[name]["rank"]} | filtered by e-value: ${eThreshold}\n\n`; }
    else { firstLines = `${name} | ${allTaxaReduced[name]["rank"]} | filtered by e-value: no\n\n`; };

    seqsArray = [firstLines, ...seqsArray];
    let seqsFile = seqsArray.join("\n");
    const a = document.createElement('a');
    const e = new MouseEvent('click');
  
    a.download = `test.tsv`;
    a.href = 'data:text/tab-separated-values,' + encodeURIComponent(seqsFile);
    a.dispatchEvent(e);
});

document.getElementById("download-all-seq")!.addEventListener("click", () => {
    let name:string = document.getElementById("context-menu")!.getAttribute("taxon")!.split("_-_")[0];
    let seqIDsArray:string[] = [];
    if (!allTaxaReduced[name]["successfulIndices"]) {
        seqIDsArray = allTaxaReduced[name]["fastaHeaders"].map((item, index) => [item, allTaxaReduced[name]["eValues"][index], name, findRealName(index, allTaxaReduced[name]["names"], name)]);
    }
    else {
        seqIDsArray = allTaxaReduced[name]["successfulIndices"].map(item => [allTaxaReduced[name]["fastaHeaders"][item], allTaxaReduced[name]["eValues"][item], name, findRealName(item, allTaxaReduced[name]["names"], name)]);
    }

    for (let child of allTaxaReduced[name]["descendants"]) {
        if (!allTaxaReduced[child]["successfulIndices"]) {
            seqIDsArray = seqIDsArray.concat(allTaxaReduced[child]["fastaHeaders"].map((item, index) => [item, allTaxaReduced[child]["eValues"][index], child, findRealName(index, allTaxaReduced[child]["names"], child)]));
        }
        else {
            seqIDsArray = seqIDsArray.concat(allTaxaReduced[child]["successfulIndices"].map(item => [allTaxaReduced[child]["fastaHeaders"][item], allTaxaReduced[child]["eValues"][item], child, findRealName(item, allTaxaReduced[child]["names"], child)]));
        }
    }

    let seqsArray = seqIDsArray.map(item => {
        if (!headerSeqObject[item[0]]) { console.log("missing item: ", item); }
        else {
            let thirdElement:string = item[2] === item[3] ? item[2] : `${item[2]} (${item[3]})`;
            return `*** ${item[0]} ${item[1]} ${thirdElement}\n${headerSeqObject[item[0]]}\n`;
        };
    });

    let eInput:any = document.getElementById("e-input")!;
    let firstLines:string;
    if (eInput.checked) { firstLines = `${name} | ${allTaxaReduced[name]["rank"]} | filtered by e-value: ${eThreshold}\n\n`; }
    else { firstLines = `${name} | ${allTaxaReduced[name]["rank"]} | filtered by e-value: no\n\n`; };

    seqsArray = [firstLines, ...seqsArray];

    let seqsFile = seqsArray.join("\n");
    const a = document.createElement('a');
    const e = new MouseEvent('click');
  
    a.download = `test.tsv`;
    a.href = 'data:text/tab-separated-values,' + encodeURIComponent(seqsFile);
    a.dispatchEvent(e);
});

document.getElementById("file")?.addEventListener("change", () => {
    let fileInput:any = document.getElementById("file")!
    fileName = fileInput.files[0].name;
    document.getElementById("status")!.innerHTML = "pending";
    let uploadForm:any = document.getElementById("uploadForm")!
    let form_data = new FormData(uploadForm);
    $.ajax({
        url: '/load_tsv_data',
        data: form_data,
        type: 'POST',
        processData: false,
        contentType: false,
        success: function(response) {
            lineagesNames = response["lineagesNames"];
            lineagesRanks = response["lineagesRanks"];
            allTaxaReduced = JSON.parse(JSON.stringify(response["allTaxaReduced"]));
            console.log("allTaxaReduced: ", allTaxaReduced);
            originalAllTaxaReduced = JSON.parse(JSON.stringify(response["allTaxaReduced"]));
            rankPatternFull = response["rankPatternFull"];
            allTaxa = response["allTaxa"];
            colorOffset = response["offset"];
            eThreshold = response["median"];
            let enableFastaUpload:boolean = response["fastaHeaderIncluded"];

            if (eThreshold) { enableEValue(eThreshold); }
            else { disableEValue(); };

            if (enableFastaUpload) { document.getElementById("fasta-file")!.removeAttribute("disabled") }
            else {
                disableEValue();
                document.getElementById("fasta-file")!.setAttribute("disabled", "disabled");
                document.getElementById("status")!.innerHTML = "";
            };

            let newData:any = document.getElementById("new-data")!
            newData.checked = true;
            document.getElementById("status")!.innerHTML = "check";
            var evt = new CustomEvent('change');
            newData.dispatchEvent(evt);
            newDataLoaded = true;
        },
        error: function (response) {
            console.log("ERROR", response);
            document.getElementById("status")!.innerHTML = "close";
        }
    });
});

document.getElementById("fasta-file")?.addEventListener("change", () => {
    let fileInput:any = document.getElementById("fasta-file")!;
    fileName = fileInput.files[0].name;
    document.getElementById("fasta-status")!.innerHTML = "pending";
    let uploadForm:any = document.getElementById("uploadForm")!;
    let form_data = new FormData(uploadForm);
    $.ajax({
        url: '/load_fasta_data',
        data: form_data,
        type: 'POST',
        processData: false,
        contentType: false,
        success: function(response) {
            document.getElementById("fasta-status")!.innerHTML = "check";
            headerSeqObject = response["headerSeqObject"];
        },
        error: function (response) {
            console.log("ERROR", response);
            document.getElementById("fasta-status")!.innerHTML = "close";
        }
    });
});
  
document.getElementById("download")!.addEventListener("click", () => {
    downloadSVGasTextFile(fileName, taxonName, layerName, modeName, collapseName);
});

document.addEventListener("mousemove", (e) => {
    let target:any = e.target!;
    if (!target.classList.contains("hoverable-object") && !target.classList.contains("taxsun-interactee")) {
        document.getElementById("descendant-section")!.setAttribute('value', "");
        var evt = new CustomEvent('change');
        document.getElementById("descendant-section")!.dispatchEvent(evt);
    };
});

/* ===== DEFINITIONS OF THE REACT COMPONENTS: AncestorSection, DescendantSection, PlotDrawing ===== */

class AncestorSection extends React.Component<{ancestors:string[], root:string, layer:number, onClickArray:any, plotEValue:boolean, ancestorRanks:string[]}, {root:string, layer:number, rank:string, totalCount:number, unassignedCount:number, lines:string[], plotEValue:boolean, eThresholdHere:any}> {
    constructor(props) {
        super(props);
        this.state = {
            root: "",
            layer: -1,
            rank: "",
            totalCount: 0,
            unassignedCount: 0,
            lines: [],
            plotEValue: false,
            eThresholdHere: eThreshold
        };
    };

    componentDidUpdate() {
        if ((this.props.root !== this.state.root) || 
            (this.props.plotEValue !== this.state.plotEValue) || 
            (eThreshold !== this.state.eThresholdHere) || 
            newDataLoaded) {

            newDataLoaded = false;
            this.getCounts();
        };
    };

    changeDiv(taxName) {
        $.ajax({
            url: '/fetchID',
            data: {"taxName": taxName.replace(RegExp(rankPatternFull.map(item => " " + item).join("|"), "g"),"")},
            type: 'GET',
            success: function(response) {
                let taxID = response["taxID"];
                if (!allTaxaReduced[taxName]) {
                    allTaxaReduced[taxName] = {};
                }
                allTaxaReduced[taxName]["taxID"] = taxID;
                originalAllTaxaReduced[taxName]["taxID"] = taxID;
                },
            error: function (response) {
                console.log("ERROR", response);
                document.getElementById("status")!.innerHTML = "close";
            }
        }).then( 
            () => { this.setState(this.state); }
        );
    };

    getCounts() {
        let totalCount:number = 0;
        let unassignedCount:number = 0;
        let rank:string = "";
        if (this.props.root.indexOf("&") > -1) {
            let groupedTaxa:string[] = this.props.root.split(" & ");
            for (let taxon of groupedTaxa) {
                totalCount += allTaxaReduced[taxon]["totalCount"];
            };
            unassignedCount = 0;
            rank = allTaxaReduced[groupedTaxa[0]]["rank"];
        }
        else {
            totalCount = allTaxaReduced[this.props.root]["totalCount"];
            unassignedCount = allTaxaReduced[this.props.root]["unassignedCount"];
            rank = allTaxaReduced[this.props.root]["rank"];
        };

        let lines:string[] = this.props.ancestors.map(item => 
            (`${round(totalCount * 100 / allTaxaReduced[item]["totalCount"], 2)}%`));

        this.setState({ totalCount: totalCount, 
                        unassignedCount: unassignedCount, 
                        root: this.props.root, 
                        layer: this.props.layer, 
                        lines: lines, 
                        rank: rank, 
                        plotEValue: this.props.plotEValue, 
                        eThresholdHere: eThreshold });
    };

    render() {
        let rootNameNoRank = this.state.root.replace(RegExp(rankPatternFull.map(item => " " + item).join("|"), "g"),"");
        
        let firstLine:any = <legend key={"legend"} style={{"color": "#800080", "fontWeight": "bold"}}>
                                CURRENT LAYER
                            </legend>;

        let nameLine:any = <p key={"nameLine"} className="mp-zero">
                                Taxon: <b>{rootNameNoRank}</b>
                           </p>;

        let rankLine:any = <p key={"rankLine"} className="mp-zero">
                                Rank: <b>{this.state.rank}</b>
                           </p>;

        let totalCountLine:any = <p key={"totalCountLine"} className="mp-zero">
                                    Total count: <b>{this.state.totalCount}</b>
                                 </p>;

        let unassignedCountLine:any = <p key={"unassignedCountLine"} className="mp-zero">
                                            Unspecified {rootNameNoRank}: <b>{this.state.unassignedCount}</b>
                                      </p>;
        
        let beforePreprocessing:number = allTaxa[this.state.root] ? allTaxa[this.state.root]["unassignedCount"] : 0;
        let bPLine:any = <p key={"bPLine"} className="mp-zero">
                            (raw file: <b>{beforePreprocessing}</b>)
                         </p>;
        
        let id:string = allTaxaReduced[this.state.root] ? allTaxaReduced[this.state.root]["taxID"] : "1";
        let taxIDline:any;
        if (id) {
            taxIDline = <div key={"taxIDline"} id="taxID-div" className="mp-zero-pb-not">
                    	    <p className="mp-zero">
                                taxID: <a style={{"display": "inline"}} target="_blank" href={`https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=${id}&lvl=3&lin=f&keep=1&srchmode=1&unlock`}>
                                            {id}
                                       </a>
                            </p>
                        </div>;
        }
        else {
            taxIDline = <div key={"taxIDline"} id="taxID-div" className="mp-zero-pb-not">
                            <p className="mp-zero">
                                taxID: <button onClick={() => this.changeDiv(this.state.root)}  id="fetch-id-button">
                                                FETCH
                                       </button>
                            </p>
                        </div>
        };
        
        let ps:any = [firstLine, nameLine, rankLine, totalCountLine, unassignedCountLine, bPLine, taxIDline];

        if (this.props.root.indexOf("&") > -1) {
            bPLine = <p key={"bPLine"} className="mp-zero-pb-not">
                        (raw file: <b>{beforePreprocessing}</b>)
                     </p>;

            ps = [firstLine, nameLine, rankLine, totalCountLine, unassignedCountLine, bPLine];
        }
        else if (this.props.root === "root") { ps.pop(); };

        for (let i=0; i<this.props.ancestors.length; i++) {
            let ancNameNoRank = this.props.ancestors[i].replace(RegExp(rankPatternFull.map(item => " " + item).join("|"), "g"),"");
            ps.push(<p key={`ps-${i}`} 
                       data-taxname={ancNameNoRank}
                       data-taxrank={this.props.ancestorRanks[i]}
                       className="mp-zero"
                       style={{"cursor": "pointer", "wordBreak": "break-all"}} 
                       onClick={this.props.onClickArray[i]}>
                        {this.state.lines[i]} of <b data-taxname={ancNameNoRank} data-taxrank={this.props.ancestorRanks[i]}>{ancNameNoRank}</b>
                    </p>);
        };

        return <fieldset>{ps}</fieldset>;
    };
};

class DescendantSection extends React.Component<{self:string, ancestor:string, layer:number, hovered:boolean}, {rank:string, totalCount:number, unassignedCount:number, percentage:number, self:string, layer:number, hovered:boolean}> {
    constructor(props) {
        super(props);
        this.state = {
            self: "",
            layer: -1,
            rank: "",
            totalCount: 0,
            unassignedCount: 0,
            percentage: 0,
            hovered: false
        };
    };

    componentDidMount(): void {
        document.getElementById("descendant-section")?.addEventListener("change", () => {
            let el:any = document.getElementById("descendant-section")!;
            let values:any[];
            let self:string;
            let layer:number;
            let ancestor:string;
            let hovered:boolean;

            if (el.value.length === 0) {
                self = "";
                layer = 0;
                ancestor = "";
                hovered = false;
            }
            else {
                values = el.value.split("*");
                self = values[0];
                layer = parseInt(values[1]);
                ancestor = values[2];
                hovered = true;
            };

            if (!(this.state.self === self)) {
                this.calculateParams(self, layer, ancestor, hovered);
            };
        });
    };

    calculateParams(self, layer, ancestor, hovered) {
        if (hovered) {
            let totalCount:number = 0;
            let unassignedCount:number = 0;
            let rank:string;
            
            if (self.indexOf("&") > -1) {
                let groupedTaxa:string[] = self.split(" & ");
                for (let taxon of groupedTaxa) { totalCount += allTaxaReduced[taxon]["totalCount"] };
                unassignedCount = 0;
                rank = allTaxaReduced[groupedTaxa[0]]["rank"];
            }
            else {
                totalCount = allTaxaReduced[self]["totalCount"];
                unassignedCount = allTaxaReduced[self]["unassignedCount"];
                rank = allTaxaReduced[self]["rank"];
            };

            let percentage:number = totalCount * 100 / allTaxaReduced[ancestor]["totalCount"];

            this.setState({ totalCount: totalCount, 
                            unassignedCount: unassignedCount, 
                            rank: rank, 
                            percentage: percentage, 
                            layer: layer, self: self, 
                            hovered: hovered });
        }
        else { 
            this.setState({ totalCount: 0, 
                               unassignedCount: 0, 
                               rank: "", 
                               percentage: 0, 
                               self: "", 
                               layer: 0, 
                               hovered: hovered });
        };
    };

    render() {
        let ps:any[] = [];

        if (this.state.hovered) {
            let selfNameNoRank:string = this.state.self.replace(RegExp(rankPatternFull.map(item => " " + item).join("|"), "g"),"");

            let firstLine:any = <legend key={"firstLine"} style={{"color": "#800080", "fontWeight": "bold"}}>
                                    HOVERING OVER
                                </legend>;

            let nameLine:any = <p key={"nameLine"} className="mp-zero">
                                    Taxon: <b>{selfNameNoRank}</b>
                               </p>;

            let rankLine:any = <p key={"rankLine"} className="mp-zero">
                                    Rank: <b>{this.state.rank}</b>
                               </p>;

            let totalCountLine:any = <p key={"totalCountLine"} className="mp-zero">
                                        Total count: <b>{this.state.totalCount}</b>
                                    </p>;

            let unassignedCountLine:any = <p key={"unassignedCountLine"} className="mp-zero">
                                                Unassigned {selfNameNoRank}: <b>{this.state.unassignedCount}</b>
                                          </p>;

            ps = [firstLine, nameLine, rankLine, totalCountLine, unassignedCountLine];

            return <fieldset id="hovering-over">{ps}</fieldset>;
        };

        return <div></div>;
    };
};

class PlotDrawing extends React.Component<{lineages:string[][], ranks:string[][]}, {root:string, layer:number, collapse:boolean, horizontalShift:number, verticalShift:number, taxonSpecifics:object, croppedLineages:string[][], alignedCroppedLineages:string[][], croppedRanks:string[][], unassignedCounts:string[][], structureByDegrees:object, structureByTaxon: object, svgPaths:object, shapeComponents:object, shapeCenters:object, taxonLabels:object, taxonShapes:object, colors:string[], ancestors:string[], ancestorRanks:string[], rankPattern:string[], alteration:string, totalUnassignedCount:number, numberOfLayers:number, layerWidth:number, count:number, abbreviateLabels:boolean, labelsPlaced:boolean, height:number, alreadyRepeated:boolean, plotEValue:boolean}> {
    constructor(props) {
        super(props);
        this.state = {
            root: "Bacteria",
            layer: 1,
            collapse: false,
            horizontalShift: viewportDimensions["cx"],
            verticalShift: viewportDimensions["cy"],
            taxonSpecifics: {},
            croppedLineages: [],
            alignedCroppedLineages: [],
            croppedRanks: [],
            unassignedCounts: [],
            structureByDegrees: {},
            structureByTaxon: {},
            svgPaths: {},
            shapeComponents: {},
            shapeCenters: {},
            taxonLabels: {},
            taxonShapes: {},
            colors: colors, //["d27979", "c0d279", "79d29c", "799cd2", "c079d2"],
            ancestors: ["root"],
            ancestorRanks: ["root"],
            rankPattern: [],
            alteration: "allEqual",
            totalUnassignedCount: 0,
            numberOfLayers: -1,
            layerWidth: -1,
            count: 0,
            abbreviateLabels: true,
            labelsPlaced: false,
            height: 0,
            alreadyRepeated: false,
            plotEValue: false
        }
    }

    componentDidMount() {

        // Once everything is initialized, calculate plot.
        this.cropLineages();

        // Recalculate plot on window resize.
        addEventListener("resize", () => {
            viewportDimensions = getViewportDimensions();
            this.cropLineages();
        });

        // Recalculate plot when user changes settings - radio button, checkboxes, new file.
        document.getElementById("radio-input")!.addEventListener("change", () => {
            let alteration:any = document.querySelector('input[name="radio"]:checked')!.getAttribute("id");
            this.cropLineages(this.state.root, this.state.layer, alteration, this.state.collapse);
        });
        document.getElementById("checkbox-input")!.addEventListener("change", () => {
            let element:any =  document.getElementById("checkbox-input")!;
            let checked:boolean = element.checked;
            this.cropLineages(this.state.root, this.state.layer, this.state.alteration, checked);
        });
        document.getElementById("e-input")!.addEventListener("change", () => {
            let element:any =  document.getElementById("e-input")!;
            let checked:boolean = element.checked;
            this.cropLineages(this.state.root, this.state.layer, this.state.alteration, this.state.collapse, checked);
        });
        document.getElementById("new-data")!.addEventListener("change", () => {
            let newData:any = document.getElementById("new-data")!
            let collapsed:any = document.getElementById("checkbox-input")!
            let currentAlteration:any = document.querySelector('input[name="radio"]:checked')!
            let allEqual:any = document.getElementById("allEqual")!
            let eFilter:any = document.getElementById("e-input")!
            newData.checked = false;
            collapsed.checked = false;
            currentAlteration.checked = false;
            allEqual.checked = true;
            eFilter.checked = false;
            colors = createPalette(colorOffset);
            this.cropLineages("root", 0, "allEqual", false, false, lineagesNames, lineagesRanks);
        });
        document.getElementById("e-text")!.addEventListener("keyup", ({key}) => {
            let eInput:any = document.getElementById("e-input")!
            if (key === "Enter") {
                let el:any = document.getElementById("e-text")!
                let value:number = parseFloat(el.value);
                if (eInput.checked) {
                    eThreshold = value;
                    this.cropLineages();
                }
                else { eThreshold = value; };
            };
        });
    };

    componentDidUpdate() {
        if (!this.state.labelsPlaced) {
            this.placeLabels();
        };
    };

    // Leave only relevant lineages and crop them if necessary.
    cropLineages(root=this.state.root, layer=this.state.layer, 
        alteration=this.state.alteration, collapse=this.state.collapse, 
        plotEValue=this.state.plotEValue, lineages=lineagesNames, ranks=lineagesRanks):void {

        // Change some variables, so that if the plot is dowlnoaded as SVG, the file name reflects all settings.
        taxonName = root.slice(0, 10);
        layerName = layer;
        modeName = alteration;
        collapseName = "collapse" + collapse;

        // If this plot has been calculated before, retrieve it from storage.
        let currPlotId:string;
        if (plotEValue) {
            currPlotId = fileName + originalAllTaxaReduced["root"]["totalCount"] + root + layer + collapse + alteration + plotEValue + eThreshold + " " + viewportDimensions["cx"] + viewportDimensions["cy"];
        }
        else {
            currPlotId = fileName + originalAllTaxaReduced["root"]["totalCount"] + root + layer + collapse + alteration + plotEValue + " " + viewportDimensions["cx"] + viewportDimensions["cy"];
        }

        if (Object.keys(alreadyVisited).indexOf(currPlotId) > -1) {
            this.setState(alreadyVisited[currPlotId]);
            return;
        };

        // Reset the object with all taxon data.
        allTaxaReduced = JSON.parse(JSON.stringify(originalAllTaxaReduced));

        // Get only relevant lineages.
        // Iterate over all lineages and filter out the ones that do not contain any of the root taxa.
        let rootTaxa:string[] = root.split(" & ");
        let croppedLineages:string[][] = [];
        let croppedRanks:string[][] = [];
        for (let i = 0; i < lineages.length; i++) {
            if (rootTaxa.indexOf(lineages[i][layer]) > -1) {
                croppedLineages.push(lineages[i]);
                croppedRanks.push(ranks[i]);
            };
        };

        // Remember the common ancestors of all relevant lineages.
        let ancestors:string[] = [""];
        let ancestorRanks:string[] = [""];
        if (croppedLineages[0]) {
            ancestors = croppedLineages[0].slice(0, layer);
            ancestorRanks = croppedRanks[0].slice(0, layer);
        };

        // Crop lineages so they start with the first common taxon (root).
        if (rootTaxa.length > 1) {
            croppedLineages = croppedLineages.map(item => item.slice(layer-1));
            croppedRanks = croppedRanks.map(item => item.slice(layer-1));
        }
        else {
            croppedLineages = croppedLineages.map(item => item.slice(layer));
            croppedRanks = croppedRanks.map(item => item.slice(layer));
        };
        
        // Filter by e-value if required.
        if (plotEValue) {
            let modified = this.filterByEValue(croppedLineages, croppedRanks);
            let minEValue = modified[2];
            if (eThreshold < minEValue) {
                eThreshold = minEValue;
                let eText:any = document.getElementById("e-text")!
                eText.value = minEValue;
                modified = this.filterByEValue(croppedLineages, croppedRanks);
            };
            croppedLineages = modified[0], croppedRanks = modified[1];
        };

        // Get minimal rank pattern for this particular plot to prepare for alignment.
        let ranksUnique:string[] = croppedRanks.reduce((accumulator, value) => accumulator.concat(value), []);
        ranksUnique = ranksUnique.filter((value, index, self) => Boolean(value) && self.indexOf(value) === index);
        let rankPattern:string[] = rankPatternFull.filter(item => ranksUnique.indexOf(item) > -1);

        // Mary taxa if necessary.
        let changedLineages:Boolean[] = [];
        if (alteration.startsWith("marriedTaxa")) {
            let cropped = this.marryTaxa(croppedLineages, croppedRanks, alteration);
            croppedLineages = cropped[0];
            croppedRanks = cropped[1];
            changedLineages = cropped[2];
        };

        // Fixes the problem with the root label of married plots.
        croppedLineages = croppedLineages.map(item => {item.splice(0, 1, root); return item});

        // Collapse lineages if necessary.
        if (collapse) {
            let arr:any = this.collapse(croppedLineages, croppedRanks);
            croppedLineages = arr[0];
            croppedRanks = arr[1];
        };
        
        // Align cropped lineages by adding null as placeholder for missing ranks.
        let alignedCroppedLineages:string[][] = [];
        let alignedCropppedRanks:string[][] = [];
        for (let i = 0; i < croppedLineages.length; i++) {
            let alignedLineage:any = new Array(rankPattern.length).fill(null);
            let alignedRank:any = new Array(rankPattern.length).fill(null);
            for (let j=0; j<croppedRanks[i].length; j++) {
                let index = rankPattern.indexOf(croppedRanks[i][j]);
                if (index > -1) { 
                    alignedLineage.splice(index, 1, croppedLineages[i][j]);
                    alignedRank.splice(index, 1, croppedRanks[i][j]);
                };
            };
            alignedCroppedLineages.push(alignedLineage);
            alignedCropppedRanks.push(alignedRank);
        };

        // Save in state object taxonSpecifics.
        let taxonSpecifics:object = {};
        for (let i = 0; i < croppedLineages.length; i++) {
            let taxName:string = croppedLineages[i][croppedLineages[i].length-1];
            taxonSpecifics[taxName] = {};
            taxonSpecifics[taxName]["rank"] = croppedRanks[i][croppedRanks[i].length-1];
            taxonSpecifics[taxName]["croppedLineage"] = croppedLineages[i];
            taxonSpecifics[taxName]["alignedCroppedLineage"] = alignedCroppedLineages[i];
            taxonSpecifics[taxName]["firstLayerUnaligned"] = croppedLineages[i].length-1;
            taxonSpecifics[taxName]["firstLayerAligned"] = alignedCroppedLineages[i].indexOf(taxName);
            if (changedLineages[i] || taxName.includes("&")) {
                let taxa:string[] = taxName.split(" & ");
                let unassignedCount:number = taxa.map(item => allTaxaReduced[item]["totalCount"]).reduce((accumulator, value) => accumulator + value, 0);
                taxonSpecifics[taxName]["unassignedCount"] = unassignedCount;
                taxonSpecifics[taxName]["totalCount"] = unassignedCount;
                taxonSpecifics[taxName]["married"] = true;
            } 
            else {
                taxonSpecifics[taxName]["unassignedCount"] = allTaxaReduced[taxName].unassignedCount;
                taxonSpecifics[taxName]["totalCount"] = allTaxaReduced[taxName]["totalCount"];
            };
        };

        // Get sum of all unassigned counts.
        let totalUnassignedCount:number = 0;
        if (root.indexOf("&") > -1) {
            for (let taxName of Object.keys(taxonSpecifics)) {
                totalUnassignedCount += taxonSpecifics[taxName]["unassignedCount"];
            };
            allTaxaReduced[root] = totalUnassignedCount;
        }
        else { totalUnassignedCount = allTaxaReduced[root]["totalCount"]; };
        
        // Make all lineages take up the same amount of degrees in the plot if necessary.
        if (alteration === "allEqual") {
            for (let taxName of Object.keys(taxonSpecifics)) {
                taxonSpecifics[taxName]["unassignedCount"] = 1;
            };
        };
        for (let i = 0; i < croppedLineages.length; i++) {
            for (let j = croppedLineages[i].length - 2; j >= 0; j--) {
                if (!taxonSpecifics[croppedLineages[i][j]]) {
                    taxonSpecifics[croppedLineages[i][j]] = {};
                    taxonSpecifics[croppedLineages[i][j]]["rank"] = croppedRanks[i][j];
                    taxonSpecifics[croppedLineages[i][j]]["croppedLineage"] = croppedLineages[i].slice(0, j+1);
                    let index = alignedCroppedLineages[i].indexOf(croppedLineages[i][j]);
                    taxonSpecifics[croppedLineages[i][j]]["alignedCroppedLineage"] = alignedCroppedLineages[i].slice(0, index+1);
                    taxonSpecifics[croppedLineages[i][j]]["unassignedCount"] = 0;
                    taxonSpecifics[croppedLineages[i][j]]["totalCount"] = allTaxaReduced[croppedLineages[i][j]]["totalCount"];
                    taxonSpecifics[croppedLineages[i][j]]["firstLayerUnaligned"] = j;
                    taxonSpecifics[croppedLineages[i][j]]["firstLayerAligned"] = index;
                };
            };
        };
        
        // Continue onto the next step if one or more lineages fulfill the criteria.
        if (croppedLineages.length >= 1) {
            this.assignDegrees({"root": root, "layer": layer, "rankPattern": rankPattern, 
                                "taxonSpecifics": taxonSpecifics, "croppedLineages": croppedLineages, 
                                "alignedCroppedLineages": alignedCroppedLineages, "ancestors": ancestors, 
                                "alteration": alteration, "collapse": collapse, "ancestorRanks": ancestorRanks, 
                                "totalUnassignedCount": totalUnassignedCount, count: 0, "abbreviateLabels": true, 
                                "labelsPlaced": false, "alreadyRepeated": false, "plotEValue": plotEValue});
        };
    };

    // If collapse=true, remove taxa that only come up in the lineage of one other taxon and have no unassigned counts of their own.
    collapse(croppedLineages:string[][], croppedRanks:string[][]):string[][][] {
        var lineagesCopy:string[][] = JSON.parse(JSON.stringify(croppedLineages));
        var ranksCopy:string[][] = JSON.parse(JSON.stringify(croppedRanks));
        var layers = getLayers(lineagesCopy);

        for (let i = 0; i < layers.length - 1; i++) {
            for (let j = 0; j < layers[i].length; j++) {
                if (layers[i].filter(item => item === layers[i][j]).length === 1 && Boolean(layers[i+1][j])) {
                    lineagesCopy[j].splice(i, 1, "toBeDeleted");
                    ranksCopy[j].splice(i, 1, "toBeDeleted");
                };
            };
        };

        for (let i = 0; i < lineagesCopy.length; i++) {
            lineagesCopy[i] = lineagesCopy[i].filter(item => item !== "toBeDeleted");
            ranksCopy[i] = ranksCopy[i].filter(item => item !== "toBeDeleted");
        };

        return [lineagesCopy, ranksCopy];
    };

    filterByEValue(croppedLineages:string[][], croppedRanks:string[][]):any {
        let allEValues:any = [];
        let newCroppedLineages = JSON.parse(JSON.stringify(croppedLineages));
        let newCroppedRanks = JSON.parse(JSON.stringify(croppedRanks));

        for (let i = croppedLineages.length - 1; i >= 0; i--) {
            let lineage:string[] = croppedLineages[i];
            let lastTaxon:string = lineage[lineage.length-1];
            let oldUnassignedCount:number = originalAllTaxaReduced[lastTaxon]["unassignedCount"];

            // For every cropped lineage, store the /"eValues"/ indices of its occurrences with permissible e-value.
            // The array where we store these indices is called successfulIndices.
            let successfulIndices:number[] = [];
            let eValues = originalAllTaxaReduced[lastTaxon]["eValues"].filter((item, index) => {
                if (item <= eThreshold) { successfulIndices.push(index); };
                return item <= eThreshold!;
            });
            allTaxaReduced[lastTaxon]["successfulIndices"] = successfulIndices;

            // Update the unassignedCount of every relevant unspecified taxon except "root".
            let newUnassignedCount:number = eValues.length;
            if (lastTaxon !== "root") {
                allTaxaReduced[lastTaxon]["unassignedCount"] = newUnassignedCount;
            };

            // Update the totalCount of every taxon except unspecified "root".
            let diff:number = oldUnassignedCount - newUnassignedCount;
            for (let taxon of lineage) {
                if (!(taxon === lastTaxon && lastTaxon === "root")) {
                    allTaxaReduced[taxon]["totalCount"] -= diff;
                };
            };

            // If some unspecified taxon has 0 occurrences with permissible e-values,
            // remove it from the list.
            if (newUnassignedCount === 0) {
                newCroppedLineages.splice(i, 1);
                newCroppedRanks.splice(i, 1);
            };

            allEValues = allEValues.concat(originalAllTaxaReduced[lastTaxon]["eValues"]);
        };

        let minEValue:number = allEValues.sort((a, b) => a - b)[0];
        return [newCroppedLineages, newCroppedRanks, minEValue];
    };

    marryTaxa(croppedLineages:string[][], croppedRanks:string[][], alteration="marriedTaxaI") {
        // Set threshold for marrying. Currently fixed at 2%.
        let threshold:number = 0.02;

        // Get the sum of unassigned counts.
        let totalUnassignedCounts:number = 0;
        for (let lineage of croppedLineages) {
            totalUnassignedCounts += allTaxaReduced[lineage[lineage.length - 1]]["unassignedCount"];
        };

        // Find all lineages that make up <2% of the whole. 
        // Crop them so that they end in the most specific taxon >= 2 %.
        // Put them in an array called reducibleLineages. 
        let reducibleLineages:any = [];
        for (let lineage of croppedLineages) {

            // If the last wedge of the current lineage is too thin...
            if (allTaxaReduced[lineage[lineage.length - 1]]["totalCount"] / totalUnassignedCounts < threshold) {
                let lineageIndex:number = croppedLineages.indexOf(lineage);
                let lastWayTooThinLayer:number = lineage.length - 1;

                // ...find the furthest parent that is also too thin.
                for (let i = lineage.length - 2; i >= 0; i--) {
                    if (allTaxaReduced[lineage[i]]["totalCount"] / totalUnassignedCounts >= threshold) {
                        lastWayTooThinLayer = i+1;
                        break;
                    };
                };

                let partialLineage:string[] = lineage.slice(0, lastWayTooThinLayer);
                reducibleLineages.push([lineageIndex, partialLineage]);
            };
        };

        // Viewing mode "Married taxa I" puts all wedges with the same ancestry
        // (the same partialLineage) under the same property name in the object reductionGroups.
        // Their common name is composed by concatenating the names of the first less-than-2%
        // taxa in each lineage.
        let reductionGroups:object = {};
        if (alteration === "marriedTaxaI") {
            for (let item of reducibleLineages) {
                if (!reductionGroups[item[1].join("")]) {
                    reductionGroups[item[1].join("")] = {};
                    reductionGroups[item[1].join("")]["spliceAt"] = item[1].length;
                    reductionGroups[item[1].join("")]["index"] = [item[0]];
                    reductionGroups[item[1].join("")]["commonName"] = croppedLineages[item[0]][item[1].length];
                } 
                else {
                    reductionGroups[item[1].join("")]["index"].push(item[0]);
                    let taxa:string = reductionGroups[item[1].join("")]["commonName"].split(" & ");
                    if (taxa.indexOf(croppedLineages[item[0]][item[1].length]) === -1) {
                        reductionGroups[item[1].join("")]["commonName"] += ` & ${croppedLineages[item[0]][item[1].length]}`;
                    };
                };
            };
        }

        // Viewing mode "Married taxa II" puts wedges with the same ancestry together
        // until the combined wedge reaches the threshold. If there are more with the 
        // same ancestry, they will be combined into another wedge.
        else {

            // Put all wedges with the same ancestry under the same property name in reducibleLineages.
            for (let item of reducibleLineages) {
                if (!reductionGroups[item[1].join("")]) {
                    reductionGroups[item[1].join("")] = {};
                    reductionGroups[item[1].join("")]["spliceAt"] = item[1].length;
                    reductionGroups[item[1].join("")]["index"] = [item[0]];
                } 
                else { reductionGroups[item[1].join("")]["index"].push(item[0]); };
            };

            // Sort indices of reduction groups by size in ascending order,
            // group some of them together if they are in the same subgroup.
            for (let group of Object.keys(reductionGroups)) {
                let spliceAt:number = reductionGroups[group]["spliceAt"];
                reductionGroups[group]["index"].sort((index1, index2) => allTaxaReduced[croppedLineages[index1][spliceAt]]["totalCount"] - allTaxaReduced[croppedLineages[index2][spliceAt]]["totalCount"])
                
                // In each reduction group, replace lineage indices with the names of the first too-small taxa.
                // The resulting array is called renameables.
                // For each unique item in renameables, create a key in temporaryObject.
                // The key will contain a list of all indices of lineages whose first too-small taxa have the same name.
                let renameables:string[] = reductionGroups[group]["index"].map(item => croppedLineages[item][spliceAt]);
                let temporaryObject:object = {};
                for (let i = 0; i < renameables.length; i++) {
                    let renameable:string = renameables[i];
                    if (!temporaryObject[renameable]) {
                        temporaryObject[renameable] = [reductionGroups[group]["index"][i]];
                    }
                    else {
                        temporaryObject[renameable].push(reductionGroups[group]["index"][i]);
                    };
                };

                // Use temporaryObject to create permanentObject, in which every key is a lineage index,
                // every value is the name of its first too-small taxon.
                // Add permanentObject to the reduction group as its "reference".
                // minimalIndexArrat contains all indices in the group ordered by size of the wedge.
                let permanentObject:object = {};
                for (let key of Object.keys(temporaryObject)) {
                    permanentObject[temporaryObject[key][0]] = temporaryObject[key];
                };
                reductionGroups[group]["references"] = permanentObject;
                reductionGroups[group]["minimalIndexArray"] = Object.keys(permanentObject).sort((index1, index2) => {
                    return allTaxaReduced[croppedLineages[index1][spliceAt]]["totalCount"] - allTaxaReduced[croppedLineages[index2][spliceAt]]["totalCount"];
                });
            };

            for (let group of Object.keys(reductionGroups)) {
                let minimalIndexArray:number[] = reductionGroups[group]["minimalIndexArray"].map(item => parseInt(item));
                let indexBeginning:number = 0;
                let indexEnd:number = minimalIndexArray.length - 1;
                let addNext:string = "indexBeginning";
                let sum:number = 0;
                let newIndexGroup:number[] = [];
                let newGroups:any = [];
                let iterations:number = minimalIndexArray.length % 2 === 0 ? minimalIndexArray.length / 2 : Math.floor(minimalIndexArray.length / 2) + 1;
                let spliceAt:number = reductionGroups[group]["spliceAt"];
                
                // To create a single wedge from a group (multiple wedges might be needed),
                // combine a the smallest wedge with the biggest and remove them from the group.
                // Continue building up the same wedge the same way until the threshold is reached.
                // Then start a new wedge if needed.
                // newIndexGroup holds the indices of the current wedge.
                // newGroups holds every newIndexGroup for this reduction group.
                while ((minimalIndexArray.length % 2 === 0 && indexBeginning <= iterations && (minimalIndexArray.length - 1) - indexEnd < iterations) || 
                       (minimalIndexArray.length % 2 === 1 && indexBeginning !== iterations && (minimalIndexArray.length - 1) - indexEnd < iterations)) {
                    if (addNext === "indexBeginning") {
                        let newIndex:number = minimalIndexArray[indexBeginning];
                        newIndexGroup.push(newIndex);
                        let totalCount:number = allTaxaReduced[croppedLineages[newIndex][spliceAt]]["totalCount"];
                        let additive:number = totalCount / totalUnassignedCounts;
                        sum += additive;
                        addNext = "indexEnd";
                        indexBeginning++;
                    }
                    else {
                        let newIndex:number = minimalIndexArray[indexEnd];
                        newIndexGroup.push(newIndex);
                        let totalCount:number = allTaxaReduced[croppedLineages[newIndex][spliceAt]]["totalCount"];
                        let additive:number = totalCount / totalUnassignedCounts;
                        sum += additive;
                        addNext = "indexBeginning";
                        indexEnd--;
                    };

                    if (sum >= threshold) {
                        newGroups.push(newIndexGroup);
                        newIndexGroup = [];
                        sum = 0;
                    };
                };

                // Add the last newIndexGroup to its newGroups array, unless it's empty.
                if (newIndexGroup.length !== 0) {
                    if (newGroups.length === 0) { newGroups = [[]]; };
                    let lastGroup:number[] = newGroups[newGroups.length - 1];
                    lastGroup.splice(lastGroup.length, 0, ...newIndexGroup);
                };

                // Replace each index in each newIndexGroup with the name 
                // of the first too-small taxon in the lineage with this index.
                // Each element in the array reductionGroups[group]["newGroups"]
                // is an array of names which will form a single wedge.
                newGroups = newGroups.map(item => item.map(item1 => reductionGroups[group]["references"][item1]));
                newGroups = newGroups.map(item => item.reduce((accumulator, value) => accumulator.concat(value), []));
                reductionGroups[group]["newGroups"] = newGroups;
            };

            // Reconfigure reductionGroups where each key holds the information for a single wedge.
            // The name of the wedge is calculated here.
            let newReductionGroups:object = {};
            for (let group of Object.keys(reductionGroups)) {
                for (let i = 0; i < reductionGroups[group]["newGroups"].length; i++) {
                    newReductionGroups[`${group}-${i}`] = {};
                    newReductionGroups[`${group}-${i}`]["spliceAt"] = reductionGroups[group]["spliceAt"];
                    newReductionGroups[`${group}-${i}`]["index"] = reductionGroups[group]["newGroups"][i];
                    var names:string[] = reductionGroups[group]["newGroups"][i].map(item => croppedLineages[item][reductionGroups[group]["spliceAt"]]).filter((v, i, a) => a.indexOf(v) === i);
                    newReductionGroups[`${group}-${i}`]["commonName"] = names.join(" & ");
                };
            };
            reductionGroups = newReductionGroups;
        };

        // Crop lineages and ranks to start with common ancestry and end with the married name.
        let changedLineages:any[] = new Array(croppedLineages.length).fill(false);
        for (let group of Object.keys(reductionGroups).filter(item => reductionGroups[item]["index"].length > 1)) {
            for (let index of reductionGroups[group]["index"]) {
                croppedLineages[index].splice(reductionGroups[group]["spliceAt"], croppedLineages[index].length - reductionGroups[group]["spliceAt"], reductionGroups[group]["commonName"]);
                croppedRanks[index].splice(reductionGroups[group]["spliceAt"] + 1);
                changedLineages.splice(index, 1, true);
            };
        };
        
        // Remove duplicates from the married lineages.
        for (let i = croppedLineages.length - 1; i >= 0; i--) {
            let croppedLineageCopy = croppedLineages.map(item => JSON.stringify(item));
            let lineage:string = croppedLineageCopy[i];
            let lastIndex = i;
            let firstIndex = croppedLineageCopy.indexOf(lineage);
            if (firstIndex !== lastIndex) {
                croppedLineages.splice(lastIndex, 1);
                croppedRanks.splice(lastIndex, 1);
                changedLineages.splice(lastIndex, 1);
            };
        };

        return [croppedLineages, croppedRanks, changedLineages];
    };

    // Assign each cropped lineage a start and end degree.
    assignDegrees(newState:object):void {
        var alignedCroppedLineages = newState["alignedCroppedLineages"];
        var croppedLineages = newState["croppedLineages"];
        var taxonSpecifics = newState["taxonSpecifics"];
        var totalUnassignedCounts:number = 0;
        if (newState["alteration"] === "allEqual") {
            for (let taxName of Object.keys(taxonSpecifics).filter(item => taxonSpecifics[item]["unassignedCount"] !== 0)) {
                totalUnassignedCounts += taxonSpecifics[taxName]["unassignedCount"];
            };
        }
        else { var totalUnassignedCounts = newState["totalUnassignedCount"]; };

        // For each taxon, calculate what layer it starts and ends in, and its start and end degrees.
        // ranges:object contains taxa names as keys and their layer and degree ranges as values.
        let ranges:object = {};
        let startDeg:number = 0;
        for (let i = 0; i < croppedLineages.length; i++) {
            for (let j = 0; j < croppedLineages[i].length; j++) {
                let currentTaxon:string = croppedLineages[i][j];
                let alignedIndex:number = taxonSpecifics[currentTaxon]["firstLayerAligned"];

                // Determine first layers and degrees.
                // Every taxon starts at its firstLayerAligned UNLESS
                // its parent is the root taxon but there are missing ranks in between -
                // in which case starts at its firstLayerUnaligned, which is layer 1.
                if (!ranges[currentTaxon]) {
                    ranges[currentTaxon] = {};
                    let firstLayer:number = taxonSpecifics[currentTaxon]["firstLayerUnaligned"] === 1 ? 1 : alignedIndex;
                    ranges[currentTaxon]["layers"] = [firstLayer];
                    ranges[currentTaxon]["degrees"] = [startDeg];
                };

                // Determine the last layer (for the current lineage - next iteration might be for the same taxon,
                // but different lineage and a different last layer, but the first layer is the same for both).
                // If there is a rank gap between the current taxon and the next one, the current taxon fills it.
                let lastLayer:number;
                if (j === croppedLineages[i].length - 1) {
                    lastLayer = alignedCroppedLineages[0].length;
                } 
                else {
                    lastLayer = alignedCroppedLineages[i].indexOf(croppedLineages[i][j+1]);
                };

                ranges[currentTaxon]["layers"].push(lastLayer);
                ranges[currentTaxon]["degrees"].push(startDeg + (taxonSpecifics[croppedLineages[i][croppedLineages[i].length-1]]["unassignedCount"] * 360) / totalUnassignedCounts);
            };
            startDeg += (taxonSpecifics[croppedLineages[i][croppedLineages[i].length-1]]["unassignedCount"] * 360) / totalUnassignedCounts;
        };

        // For each taxon, uniquify its "layers" array and adjust "degrees" accordingly.
        for (let taxName of Object.keys(ranges)) {
            for (let i = ranges[taxName]["layers"].length - 1; i >= 1; i--) {
                if (ranges[taxName]["layers"][i] === ranges[taxName]["layers"][i-1]) {
                    ranges[taxName]["degrees"][i-1] = ranges[taxName]["degrees"][i];
                    ranges[taxName]["degrees"].splice(i,1);
                    ranges[taxName]["layers"].splice(i,1);
                };
            };
        };

        for (let taxName of Object.keys(taxonSpecifics)) {
            taxonSpecifics[taxName]["layers"] = ranges[taxName]["layers"];
            taxonSpecifics[taxName]["degrees"] = ranges[taxName]["degrees"];
        };

        this.calculateSVGPaths(newState);
    };

    calculateSVGPaths(newState:object):void {
        let cx = viewportDimensions["cx"];
        let cy = viewportDimensions["cy"];
        let alignedCroppedLineages:string[][] = newState["alignedCroppedLineages"];
        let taxonSpecifics:object = newState["taxonSpecifics"];
        let dpmm:number = viewportDimensions["dpmm"];
        let numberOfLayers:number = alignedCroppedLineages[0].length;
        // let smallerDimension:number = Math.min(cx * 0.6, cy); //var smallerDimension:number = Math.min(cx, cy);
        let layerWidth:number = Math.max(viewportDimensions["smallerDimSize"] / numberOfLayers, dpmm * 1); //var layerWidth:number = Math.max((smallerDimension) / numberOfLayers, dpmm * 1);
        
        for (let key of Object.keys(taxonSpecifics)) {
            let layers = taxonSpecifics[key]["layers"];
            let degrees = taxonSpecifics[key]["degrees"];
            let fstLayer = layers[0];
            let sndLayer = layers[1];
            let startDeg = degrees[0];
            let endDeg = degrees[degrees.length - 1];
            let innRad:number = round(fstLayer * layerWidth);

            // If the shape to be drawn is the center of the plot (a single circle).
            if (layers[0] === 0) {
                taxonSpecifics[key]["svgPath"] = `M ${cx}, ${cy} m -${layerWidth}, 0 a ${layerWidth},${layerWidth} 0 1,0 ${(layerWidth)* 2},0 a ${layerWidth},${layerWidth} 0 1,0 -${(layerWidth)* 2},0`;
            }

            // If the shape to be drawn is NOT the center of the plot, but a complex shape.
            else {
                var subpaths:string[] = [];

                // If the shape to be drawn completes a full circle...
                if (round(endDeg - startDeg) === 360) {
                    let innerArcPath:string = `M ${cx}, ${cy} m -${innRad}, 0 a ${innRad},${innRad} 0 1,0 ${(innRad)* 2},0 a ${innRad},${innRad} 0 1,0 -${innRad* 2},0`;
                    subpaths = [innerArcPath];

                    // ...and consists simply of two concentric circles.
                    if (layers.length === 2) { 
                        let outerCirc = sndLayer * layerWidth;
                        let midArcPath:string = `M ${cx}, ${cy} m -${outerCirc}, 0 a ${outerCirc},${outerCirc} 0 1,0 ${outerCirc* 2},0 a ${outerCirc},${outerCirc} 0 1,0 -${outerCirc* 2},0`;
                        subpaths.push(midArcPath);
                    }
                    // ...and is of irregular shape.
                    else {
                        let midArc:object = {};
                        for (let i = layers.length - 1; i >= 1; i--) {
                            let curr = degrees[i];
                            let prev = degrees[i-1];
                            let MorL:string = i === layers.length - 1 ? "M" : "L";
                            midArc = calculateArcEndpoints(layers[i], layerWidth, prev, curr, cx, cy);
                            let midArcPath:string = `${MorL} ${midArc["x2"]},${midArc["y2"]} A ${midArc["radius"]},${midArc["radius"]} 0 0 0 ${midArc["x1"]},${midArc["y1"]}`;
                            if (Math.abs(curr - prev) >= 180) {
                                midArcPath = `${MorL} ${midArc["x2"]},${midArc["y2"]} A ${midArc["radius"]},${midArc["radius"]} 0 1 0 ${midArc["x1"]},${midArc["y1"]}`;  
                            };
                            subpaths.push(midArcPath);
                        };
                        let lineInnertoOuter = `L ${midArc["x1"]},${midArc["y1"]} ${cx},${cy + layers[layers.length - 1] * layerWidth}`;
                        subpaths.push(lineInnertoOuter);
                    };
                    taxonSpecifics[key]["svgPath"] = subpaths.join(" ");
                }

                // If the shape doesn't complete a full circle.
                else { 
                    let innerArc:object = calculateArcEndpoints(fstLayer, layerWidth, startDeg, endDeg, cx, cy);
                    let innerArcPath:string = `M ${innerArc["x1"]},${innerArc["y1"]} A ${innRad},${innRad} 0 0 1 ${innerArc["x2"]},${innerArc["y2"]}`;
                    if (Math.abs(endDeg - startDeg) >= 180) {
                        innerArcPath = `M ${innerArc["x1"]},${innerArc["y1"]} A ${innerArc["radius"]},${innerArc["radius"]} 0 1 1 ${innerArc["x2"]},${innerArc["y2"]}`;
                    };

                    let subpaths:string[] = [innerArcPath];
                    let midArc:object = {};
                    for (let i = layers.length - 1; i >= 0; i--) {
                        let curr = degrees[i];
                        let prev = i === 0 ? startDeg : degrees[i-1];
                        midArc = calculateArcEndpoints(layers[i], layerWidth, prev, curr, cx, cy);
                        let midArcPath:string = `L ${midArc["x2"]},${midArc["y2"]} A ${midArc["radius"]},${midArc["radius"]} 0 0 0 ${midArc["x1"]},${midArc["y1"]}`;
                        if (Math.abs(curr - prev) >= 180) {
                            midArcPath = `L ${midArc["x2"]},${midArc["y2"]} A ${midArc["radius"]},${midArc["radius"]} 0 1 0 ${midArc["x1"]},${midArc["y1"]}`;  
                        };
                        subpaths.push(midArcPath);
                    };
                    
                    let lineInnertoOuter = `L ${midArc["x1"]},${midArc["y1"]} ${innerArc["x1"]},${innerArc["y1"]}`;
                    subpaths.push(lineInnertoOuter);
                    taxonSpecifics[key]["svgPath"] = subpaths.join(" ");
                };
            };
        };
        newState["numberOfLayers"] = numberOfLayers;
        newState["layerWidth"] = layerWidth;
        this.calculateTaxonLabels(newState);
    };

    calculateTaxonLabels(newState:object):void {
        let alignedCroppedLineages = newState["alignedCroppedLineages"];
        let totalUnassignedCount = newState["totalUnassignedCount"];
        let root:string = newState["root"];
        let taxonSpecifics = newState["taxonSpecifics"];
        let numberOfLayers:number = alignedCroppedLineages[0].length;
        let cx:number = viewportDimensions["cx"];
        let cy:number = viewportDimensions["cy"];
        let layerWidthInPx:number = Math.max(viewportDimensions["smallerDimSize"] / numberOfLayers , viewportDimensions["dpmm"] * 1); //var layerWidthInPx:number = Math.max((Math.min(cx, cy)) / numberOfLayers , viewportDimensions["dpmm"] * 1);
        
        for (let key of Object.keys(taxonSpecifics)) {
            let startDeg = taxonSpecifics[key]["degrees"][0];
            let endDeg = taxonSpecifics[key]["degrees"][taxonSpecifics[key]["degrees"].length-1];
            let centerDegree = startDeg + (endDeg - startDeg) / 2;
            let centerRadius = taxonSpecifics[key]["firstLayerAligned"] + 0.333;

            let centerX = round(centerRadius * layerWidthInPx * cos(centerDegree)) + cx;
            let centerY = round(-centerRadius * layerWidthInPx * sin(centerDegree)) + cy;
            let pointOnLeftBorderX = round(centerRadius * layerWidthInPx * cos(startDeg)) + cx;
            let pointOnLeftBorderY = round(-centerRadius * layerWidthInPx * sin(startDeg)) + cy;
            let pointOnRightBorderX = round(centerRadius * layerWidthInPx * cos(endDeg)) + cx;
            let pointOnRightBorderY = round(-centerRadius * layerWidthInPx * sin(endDeg)) + cy;

            let center = [centerX, centerY, centerDegree, pointOnLeftBorderX, pointOnLeftBorderY, pointOnRightBorderX, pointOnRightBorderY];
            taxonSpecifics[key]["center"] = center;
        };

        for (let key of Object.keys(taxonSpecifics)) {
            // Label of root taxon.
            if (taxonSpecifics[key]["layers"][0] === 0) {
                taxonSpecifics[key]["label"] = {
                    "direction": "horizontal",
                    "opacity": "1",
                    "left": 0,
                    "hoverLeft": 0,
                    "hoverWidth": 0,
                    "hoverDisplay": "unset",
                    "angle": 0,
                    "abbreviation": root.replace(RegExp(rankPatternFull.map(item => " " + item).join("|"), "g"),""),
                    "display": "unset",
                    "fullLabel": root.replace(RegExp(rankPatternFull.map(item => " " + item).join("|"), "g"),""),
                }
            }

            else {
                let centerDeg = taxonSpecifics[key]["center"][2];
                let direction = (taxonSpecifics[key]["layers"].length === 2 && taxonSpecifics[key]["layers"][1] === numberOfLayers) ? "radial" : "verse";
                let angle, radialAngle;
                if (direction === "radial") {
                    angle = centerDeg <= 180 ? -centerDeg : centerDeg;
                } 
                else {
                    angle = (((270 - centerDeg) + 360) % 360) > 180 && (((270 - centerDeg) + 360) % 360 <= 360) ? centerDeg % 360 : (centerDeg + 180) % 360;
                    radialAngle = centerDeg <= 180 ? -centerDeg : centerDeg;
                };

                let percentage:number = round((taxonSpecifics[key]["totalCount"] / totalUnassignedCount) * 100);
                taxonSpecifics[key]["label"] = {
                    "direction": direction,
                    "opacity": "1",
                    "left": 0,
                    "hoverLeft": 0,
                    "hoverDisplay": "unset",
                    "hoverWidth": 0,
                    "top": 0,
                    "angle": angle,
                    "abbreviation": key.replace(RegExp(rankPatternFull.map(item => " " + item).join("|"), "g"),""),
                    "display": "unset",
                    "fullLabel": key.replace(RegExp(rankPatternFull.map(item => " " + item).join("|"), "g"),"") + ` ${percentage}%`,
                    "radialAngle": radialAngle,
                };

                if (taxonSpecifics[key]["rank"] === "species") {
                    let abbr:string = taxonSpecifics[key]["label"]["abbreviation"];
                    if (abbr.split(" ").length >= 2 && !(abbr.split(" ")[1] === "sp.")) {
                        let newAbbr:string = (abbr.split(" ")[0].slice(0, 1) + ". " + abbr.split(" ").slice(1, abbr.split(" ").length).join(" ")).slice(0,15);
                        taxonSpecifics[key]["label"]["abbreviation"] = newAbbr;
                    }
                    else if (abbr.split(" ").indexOf("sp.") !== -1) {
                        let newAbbr:string = (abbr.split(" ").slice(0, abbr.split(" ").indexOf("sp.") + 1).join(" ")).slice(0,15);
                        taxonSpecifics[key]["label"]["abbreviation"] = newAbbr;
                    };
                };
            };
        };
        this.calcShapeColors(newState);
    };

    calcShapeColors(newState:object):void {
        var croppedLineages:string[][] = newState["croppedLineages"] == undefined ? this.state.croppedLineages : newState["croppedLineages"];
        var croppedLineages:string[][] = JSON.parse(JSON.stringify(croppedLineages));
        var taxonSpecifics = newState["taxonSpecifics"] == undefined ? this.state.taxonSpecifics : newState["taxonSpecifics"];

        let strokes:string[] = [];
        let colorIndex:number = 0;
        for (let i = 0; i < croppedLineages.length; i++) {
            if (croppedLineages[i].length > 1) {
                let firstAncestor:string = croppedLineages[i][1];
                if (strokes.indexOf(firstAncestor) === -1) {
                    taxonSpecifics[firstAncestor]["fill"] = colors[colorIndex % colors.length];
                    taxonSpecifics[firstAncestor]["stroke"] = skeletonColor;
                    strokes.push(firstAncestor);
                    colorIndex++;
                };

                for (let j = 2; j < croppedLineages[i].length; j++) {
                    let ancestorColor = taxonSpecifics[croppedLineages[i][1]]["fill"];
                    let nextColorIndex = (colors.indexOf(ancestorColor) + 1) % colors.length;
                    let nextColor = colors[nextColorIndex];
                    let selfStartDeg:number = taxonSpecifics[croppedLineages[i][j]]["degrees"][0];
                    let ancestorStartDeg:number = taxonSpecifics[croppedLineages[i][1]]["degrees"][0];
                    let ancestorEndDeg:number = taxonSpecifics[croppedLineages[i][1]]["degrees"][taxonSpecifics[croppedLineages[i][1]]["degrees"].length-1];
                    let coef:number = (selfStartDeg - ancestorStartDeg) / (ancestorEndDeg - ancestorStartDeg);
                    let tintFactor:number = (taxonSpecifics[croppedLineages[i][j]]["firstLayerAligned"] - 1) / 10;
                    var hue = midColor(ancestorColor, nextColor, coef);
                    var tintifiedHue = tintify(hue, tintFactor);
                    taxonSpecifics[croppedLineages[i][j]]["fill"] = tintifiedHue;
                    taxonSpecifics[croppedLineages[i][j]]["stroke"] = skeletonColor;
                };
            };
        };

        taxonSpecifics[croppedLineages[0][0]]["fill"] = "white";
        taxonSpecifics[croppedLineages[0][0]]["stroke"] = skeletonColor;
        this.setState(newState);
    };

    placeLabels(alreadyRepeated:boolean = this.state.alreadyRepeated) {
        let newTaxonSpecifics:object = JSON.parse(JSON.stringify(this.state.taxonSpecifics));
        let height:number = 0;
        for (let key of Object.keys(newTaxonSpecifics)) {
            let center = newTaxonSpecifics[key]["center"];
            let label = newTaxonSpecifics[key]["label"];
            let labelElement:any = document.getElementById(`${key}_-_${newTaxonSpecifics[key]["firstLayerUnaligned"]}-label`)!;
            let hoverLabelElement:any = document.getElementById(`${key}_-_${newTaxonSpecifics[key]["firstLayerUnaligned"]}-hoverLabel`)!;
            height = !alreadyRepeated ? labelElement.getBoundingClientRect().height / 2 : this.state.height;
            let width = labelElement.getBoundingClientRect().width;
            let hoverWidth = hoverLabelElement.getBoundingClientRect().width;
            let angle = label["angle"];
            let centerDegree:number = center[2];
            let transformOrigin = `${center[0]} ${center[1]}`;
            let top = center[1] + height/2;
            let left, radialLeft, horizontalSpace, abbreviation, howManyLettersFit, hoverLeft, hoverRadialLeft;

            // Calculate left and angle for all labels of the last layer, which are always radial.
            if (label["direction"] === "radial") {
                if (centerDegree >= 180 && centerDegree < 360) {
                    left = hoverLeft = center[0];
                    angle = 360 - (270 - angle);    
                }
                else if (centerDegree >= 0 && centerDegree <= 180) {
                    left = center[0] - width;
                    hoverLeft = center[0] - hoverWidth;
                    angle = 270 - angle;
                };

                abbreviation = label["abbreviation"];
                let sliceHere:number = round(((this.state.numberOfLayers - newTaxonSpecifics[key]["firstLayerAligned"]) + 1) * this.state.layerWidth / viewportDimensions["2vmin"] * 2.3)
                if (label["abbreviation"].length > sliceHere) {
                    abbreviation = abbreviation.slice(0, sliceHere) + "...";
                };
            }

            // For internal wedges, calculate: 
            else if (label["direction"] === "verse") {
                left = center[0] - width/2;
                hoverLeft = center[0] - hoverWidth/2;
                let radialAngle = label["radialAngle"];

                // The circumferential space of the wedge (1).
                let topBeforeRotation = center[1] - height/2;
                let bottomBeforeRotation = center[1] + height/2;
                let leftBeforeRotation = left;
                let rightBeforeRotation = left + width;
                let fourPoints = getFourCorners(topBeforeRotation, bottomBeforeRotation, leftBeforeRotation, rightBeforeRotation, center[0], center[1], angle);

                let leftIntersect, rightIntersect;
                if (centerDegree >= 180 && centerDegree < 360) {
                    radialLeft = hoverRadialLeft = center[0];
                    radialAngle = 360 - (270 - radialAngle);
                    
                    // (1)
                    leftIntersect = lineIntersect(viewportDimensions["cx"], viewportDimensions["cy"], center[3], center[4], fourPoints["bottomLeft"][0], fourPoints["bottomLeft"][1], fourPoints["bottomRight"][0], fourPoints["bottomRight"][1])!
                    rightIntersect = lineIntersect(viewportDimensions["cx"], viewportDimensions["cy"], center[5], center[6], fourPoints["bottomLeft"][0], fourPoints["bottomLeft"][1], fourPoints["bottomRight"][0], fourPoints["bottomRight"][1])!
                }
                else if (centerDegree >= 0 && centerDegree <= 180) {
                    radialLeft = center[0] - width;
                    hoverRadialLeft = center[0] - hoverWidth;
                    radialAngle = 270 - radialAngle;

                    // (1)
                    leftIntersect = lineIntersect(viewportDimensions["cx"], viewportDimensions["cy"], center[3], center[4], fourPoints["topLeft"][0], fourPoints["topLeft"][1], fourPoints["topRight"][0], fourPoints["topRight"][1])!
                    rightIntersect = lineIntersect(viewportDimensions["cx"], viewportDimensions["cy"], center[5], center[6], fourPoints["topLeft"][0], fourPoints["topLeft"][1], fourPoints["topRight"][0], fourPoints["topRight"][1])!
                }

                // (1)
                if (leftIntersect === null || rightIntersect === null) {
                    horizontalSpace = 0;
                }
                else {
                    horizontalSpace = lineLength(leftIntersect["x"], leftIntersect["y"], rightIntersect["x"], rightIntersect["y"])
                };

                // Calculate radial space.
                let layersCopy = JSON.parse(JSON.stringify(newTaxonSpecifics[key]["layers"]));
                let lastViableLayer = layersCopy.sort(function(a, b){return a-b})[1]
                let pointOnLastLayerX = lastViableLayer * this.state.layerWidth * cos(center[2]);
                pointOnLastLayerX = round(pointOnLastLayerX) + viewportDimensions["cx"];
                let pointOnLastLayerY = - lastViableLayer * this.state.layerWidth * sin(center[2]);
                pointOnLastLayerY = round(pointOnLastLayerY) + viewportDimensions["cy"];
                let verticalSpace = lineLength(center[0], center[1], pointOnLastLayerX, pointOnLastLayerY);

                // Decide between radial and circumferential.
                let lengthPerLetter = width/label["abbreviation"].length;
                if (verticalSpace > horizontalSpace) {
                    left = radialLeft;
                    hoverLeft = hoverRadialLeft;
                    angle = radialAngle;
                    howManyLettersFit = Math.floor(verticalSpace/lengthPerLetter) - 2;
                    
                }
                else {
                    howManyLettersFit = Math.floor(horizontalSpace/lengthPerLetter) - 2 > 0 ? Math.floor(horizontalSpace/lengthPerLetter) - 2 : 0;
                };
                abbreviation = label["abbreviation"].slice(0, howManyLettersFit);
            }

            // Calculations for root shape in the center.
            else {
                top = viewportDimensions["cy"] + height/2;
                left = center[0] - width/2;
                hoverLeft = center[0] - hoverWidth/2;
                transformOrigin = "";

                let lengthPerLetter = width/label["abbreviation"].length;
                howManyLettersFit = Math.floor(this.state.layerWidth*2/lengthPerLetter) - 2 > 0 ? Math.floor(this.state.layerWidth*2/lengthPerLetter) - 2 : 0;
                abbreviation = label["abbreviation"].slice(0, howManyLettersFit);
            };

            // Decide if the label should be hidden due to being too short, and if a dot is needed.
            abbreviation = abbreviation.indexOf(".") >= 0 || !(label["fullLabel"].split(" ")[0][howManyLettersFit]) ? abbreviation : abbreviation + ".";
            label["abbreviation"] = abbreviation;
            if (label["abbreviation"].length < 4) {
                label["abbreviation"] = "";
                label["display"] = "none"; 
            };

            // Check one time if, after all the calculations, the abbreviated label indeed fits its shape. If not, set its display to none.
            let fourPoints = getFourCorners((top-height)-2, top+2, left-2, left+width+2, newTaxonSpecifics[key]["center"][0], newTaxonSpecifics[key]["center"][1], angle);
            let bottomLeft = document.querySelector("svg")!.createSVGPoint();
            bottomLeft.x = fourPoints!["bottomLeft"][0];
            bottomLeft.y = fourPoints!["bottomLeft"][1];

            let bottomRight = document.querySelector("svg")!.createSVGPoint();
            bottomRight.x = fourPoints!["bottomRight"][0];
            bottomRight.y = fourPoints!["bottomRight"][1];

            let topLeft = document.querySelector("svg")!.createSVGPoint();
            topLeft.x = fourPoints!["topLeft"][0];
            topLeft.y = fourPoints!["topLeft"][1];

            let topRight = document.querySelector("svg")!.createSVGPoint();
            topRight.x = fourPoints!["topRight"][0];
            topRight.y = fourPoints!["topRight"][1];

            let shape:any = document.getElementById(`${key}_-_${this.state.taxonSpecifics[key]["firstLayerUnaligned"]}`)!;

            if (alreadyRepeated && (label["direction"] === "verse" || label["direction"] === "horizontal")) {
                if (!(shape.isPointInFill(bottomLeft) && shape.isPointInFill(topLeft) && shape.isPointInFill(bottomRight) && shape.isPointInFill(topRight))) {
                    label["display"] = "none"; 
                };
            } 
            else if (alreadyRepeated && label["direction"] === "radial") {
                if (!((shape.isPointInFill(bottomLeft) && shape.isPointInFill(topLeft)) || (shape.isPointInFill(bottomRight) && shape.isPointInFill(topRight)))) {
                    label["display"] = "none"; 
                };
            };

            label["top"] = top;
            label["transformOrigin"] = transformOrigin;
            label["left"] = left;
            label["transform"] = !alreadyRepeated ? `rotate(0)` : `rotate(${angle} ${transformOrigin})`;

            if (!alreadyRepeated) {
                label["hoverLeft"] = hoverLeft;
                label["hoverDisplay"] = "none";
                label["hoverWidth"] = hoverWidth;
            };
        }

        if (!alreadyRepeated) {
            this.setState({taxonSpecifics: newTaxonSpecifics, alreadyRepeated: true, height: height})
        }
        else {
            this.setState({taxonSpecifics: newTaxonSpecifics, labelsPlaced: true})
        };  
    };

    handleClick(shapeId, e):void {
        let taxon:string = typeof e.detail === "object" ? e.detail.taxName : e.target.getAttribute("data-taxname");
        let rank:string = typeof e.detail === "object" ? e.detail.taxRank : e.target.getAttribute("data-taxrank");
        let nextLayer;
        if (taxon.includes("&")) {
            nextLayer = originalAllTaxaReduced[taxon.split(" & ")[0]]["lineageNames"].length-1;
        }
        else {
            nextLayer = originalAllTaxaReduced[taxon]["lineageNames"].length-1;
        };
        (window as any).clickTaxsun2External(taxon, rank);
        if (taxon !== this.state.root) this.cropLineages(taxon, nextLayer, this.state.alteration, this.state.collapse);
    };

    render() {
        let plotId;
        if (this.state.plotEValue) {
            plotId = fileName + originalAllTaxaReduced["root"]["totalCount"] + this.state.root + this.state.layer + this.state.collapse + this.state.alteration + this.state.plotEValue + eThreshold + " " + viewportDimensions["cx"] + viewportDimensions["cy"];
        }
        else {
            plotId = fileName + originalAllTaxaReduced["root"]["totalCount"] + this.state.root + this.state.layer + this.state.collapse + this.state.alteration + this.state.plotEValue + " " + viewportDimensions["cx"] + viewportDimensions["cy"];
        };
        if (Object.keys(alreadyVisited).indexOf(plotId) === -1 && this.state.numberOfLayers !== -1) {
            alreadyVisited[plotId] = JSON.parse(JSON.stringify(this.state));
            alreadyVisited[plotId]["abbreviateLabels"] = false;
        };

        var shapes:any = [];
        var labels:any = [];
        var ancestors:any = [];
        var clipPaths:any = [];
        let tS:object = this.state.taxonSpecifics;
        let tSkeys = Object.keys(tS);
        for (let item of tSkeys) {
            let id:string = `${item}_-_${tS[item]["firstLayerUnaligned"]}`;
            let redirectTo:string = tS[item]["layers"][0] === 0 ? `${this.state.ancestors[this.state.ancestors.length - 1]}_-_0` : id;

            shapes.push(<TaxonShape key={id} id={id} abbr={tS[item]["label"]["abbreviation"]} taxName = {redirectTo.split("_-_")[0]} taxRank = {tS[item]["rank"]} onClick={(event) => this.handleClick(redirectTo, event)} d={tS[item]["svgPath"]} onContextMenu={(e) => {showContextMenu(e)}} strokeWidth={viewportDimensions["dpmm"] * 0.265} fillColor={tS[item]["fill"]} labelOpacity={tS[item]["label"]["opacity"]} labelDisplay={tS[item]["label"]["display"]} fullLabel={tS[item]["label"]["fullLabel"]} stroke={tS[item]["stroke"]} transformOrigin={tS[item]["label"]["transformOrigin"]} root={this.state.root}/>);
            if (tS[item]["married"]) {
                clipPaths.push(<path key={`clippath-${id}`} d={tS[item]["svgPath"]}/>)
            }
        }
        
        for (let item of tSkeys) {
            let id:string = `${item}_-_${tS[item]["firstLayerUnaligned"]}`;
            let redirectTo:string = tS[item]["layers"][0] === 0 ? `${this.state.ancestors[this.state.ancestors.length - 1]}_-_0` : id;
            let label = <TaxonLabel key={`${id}-label`} id={`${id}-label`} abbr={tS[item]["label"]["abbreviation"]} taxName = {redirectTo.split("_-_")[0]} taxRank = {tS[item]["rank"]} transform={tS[item]["label"]["transform"]} left={tS[item]["label"]["left"]} top={tS[item]["label"]["top"]} opacity={tS[item]["label"]["opacity"]} labelDisplay={tS[item]["label"]["display"]} display={tS[item]["label"]["display"]} onClick={(event) => {this.handleClick(redirectTo, event)}} fullLabel={tS[item]["label"]["fullLabel"]} fontWeight="normal" root={this.state.root}/>;

            labels.push(label);
        };

        for (let item of tSkeys) {
            let id:string = `${item}_-_${tS[item]["firstLayerUnaligned"]}`;
            let redirectTo:string = tS[item]["layers"][0] === 0 ? `${this.state.ancestors[this.state.ancestors.length - 1]}_-_0` : id;

            let labelBackground = <LabelBackground key={`${id}-labelBackground`} id={`${id}-labelBackground`} taxName = {redirectTo.split("_-_")[0]} taxRank = {tS[item]["rank"]} transform={tS[item]["label"]["transform"]} left={tS[item]["label"]["hoverLeft"]-4} top={(tS[item]["label"]["top"]-this.state.height) - 4} selfDisplay="none" labelDisplay={tS[item]["label"]["display"]} onClick={(event) => {this.handleClick(redirectTo, event)}} fullLabel={tS[item]["label"]["fullLabel"]} height={this.state.height+8} width={tS[item]["label"]["hoverWidth"]+8} stroke="#800080" fill="#ffffff" root={this.state.root}/>

            let hoverLabel = <TaxonLabel key={`${id}-hoverLabel`} id={`${id}-hoverLabel`} abbr={tS[item]["label"]["fullLabel"]} taxName = {redirectTo.split("_-_")[0]} taxRank = {tS[item]["rank"]} transform={tS[item]["label"]["transform"]} left={tS[item]["label"]["hoverLeft"]} top={tS[item]["label"]["top"]} opacity={tS[item]["label"]["opacity"]} labelDisplay={tS[item]["label"]["display"]} display={tS[item]["label"]["hoverDisplay"]} onContextMenu={(e) => {showContextMenu(e)}} onClick={(event) => {this.handleClick(redirectTo, event)}} fullLabel={tS[item]["label"]["fullLabel"]} fontWeight="bold" root={this.state.root}/>;
            labels.push(labelBackground);
            labels.push(hoverLabel);
        };

        let anc:any[] = JSON.parse(JSON.stringify(this.state.ancestors)).reverse();
        let ancRanks:any[] = JSON.parse(JSON.stringify(this.state.ancestorRanks)).reverse();

        return [<svg key={"svg"} xmlns="http://www.w3.org/2000/svg" style={{"margin": "0", "padding": "0", "boxSizing": "border-box", "border": "none"}} id="shapes">{shapes} {labels}<clipPath key={"clipPath"} id="mask">{clipPaths}</clipPath></svg>,<div key={"div-ancestors"} id="ancestors">{ancestors}</div>,<div key={"left-column"} id="left-column"><AncestorSection key={"ancestor-section"} ancestors={anc} root={this.state.root} layer={this.state.layer} plotEValue={this.state.plotEValue} ancestorRanks = {ancRanks} onClickArray={anc.map((self, index) => (event) => {this.handleClick(`${self}_-_${-index}`, event)})}/><DescendantSection key={"descendant-section"} self="Felinae" layer={0} ancestor="Felidae" hovered={true}/></div>]
    }
}

function TaxonShape(props) {
    return <path id={props.id} data-taxname={props.taxName} data-taxrank={props.taxRank} label-display={props.labelDisplay} className="hoverable-object" d={props.d} onMouseOver={(e) => hoverHandler(props.id, props.fullLabel, props.root, e)} onMouseOut={(e) => onMouseOutHandler(props.id, props.labelDisplay, e)} onClick={props.onClick} onContextMenu={props.onContextMenu} style={{"stroke": props.stroke, "strokeWidth": "0.2vmin", "fill": props.fillColor}}/>;
};

function TaxonLabel(props) {
    return <text data-taxname={props.taxName} data-taxrank={props.taxRank} className="hoverable-object" x={props.left} y={props.top} transform={props.transform} transform-origin={props.transformOrigin} id={props.id} onMouseOver={(e) => hoverHandler(props.id, props.fullLabel, props.root, e)} onMouseOut={(e) => onMouseOutHandler(props.id, props.labelDisplay, e)} onClick={props.onClick} onContextMenu={(e) => {showContextMenu(e)}} style={{"margin": "0", "padding": "0", "lineHeight": "2vmin", "position": "fixed", "fontFamily": "calibri", "fontSize": "2vmin", "transformOrigin": props.transformOrigin, "fill": "#800080", "opacity": props.opacity, "display": props.display, "fontWeight": props.fontWeight}}>{props.abbr}</text>
};

function LabelBackground(props) {
    if (props.top) {
        return <rect data-taxname={props.taxName} data-taxrank={props.taxRank} className="hoverable-object" x={props.left} y={props.top} height={props.height} width={props.width} transform={props.transform} transform-origin={props.transformOrigin} id={props.id} onMouseOver={(e) => hoverHandler(props.id, props.fullLabel, props.root, e)} onMouseOut={(e) => onMouseOutHandler(props.id, props.labelDisplay, e)} onClick={props.onClick} fill={props.fill} stroke={props.stroke} style={{"position": "fixed", "display": props.selfDisplay, "strokeWidth":"0.2vmin"}}/>
    }
    else { return null; };
};

//addEventListener("mousemove", (event) => handleMouseMove(event));

export {PlotDrawing}