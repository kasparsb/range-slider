/**
 * Konvertējam pins definīciju uz vienotu formātu
 * pins varbūt šādi
 *     - number, skaits cik pins vajag
 *     - array masīvs ar pins definīciju
 */
function formatPinsConfiguration(pins, steps) {
    
    if (typeof pins === 'number') {
        pins = fromNumber(pins, steps);
    }

    return pins.map(appendDefaultParams);
}

/**
 * Pins definīcijai saliekam visas default vērtības
 */
function appendDefaultParams(pin, index) {
    pin.index = index;

    if (typeof pin.value != 'object') {
        pin.value = {
            x: pin.value,
            y: 0
        }
    }

    /**
     * @todo Jāpieliek boundry definīcija
     */
    pin.boundry = {
        min: 0,
        max: 1
    }

    return pin
}

function fromNumber(count, steps) {
    /**
     * Ja steps ir neirobežots, tad vienmērīgi sadalām platumu pa visiem pins
     */

    let r = [];
    for (let i = 0; i < count; i++) {
        r.push({
            value: {
                x: i * (1 / (steps.x === Infinity ? count : steps.x)),
                y: i * (1 / (steps.y === Infinity ? count : steps.y))
            }
        });
    }
    return r;
}

export default formatPinsConfiguration