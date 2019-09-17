function createElIfNotExists(parent, className, tagName) {
    let el = parent.querySelector('.'+className);

    console.log(el);

    if (!el) {
        el = document.createElement(tagName);
        el.className = className;
        parent.appendChild(el);
    }

    return el;
}

export default createElIfNotExists