import boundry from './boundry';

/**
 * Pin reālo vērtību, kuru definē lietotājs
 * konvertējam uz relatīvo vērtību, tā kuru
 * RangeSlider izmanto iekšēji. Tā ir tā vērtība,
 * kura ir 0..1
 *
 * Reālā vērtība ir piemēram 7, šī vērtība ir starp min un max
 * min: 2
 * max: 8
 * value: 2..8
 */
function valueRealToRelative(realValue, min, max) {
    // Ierobežojam realValue, lai tā ir starp min un max
    realValue = boundry(realValue, min, max);

    // Starpība starp max un min vērtībām
    let d = max - min;

    // Attālums no min līdz value
    let vd = realValue - min;

    // Relatīvā vērtība. Burtiski procentuālā vērtība 0..1
    return vd / d;
}

export default valueRealToRelative