import create from 'dom-helpers/src/create';
import append from 'dom-helpers/src/append';

let style = {
    display: 'block',
    position: 'absolute',
    
    top: '-40px',
    bottom: '-40px',
    left: '-20px',
    right: '-20px',

    zIndex: '2'
    //background: 'rgba(255,34,34,0.4)'
}

function createSwipeEl(parent) {
    let el = create('div', {
        style: style
    });

    append(parent, el);

    return el;
}

export default createSwipeEl;