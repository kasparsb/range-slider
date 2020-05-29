import create from 'dom-helpers/src/create';
import append from 'dom-helpers/src/append';
import q from 'dom-helpers/src/q';

function createTrackEl(parent) {
    // Meklējam vai ir jau pieejams track elements    
    let el = q(parent, '.rangeslider__track')

    if (!el) {
        el = create('div', {
            className: 'rangeslider__track'
        });
        append(parent, el);
    }

    return el;
}

export default createTrackEl;