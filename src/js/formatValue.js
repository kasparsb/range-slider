/**
 * Gala vērtībai jābūt {x:0,y:0} formātā
 * Ja ienākošā vērtība ir objekts, tad pārbaudām lai būtu x, y props
 * Ja ienākošā vērtība ir number, tad veidojam {x,y} atkarībā
 * no tā kāds ir slider direction (horizontāls:x, vai vertikāls:y)
 * Attiecīgi šo vērtību uzskatām par x, ja direction ir x. Tas pats ar y
 */
function formatValue(value, direction) {
    let r = {
        x: 0,
        y: 0
    }

    // Šajā gadījumā jābūt tikai vienam virzienam (x vai y)
    if (typeof value != 'object') {
        r[direction[0]] = value
    }
    else {
        r.x = typeof value.x === 'undefined' ? 0 : value.x;
        r.y = typeof value.y === 'undefined' ? 0 : value.y;
    }

    return r;
}

export default formatValue