function createSwipeEl(parent) {
    let el = document.createElement('div');

    applyStyle(el);

    parent.appendChild(el);
    
    return el;
}

function applyStyle(el) {
    el.style.display = 'block';
    el.style.position = 'absolute';
    
    
    el.style.top = '-40px';
    el.style.bottom = '-40px';
    el.style.left = '-20px';
    el.style.right = '-20px';

    el.style.zIndex =  '2';

    el.style.background = 'rgba(255,34,34,0.4)'
}

export default createSwipeEl;