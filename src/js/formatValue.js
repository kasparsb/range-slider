/**
 * Gala vērtībai jābūt {x:0,y:0} formātā
 * Ja ienākošā vērtība ir objekts, tad pārbaudām lai būtu x, y props
 * Ja ienākošā vērtība ir number, tad veidojam {x,y} atkarībā
 * no tā kāds ir slider direction (horizontāls:x, vai vertikāls:y)
 * Attiecīgi šo vērtību uzskatām par x, ja direction ir x. Tas pats ar y
 */
function formatValue(value, direction, defaultValue) {
    if (typeof defaultValue === 'undefined') {
        defaultValue = 0;
    }

    let r = {
        x: defaultValue,
        y: defaultValue
    }

    // Šajā gadījumā jābūt tikai vienam virzienam (x vai y)
    if (typeof value != 'object') {
        r[direction[0]] = value
    }
    else {
        r.x = typeof value.x === 'undefined' ? defaultValue : value.x;
        r.y = typeof value.y === 'undefined' ? defaultValue : value.y;
    }

    return r;
}

export default formatValue