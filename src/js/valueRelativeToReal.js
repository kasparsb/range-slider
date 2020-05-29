/**
 * Tas pats, kas valueRealToRelative tikai pretējā virzienā
 * Vienīgi iegūtā vertība tiek apstrādāta, lai tā dalītos
 * bez atlikuma ar step
 * Tas ir tāpēc, ka vienkārši reizinot ar relativeValue gala vērtība
 * ir ļoti neprecīza
 */
function valueRelativeToReal(relativeValue, min, max, step) {
    // Starpība starp max un min vērtībām
    let d = max - min;

    if (step > 0) {
        // Daram tā, lai vērtība dalītos bez atlikuma ar step vērtību
        return min + (Math.floor((d * relativeValue) / step) * step);
    }
    else {
        return min + (d*relativeValue)
    }
}

export default valueRelativeToReal