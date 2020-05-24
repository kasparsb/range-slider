import createEl from './createEl';

function createElIfNotExists(parent, className, tagName) {
    let el = parent.querySelector('.'+className);

    if (!el) {
        el = createEl(className, tagName);
        parent.appendChild(el);
    }

    return el;
}

export default createElIfNotExists