function createEl(className, tagName) {
    let el = document.createElement(tagName);
    el.className = className;

    return el;
}

export default createEl