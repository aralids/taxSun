"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _a, _b;
exports.__esModule = true;
exports.PlotDrawing = void 0;
var React = require("react");
var predefinedObjects_js_1 = require("./predefinedObjects.js");
var helperFunctions_js_1 = require("./helperFunctions.js");
/* ===== VARIABLE DECLARATIONS/DEFINITIONS - all of which will ideally become either a prop or a part of the state of PlotDrawing. ===== */
var fileName = "lessSpontaneous2.tsv";
var taxonName = "Bacteria";
var layerName = 1;
var collapseName = "collapseFalse";
var modeName = "allEqual";
var skeletonColor = "#800080";
var viewportDimensions = (0, helperFunctions_js_1.getViewportDimensions)();
var alreadyVisited = {};
var eThreshold = null;
var newDataLoaded = false;
var headerSeqObject = {};
var allTaxa = predefinedObjects_js_1.at;
var lineagesNames = predefinedObjects_js_1.ln;
var lineagesRanks = predefinedObjects_js_1.lr;
var allTaxaReduced = JSON.parse(JSON.stringify(predefinedObjects_js_1.atr));
var originalAllTaxaReduced = JSON.parse(JSON.stringify(predefinedObjects_js_1.atr));
var rankPatternFull = ["root", "superkingdom", "kingdom", "subkingdom", "superphylum", "phylum", "subphylum", "superclass", "class", "subclass", "superorder", "order", "suborder", "superfamily", "family", "subfamily", "supergenus", "genus", "subgenus", "superspecies", "species"];
var colorOffset;
var colors = (0, helperFunctions_js_1.createPalette)();
var aTRKeys = Object.keys(allTaxaReduced);
var descendants = {};
for (var _i = 0, aTRKeys_1 = aTRKeys; _i < aTRKeys_1.length; _i++) {
    var taxName = aTRKeys_1[_i];
    var lineage = allTaxaReduced[taxName]["lineageNames"];
    for (var _c = 0, lineage_1 = lineage; _c < lineage_1.length; _c++) {
        var predecessor = lineage_1[_c];
        if (!descendants[predecessor[1]]) {
            descendants[predecessor[1]] = [taxName];
        }
        else {
            descendants[predecessor[1]].push(taxName);
        }
        ;
    }
    ;
}
;
/* ===== EVENT LISTENERS ===== */
document.addEventListener("click", function () { (0, helperFunctions_js_1.hideContextMenu)(); });
/**
 * Get the gene identifiers that correspond to the right-clicked taxon shape, and copy them to clipboard.
 * @param  {boolean} copyAll Copy all sequences instead of just unspecified ones.
 * @return {void}
 */
