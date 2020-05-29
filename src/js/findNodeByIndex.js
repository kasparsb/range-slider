function findNodeByIndex(nodeList, index) {
    if (index < nodeList.length) {
        return nodeList[index];
    }
    return false;
}

export default findNodeByIndex