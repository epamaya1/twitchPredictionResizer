//saved data
let cachedState = null;
chrome.storage.local.get(['boxStateData'], (res) => {
    if (res.boxStateData) {
        cachedState = res.boxStateData;
    }
});

const obs = new MutationObserver((mutations) => {
    const popups = document.querySelectorAll('[role="dialog"]'); 
    
    popups.forEach(theActualPopup => {
        const textThings = theActualPopup.querySelectorAll('h4, h5, div');
        let titleThing = Array.from(textThings).find(el => el.textContent === 'Start a Prediction');

        if (titleThing && !theActualPopup.classList.contains('moving-box-thing')) {
            makeItMove(theActualPopup, titleThing);
        }
    });
});

obs.observe(document.body, { childList: true, subtree: true });

function makeItMove(box, grabber) {
    box.classList.add('moving-box-thing');
    grabber.classList.add('grabby-part');

    if (cachedState) {
        box.style.top = cachedState.top;
        box.style.left = cachedState.left;
        box.style.width = cachedState.width;
        box.style.height = cachedState.height;
    }

    let x1 = 0, y1 = 0, x2 = 0, y2 = 0;

    grabber.onmousedown = (e) => {
        e.preventDefault();
        x2 = e.clientX;
        y2 = e.clientY;
        document.onmouseup = stopMoving;
        document.onmousemove = dragIt;
    };

    function dragIt(e) {
        e.preventDefault();
        x1 = x2 - e.clientX;
        y1 = y2 - e.clientY;
        x2 = e.clientX;
        y2 = e.clientY;
        
        box.style.top = (box.offsetTop - y1) + "px";
        box.style.left = (box.offsetLeft - x1) + "px";
    }

    function stopMoving() {
        document.onmouseup = null;
        document.onmousemove = null;
        saveMyState();
    }

    const saveMyState = () => {
        cachedState = {
            top: box.style.top,
            left: box.style.left,
            width: box.style.width,
            height: box.style.height
        };
        chrome.storage.local.set({ 'boxStateData': cachedState });
    };

    const resizeObs = new ResizeObserver(() => {
        saveMyState();
    });
    resizeObs.observe(box);
}

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    if (req.action === "oh_crap_go_back") {
        chrome.storage.local.remove('boxStateData');
        cachedState = null; 
        
        const box = document.querySelector('.moving-box-thing');
        if (box) {
            box.style.top = "";
            box.style.left = "";
            box.style.width = "";
            box.style.height = "";
        }
    }
});