function copy2clipboard(copyAll) {
    if (copyAll === void 0) { copyAll = false; }
    // Get the name of the clicked taxon.
    var name = document.getElementById("context-menu")
        .getAttribute("taxon")
        .split("_-_")[0];
    // Put the identifiers of all genes with appropriate e-value (if filtering was applied)
    // associated with the current taxon in the array seqIDsArray.
    var seqIDsArray = [];
    if (!allTaxaReduced[name]["successfulIndices"]) {
        seqIDsArray = allTaxaReduced[name]["geneNames"];
    }
    else {
        seqIDsArray = allTaxaReduced[name]["successfulIndices"].map(function (item) { return allTaxaReduced[name]["geneNames"][item]; });
    }
    ;
    // If all gene identifiers and not just the current taxon's own unspecified ones are required,
    // add the gene identifiers of the DESCENDANTS of the current taxon to seqIDsArray.
    // Again, only considering the ones with appropriate e-value.
    if (copyAll) {
        var _loop_1 = function (child) {
            if (!allTaxaReduced[child]["successfulIndices"]) {
                seqIDsArray = seqIDsArray.concat(allTaxaReduced[child]["geneNames"]);
            }
            else {
                seqIDsArray = seqIDsArray.concat(allTaxaReduced[child]["successfulIndices"].map(function (item) { return allTaxaReduced[child]["geneNames"][item]; }));
            }
        };
        for (var _i = 0, _a = allTaxaReduced[name]["descendants"]; _i < _a.length; _i++) {
            var child = _a[_i];
            _loop_1(child);
        }
        ;
    }
    ;
    navigator.clipboard.writeText(seqIDsArray.join(" "));
}
;
document.getElementById("copy").addEventListener("click", function () {
    copy2clipboard();
});
document.getElementById("copy-all").addEventListener("click", function () {
    copy2clipboard(true);
});
document.getElementById("download-seq").addEventListener("click", function () {
    var name = document.getElementById("context-menu").getAttribute("taxon").split("_-_")[0];
    var seqIDsArray = [];
    if (!allTaxaReduced[name]["successfulIndices"]) {
        seqIDsArray = allTaxaReduced[name]["fastaHeaders"].map(function (item, index) { return [item, allTaxaReduced[name]["eValues"][index], name, (0, helperFunctions_js_1.findRealName)(index, allTaxaReduced[name]["names"], name)]; });
    }
    else {
        seqIDsArray = allTaxaReduced[name]["successfulIndices"].map(function (item) { return [allTaxaReduced[name]["fastaHeaders"][item], allTaxaReduced[name]["eValues"][item], name, (0, helperFunctions_js_1.findRealName)(item, allTaxaReduced[name]["names"], name)]; });
    }
    ;
    var seqsArray = seqIDsArray.map(function (item) {
        if (!headerSeqObject[item[0]]) {
            console.log("missing item: ", item);
        }
        else {
            var thirdElement = item[2] === item[3] ? item[2] : "".concat(item[2], " (").concat(item[3], ")");
            return "*** ".concat(item[0], " ").concat(item[1], " ").concat(thirdElement, "\n").concat(headerSeqObject[item[0]], "\n");
        }
        ;
    });
    var eInput = document.getElementById("e-input");
    var firstLines;
    if (eInput.checked) {
        firstLines = "".concat(name, " | ").concat(allTaxaReduced[name]["rank"], " | filtered by e-value: ").concat(eThreshold, "\n\n");
    }
    else {
        firstLines = "".concat(name, " | ").concat(allTaxaReduced[name]["rank"], " | filtered by e-value: no\n\n");
    }
    ;
    seqsArray = __spreadArray([firstLines], seqsArray, true);
    var seqsFile = seqsArray.join("\n");
    var a = document.createElement('a');
    var e = new MouseEvent('click');
    a.download = "test.tsv";
    a.href = 'data:text/tab-separated-values,' + encodeURIComponent(seqsFile);
    a.dispatchEvent(e);
});
document.getElementById("download-all-seq").addEventListener("click", function () {
    var name = document.getElementById("context-menu").getAttribute("taxon").split("_-_")[0];
    var seqIDsArray = [];
    if (!allTaxaReduced[name]["successfulIndices"]) {
        seqIDsArray = allTaxaReduced[name]["fastaHeaders"].map(function (item, index) { return [item, allTaxaReduced[name]["eValues"][index], name, (0, helperFunctions_js_1.findRealName)(index, allTaxaReduced[name]["names"], name)]; });
    }
    else {
        seqIDsArray = allTaxaReduced[name]["successfulIndices"].map(function (item) { return [allTaxaReduced[name]["fastaHeaders"][item], allTaxaReduced[name]["eValues"][item], name, (0, helperFunctions_js_1.findRealName)(item, allTaxaReduced[name]["names"], name)]; });
    }
    var _loop_2 = function (child) {
        if (!allTaxaReduced[child]["successfulIndices"]) {
            seqIDsArray = seqIDsArray.concat(allTaxaReduced[child]["fastaHeaders"].map(function (item, index) { return [item, allTaxaReduced[child]["eValues"][index], child, (0, helperFunctions_js_1.findRealName)(index, allTaxaReduced[child]["names"], child)]; }));
        }
        else {
            seqIDsArray = seqIDsArray.concat(allTaxaReduced[child]["successfulIndices"].map(function (item) { return [allTaxaReduced[child]["fastaHeaders"][item], allTaxaReduced[child]["eValues"][item], child, (0, helperFunctions_js_1.findRealName)(item, allTaxaReduced[child]["names"], child)]; }));
        }
    };
    for (var _i = 0, _a = allTaxaReduced[name]["descendants"]; _i < _a.length; _i++) {
        var child = _a[_i];
        _loop_2(child);
    }
    var seqsArray = seqIDsArray.map(function (item) {
        if (!headerSeqObject[item[0]]) {
            console.log("missing item: ", item);
        }
        else {
            var thirdElement = item[2] === item[3] ? item[2] : "".concat(item[2], " (").concat(item[3], ")");
            return "*** ".concat(item[0], " ").concat(item[1], " ").concat(thirdElement, "\n").concat(headerSeqObject[item[0]], "\n");
        }
        ;
    });
    var eInput = document.getElementById("e-input");
    var firstLines;
    if (eInput.checked) {
        firstLines = "".concat(name, " | ").concat(allTaxaReduced[name]["rank"], " | filtered by e-value: ").concat(eThreshold, "\n\n");
    }
    else {
        firstLines = "".concat(name, " | ").concat(allTaxaReduced[name]["rank"], " | filtered by e-value: no\n\n");
    }
    ;
    seqsArray = __spreadArray([firstLines], seqsArray, true);
    var seqsFile = seqsArray.join("\n");
    var a = document.createElement('a');
    var e = new MouseEvent('click');
    a.download = "test.tsv";
    a.href = 'data:text/tab-separated-values,' + encodeURIComponent(seqsFile);
    a.dispatchEvent(e);
});
(_a = document.getElementById("file")) === null || _a === void 0 ? void 0 : _a.addEventListener("change", function () {
    var fileInput = document.getElementById("file");
    fileName = fileInput.files[0].name;
    document.getElementById("status").innerHTML = "pending";
    var uploadForm = document.getElementById("uploadForm");
    var form_data = new FormData(uploadForm);
    $.ajax({
        url: '/load_tsv_data',
        data: form_data,
        type: 'POST',
        processData: false,
        contentType: false,
        success: function (response) {
            lineagesNames = response["lineagesNames"];
            lineagesRanks = response["lineagesRanks"];
            allTaxaReduced = JSON.parse(JSON.stringify(response["allTaxaReduced"]));
            console.log("allTaxaReduced: ", allTaxaReduced);
            originalAllTaxaReduced = JSON.parse(JSON.stringify(response["allTaxaReduced"]));
            rankPatternFull = response["rankPatternFull"];
            allTaxa = response["allTaxa"];
            colorOffset = response["offset"];
            eThreshold = response["median"];
            var enableFastaUpload = response["fastaHeaderIncluded"];
            if (eThreshold) {
                (0, helperFunctions_js_1.enableEValue)(eThreshold);
            }
            else {
                (0, helperFunctions_js_1.disableEValue)();
            }
            ;
            if (enableFastaUpload) {
                document.getElementById("fasta-file").removeAttribute("disabled");
            }
            else {
                (0, helperFunctions_js_1.disableEValue)();
                document.getElementById("fasta-file").setAttribute("disabled", "disabled");
                document.getElementById("status").innerHTML = "";
            }
            ;
            var newData = document.getElementById("new-data");
            newData.checked = true;
            document.getElementById("status").innerHTML = "check";
            var evt = new CustomEvent('change');
            newData.dispatchEvent(evt);
            newDataLoaded = true;
        },
        error: function (response) {
            console.log("ERROR", response);
            document.getElementById("status").innerHTML = "close";
        }
    });
});
(_b = document.getElementById("fasta-file")) === null || _b === void 0 ? void 0 : _b.addEventListener("change", function () {
    var fileInput = document.getElementById("fasta-file");
    fileName = fileInput.files[0].name;
    document.getElementById("fasta-status").innerHTML = "pending";
    var uploadForm = document.getElementById("uploadForm");
    var form_data = new FormData(uploadForm);
    $.ajax({
        url: '/load_fasta_data',
        data: form_data,
        type: 'POST',
        processData: false,
        contentType: false,
        success: function (response) {
            document.getElementById("fasta-status").innerHTML = "check";
            headerSeqObject = response["headerSeqObject"];
        },
        error: function (response) {
            console.log("ERROR", response);
            document.getElementById("fasta-status").innerHTML = "close";
        }
    });
});
document.getElementById("download").addEventListener("click", function () {
    (0, helperFunctions_js_1.downloadSVGasTextFile)(fileName, taxonName, layerName, modeName, collapseName);
});
document.addEventListener("mousemove", function (e) {
    var target = e.target;
    if (!target.classList.contains("hoverable-object") && !target.classList.contains("taxsun-interactee")) {
        document.getElementById("descendant-section").setAttribute('value', "");
        var evt = new CustomEvent('change');
        document.getElementById("descendant-section").dispatchEvent(evt);
    }
    ;
});
/* ===== DEFINITIONS OF THE REACT COMPONENTS: AncestorSection, DescendantSection, PlotDrawing ===== */
var AncestorSection = /** @class */ (function (_super) {
    __extends(AncestorSection, _super);
    function AncestorSection(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            root: "",
            layer: -1,
            rank: "",
            totalCount: 0,
            unassignedCount: 0,
            lines: [],
            plotEValue: false,
            eThresholdHere: eThreshold
        };
        return _this;
    }
    ;
    AncestorSection.prototype.componentDidUpdate = function () {
        if ((this.props.root !== this.state.root) ||
            (this.props.plotEValue !== this.state.plotEValue) ||
            (eThreshold !== this.state.eThresholdHere) ||
            newDataLoaded) {
            newDataLoaded = false;
            this.getCounts();
        }
        ;
    };
    ;
    AncestorSection.prototype.changeDiv = function (taxName) {
        var _this = this;
        $.ajax({
            url: '/fetchID',
            data: { "taxName": taxName.replace(RegExp(rankPatternFull.map(function (item) { return " " + item; }).join("|"), "g"), "") },
            type: 'GET',
            success: function (response) {
                var taxID = response["taxID"];
                if (!allTaxaReduced[taxName]) {
                    allTaxaReduced[taxName] = {};
                }
                allTaxaReduced[taxName]["taxID"] = taxID;
                originalAllTaxaReduced[taxName]["taxID"] = taxID;
            },
            error: function (response) {
                console.log("ERROR", response);
                document.getElementById("status").innerHTML = "close";
            }
        }).then(function () { _this.setState(_this.state); });
    };
    ;
    AncestorSection.prototype.getCounts = function () {
        var totalCount = 0;
        var unassignedCount = 0;
        var rank = "";
        if (this.props.root.indexOf("&") > -1) {
            var groupedTaxa = this.props.root.split(" & ");
            for (var _i = 0, groupedTaxa_1 = groupedTaxa; _i < groupedTaxa_1.length; _i++) {
                var taxon = groupedTaxa_1[_i];
                totalCount += allTaxaReduced[taxon]["totalCount"];
            }
            ;
            unassignedCount = 0;
            rank = allTaxaReduced[groupedTaxa[0]]["rank"];
        }
        else {
            totalCount = allTaxaReduced[this.props.root]["totalCount"];
            unassignedCount = allTaxaReduced[this.props.root]["unassignedCount"];
            rank = allTaxaReduced[this.props.root]["rank"];
        }
        ;
        var lines = this.props.ancestors.map(function (item) {
            return ("".concat((0, helperFunctions_js_1.round)(totalCount * 100 / allTaxaReduced[item]["totalCount"], 2), "%"));
        });
        this.setState({ totalCount: totalCount,
            unassignedCount: unassignedCount,
            root: this.props.root,
            layer: this.props.layer,
            lines: lines,
            rank: rank,
            plotEValue: this.props.plotEValue,
            eThresholdHere: eThreshold });
    };
    ;
    AncestorSection.prototype.render = function () {
        var _this = this;
        var rootNameNoRank = this.state.root.replace(RegExp(rankPatternFull.map(function (item) { return " " + item; }).join("|"), "g"), "");
        var firstLine = React.createElement("legend", { key: "legend", style: { "color": "#800080", "fontWeight": "bold" } }, "CURRENT LAYER");
        var nameLine = React.createElement("p", { key: "nameLine", className: "mp-zero" },
            "Taxon: ",
            React.createElement("b", null, rootNameNoRank));
        var rankLine = React.createElement("p", { key: "rankLine", className: "mp-zero" },
            "Rank: ",
            React.createElement("b", null, this.state.rank));
        var totalCountLine = React.createElement("p", { key: "totalCountLine", className: "mp-zero" },
            "Total count: ",
            React.createElement("b", null, this.state.totalCount));
        var unassignedCountLine = React.createElement("p", { key: "unassignedCountLine", className: "mp-zero" },
            "Unspecified ",
            rootNameNoRank,
            ": ",
            React.createElement("b", null, this.state.unassignedCount));
        var beforePreprocessing = allTaxa[this.state.root] ? allTaxa[this.state.root]["unassignedCount"] : 0;
        var bPLine = React.createElement("p", { key: "bPLine", className: "mp-zero" },
            "(raw file: ",
            React.createElement("b", null, beforePreprocessing),
            ")");
        var id = allTaxaReduced[this.state.root] ? allTaxaReduced[this.state.root]["taxID"] : "1";
        var taxIDline;
        if (id) {
            taxIDline = React.createElement("div", { key: "taxIDline", id: "taxID-div", className: "mp-zero-pb-not" },
                React.createElement("p", { className: "mp-zero" },
                    "taxID: ",
                    React.createElement("a", { style: { "display": "inline" }, target: "_blank", href: "https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=".concat(id, "&lvl=3&lin=f&keep=1&srchmode=1&unlock") }, id)));
        }
        else {
            taxIDline = React.createElement("div", { key: "taxIDline", id: "taxID-div", className: "mp-zero-pb-not" },
                React.createElement("p", { className: "mp-zero" },
                    "taxID: ",
                    React.createElement("button", { onClick: function () { return _this.changeDiv(_this.state.root); }, id: "fetch-id-button" }, "FETCH")));
        }
        ;
        var ps = [firstLine, nameLine, rankLine, totalCountLine, unassignedCountLine, bPLine, taxIDline];
        if (this.props.root.indexOf("&") > -1) {
            bPLine = React.createElement("p", { key: "bPLine", className: "mp-zero-pb-not" },
                "(raw file: ",
                React.createElement("b", null, beforePreprocessing),
                ")");
            ps = [firstLine, nameLine, rankLine, totalCountLine, unassignedCountLine, bPLine];
        }
        else if (this.props.root === "root") {
            ps.pop();
        }
        ;
        for (var i = 0; i < this.props.ancestors.length; i++) {
            var ancNameNoRank = this.props.ancestors[i].replace(RegExp(rankPatternFull.map(function (item) { return " " + item; }).join("|"), "g"), "");
            ps.push(React.createElement("p", { key: "ps-".concat(i), "data-taxname": ancNameNoRank, "data-taxrank": this.props.ancestorRanks[i], className: "mp-zero", style: { "cursor": "pointer", "wordBreak": "break-all" }, onClick: this.props.onClickArray[i] },
                this.state.lines[i],
                " of ",
                React.createElement("b", { "data-taxname": ancNameNoRank, "data-taxrank": this.props.ancestorRanks[i] }, ancNameNoRank)));
        }
        ;
        return React.createElement("fieldset", null, ps);
    };
    ;
    return AncestorSection;
}(React.Component));
;
var DescendantSection = /** @class */ (function (_super) {
    __extends(DescendantSection, _super);
    function DescendantSection(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            self: "",
            layer: -1,
            rank: "",
            totalCount: 0,
            unassignedCount: 0,
            percentage: 0,
            hovered: false
        };
        return _this;
    }
    ;
    DescendantSection.prototype.componentDidMount = function () {
        var _this = this;
        var _a;
        (_a = document.getElementById("descendant-section")) === null || _a === void 0 ? void 0 : _a.addEventListener("change", function () {
            var el = document.getElementById("descendant-section");
            var values;
            var self;
            var layer;
            var ancestor;
            var hovered;
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
            }
            ;
            if (!(_this.state.self === self)) {
                _this.calculateParams(self, layer, ancestor, hovered);
            }
            ;
        });
    };
    ;
    DescendantSection.prototype.calculateParams = function (self, layer, ancestor, hovered) {
        if (hovered) {
            var totalCount = 0;
            var unassignedCount = 0;
            var rank = void 0;
            if (self.indexOf("&") > -1) {
                var groupedTaxa = self.split(" & ");
                for (var _i = 0, groupedTaxa_2 = groupedTaxa; _i < groupedTaxa_2.length; _i++) {
                    var taxon = groupedTaxa_2[_i];
                    totalCount += allTaxaReduced[taxon]["totalCount"];
                }
                ;
                unassignedCount = 0;
                rank = allTaxaReduced[groupedTaxa[0]]["rank"];
            }
            else {
                totalCount = allTaxaReduced[self]["totalCount"];
                unassignedCount = allTaxaReduced[self]["unassignedCount"];
                rank = allTaxaReduced[self]["rank"];
            }
            ;
            var percentage = totalCount * 100 / allTaxaReduced[ancestor]["totalCount"];
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
        }
        ;
    };
    ;
    DescendantSection.prototype.render = function () {
        var ps = [];
        if (this.state.hovered) {
            var selfNameNoRank = this.state.self.replace(RegExp(rankPatternFull.map(function (item) { return " " + item; }).join("|"), "g"), "");
            var firstLine = React.createElement("legend", { key: "firstLine", style: { "color": "#800080", "fontWeight": "bold" } }, "HOVERING OVER");
            var nameLine = React.createElement("p", { key: "nameLine", className: "mp-zero" },
                "Taxon: ",
                React.createElement("b", null, selfNameNoRank));
            var rankLine = React.createElement("p", { key: "rankLine", className: "mp-zero" },
                "Rank: ",
                React.createElement("b", null, this.state.rank));
            var totalCountLine = React.createElement("p", { key: "totalCountLine", className: "mp-zero" },
                "Total count: ",
                React.createElement("b", null, this.state.totalCount));
            var unassignedCountLine = React.createElement("p", { key: "unassignedCountLine", className: "mp-zero" },
                "Unassigned ",
                selfNameNoRank,
                ": ",
                React.createElement("b", null, this.state.unassignedCount));
            ps = [firstLine, nameLine, rankLine, totalCountLine, unassignedCountLine];
            return React.createElement("fieldset", { id: "hovering-over" }, ps);
        }
        ;
        return React.createElement("div", null);
    };
    ;
    return DescendantSection;
}(React.Component));
;
var PlotDrawing = /** @class */ (function (_super) {
    __extends(PlotDrawing, _super);
    function PlotDrawing(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
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
            colors: colors,
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
        };
        return _this;
    }
    PlotDrawing.prototype.componentDidMount = function () {
        var _this = this;
        // Once everything is initialized, calculate plot.
        this.cropLineages();
        // Recalculate plot on window resize.
        addEventListener("resize", function () {
            viewportDimensions = (0, helperFunctions_js_1.getViewportDimensions)();
            _this.cropLineages();
        });
        // Recalculate plot when user changes settings - radio button, checkboxes, new file.
        document.getElementById("radio-input").addEventListener("change", function () {
            var alteration = document.querySelector('input[name="radio"]:checked').getAttribute("id");
            _this.cropLineages(_this.state.root, _this.state.layer, alteration, _this.state.collapse);
        });
        document.getElementById("checkbox-input").addEventListener("change", function () {
            var element = document.getElementById("checkbox-input");
            var checked = element.checked;
            _this.cropLineages(_this.state.root, _this.state.layer, _this.state.alteration, checked);
        });
        document.getElementById("e-input").addEventListener("change", function () {
            var element = document.getElementById("e-input");
            var checked = element.checked;
            _this.cropLineages(_this.state.root, _this.state.layer, _this.state.alteration, _this.state.collapse, checked);
        });
        document.getElementById("new-data").addEventListener("change", function () {
            var newData = document.getElementById("new-data");
            var collapsed = document.getElementById("checkbox-input");
            var currentAlteration = document.querySelector('input[name="radio"]:checked');
            var allEqual = document.getElementById("allEqual");
            var eFilter = document.getElementById("e-input");
            newData.checked = false;
            collapsed.checked = false;
            currentAlteration.checked = false;
            allEqual.checked = true;
            eFilter.checked = false;
            colors = (0, helperFunctions_js_1.createPalette)(colorOffset);
            _this.cropLineages("root", 0, "allEqual", false, false, lineagesNames, lineagesRanks);
        });
        document.getElementById("e-text").addEventListener("keyup", function (_a) {
            var key = _a.key;
            var eInput = document.getElementById("e-input");
            if (key === "Enter") {
                var el = document.getElementById("e-text");
                var value = parseFloat(el.value);
                if (eInput.checked) {
                    eThreshold = value;
                    _this.cropLineages();
                }
                else {
                    eThreshold = value;
                }
                ;
            }
            ;
        });
    };
    ;
    PlotDrawing.prototype.componentDidUpdate = function () {
        if (!this.state.labelsPlaced) {
            this.placeLabels();
        }
        ;
    };
    ;
    // Leave only relevant lineages and crop them if necessary.
    PlotDrawing.prototype.cropLineages = function (root, layer, alteration, collapse, plotEValue, lineages, ranks) {
        if (root === void 0) { root = this.state.root; }
        if (layer === void 0) { layer = this.state.layer; }
        if (alteration === void 0) { alteration = this.state.alteration; }
        if (collapse === void 0) { collapse = this.state.collapse; }
        if (plotEValue === void 0) { plotEValue = this.state.plotEValue; }
        if (lineages === void 0) { lineages = lineagesNames; }
        if (ranks === void 0) { ranks = lineagesRanks; }
        // Change some variables, so that if the plot is dowlnoaded as SVG, the file name reflects all settings.
        taxonName = root.slice(0, 10);
        layerName = layer;
        modeName = alteration;
        collapseName = "collapse" + collapse;
        // If this plot has been calculated before, retrieve it from storage.
        var currPlotId;
        if (plotEValue) {
            currPlotId = fileName + originalAllTaxaReduced["root"]["totalCount"] + root + layer + collapse + alteration + plotEValue + eThreshold + " " + viewportDimensions["cx"] + viewportDimensions["cy"];
        }
        else {
            currPlotId = fileName + originalAllTaxaReduced["root"]["totalCount"] + root + layer + collapse + alteration + plotEValue + " " + viewportDimensions["cx"] + viewportDimensions["cy"];
        }
        if (Object.keys(alreadyVisited).indexOf(currPlotId) > -1) {
            this.setState(alreadyVisited[currPlotId]);
            return;
        }
        ;
        // Reset the object with all taxon data.
        allTaxaReduced = JSON.parse(JSON.stringify(originalAllTaxaReduced));
        // Get only relevant lineages.
        // Iterate over all lineages and filter out the ones that do not contain any of the root taxa.
        var rootTaxa = root.split(" & ");
        var croppedLineages = [];
        var croppedRanks = [];
        for (var i = 0; i < lineages.length; i++) {
            if (rootTaxa.indexOf(lineages[i][layer]) > -1) {
                croppedLineages.push(lineages[i]);
                croppedRanks.push(ranks[i]);
            }
            ;
        }
        ;
        // Remember the common ancestors of all relevant lineages.
        var ancestors = [""];
        var ancestorRanks = [""];
        if (croppedLineages[0]) {
            ancestors = croppedLineages[0].slice(0, layer);
            ancestorRanks = croppedRanks[0].slice(0, layer);
        }
        ;
        // Crop lineages so they start with the first common taxon (root).
        if (rootTaxa.length > 1) {
            croppedLineages = croppedLineages.map(function (item) { return item.slice(layer - 1); });
            croppedRanks = croppedRanks.map(function (item) { return item.slice(layer - 1); });
        }
        else {
            croppedLineages = croppedLineages.map(function (item) { return item.slice(layer); });
            croppedRanks = croppedRanks.map(function (item) { return item.slice(layer); });
        }
        ;
        // Filter by e-value if required.
        if (plotEValue) {
            var modified = this.filterByEValue(croppedLineages, croppedRanks);
            var minEValue = modified[2];
            if (eThreshold < minEValue) {
                eThreshold = minEValue;
                var eText = document.getElementById("e-text");
                eText.value = minEValue;
                modified = this.filterByEValue(croppedLineages, croppedRanks);
            }
            ;
            croppedLineages = modified[0], croppedRanks = modified[1];
        }
        ;
        // Get minimal rank pattern for this particular plot to prepare for alignment.
        var ranksUnique = croppedRanks.reduce(function (accumulator, value) { return accumulator.concat(value); }, []);
        ranksUnique = ranksUnique.filter(function (value, index, self) { return Boolean(value) && self.indexOf(value) === index; });
        var rankPattern = rankPatternFull.filter(function (item) { return ranksUnique.indexOf(item) > -1; });
        // Mary taxa if necessary.
        var changedLineages = [];
        if (alteration.startsWith("marriedTaxa")) {
            var cropped = this.marryTaxa(croppedLineages, croppedRanks, alteration);
            croppedLineages = cropped[0];
            croppedRanks = cropped[1];
            changedLineages = cropped[2];
        }
        ;
        // Fixes the problem with the root label of married plots.
        croppedLineages = croppedLineages.map(function (item) { item.splice(0, 1, root); return item; });
        // Collapse lineages if necessary.
        if (collapse) {
            var arr = this.collapse(croppedLineages, croppedRanks);
            croppedLineages = arr[0];
            croppedRanks = arr[1];
        }
        ;
        // Align cropped lineages by adding null as placeholder for missing ranks.
        var alignedCroppedLineages = [];
        var alignedCropppedRanks = [];
        for (var i = 0; i < croppedLineages.length; i++) {
            var alignedLineage = new Array(rankPattern.length).fill(null);
            var alignedRank = new Array(rankPattern.length).fill(null);
            for (var j = 0; j < croppedRanks[i].length; j++) {
                var index = rankPattern.indexOf(croppedRanks[i][j]);
                if (index > -1) {
                    alignedLineage.splice(index, 1, croppedLineages[i][j]);
                    alignedRank.splice(index, 1, croppedRanks[i][j]);
                }
                ;
            }
            ;
            alignedCroppedLineages.push(alignedLineage);
            alignedCropppedRanks.push(alignedRank);
        }
        ;
        // Save in state object taxonSpecifics.
        var taxonSpecifics = {};
        for (var i = 0; i < croppedLineages.length; i++) {
            var taxName = croppedLineages[i][croppedLineages[i].length - 1];
            taxonSpecifics[taxName] = {};
            taxonSpecifics[taxName]["rank"] = croppedRanks[i][croppedRanks[i].length - 1];
            taxonSpecifics[taxName]["croppedLineage"] = croppedLineages[i];
            taxonSpecifics[taxName]["alignedCroppedLineage"] = alignedCroppedLineages[i];
            taxonSpecifics[taxName]["firstLayerUnaligned"] = croppedLineages[i].length - 1;
            taxonSpecifics[taxName]["firstLayerAligned"] = alignedCroppedLineages[i].indexOf(taxName);
            if (changedLineages[i] || taxName.includes("&")) {
                var taxa = taxName.split(" & ");
                var unassignedCount = taxa.map(function (item) { return allTaxaReduced[item]["totalCount"]; }).reduce(function (accumulator, value) { return accumulator + value; }, 0);
                taxonSpecifics[taxName]["unassignedCount"] = unassignedCount;
                taxonSpecifics[taxName]["totalCount"] = unassignedCount;
                taxonSpecifics[taxName]["married"] = true;
            }
            else {
                taxonSpecifics[taxName]["unassignedCount"] = allTaxaReduced[taxName].unassignedCount;
                taxonSpecifics[taxName]["totalCount"] = allTaxaReduced[taxName]["totalCount"];
            }
            ;
        }
        ;
        // Get sum of all unassigned counts.
        var totalUnassignedCount = 0;
        if (root.indexOf("&") > -1) {
            for (var _i = 0, _a = Object.keys(taxonSpecifics); _i < _a.length; _i++) {
                var taxName = _a[_i];
                totalUnassignedCount += taxonSpecifics[taxName]["unassignedCount"];
            }
            ;
            allTaxaReduced[root] = totalUnassignedCount;
        }
        else {
            totalUnassignedCount = allTaxaReduced[root]["totalCount"];
        }
        ;
        // Make all lineages take up the same amount of degrees in the plot if necessary.
        if (alteration === "allEqual") {
            for (var _b = 0, _c = Object.keys(taxonSpecifics); _b < _c.length; _b++) {
                var taxName = _c[_b];
                taxonSpecifics[taxName]["unassignedCount"] = 1;
            }
            ;
        }
        ;
        for (var i = 0; i < croppedLineages.length; i++) {
            for (var j = croppedLineages[i].length - 2; j >= 0; j--) {
                if (!taxonSpecifics[croppedLineages[i][j]]) {
                    taxonSpecifics[croppedLineages[i][j]] = {};
                    taxonSpecifics[croppedLineages[i][j]]["rank"] = croppedRanks[i][j];
                    taxonSpecifics[croppedLineages[i][j]]["croppedLineage"] = croppedLineages[i].slice(0, j + 1);
                    var index = alignedCroppedLineages[i].indexOf(croppedLineages[i][j]);
                    taxonSpecifics[croppedLineages[i][j]]["alignedCroppedLineage"] = alignedCroppedLineages[i].slice(0, index + 1);
                    taxonSpecifics[croppedLineages[i][j]]["unassignedCount"] = 0;
                    taxonSpecifics[croppedLineages[i][j]]["totalCount"] = allTaxaReduced[croppedLineages[i][j]]["totalCount"];
                    taxonSpecifics[croppedLineages[i][j]]["firstLayerUnaligned"] = j;
                    taxonSpecifics[croppedLineages[i][j]]["firstLayerAligned"] = index;
                }
                ;
            }
            ;
        }
        ;
        // Continue onto the next step if one or more lineages fulfill the criteria.
        if (croppedLineages.length >= 1) {
            this.assignDegrees({ "root": root, "layer": layer, "rankPattern": rankPattern,
                "taxonSpecifics": taxonSpecifics, "croppedLineages": croppedLineages,
                "alignedCroppedLineages": alignedCroppedLineages, "ancestors": ancestors,
                "alteration": alteration, "collapse": collapse, "ancestorRanks": ancestorRanks,
                "totalUnassignedCount": totalUnassignedCount, count: 0, "abbreviateLabels": true,
                "labelsPlaced": false, "alreadyRepeated": false, "plotEValue": plotEValue });
        }
        ;
    };
    ;
    // If collapse=true, remove taxa that only come up in the lineage of one other taxon and have no unassigned counts of their own.
    PlotDrawing.prototype.collapse = function (croppedLineages, croppedRanks) {
        var lineagesCopy = JSON.parse(JSON.stringify(croppedLineages));
        var ranksCopy = JSON.parse(JSON.stringify(croppedRanks));
        var layers = (0, helperFunctions_js_1.getLayers)(lineagesCopy);
        var _loop_3 = function (i) {
            var _loop_4 = function (j) {
                if (layers[i].filter(function (item) { return item === layers[i][j]; }).length === 1 && Boolean(layers[i + 1][j])) {
                    lineagesCopy[j].splice(i, 1, "toBeDeleted");
                    ranksCopy[j].splice(i, 1, "toBeDeleted");
                }
                ;
            };
            for (var j = 0; j < layers[i].length; j++) {
                _loop_4(j);
            }
            ;
        };
        for (var i = 0; i < layers.length - 1; i++) {
            _loop_3(i);
        }
        ;
        for (var i = 0; i < lineagesCopy.length; i++) {
            lineagesCopy[i] = lineagesCopy[i].filter(function (item) { return item !== "toBeDeleted"; });
            ranksCopy[i] = ranksCopy[i].filter(function (item) { return item !== "toBeDeleted"; });
        }
        ;
        return [lineagesCopy, ranksCopy];
    };
    ;
    PlotDrawing.prototype.filterByEValue = function (croppedLineages, croppedRanks) {
        var allEValues = [];
        var newCroppedLineages = JSON.parse(JSON.stringify(croppedLineages));
        var newCroppedRanks = JSON.parse(JSON.stringify(croppedRanks));
        var _loop_5 = function (i) {
            var lineage = croppedLineages[i];
            var lastTaxon = lineage[lineage.length - 1];
            var oldUnassignedCount = originalAllTaxaReduced[lastTaxon]["unassignedCount"];
            // For every cropped lineage, store the /"eValues"/ indices of its occurrences with permissible e-value.
            // The array where we store these indices is called successfulIndices.
            var successfulIndices = [];
            var eValues = originalAllTaxaReduced[lastTaxon]["eValues"].filter(function (item, index) {
                if (item <= eThreshold) {
                    successfulIndices.push(index);
                }
                ;
                return item <= eThreshold;
            });
            allTaxaReduced[lastTaxon]["successfulIndices"] = successfulIndices;
            // Update the unassignedCount of every relevant unspecified taxon except "root".
            var newUnassignedCount = eValues.length;
            if (lastTaxon !== "root") {
                allTaxaReduced[lastTaxon]["unassignedCount"] = newUnassignedCount;
            }
            ;
            // Update the totalCount of every taxon except unspecified "root".
            var diff = oldUnassignedCount - newUnassignedCount;
            for (var _i = 0, lineage_2 = lineage; _i < lineage_2.length; _i++) {
                var taxon = lineage_2[_i];
                if (!(taxon === lastTaxon && lastTaxon === "root")) {
                    allTaxaReduced[taxon]["totalCount"] -= diff;
                }
                ;
            }
            ;
            // If some unspecified taxon has 0 occurrences with permissible e-values,
            // remove it from the list.
            if (newUnassignedCount === 0) {
                newCroppedLineages.splice(i, 1);
                newCroppedRanks.splice(i, 1);
            }
            ;
            allEValues = allEValues.concat(originalAllTaxaReduced[lastTaxon]["eValues"]);
        };
        for (var i = croppedLineages.length - 1; i >= 0; i--) {
            _loop_5(i);
        }
        ;
        var minEValue = allEValues.sort(function (a, b) { return a - b; })[0];
        return [newCroppedLineages, newCroppedRanks, minEValue];
    };
    ;
    PlotDrawing.prototype.marryTaxa = function (croppedLineages, croppedRanks, alteration) {
        if (alteration === void 0) { alteration = "marriedTaxaI"; }
        // Set threshold for marrying. Currently fixed at 2%.
        var threshold = 0.02;
        // Get the sum of unassigned counts.
        var totalUnassignedCounts = 0;
        for (var _i = 0, croppedLineages_1 = croppedLineages; _i < croppedLineages_1.length; _i++) {
            var lineage = croppedLineages_1[_i];
            totalUnassignedCounts += allTaxaReduced[lineage[lineage.length - 1]]["unassignedCount"];
        }
        ;
        // Find all lineages that make up <2% of the whole. 
        // Crop them so that they end in the most specific taxon >= 2 %.
        // Put them in an array called reducibleLineages. 
        var reducibleLineages = [];
        for (var _a = 0, croppedLineages_2 = croppedLineages; _a < croppedLineages_2.length; _a++) {
            var lineage = croppedLineages_2[_a];
            // If the last wedge of the current lineage is too thin...
            if (allTaxaReduced[lineage[lineage.length - 1]]["totalCount"] / totalUnassignedCounts < threshold) {
                var lineageIndex = croppedLineages.indexOf(lineage);
                var lastWayTooThinLayer = lineage.length - 1;
                // ...find the furthest parent that is also too thin.
                for (var i = lineage.length - 2; i >= 0; i--) {
                    if (allTaxaReduced[lineage[i]]["totalCount"] / totalUnassignedCounts >= threshold) {
                        lastWayTooThinLayer = i + 1;
                        break;
                    }
                    ;
                }
                ;
                var partialLineage = lineage.slice(0, lastWayTooThinLayer);
                reducibleLineages.push([lineageIndex, partialLineage]);
            }
            ;
        }
        ;
        // Viewing mode "Married taxa I" puts all wedges with the same ancestry
        // (the same partialLineage) under the same property name in the object reductionGroups.
        // Their common name is composed by concatenating the names of the first less-than-2%
        // taxa in each lineage.
        var reductionGroups = {};
        if (alteration === "marriedTaxaI") {
            for (var _b = 0, reducibleLineages_1 = reducibleLineages; _b < reducibleLineages_1.length; _b++) {
                var item = reducibleLineages_1[_b];
                if (!reductionGroups[item[1].join("")]) {
                    reductionGroups[item[1].join("")] = {};
                    reductionGroups[item[1].join("")]["spliceAt"] = item[1].length;
                    reductionGroups[item[1].join("")]["index"] = [item[0]];
                    reductionGroups[item[1].join("")]["commonName"] = croppedLineages[item[0]][item[1].length];
                }
                else {
                    reductionGroups[item[1].join("")]["index"].push(item[0]);
                    var taxa = reductionGroups[item[1].join("")]["commonName"].split(" & ");
                    if (taxa.indexOf(croppedLineages[item[0]][item[1].length]) === -1) {
                        reductionGroups[item[1].join("")]["commonName"] += " & ".concat(croppedLineages[item[0]][item[1].length]);
                    }
                    ;
                }
                ;
            }
            ;
        }
        // Viewing mode "Married taxa II" puts wedges with the same ancestry together
        // until the combined wedge reaches the threshold. If there are more with the 
        // same ancestry, they will be combined into another wedge.
        else {
            // Put all wedges with the same ancestry under the same property name in reducibleLineages.
            for (var _c = 0, reducibleLineages_2 = reducibleLineages; _c < reducibleLineages_2.length; _c++) {
                var item = reducibleLineages_2[_c];
                if (!reductionGroups[item[1].join("")]) {
                    reductionGroups[item[1].join("")] = {};
                    reductionGroups[item[1].join("")]["spliceAt"] = item[1].length;
                    reductionGroups[item[1].join("")]["index"] = [item[0]];
                }
                else {
                    reductionGroups[item[1].join("")]["index"].push(item[0]);
                }
                ;
            }
            ;
            var _loop_6 = function (group) {
                var spliceAt = reductionGroups[group]["spliceAt"];
                reductionGroups[group]["index"].sort(function (index1, index2) { return allTaxaReduced[croppedLineages[index1][spliceAt]]["totalCount"] - allTaxaReduced[croppedLineages[index2][spliceAt]]["totalCount"]; });
                // In each reduction group, replace lineage indices with the names of the first too-small taxa.
                // The resulting array is called renameables.
                // For each unique item in renameables, create a key in temporaryObject.
                // The key will contain a list of all indices of lineages whose first too-small taxa have the same name.
                var renameables = reductionGroups[group]["index"].map(function (item) { return croppedLineages[item][spliceAt]; });
                var temporaryObject = {};
                for (var i = 0; i < renameables.length; i++) {
                    var renameable = renameables[i];
                    if (!temporaryObject[renameable]) {
                        temporaryObject[renameable] = [reductionGroups[group]["index"][i]];
                    }
                    else {
                        temporaryObject[renameable].push(reductionGroups[group]["index"][i]);
                    }
                    ;
                }
                ;
                // Use temporaryObject to create permanentObject, in which every key is a lineage index,
                // every value is the name of its first too-small taxon.
                // Add permanentObject to the reduction group as its "reference".
                // minimalIndexArrat contains all indices in the group ordered by size of the wedge.
                var permanentObject = {};
                for (var _p = 0, _q = Object.keys(temporaryObject); _p < _q.length; _p++) {
                    var key = _q[_p];
                    permanentObject[temporaryObject[key][0]] = temporaryObject[key];
                }
                ;
                reductionGroups[group]["references"] = permanentObject;
                reductionGroups[group]["minimalIndexArray"] = Object.keys(permanentObject).sort(function (index1, index2) {
                    return allTaxaReduced[croppedLineages[index1][spliceAt]]["totalCount"] - allTaxaReduced[croppedLineages[index2][spliceAt]]["totalCount"];
                });
            };
            // Sort indices of reduction groups by size in ascending order,
            // group some of them together if they are in the same subgroup.
            for (var _d = 0, _e = Object.keys(reductionGroups); _d < _e.length; _d++) {
                var group = _e[_d];
                _loop_6(group);
            }
            ;
            var _loop_7 = function (group) {
                var minimalIndexArray = reductionGroups[group]["minimalIndexArray"].map(function (item) { return parseInt(item); });
                var indexBeginning = 0;
                var indexEnd = minimalIndexArray.length - 1;
                var addNext = "indexBeginning";
                var sum = 0;
                var newIndexGroup = [];
                var newGroups = [];
                var iterations = minimalIndexArray.length % 2 === 0 ? minimalIndexArray.length / 2 : Math.floor(minimalIndexArray.length / 2) + 1;
                var spliceAt = reductionGroups[group]["spliceAt"];
                // To create a single wedge from a group (multiple wedges might be needed),
                // combine a the smallest wedge with the biggest and remove them from the group.
                // Continue building up the same wedge the same way until the threshold is reached.
                // Then start a new wedge if needed.
                // newIndexGroup holds the indices of the current wedge.
                // newGroups holds every newIndexGroup for this reduction group.
                while ((minimalIndexArray.length % 2 === 0 && indexBeginning <= iterations && (minimalIndexArray.length - 1) - indexEnd < iterations) ||
                    (minimalIndexArray.length % 2 === 1 && indexBeginning !== iterations && (minimalIndexArray.length - 1) - indexEnd < iterations)) {
                    if (addNext === "indexBeginning") {
                        var newIndex = minimalIndexArray[indexBeginning];
                        newIndexGroup.push(newIndex);
                        var totalCount = allTaxaReduced[croppedLineages[newIndex][spliceAt]]["totalCount"];
                        var additive = totalCount / totalUnassignedCounts;
                        sum += additive;
                        addNext = "indexEnd";
                        indexBeginning++;
                    }
                    else {
                        var newIndex = minimalIndexArray[indexEnd];
                        newIndexGroup.push(newIndex);
                        var totalCount = allTaxaReduced[croppedLineages[newIndex][spliceAt]]["totalCount"];
                        var additive = totalCount / totalUnassignedCounts;
                        sum += additive;
                        addNext = "indexBeginning";
                        indexEnd--;
                    }
                    ;
                    if (sum >= threshold) {
                        newGroups.push(newIndexGroup);
                        newIndexGroup = [];
                        sum = 0;
                    }
                    ;
                }
                ;
                // Add the last newIndexGroup to its newGroups array, unless it's empty.
                if (newIndexGroup.length !== 0) {
                    if (newGroups.length === 0) {
                        newGroups = [[]];
                    }
                    ;
                    var lastGroup = newGroups[newGroups.length - 1];
                    lastGroup.splice.apply(lastGroup, __spreadArray([lastGroup.length, 0], newIndexGroup, false));
                }
                ;
                // Replace each index in each newIndexGroup with the name 
                // of the first too-small taxon in the lineage with this index.
                // Each element in the array reductionGroups[group]["newGroups"]
                // is an array of names which will form a single wedge.
                newGroups = newGroups.map(function (item) { return item.map(function (item1) { return reductionGroups[group]["references"][item1]; }); });
                newGroups = newGroups.map(function (item) { return item.reduce(function (accumulator, value) { return accumulator.concat(value); }, []); });
                reductionGroups[group]["newGroups"] = newGroups;
            };
            for (var _f = 0, _g = Object.keys(reductionGroups); _f < _g.length; _f++) {
                var group = _g[_f];
                _loop_7(group);
            }
            ;
            // Reconfigure reductionGroups where each key holds the information for a single wedge.
            // The name of the wedge is calculated here.
            var newReductionGroups = {};
            var _loop_8 = function (group) {
                for (var i = 0; i < reductionGroups[group]["newGroups"].length; i++) {
                    newReductionGroups["".concat(group, "-").concat(i)] = {};
                    newReductionGroups["".concat(group, "-").concat(i)]["spliceAt"] = reductionGroups[group]["spliceAt"];
                    newReductionGroups["".concat(group, "-").concat(i)]["index"] = reductionGroups[group]["newGroups"][i];
                    names = reductionGroups[group]["newGroups"][i].map(function (item) { return croppedLineages[item][reductionGroups[group]["spliceAt"]]; }).filter(function (v, i, a) { return a.indexOf(v) === i; });
                    newReductionGroups["".concat(group, "-").concat(i)]["commonName"] = names.join(" & ");
                }
                ;
            };
            var names;
            for (var _h = 0, _j = Object.keys(reductionGroups); _h < _j.length; _h++) {
                var group = _j[_h];
                _loop_8(group);
            }
            ;
            reductionGroups = newReductionGroups;
        }
        ;
        // Crop lineages and ranks to start with common ancestry and end with the married name.
        var changedLineages = new Array(croppedLineages.length).fill(false);
        for (var _k = 0, _l = Object.keys(reductionGroups).filter(function (item) { return reductionGroups[item]["index"].length > 1; }); _k < _l.length; _k++) {
            var group = _l[_k];
            for (var _m = 0, _o = reductionGroups[group]["index"]; _m < _o.length; _m++) {
                var index = _o[_m];
                croppedLineages[index].splice(reductionGroups[group]["spliceAt"], croppedLineages[index].length - reductionGroups[group]["spliceAt"], reductionGroups[group]["commonName"]);
                croppedRanks[index].splice(reductionGroups[group]["spliceAt"] + 1);
                changedLineages.splice(index, 1, true);
            }
            ;
        }
        ;
        // Remove duplicates from the married lineages.
        for (var i = croppedLineages.length - 1; i >= 0; i--) {
            var croppedLineageCopy = croppedLineages.map(function (item) { return JSON.stringify(item); });
            var lineage = croppedLineageCopy[i];
            var lastIndex = i;
            var firstIndex = croppedLineageCopy.indexOf(lineage);
            if (firstIndex !== lastIndex) {
                croppedLineages.splice(lastIndex, 1);
                croppedRanks.splice(lastIndex, 1);
                changedLineages.splice(lastIndex, 1);
            }
            ;
        }
        ;
        return [croppedLineages, croppedRanks, changedLineages];
    };
    ;
    // Assign each cropped lineage a start and end degree.
    PlotDrawing.prototype.assignDegrees = function (newState) {
        var alignedCroppedLineages = newState["alignedCroppedLineages"];
        var croppedLineages = newState["croppedLineages"];
        var taxonSpecifics = newState["taxonSpecifics"];
        var totalUnassignedCounts = 0;
        if (newState["alteration"] === "allEqual") {
            for (var _i = 0, _a = Object.keys(taxonSpecifics).filter(function (item) { return taxonSpecifics[item]["unassignedCount"] !== 0; }); _i < _a.length; _i++) {
                var taxName = _a[_i];
                totalUnassignedCounts += taxonSpecifics[taxName]["unassignedCount"];
            }
            ;
        }
        else {
            var totalUnassignedCounts = newState["totalUnassignedCount"];
        }
        ;
        // For each taxon, calculate what layer it starts and ends in, and its start and end degrees.
        // ranges:object contains taxa names as keys and their layer and degree ranges as values.
        var ranges = {};
        var startDeg = 0;
        for (var i = 0; i < croppedLineages.length; i++) {
            for (var j = 0; j < croppedLineages[i].length; j++) {
                var currentTaxon = croppedLineages[i][j];
                var alignedIndex = taxonSpecifics[currentTaxon]["firstLayerAligned"];
                // Determine first layers and degrees.
                // Every taxon starts at its firstLayerAligned UNLESS
                // its parent is the root taxon but there are missing ranks in between -
                // in which case starts at its firstLayerUnaligned, which is layer 1.
                if (!ranges[currentTaxon]) {
                    ranges[currentTaxon] = {};
                    var firstLayer = taxonSpecifics[currentTaxon]["firstLayerUnaligned"] === 1 ? 1 : alignedIndex;
                    ranges[currentTaxon]["layers"] = [firstLayer];
                    ranges[currentTaxon]["degrees"] = [startDeg];
                }
                ;
                // Determine the last layer (for the current lineage - next iteration might be for the same taxon,
                // but different lineage and a different last layer, but the first layer is the same for both).
                // If there is a rank gap between the current taxon and the next one, the current taxon fills it.
                var lastLayer = void 0;
                if (j === croppedLineages[i].length - 1) {
                    lastLayer = alignedCroppedLineages[0].length;
                }
                else {
                    lastLayer = alignedCroppedLineages[i].indexOf(croppedLineages[i][j + 1]);
                }
                ;
                ranges[currentTaxon]["layers"].push(lastLayer);
                ranges[currentTaxon]["degrees"].push(startDeg + (taxonSpecifics[croppedLineages[i][croppedLineages[i].length - 1]]["unassignedCount"] * 360) / totalUnassignedCounts);
            }
            ;
            startDeg += (taxonSpecifics[croppedLineages[i][croppedLineages[i].length - 1]]["unassignedCount"] * 360) / totalUnassignedCounts;
        }
        ;
        // For each taxon, uniquify its "layers" array and adjust "degrees" accordingly.
        for (var _b = 0, _c = Object.keys(ranges); _b < _c.length; _b++) {
            var taxName = _c[_b];
            for (var i = ranges[taxName]["layers"].length - 1; i >= 1; i--) {
                if (ranges[taxName]["layers"][i] === ranges[taxName]["layers"][i - 1]) {
                    ranges[taxName]["degrees"][i - 1] = ranges[taxName]["degrees"][i];
                    ranges[taxName]["degrees"].splice(i, 1);
                    ranges[taxName]["layers"].splice(i, 1);
                }
                ;
            }
            ;
        }
        ;
        for (var _d = 0, _e = Object.keys(taxonSpecifics); _d < _e.length; _d++) {
            var taxName = _e[_d];
            taxonSpecifics[taxName]["layers"] = ranges[taxName]["layers"];
            taxonSpecifics[taxName]["degrees"] = ranges[taxName]["degrees"];
        }
        ;
        this.calculateSVGPaths(newState);
    };
    ;
    PlotDrawing.prototype.calculateSVGPaths = function (newState) {
        var cx = viewportDimensions["cx"];
        var cy = viewportDimensions["cy"];
        var alignedCroppedLineages = newState["alignedCroppedLineages"];
        var taxonSpecifics = newState["taxonSpecifics"];
        var dpmm = viewportDimensions["dpmm"];
        var numberOfLayers = alignedCroppedLineages[0].length;
        // let smallerDimension:number = Math.min(cx * 0.6, cy); //var smallerDimension:number = Math.min(cx, cy);
        var layerWidth = Math.max(viewportDimensions["smallerDimSize"] / numberOfLayers, dpmm * 1); //var layerWidth:number = Math.max((smallerDimension) / numberOfLayers, dpmm * 1);
        for (var _i = 0, _a = Object.keys(taxonSpecifics); _i < _a.length; _i++) {
            var key = _a[_i];
            var layers = taxonSpecifics[key]["layers"];
            var degrees = taxonSpecifics[key]["degrees"];
            var fstLayer = layers[0];
            var sndLayer = layers[1];
            var startDeg = degrees[0];
            var endDeg = degrees[degrees.length - 1];
            var innRad = (0, helperFunctions_js_1.round)(fstLayer * layerWidth);
            // If the shape to be drawn is the center of the plot (a single circle).
            if (layers[0] === 0) {
                taxonSpecifics[key]["svgPath"] = "M ".concat(cx, ", ").concat(cy, " m -").concat(layerWidth, ", 0 a ").concat(layerWidth, ",").concat(layerWidth, " 0 1,0 ").concat((layerWidth) * 2, ",0 a ").concat(layerWidth, ",").concat(layerWidth, " 0 1,0 -").concat((layerWidth) * 2, ",0");
            }
            // If the shape to be drawn is NOT the center of the plot, but a complex shape.
            else {
                var subpaths = [];
                // If the shape to be drawn completes a full circle...
                if ((0, helperFunctions_js_1.round)(endDeg - startDeg) === 360) {
                    var innerArcPath = "M ".concat(cx, ", ").concat(cy, " m -").concat(innRad, ", 0 a ").concat(innRad, ",").concat(innRad, " 0 1,0 ").concat((innRad) * 2, ",0 a ").concat(innRad, ",").concat(innRad, " 0 1,0 -").concat(innRad * 2, ",0");
                    subpaths = [innerArcPath];
                    // ...and consists simply of two concentric circles.
                    if (layers.length === 2) {
                        var outerCirc = sndLayer * layerWidth;
                        var midArcPath = "M ".concat(cx, ", ").concat(cy, " m -").concat(outerCirc, ", 0 a ").concat(outerCirc, ",").concat(outerCirc, " 0 1,0 ").concat(outerCirc * 2, ",0 a ").concat(outerCirc, ",").concat(outerCirc, " 0 1,0 -").concat(outerCirc * 2, ",0");
                        subpaths.push(midArcPath);
                    }
                    // ...and is of irregular shape.
                    else {
                        var midArc = {};
                        for (var i = layers.length - 1; i >= 1; i--) {
                            var curr = degrees[i];
                            var prev = degrees[i - 1];
                            var MorL = i === layers.length - 1 ? "M" : "L";
                            midArc = (0, helperFunctions_js_1.calculateArcEndpoints)(layers[i], layerWidth, prev, curr, cx, cy);
                            var midArcPath = "".concat(MorL, " ").concat(midArc["x2"], ",").concat(midArc["y2"], " A ").concat(midArc["radius"], ",").concat(midArc["radius"], " 0 0 0 ").concat(midArc["x1"], ",").concat(midArc["y1"]);
                            if (Math.abs(curr - prev) >= 180) {
                                midArcPath = "".concat(MorL, " ").concat(midArc["x2"], ",").concat(midArc["y2"], " A ").concat(midArc["radius"], ",").concat(midArc["radius"], " 0 1 0 ").concat(midArc["x1"], ",").concat(midArc["y1"]);
                            }
                            ;
                            subpaths.push(midArcPath);
                        }
                        ;
                        var lineInnertoOuter = "L ".concat(midArc["x1"], ",").concat(midArc["y1"], " ").concat(cx, ",").concat(cy + layers[layers.length - 1] * layerWidth);
                        subpaths.push(lineInnertoOuter);
                    }
                    ;
                    taxonSpecifics[key]["svgPath"] = subpaths.join(" ");
                }
                // If the shape doesn't complete a full circle.
                else {
                    var innerArc = (0, helperFunctions_js_1.calculateArcEndpoints)(fstLayer, layerWidth, startDeg, endDeg, cx, cy);
                    var innerArcPath = "M ".concat(innerArc["x1"], ",").concat(innerArc["y1"], " A ").concat(innRad, ",").concat(innRad, " 0 0 1 ").concat(innerArc["x2"], ",").concat(innerArc["y2"]);
                    if (Math.abs(endDeg - startDeg) >= 180) {
                        innerArcPath = "M ".concat(innerArc["x1"], ",").concat(innerArc["y1"], " A ").concat(innerArc["radius"], ",").concat(innerArc["radius"], " 0 1 1 ").concat(innerArc["x2"], ",").concat(innerArc["y2"]);
                    }
                    ;
                    var subpaths_1 = [innerArcPath];
                    var midArc = {};
                    for (var i = layers.length - 1; i >= 0; i--) {
                        var curr = degrees[i];
                        var prev = i === 0 ? startDeg : degrees[i - 1];
                        midArc = (0, helperFunctions_js_1.calculateArcEndpoints)(layers[i], layerWidth, prev, curr, cx, cy);
                        var midArcPath = "L ".concat(midArc["x2"], ",").concat(midArc["y2"], " A ").concat(midArc["radius"], ",").concat(midArc["radius"], " 0 0 0 ").concat(midArc["x1"], ",").concat(midArc["y1"]);
                        if (Math.abs(curr - prev) >= 180) {
                            midArcPath = "L ".concat(midArc["x2"], ",").concat(midArc["y2"], " A ").concat(midArc["radius"], ",").concat(midArc["radius"], " 0 1 0 ").concat(midArc["x1"], ",").concat(midArc["y1"]);
                        }
                        ;
                        subpaths_1.push(midArcPath);
                    }
                    ;
                    var lineInnertoOuter = "L ".concat(midArc["x1"], ",").concat(midArc["y1"], " ").concat(innerArc["x1"], ",").concat(innerArc["y1"]);
                    subpaths_1.push(lineInnertoOuter);
                    taxonSpecifics[key]["svgPath"] = subpaths_1.join(" ");
                }
                ;
            }
            ;
        }
        ;
        newState["numberOfLayers"] = numberOfLayers;
        newState["layerWidth"] = layerWidth;
        this.calculateTaxonLabels(newState);
    };
    ;
    PlotDrawing.prototype.calculateTaxonLabels = function (newState) {
        var alignedCroppedLineages = newState["alignedCroppedLineages"];
        var totalUnassignedCount = newState["totalUnassignedCount"];
        var root = newState["root"];
        var taxonSpecifics = newState["taxonSpecifics"];
        var numberOfLayers = alignedCroppedLineages[0].length;
        var cx = viewportDimensions["cx"];
        var cy = viewportDimensions["cy"];
        var layerWidthInPx = Math.max(viewportDimensions["smallerDimSize"] / numberOfLayers, viewportDimensions["dpmm"] * 1); //var layerWidthInPx:number = Math.max((Math.min(cx, cy)) / numberOfLayers , viewportDimensions["dpmm"] * 1);
        for (var _i = 0, _a = Object.keys(taxonSpecifics); _i < _a.length; _i++) {
            var key = _a[_i];
            var startDeg = taxonSpecifics[key]["degrees"][0];
            var endDeg = taxonSpecifics[key]["degrees"][taxonSpecifics[key]["degrees"].length - 1];
            var centerDegree = startDeg + (endDeg - startDeg) / 2;
            var centerRadius = taxonSpecifics[key]["firstLayerAligned"] + 0.333;
            var centerX = (0, helperFunctions_js_1.round)(centerRadius * layerWidthInPx * (0, helperFunctions_js_1.cos)(centerDegree)) + cx;
            var centerY = (0, helperFunctions_js_1.round)(-centerRadius * layerWidthInPx * (0, helperFunctions_js_1.sin)(centerDegree)) + cy;
            var pointOnLeftBorderX = (0, helperFunctions_js_1.round)(centerRadius * layerWidthInPx * (0, helperFunctions_js_1.cos)(startDeg)) + cx;
            var pointOnLeftBorderY = (0, helperFunctions_js_1.round)(-centerRadius * layerWidthInPx * (0, helperFunctions_js_1.sin)(startDeg)) + cy;
            var pointOnRightBorderX = (0, helperFunctions_js_1.round)(centerRadius * layerWidthInPx * (0, helperFunctions_js_1.cos)(endDeg)) + cx;
            var pointOnRightBorderY = (0, helperFunctions_js_1.round)(-centerRadius * layerWidthInPx * (0, helperFunctions_js_1.sin)(endDeg)) + cy;
            var center = [centerX, centerY, centerDegree, pointOnLeftBorderX, pointOnLeftBorderY, pointOnRightBorderX, pointOnRightBorderY];
            taxonSpecifics[key]["center"] = center;
        }
        ;
        for (var _b = 0, _c = Object.keys(taxonSpecifics); _b < _c.length; _b++) {
            var key = _c[_b];
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
                    "abbreviation": root.replace(RegExp(rankPatternFull.map(function (item) { return " " + item; }).join("|"), "g"), ""),
                    "display": "unset",
                    "fullLabel": root.replace(RegExp(rankPatternFull.map(function (item) { return " " + item; }).join("|"), "g"), "")
                };
            }
            else {
                var centerDeg = taxonSpecifics[key]["center"][2];
                var direction = (taxonSpecifics[key]["layers"].length === 2 && taxonSpecifics[key]["layers"][1] === numberOfLayers) ? "radial" : "verse";
                var angle = void 0, radialAngle = void 0;
                if (direction === "radial") {
                    angle = centerDeg <= 180 ? -centerDeg : centerDeg;
                }
                else {
                    angle = (((270 - centerDeg) + 360) % 360) > 180 && (((270 - centerDeg) + 360) % 360 <= 360) ? centerDeg % 360 : (centerDeg + 180) % 360;
                    radialAngle = centerDeg <= 180 ? -centerDeg : centerDeg;
                }
                ;
                var percentage = (0, helperFunctions_js_1.round)((taxonSpecifics[key]["totalCount"] / totalUnassignedCount) * 100);
                taxonSpecifics[key]["label"] = {
                    "direction": direction,
                    "opacity": "1",
                    "left": 0,
                    "hoverLeft": 0,
                    "hoverDisplay": "unset",
                    "hoverWidth": 0,
                    "top": 0,
                    "angle": angle,
                    "abbreviation": key.replace(RegExp(rankPatternFull.map(function (item) { return " " + item; }).join("|"), "g"), ""),
                    "display": "unset",
                    "fullLabel": key.replace(RegExp(rankPatternFull.map(function (item) { return " " + item; }).join("|"), "g"), "") + " ".concat(percentage, "%"),
                    "radialAngle": radialAngle
                };
                if (taxonSpecifics[key]["rank"] === "species") {
                    var abbr = taxonSpecifics[key]["label"]["abbreviation"];
                    if (abbr.split(" ").length >= 2 && !(abbr.split(" ")[1] === "sp.")) {
                        var newAbbr = (abbr.split(" ")[0].slice(0, 1) + ". " + abbr.split(" ").slice(1, abbr.split(" ").length).join(" ")).slice(0, 15);
                        taxonSpecifics[key]["label"]["abbreviation"] = newAbbr;
                    }
                    else if (abbr.split(" ").indexOf("sp.") !== -1) {
                        var newAbbr = (abbr.split(" ").slice(0, abbr.split(" ").indexOf("sp.") + 1).join(" ")).slice(0, 15);
                        taxonSpecifics[key]["label"]["abbreviation"] = newAbbr;
                    }
                    ;
                }
                ;
            }
            ;
        }
        ;
        this.calcShapeColors(newState);
    };
    ;
    PlotDrawing.prototype.calcShapeColors = function (newState) {
        var croppedLineages = newState["croppedLineages"] == undefined ? this.state.croppedLineages : newState["croppedLineages"];
        var croppedLineages = JSON.parse(JSON.stringify(croppedLineages));
        var taxonSpecifics = newState["taxonSpecifics"] == undefined ? this.state.taxonSpecifics : newState["taxonSpecifics"];
        var strokes = [];
        var colorIndex = 0;
        for (var i = 0; i < croppedLineages.length; i++) {
            if (croppedLineages[i].length > 1) {
                var firstAncestor = croppedLineages[i][1];
                if (strokes.indexOf(firstAncestor) === -1) {
                    taxonSpecifics[firstAncestor]["fill"] = colors[colorIndex % colors.length];
                    taxonSpecifics[firstAncestor]["stroke"] = skeletonColor;
                    strokes.push(firstAncestor);
                    colorIndex++;
                }
                ;
                for (var j = 2; j < croppedLineages[i].length; j++) {
                    var ancestorColor = taxonSpecifics[croppedLineages[i][1]]["fill"];
                    var nextColorIndex = (colors.indexOf(ancestorColor) + 1) % colors.length;
                    var nextColor = colors[nextColorIndex];
                    var selfStartDeg = taxonSpecifics[croppedLineages[i][j]]["degrees"][0];
                    var ancestorStartDeg = taxonSpecifics[croppedLineages[i][1]]["degrees"][0];
                    var ancestorEndDeg = taxonSpecifics[croppedLineages[i][1]]["degrees"][taxonSpecifics[croppedLineages[i][1]]["degrees"].length - 1];
                    var coef = (selfStartDeg - ancestorStartDeg) / (ancestorEndDeg - ancestorStartDeg);
                    var tintFactor = (taxonSpecifics[croppedLineages[i][j]]["firstLayerAligned"] - 1) / 10;
                    var hue = (0, helperFunctions_js_1.midColor)(ancestorColor, nextColor, coef);
                    var tintifiedHue = (0, helperFunctions_js_1.tintify)(hue, tintFactor);
                    taxonSpecifics[croppedLineages[i][j]]["fill"] = tintifiedHue;
                    taxonSpecifics[croppedLineages[i][j]]["stroke"] = skeletonColor;
                }
                ;
            }
            ;
        }
        ;
        taxonSpecifics[croppedLineages[0][0]]["fill"] = "white";
        taxonSpecifics[croppedLineages[0][0]]["stroke"] = skeletonColor;
        this.setState(newState);
    };
    ;
    PlotDrawing.prototype.placeLabels = function (alreadyRepeated) {
        if (alreadyRepeated === void 0) { alreadyRepeated = this.state.alreadyRepeated; }
        var newTaxonSpecifics = JSON.parse(JSON.stringify(this.state.taxonSpecifics));
        var height = 0;
        for (var _i = 0, _a = Object.keys(newTaxonSpecifics); _i < _a.length; _i++) {
            var key = _a[_i];
            var center = newTaxonSpecifics[key]["center"];
            var label = newTaxonSpecifics[key]["label"];
            var labelElement = document.getElementById("".concat(key, "_-_").concat(newTaxonSpecifics[key]["firstLayerUnaligned"], "-label"));
            var hoverLabelElement = document.getElementById("".concat(key, "_-_").concat(newTaxonSpecifics[key]["firstLayerUnaligned"], "-hoverLabel"));
            height = !alreadyRepeated ? labelElement.getBoundingClientRect().height / 2 : this.state.height;
            var width = labelElement.getBoundingClientRect().width;
            var hoverWidth = hoverLabelElement.getBoundingClientRect().width;
            var angle = label["angle"];
            var centerDegree = center[2];
            var transformOrigin = "".concat(center[0], " ").concat(center[1]);
            var top_1 = center[1] + height / 2;
            var left = void 0, radialLeft = void 0, horizontalSpace = void 0, abbreviation = void 0, howManyLettersFit = void 0, hoverLeft = void 0, hoverRadialLeft = void 0;
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
                }
                ;
                abbreviation = label["abbreviation"];
                var sliceHere = (0, helperFunctions_js_1.round)(((this.state.numberOfLayers - newTaxonSpecifics[key]["firstLayerAligned"]) + 1) * this.state.layerWidth / viewportDimensions["2vmin"] * 2.3);
                if (label["abbreviation"].length > sliceHere) {
                    abbreviation = abbreviation.slice(0, sliceHere) + "...";
                }
                ;
            }
            // For internal wedges, calculate: 
            else if (label["direction"] === "verse") {
                left = center[0] - width / 2;
                hoverLeft = center[0] - hoverWidth / 2;
                var radialAngle = label["radialAngle"];
                // The circumferential space of the wedge (1).
                var topBeforeRotation = center[1] - height / 2;
                var bottomBeforeRotation = center[1] + height / 2;
                var leftBeforeRotation = left;
                var rightBeforeRotation = left + width;
                var fourPoints_1 = (0, helperFunctions_js_1.getFourCorners)(topBeforeRotation, bottomBeforeRotation, leftBeforeRotation, rightBeforeRotation, center[0], center[1], angle);
                var leftIntersect = void 0, rightIntersect = void 0;
                if (centerDegree >= 180 && centerDegree < 360) {
                    radialLeft = hoverRadialLeft = center[0];
                    radialAngle = 360 - (270 - radialAngle);
                    // (1)
                    leftIntersect = (0, helperFunctions_js_1.lineIntersect)(viewportDimensions["cx"], viewportDimensions["cy"], center[3], center[4], fourPoints_1["bottomLeft"][0], fourPoints_1["bottomLeft"][1], fourPoints_1["bottomRight"][0], fourPoints_1["bottomRight"][1]);
                    rightIntersect = (0, helperFunctions_js_1.lineIntersect)(viewportDimensions["cx"], viewportDimensions["cy"], center[5], center[6], fourPoints_1["bottomLeft"][0], fourPoints_1["bottomLeft"][1], fourPoints_1["bottomRight"][0], fourPoints_1["bottomRight"][1]);
                }
                else if (centerDegree >= 0 && centerDegree <= 180) {
                    radialLeft = center[0] - width;
                    hoverRadialLeft = center[0] - hoverWidth;
                    radialAngle = 270 - radialAngle;
                    // (1)
                    leftIntersect = (0, helperFunctions_js_1.lineIntersect)(viewportDimensions["cx"], viewportDimensions["cy"], center[3], center[4], fourPoints_1["topLeft"][0], fourPoints_1["topLeft"][1], fourPoints_1["topRight"][0], fourPoints_1["topRight"][1]);
                    rightIntersect = (0, helperFunctions_js_1.lineIntersect)(viewportDimensions["cx"], viewportDimensions["cy"], center[5], center[6], fourPoints_1["topLeft"][0], fourPoints_1["topLeft"][1], fourPoints_1["topRight"][0], fourPoints_1["topRight"][1]);
                }
                // (1)
                if (leftIntersect === null || rightIntersect === null) {
                    horizontalSpace = 0;
                }
                else {
                    horizontalSpace = (0, helperFunctions_js_1.lineLength)(leftIntersect["x"], leftIntersect["y"], rightIntersect["x"], rightIntersect["y"]);
                }
                ;
                // Calculate radial space.
                var layersCopy = JSON.parse(JSON.stringify(newTaxonSpecifics[key]["layers"]));
                var lastViableLayer = layersCopy.sort(function (a, b) { return a - b; })[1];
                var pointOnLastLayerX = lastViableLayer * this.state.layerWidth * (0, helperFunctions_js_1.cos)(center[2]);
                pointOnLastLayerX = (0, helperFunctions_js_1.round)(pointOnLastLayerX) + viewportDimensions["cx"];
                var pointOnLastLayerY = -lastViableLayer * this.state.layerWidth * (0, helperFunctions_js_1.sin)(center[2]);
                pointOnLastLayerY = (0, helperFunctions_js_1.round)(pointOnLastLayerY) + viewportDimensions["cy"];
                var verticalSpace = (0, helperFunctions_js_1.lineLength)(center[0], center[1], pointOnLastLayerX, pointOnLastLayerY);
                // Decide between radial and circumferential.
                var lengthPerLetter = width / label["abbreviation"].length;
                if (verticalSpace > horizontalSpace) {
                    left = radialLeft;
                    hoverLeft = hoverRadialLeft;
                    angle = radialAngle;
                    howManyLettersFit = Math.floor(verticalSpace / lengthPerLetter) - 2;
                }
                else {
                    howManyLettersFit = Math.floor(horizontalSpace / lengthPerLetter) - 2 > 0 ? Math.floor(horizontalSpace / lengthPerLetter) - 2 : 0;
                }
                ;
                abbreviation = label["abbreviation"].slice(0, howManyLettersFit);
            }
            // Calculations for root shape in the center.
            else {
                top_1 = viewportDimensions["cy"] + height / 2;
                left = center[0] - width / 2;
                hoverLeft = center[0] - hoverWidth / 2;
                transformOrigin = "";
                var lengthPerLetter = width / label["abbreviation"].length;
                howManyLettersFit = Math.floor(this.state.layerWidth * 2 / lengthPerLetter) - 2 > 0 ? Math.floor(this.state.layerWidth * 2 / lengthPerLetter) - 2 : 0;
                abbreviation = label["abbreviation"].slice(0, howManyLettersFit);
            }
            ;
            // Decide if the label should be hidden due to being too short, and if a dot is needed.
            abbreviation = abbreviation.indexOf(".") >= 0 || !(label["fullLabel"].split(" ")[0][howManyLettersFit]) ? abbreviation : abbreviation + ".";
            label["abbreviation"] = abbreviation;
            if (label["abbreviation"].length < 4) {
                label["abbreviation"] = "";
                label["display"] = "none";
            }
            ;
            // Check one time if, after all the calculations, the abbreviated label indeed fits its shape. If not, set its display to none.
            var fourPoints = (0, helperFunctions_js_1.getFourCorners)((top_1 - height) - 2, top_1 + 2, left - 2, left + width + 2, newTaxonSpecifics[key]["center"][0], newTaxonSpecifics[key]["center"][1], angle);
            var bottomLeft = document.querySelector("svg").createSVGPoint();
            bottomLeft.x = fourPoints["bottomLeft"][0];
            bottomLeft.y = fourPoints["bottomLeft"][1];
            var bottomRight = document.querySelector("svg").createSVGPoint();
            bottomRight.x = fourPoints["bottomRight"][0];
            bottomRight.y = fourPoints["bottomRight"][1];
            var topLeft = document.querySelector("svg").createSVGPoint();
            topLeft.x = fourPoints["topLeft"][0];
            topLeft.y = fourPoints["topLeft"][1];
            var topRight = document.querySelector("svg").createSVGPoint();
            topRight.x = fourPoints["topRight"][0];
            topRight.y = fourPoints["topRight"][1];
            var shape = document.getElementById("".concat(key, "_-_").concat(this.state.taxonSpecifics[key]["firstLayerUnaligned"]));
            if (alreadyRepeated && (label["direction"] === "verse" || label["direction"] === "horizontal")) {
                if (!(shape.isPointInFill(bottomLeft) && shape.isPointInFill(topLeft) && shape.isPointInFill(bottomRight) && shape.isPointInFill(topRight))) {
                    label["display"] = "none";
                }
                ;
            }
            else if (alreadyRepeated && label["direction"] === "radial") {
                if (!((shape.isPointInFill(bottomLeft) && shape.isPointInFill(topLeft)) || (shape.isPointInFill(bottomRight) && shape.isPointInFill(topRight)))) {
                    label["display"] = "none";
                }
                ;
            }
            ;
            label["top"] = top_1;
            label["transformOrigin"] = transformOrigin;
            label["left"] = left;
            label["transform"] = !alreadyRepeated ? "rotate(0)" : "rotate(".concat(angle, " ").concat(transformOrigin, ")");
            if (!alreadyRepeated) {
                label["hoverLeft"] = hoverLeft;
                label["hoverDisplay"] = "none";
                label["hoverWidth"] = hoverWidth;
            }
            ;
        }
        if (!alreadyRepeated) {
            this.setState({ taxonSpecifics: newTaxonSpecifics, alreadyRepeated: true, height: height });
        }
        else {
            this.setState({ taxonSpecifics: newTaxonSpecifics, labelsPlaced: true });
        }
        ;
    };
    ;
    PlotDrawing.prototype.handleClick = function (shapeId, e) {
        var taxon = typeof e.detail === "object" ? e.detail.taxName : e.target.getAttribute("data-taxname");
        var rank = typeof e.detail === "object" ? e.detail.taxRank : e.target.getAttribute("data-taxrank");
        var nextLayer;
        if (taxon.includes("&")) {
            nextLayer = originalAllTaxaReduced[taxon.split(" & ")[0]]["lineageNames"].length - 1;
        }
        else {
            nextLayer = originalAllTaxaReduced[taxon]["lineageNames"].length - 1;
        }
        ;
        window.clickTaxsun2External(taxon, rank);
        if (taxon !== this.state.root)
            this.cropLineages(taxon, nextLayer, this.state.alteration, this.state.collapse);
    };
    ;
    PlotDrawing.prototype.render = function () {
        var _this = this;
        var plotId;
        if (this.state.plotEValue) {
            plotId = fileName + originalAllTaxaReduced["root"]["totalCount"] + this.state.root + this.state.layer + this.state.collapse + this.state.alteration + this.state.plotEValue + eThreshold + " " + viewportDimensions["cx"] + viewportDimensions["cy"];
        }
        else {
            plotId = fileName + originalAllTaxaReduced["root"]["totalCount"] + this.state.root + this.state.layer + this.state.collapse + this.state.alteration + this.state.plotEValue + " " + viewportDimensions["cx"] + viewportDimensions["cy"];
        }
        ;
        if (Object.keys(alreadyVisited).indexOf(plotId) === -1 && this.state.numberOfLayers !== -1) {
            alreadyVisited[plotId] = JSON.parse(JSON.stringify(this.state));
            alreadyVisited[plotId]["abbreviateLabels"] = false;
        }
        ;
        var shapes = [];
        var labels = [];
        var ancestors = [];
        var clipPaths = [];
        var tS = this.state.taxonSpecifics;
        var tSkeys = Object.keys(tS);
        var _loop_9 = function (item) {
            var id = "".concat(item, "_-_").concat(tS[item]["firstLayerUnaligned"]);
            var redirectTo = tS[item]["layers"][0] === 0 ? "".concat(this_1.state.ancestors[this_1.state.ancestors.length - 1], "_-_0") : id;
            shapes.push(React.createElement(TaxonShape, { key: id, id: id, abbr: tS[item]["label"]["abbreviation"], taxName: redirectTo.split("_-_")[0], taxRank: tS[item]["rank"], onClick: function (event) { return _this.handleClick(redirectTo, event); }, d: tS[item]["svgPath"], onContextMenu: function (e) { (0, helperFunctions_js_1.showContextMenu)(e); }, strokeWidth: viewportDimensions["dpmm"] * 0.265, fillColor: tS[item]["fill"], labelOpacity: tS[item]["label"]["opacity"], labelDisplay: tS[item]["label"]["display"], fullLabel: tS[item]["label"]["fullLabel"], stroke: tS[item]["stroke"], transformOrigin: tS[item]["label"]["transformOrigin"], root: this_1.state.root }));
            if (tS[item]["married"]) {
                clipPaths.push(React.createElement("path", { key: "clippath-".concat(id), d: tS[item]["svgPath"] }));
            }
        };
        var this_1 = this;
        for (var _i = 0, tSkeys_1 = tSkeys; _i < tSkeys_1.length; _i++) {
            var item = tSkeys_1[_i];
            _loop_9(item);
        }
        var _loop_10 = function (item) {
            var id = "".concat(item, "_-_").concat(tS[item]["firstLayerUnaligned"]);
            var redirectTo = tS[item]["layers"][0] === 0 ? "".concat(this_2.state.ancestors[this_2.state.ancestors.length - 1], "_-_0") : id;
            var label = React.createElement(TaxonLabel, { key: "".concat(id, "-label"), id: "".concat(id, "-label"), abbr: tS[item]["label"]["abbreviation"], taxName: redirectTo.split("_-_")[0], taxRank: tS[item]["rank"], transform: tS[item]["label"]["transform"], left: tS[item]["label"]["left"], top: tS[item]["label"]["top"], opacity: tS[item]["label"]["opacity"], labelDisplay: tS[item]["label"]["display"], display: tS[item]["label"]["display"], onClick: function (event) { _this.handleClick(redirectTo, event); }, fullLabel: tS[item]["label"]["fullLabel"], fontWeight: "normal", root: this_2.state.root });
            labels.push(label);
        };
        var this_2 = this;
        for (var _a = 0, tSkeys_2 = tSkeys; _a < tSkeys_2.length; _a++) {
            var item = tSkeys_2[_a];
            _loop_10(item);
        }
        ;
        var _loop_11 = function (item) {
            var id = "".concat(item, "_-_").concat(tS[item]["firstLayerUnaligned"]);
            var redirectTo = tS[item]["layers"][0] === 0 ? "".concat(this_3.state.ancestors[this_3.state.ancestors.length - 1], "_-_0") : id;
            var labelBackground = React.createElement(LabelBackground, { key: "".concat(id, "-labelBackground"), id: "".concat(id, "-labelBackground"), taxName: redirectTo.split("_-_")[0], taxRank: tS[item]["rank"], transform: tS[item]["label"]["transform"], left: tS[item]["label"]["hoverLeft"] - 4, top: (tS[item]["label"]["top"] - this_3.state.height) - 4, selfDisplay: "none", labelDisplay: tS[item]["label"]["display"], onClick: function (event) { _this.handleClick(redirectTo, event); }, fullLabel: tS[item]["label"]["fullLabel"], height: this_3.state.height + 8, width: tS[item]["label"]["hoverWidth"] + 8, stroke: "#800080", fill: "#ffffff", root: this_3.state.root });
            var hoverLabel = React.createElement(TaxonLabel, { key: "".concat(id, "-hoverLabel"), id: "".concat(id, "-hoverLabel"), abbr: tS[item]["label"]["fullLabel"], taxName: redirectTo.split("_-_")[0], taxRank: tS[item]["rank"], transform: tS[item]["label"]["transform"], left: tS[item]["label"]["hoverLeft"], top: tS[item]["label"]["top"], opacity: tS[item]["label"]["opacity"], labelDisplay: tS[item]["label"]["display"], display: tS[item]["label"]["hoverDisplay"], onContextMenu: function (e) { (0, helperFunctions_js_1.showContextMenu)(e); }, onClick: function (event) { _this.handleClick(redirectTo, event); }, fullLabel: tS[item]["label"]["fullLabel"], fontWeight: "bold", root: this_3.state.root });
            labels.push(labelBackground);
            labels.push(hoverLabel);
        };
        var this_3 = this;
        for (var _b = 0, tSkeys_3 = tSkeys; _b < tSkeys_3.length; _b++) {
            var item = tSkeys_3[_b];
            _loop_11(item);
        }
        ;
        var anc = JSON.parse(JSON.stringify(this.state.ancestors)).reverse();
        var ancRanks = JSON.parse(JSON.stringify(this.state.ancestorRanks)).reverse();
        return [React.createElement("svg", { key: "svg", xmlns: "http://www.w3.org/2000/svg", style: { "margin": "0", "padding": "0", "boxSizing": "border-box", "border": "none" }, id: "shapes" },
                shapes,
                " ",
                labels,
                React.createElement("clipPath", { key: "clipPath", id: "mask" }, clipPaths)), React.createElement("div", { key: "div-ancestors", id: "ancestors" }, ancestors), React.createElement("div", { key: "left-column", id: "left-column" },
                React.createElement(AncestorSection, { key: "ancestor-section", ancestors: anc, root: this.state.root, layer: this.state.layer, plotEValue: this.state.plotEValue, ancestorRanks: ancRanks, onClickArray: anc.map(function (self, index) { return function (event) { _this.handleClick("".concat(self, "_-_").concat(-index), event); }; }) }),
                React.createElement(DescendantSection, { key: "descendant-section", self: "Felinae", layer: 0, ancestor: "Felidae", hovered: true }))];
    };
    return PlotDrawing;
}(React.Component));
exports.PlotDrawing = PlotDrawing;
function TaxonShape(props) {
    return React.createElement("path", { id: props.id, "data-taxname": props.taxName, "data-taxrank": props.taxRank, "label-display": props.labelDisplay, className: "hoverable-object", d: props.d, onMouseOver: function (e) { return (0, helperFunctions_js_1.hoverHandler)(props.id, props.fullLabel, props.root, e); }, onMouseOut: function (e) { return (0, helperFunctions_js_1.onMouseOutHandler)(props.id, props.labelDisplay, e); }, onClick: props.onClick, onContextMenu: props.onContextMenu, style: { "stroke": props.stroke, "strokeWidth": "0.2vmin", "fill": props.fillColor } });
}
;
function TaxonLabel(props) {
    return React.createElement("text", { "data-taxname": props.taxName, "data-taxrank": props.taxRank, className: "hoverable-object", x: props.left, y: props.top, transform: props.transform, "transform-origin": props.transformOrigin, id: props.id, onMouseOver: function (e) { return (0, helperFunctions_js_1.hoverHandler)(props.id, props.fullLabel, props.root, e); }, onMouseOut: function (e) { return (0, helperFunctions_js_1.onMouseOutHandler)(props.id, props.labelDisplay, e); }, onClick: props.onClick, onContextMenu: function (e) { (0, helperFunctions_js_1.showContextMenu)(e); }, style: { "margin": "0", "padding": "0", "lineHeight": "2vmin", "position": "fixed", "fontFamily": "calibri", "fontSize": "2vmin", "transformOrigin": props.transformOrigin, "fill": "#800080", "opacity": props.opacity, "display": props.display, "fontWeight": props.fontWeight } }, props.abbr);
}
;
function LabelBackground(props) {
    if (props.top) {
        return React.createElement("rect", { "data-taxname": props.taxName, "data-taxrank": props.taxRank, className: "hoverable-object", x: props.left, y: props.top, height: props.height, width: props.width, transform: props.transform, "transform-origin": props.transformOrigin, id: props.id, onMouseOver: function (e) { return (0, helperFunctions_js_1.hoverHandler)(props.id, props.fullLabel, props.root, e); }, onMouseOut: function (e) { return (0, helperFunctions_js_1.onMouseOutHandler)(props.id, props.labelDisplay, e); }, onClick: props.onClick, fill: props.fill, stroke: props.stroke, style: { "position": "fixed", "display": props.selfDisplay, "strokeWidth": "0.2vmin" } });
    }
    else {
        return null;
    }
    ;
}
;
