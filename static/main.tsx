import * as React from "react";
import * as ReactDOM from "react-dom/client";
import {ln, lr} from "./predefinedObjects.js";

let newContainerParent:any = document.createElement("div");
newContainerParent.setAttribute("id", "body-1");
let plotContainerParentDiv = document.createElement("div");
plotContainerParentDiv.setAttribute("id", "plot-container-parent");
newContainerParent.appendChild(plotContainerParentDiv);
let currContainerParent = document.getElementById("plot-container")!.parentElement!;
let container = document.getElementById("plot-container")!;

let lcw = container.getAttribute("left-column-width")
document.body.style.setProperty("--left-column-width", container.getAttribute("left-column-width"));
if (!Boolean(Number(lcw))) document.body.style.setProperty("--left-column-display", "none");
container.setAttribute("left-column-width", "");

let rcw = container.getAttribute("right-column-width")
document.body.style.setProperty("--right-column-width", container.getAttribute("right-column-width"));
if (!Boolean(Number(rcw))) document.body.style.setProperty("--right-column-display", "none");
container.setAttribute("right-column-width", "");

document.body.style.setProperty("--container-position", container.getAttribute("position"));
container.setAttribute("position", "");
document.body.style.setProperty("--container-top", container.getAttribute("top"));
container.setAttribute("top", "");
document.body.style.setProperty("--container-left", container.getAttribute("left"));
container.setAttribute("left", "");
document.body.style.setProperty("--container-width", container.getAttribute("width"));
container.setAttribute("width", "");
document.body.style.setProperty("--container-height", container.getAttribute("height"));
container.setAttribute("height", "");
document.body.style.setProperty("--container-border", container.getAttribute("border"));
container.setAttribute("border", "");

currContainerParent.replaceChild(newContainerParent, container);
plotContainerParentDiv.appendChild(container);

let dpmmDiv = document.createElement("div");
dpmmDiv.setAttribute("id", "dpmm");
plotContainerParentDiv.prepend(dpmmDiv);
let labelsDiv = document.createElement("div");
labelsDiv.setAttribute("id", "labels");
plotContainerParentDiv.prepend(labelsDiv);

let interaction = document.createElement("div");
interaction.setAttribute("id", "interaction");
newContainerParent.prepend(interaction);
////
let lastFieldset = document.createElement("fieldset");
lastFieldset.setAttribute("id", "interaction-last-fieldset");
interaction.prepend(lastFieldset);
let lastFieldsetLegend = document.createElement("legend");
lastFieldsetLegend.innerText = "DOWNLOAD";
lastFieldset.appendChild(lastFieldsetLegend);
let lastFieldsetButton = document.createElement("button");
lastFieldsetButton.setAttribute("id", "download");
lastFieldsetButton.innerText = "Download SVG";
lastFieldset.appendChild(lastFieldsetButton);

