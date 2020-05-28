import findNodeByIndex from './findNodeByIndex';
import getDimensions from 'dom-helpers/src/getDimensions';
import create from 'dom-helpers/src/create';

function createFill(index, alreadyDefinedElements, container) {
    let el = findNodeByIndex(alreadyDefinedElements, index);

    if (!el) {
        el = create('div', {
            style: {
                left: 0,
                width: 0
            }
        });

        container.appendChild(el)
    }

    el.className = 'rangeslider__track-fill rangeslider__track-fill-'+index;

    return {
        index: index,
        el: el,
        left: 0,
        width: 0
    }
}

function TrackFillsList(pinsCount, container) {
    this.container = container;

    this.dimensions = undefined;

    this.items = [];

    // Atlasām jau dom esošos pin elementus, lai tos izmantotu
    let alreadyDefinedElements = container.querySelectorAll('.rangeslider__track-fill');

    // track fill būs par vienu vairāk kā pinsCount
    // Viens pirms, otrs pēc pin
    for (let i = 0; i < pinsCount+1; i++) {
        this.items.push(createFill(i, alreadyDefinedElements, this.container))
    }
}

TrackFillsList.prototype = {
    resize(isInitialSetup) {
        this.dimensions = getDimensions(this.container);
    },

    vizualize(pinsPosition) {
        let prevX = 0;

        pinsPosition.forEach(pin => {
            this.setPosition(pin.index, prevX, pin.x - prevX);
            prevX = pin.x;
        })

        // Pēdējais fill elements. Tas ir no pēdējā pin elementa līdz track beigām
        this.setPosition(this.items.length-1, prevX, this.dimensions.width - prevX);
    },

    setPosition(index, left, width) {
        this.setProp(index, 'left', left);
        this.setProp(index, 'width', width);
    },

    setProp(index, propName, value) {
        if (this.items[index][propName] != value) {
            this.items[index][propName] = value;
            
            this.items[index].el.style[propName] = value+'px';
        }
    }
}

export default TrackFillsList