function createSwipeEl(parent) {
    let el = document.createElement('div');

    applyStyle(el);

    parent.appendChild(el);
    
    return el;
}

function applyStyle(el) {
    el.style.display = 'block';
    el.style.position = 'absolute';
    el.style.left = '0';
    el.style.width = '100%';
    el.style.top = '-20px';
    el.style.bottom = '-20px';
    el.style.zIndex =  '2';
}

export default createSwipeEl;