let wrapperFieldset = document.createElement("fieldset");
wrapperFieldset.setAttribute("id", "wrapper-fieldset");
interaction.prepend(wrapperFieldset);
let wrapperFieldsetLegend = document.createElement("legend");
wrapperFieldsetLegend.innerText = "VIEWING MODES";
wrapperFieldset.appendChild(wrapperFieldsetLegend);
let wrapperFieldsetInput = document.createElement("div");
wrapperFieldsetInput.setAttribute("id", "input");
wrapperFieldset.appendChild(wrapperFieldsetInput);
let wrapperFieldsetInputInput = document.createElement("input");
wrapperFieldsetInputInput.setAttribute("id", "checkbox-input");
wrapperFieldsetInputInput.setAttribute("type", "checkbox");
wrapperFieldsetInputInput.setAttribute("name", "collapse");
wrapperFieldsetInput.appendChild(wrapperFieldsetInputInput);
let wrapperFieldsetInputLabel = document.createElement("label");
wrapperFieldsetInputLabel.setAttribute("for", "collapse");
wrapperFieldsetInputLabel.innerText = " Collapse";
wrapperFieldsetInput.appendChild(wrapperFieldsetInputLabel);
let wrapperFieldsetInput1 = document.createElement("div");
wrapperFieldsetInput1.setAttribute("id", "input1");
wrapperFieldset.appendChild(wrapperFieldsetInput1);
let wrapperFieldsetInput1Input = document.createElement("input");
wrapperFieldsetInput1Input.setAttribute("id", "e-input");
wrapperFieldsetInput1Input.setAttribute("type", "checkbox");
wrapperFieldsetInput1Input.setAttribute("name", "e-value");
wrapperFieldsetInput1Input.setAttribute("disabled", "disabled");
wrapperFieldsetInput1.appendChild(wrapperFieldsetInput1Input);
let wrapperFieldsetInput1Label = document.createElement("label");
wrapperFieldsetInput1Label.setAttribute("id", "e-label");
wrapperFieldsetInput1Label.setAttribute("for", "e-value");
wrapperFieldsetInput1Label.innerText = " Filter by e-value: ";
wrapperFieldsetInput1.appendChild(wrapperFieldsetInput1Label);
let wrapperFieldsetInput1Text = document.createElement("input");
wrapperFieldsetInput1Text.setAttribute("id", "e-text");
wrapperFieldsetInput1Text.setAttribute("type", "text");
wrapperFieldsetInput1Text.setAttribute("disabled", "disabled");
wrapperFieldsetInput1.appendChild(wrapperFieldsetInput1Text);
let radioInputFieldset = document.createElement("fieldset");
radioInputFieldset.setAttribute("id", "radio-input");
wrapperFieldset.appendChild(radioInputFieldset);
let radioInputFieldsetUnaltered = document.createElement("div");
radioInputFieldset.appendChild(radioInputFieldsetUnaltered);
let radioInputFieldsetUnalteredInput = document.createElement("input");
radioInputFieldsetUnalteredInput.setAttribute("id", "unaltered");
radioInputFieldsetUnalteredInput.setAttribute("type", "radio");
radioInputFieldsetUnalteredInput.setAttribute("name", "radio");
radioInputFieldsetUnaltered.appendChild(radioInputFieldsetUnalteredInput);
let radioInputFieldsetUnalteredLabel = document.createElement("label");
radioInputFieldsetUnalteredLabel.setAttribute("for", "unaltered");
radioInputFieldsetUnalteredLabel.innerText = "Unaltered";
radioInputFieldsetUnaltered.appendChild(radioInputFieldsetUnalteredLabel);

let radioInputFieldsetMarriedTaxaI = document.createElement("div");
radioInputFieldset.appendChild(radioInputFieldsetMarriedTaxaI);
let radioInputFieldsetMarriedTaxaIInput = document.createElement("input");
radioInputFieldsetMarriedTaxaIInput.setAttribute("id", "marriedTaxaI");
radioInputFieldsetMarriedTaxaIInput.setAttribute("type", "radio");
radioInputFieldsetMarriedTaxaIInput.setAttribute("name", "radio");
radioInputFieldsetMarriedTaxaI.appendChild(radioInputFieldsetMarriedTaxaIInput);
let radioInputFieldsetMarriedTaxaILabel = document.createElement("label");
radioInputFieldsetMarriedTaxaILabel.setAttribute("for", "married-taxa-i");
radioInputFieldsetMarriedTaxaILabel.innerText = "Married taxa I";
radioInputFieldsetMarriedTaxaI.appendChild(radioInputFieldsetMarriedTaxaILabel);

let radioInputFieldsetMarriedTaxaII = document.createElement("div");
radioInputFieldset.appendChild(radioInputFieldsetMarriedTaxaII);
let radioInputFieldsetMarriedTaxaIIInput = document.createElement("input");
radioInputFieldsetMarriedTaxaIIInput.setAttribute("id", "marriedTaxaII");
radioInputFieldsetMarriedTaxaIIInput.setAttribute("type", "radio");
radioInputFieldsetMarriedTaxaIIInput.setAttribute("name", "radio");
radioInputFieldsetMarriedTaxaII.appendChild(radioInputFieldsetMarriedTaxaIIInput);
let radioInputFieldsetMarriedTaxaIILabel = document.createElement("label");
radioInputFieldsetMarriedTaxaIILabel.setAttribute("for", "married-taxa-ii");
radioInputFieldsetMarriedTaxaIILabel.innerText = "Married taxa II";
radioInputFieldsetMarriedTaxaII.appendChild(radioInputFieldsetMarriedTaxaIILabel);

let radioInputFieldsetAllEqual = document.createElement("div");
radioInputFieldset.appendChild(radioInputFieldsetAllEqual);
let radioInputFieldsetAllEqualInput = document.createElement("input");
radioInputFieldsetAllEqualInput.setAttribute("id", "allEqual");
radioInputFieldsetAllEqualInput.setAttribute("type", "radio");
radioInputFieldsetAllEqualInput.setAttribute("name", "radio");
radioInputFieldsetAllEqualInput.checked = true;
radioInputFieldsetAllEqual.appendChild(radioInputFieldsetAllEqualInput);
let radioInputFieldsetAllEqualLabel = document.createElement("label");
radioInputFieldsetAllEqualLabel.setAttribute("for", "all-equal");
radioInputFieldsetAllEqualLabel.innerText = "All equal";
radioInputFieldsetAllEqual.appendChild(radioInputFieldsetAllEqualLabel);

