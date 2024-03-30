function clickTaxsun2External(name, rank, id) {
    let element = document.querySelector(`.taxsun-interactee[data-taxname='${name}'][data-taxrank='${rank}']`);
    if (element) element.click();
};

function mouseOverTaxsun2External(name, rank, id) {
    let element = document.querySelector(`.taxsun-interactee[data-taxname='${name}'][data-taxrank='${rank}']`);
    if (element) element.dispatchEvent(new MouseEvent("mouseover", {'view': window, 'bubbles': true, 'cancelable': true}));
};

function mouseOutTaxsun2External(name, rank, id) {
    let element = document.querySelector(`.taxsun-interactee[data-taxname='${name}'][data-taxrank='${rank}']`);
    if (element) element.dispatchEvent(new MouseEvent("mouseout", {'view': window, 'bubbles': true, 'cancelable': true}));
};

const mouseClickEvents = ['mousedown', 'click', 'mouseup'];
function clickExternal2Taxsun(event){
    if (event.isTrusted) {
        let element = document.querySelector(".hoverable-object");
        mouseClickEvents.forEach(mouseEventType =>
            element.dispatchEvent(
                new CustomEvent(mouseEventType, {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                    buttons: 1,
                    detail: {taxName: event.target.getAttribute("data-taxname"), taxRank: event.target.getAttribute("data-taxrank")}
                })
            )
        );
    }
    
}

const mouseOverEvent = ['mouseover'];
function mouseOverExternal2Taxsun(event){
    if (event.isTrusted) {
        let element = document.querySelector(".hoverable-object");
        mouseOverEvent.forEach(mouseEventType =>
            element.dispatchEvent(
                new CustomEvent(mouseEventType, {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                    buttons: 1,
                    detail: {taxName: event.target.getAttribute("data-taxname"), taxRank: event.target.getAttribute("data-taxrank")}
                })
            )
        );        
    }
}
const mouseOutEvent = ['mouseout'];
function mouseOutExternal2Taxsun(event){
    if (event.isTrusted) {
        let element = document.querySelector(".hoverable-object");
        mouseOutEvent.forEach(mouseEventType =>
            element.dispatchEvent(
                new CustomEvent(mouseEventType, {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                    buttons: 1,
                    detail: {taxName: event.target.getAttribute("data-taxname"), taxRank: event.target.getAttribute("data-taxrank")}
                })
            )
        );
    }
}

window.addEventListener('load', function() {
    var element = document.getElementById("Gammaproteobacteria_-_2");
    // simulateMouseClick(element);
    //simulateMouseOver(element);
    //setTimeout(() => {simulateMouseOut(element)}, 3000);
})