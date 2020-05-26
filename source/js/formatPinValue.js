function formatPinValue(value) {
    let r = {
        x: 0,
        y: 0
    }

    if (typeof value != 'object') {
        r.x = value
    }
    else {
        r.x = value.x;
        r.y = value.y;
    }

    return r;
}

export default formatPinValue