let newDataInput = document.createElement("div");
newDataInput.setAttribute("id", "new-data-input");
wrapperFieldset.appendChild(newDataInput);
let newDataInputInput = document.createElement("input");
newDataInputInput.setAttribute("id", "new-data");
newDataInputInput.setAttribute("name", "new-data");
newDataInputInput.setAttribute("type", "checkbox");
newDataInput.appendChild(newDataInputInput);
let newDataInputLabel = document.createElement("label");
newDataInputLabel.setAttribute("for", "new-data");
newDataInputLabel.innerText = "New Data: Yes or No";
newDataInput.appendChild(newDataInputLabel);
////
let interactionWrapperDiv = document.createElement("div");
interaction.prepend(interactionWrapperDiv);
//
let interactionForm = document.createElement("form");
interactionForm.setAttribute("id", "uploadForm");
interactionForm.setAttribute("action", "http://127.0.0.1:5000/load_tsv_data");
interactionForm.setAttribute("method", "POST");
interactionForm.setAttribute("enctype", "multipart/form-data");
interactionWrapperDiv.appendChild(interactionForm);
//
let interactionFieldset = document.createElement("fieldset");
interactionForm.appendChild(interactionFieldset);
//
let interactionLegend = document.createElement("legend");
interactionLegend.innerText = "UPLOAD YOUR DATA";
interactionFieldset.appendChild(interactionLegend);
//
let interactionFieldsetDiv = document.createElement("div");
interactionFieldset.appendChild(interactionFieldsetDiv);
//
let interactionInput = document.createElement("input");
interactionInput.setAttribute("type", "file");
interactionInput.setAttribute("name", "file");
interactionInput.setAttribute("id", "file");
interactionFieldsetDiv.appendChild(interactionInput);
let interactionSpan = document.createElement("span");
interactionSpan.setAttribute("id", "status");
interactionSpan.setAttribute("class", "material-symbols-outlined");
interactionFieldsetDiv.appendChild(interactionSpan);
//
let interactionFieldsetDiv2 = document.createElement("div");
interactionFieldsetDiv2.style.marginTop = "1vh";
interactionFieldset.appendChild(interactionFieldsetDiv2);
let interactionInput2 = document.createElement("input");
interactionInput2.setAttribute("type", "file");
interactionInput2.setAttribute("name", "fasta-file");
interactionInput2.setAttribute("id", "fasta-file");
interactionInput2.setAttribute("disabled", "disabled");
interactionFieldsetDiv2.appendChild(interactionInput2);
let interactionSpan2 = document.createElement("span");
interactionSpan2.setAttribute("id", "fasta-status");
interactionSpan2.setAttribute("class", "material-symbols-outlined");
interactionFieldsetDiv2.appendChild(interactionSpan2);

let descendantSection = document.createElement("input");
descendantSection.setAttribute("type", "text");
descendantSection.setAttribute("id", "descendant-section");
interaction.prepend(descendantSection);
//////
let marriedDots = document.createElement("div");
marriedDots.setAttribute("id", "married-pattern");
marriedDots.style.top = newContainerParent.offsetTop;
marriedDots.style.left = newContainerParent.offsetLeft;
newContainerParent.prepend(marriedDots);

let contextMenu = document.createElement("div");
contextMenu.setAttribute("id", "context-menu");
newContainerParent.appendChild(contextMenu);
let copyButton = document.createElement("button");
copyButton.setAttribute("id", "copy");
copyButton.innerText = "Copy own seq IDs to clipboard";
contextMenu.appendChild(copyButton);
let copyAllButton = document.createElement("button");
copyAllButton.setAttribute("id", "copy-all");
copyAllButton.innerText = "Copy all seq IDs to clipboard";
contextMenu.appendChild(copyAllButton);
let downloadSeqButton = document.createElement("button");
downloadSeqButton.setAttribute("id", "download-seq");
downloadSeqButton.innerText = "Download own sequences";
contextMenu.appendChild(downloadSeqButton);
let downloadAllSeqButton = document.createElement("button");
downloadAllSeqButton.setAttribute("id", "download-all-seq");
downloadAllSeqButton.innerText = "Download all sequences";
contextMenu.appendChild(downloadAllSeqButton);

import {PlotDrawing} from "./components.js";
let domContainer:any = document.querySelector('#plot-container');
let reactRoot = ReactDOM.createRoot(domContainer);
reactRoot.render(<PlotDrawing lineages={ln} ranks={lr}/>);

let plotContainerParent:any = domContainer.parentElement;