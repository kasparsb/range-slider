function removeEl(node) {
    if (node.parentNode) {
        node.parentNode.removeChild(node);
    }
}

export default removeEl;