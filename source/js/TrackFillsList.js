import getElementDimensions from './getElementDimensions';
import findNodeByIndex from './findNodeByIndex';
import createEl from './createEl';

function create(index, alreadyDefinedElements) {
    let el = findNodeByIndex(alreadyDefinedElements, index);

    el = el ? el : createEl('rangeslider__track-fill', 'div');

    el.className = 'rangeslider__track-fill rangeslider__track-fill-'+index;

    el.style.left = 0;
    el.style.width = 0;

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
        this.items.push(create(i, alreadyDefinedElements))
    }

    this.items.forEach(item => this.container.appendChild(item.el))
}

TrackFillsList.prototype = {
    vizualize(pinsPosition) {
        let prevX = 0;

        pinsPosition.forEach(pin => {
            this.setPosition(pin.index, prevX, pin.x - prevX);
            prevX = pin.x;
        })

        // Pēdējais fill elements. Tas ir no pēdējā pin elementa līdz track beigām
        this.setPosition(this.items.length-1, prevX, this.dimensions.width - prevX);
    },

    resize(isInitialSetup) {
        this.dimensions = getElementDimensions(this.container);
    },

    setPosition(index, left, width) {
        let needRedraw = false;

        if (this.items[index].left != left) {
            this.items[index].left = left;
            needRedraw = true;
        }

        if (this.items[index].width != width) {
            this.items[index].width = width;
            needRedraw = true;
        }

        if (needRedraw) {
            console.log('needRedraw');
            this.items[index].el.style.left = this.items[index].left+'px';
            this.items[index].el.style.width = this.items[index].width+'px';
        }
    }
}

export default TrackFillsList