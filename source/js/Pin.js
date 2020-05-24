import boundry from './boundry';
import createEl from './createEl';
import isBetween from './isBetween';
import setCssTransform from './setCssTransform';
import getElementOuterDimensions from './getElementOuterDimensions';

function Pin(el) {
    this.el = el ? el : createEl('rangeslider__pin', 'a');

    this.prev = undefined;
    this.next = undefined;

    /**
     * Pin element real dimensions
     */
    this.dimensions = undefined;

    this.parentDimensions = undefined;

    this.safePadding = undefined;

    /**
     * Real position in parent element
     */
    this.position = {
        x: 0,
        y: 0
    }

    this.offset = {
        x: 0,
        y: 0
    }

    /**
     * Two dimensional value for x, y range
     */
    this.value = {
        x: 0,
        y: 0
    };
}
Pin.prototype = {
    
    setSafePadding(padding) {
        this.safePadding = padding;
    },

    setParentDimensions(dimensions) {
        this.parentDimensions = dimensions;
    },

    setOffset(x, y) {
        this.offset.x = x;
        this.offset.y = y;
    },

    setIndex(index) {
        this.index = index;
    },

    setValue(value) {
        this.value.x = value.x;
        this.value.y = value.y;
    },

    /**
     * @todo uztaisīt
     */
    setBoundry(boundry) {

    },

    setPrev(pin) {
        this.prev = pin;
    },

    setNext(pin) {
        this.next = pin;
    },

    startMove() {
        // Nofiksējam esošo pozīciju
        this.position.x = this.boundryX(this.position.x + this.offset.x);
        this.position.y = this.boundryY(this.position.y + this.offset.y);

        // Notīrām move offset vērtības
        this.offset.x = 0;
        this.offset.y = 0;
    },

    endMove() {
        this.startMove();

        this.calcValue();
    },

    move(x, y) {
        this.setOffset(x, y);
        this.calcValue();

        this.vizualize();
    },

    vizualize() {
        setCssTransform(
            this.el,
            this.boundryX(this.position.x + this.offset.x),
            //this.boundryY(this.position.y + this.offset.y),
            0
        )
    },

    resize() {
        this.dimensions = getElementOuterDimensions(this.el);

        // Recalculate position based on parent element dimensions
        this.position.x = this.parentDimensions.width * this.value.x;
        this.position.y = this.parentDimensions.height * this.value.y;

        this.calcValue();

        this.vizualize();
    },

    calcValue() {
        this.value.x = this.boundryX(this.position.x + this.offset.x) / (this.parentDimensions.width - this.dimensions.width);
        this.value.y = this.boundryY(this.position.y + this.offset.y) / (this.parentDimensions.height - this.dimensions.height);
    },

    /**
     * Nosakām vai padotā x,y koordināte ir virs pin
     */
    isXY(x, y) {
        return this.isX(x) && this.isY(y);
    },

    isX(x) {
        return isBetween(
            x,
            this.position.x - this.safePadding,
            this.position.x + this.dimensions.width + this.safePadding
        )
    },

    /**
     * Pin ir nogrieznies (platums)
     *     x: sākums 
     *     x + width: beigas
     * ja x ir starp sākumu un beigām tad atgriežam 0
     * pretējā gadījumā atgriežam attālumu līdz tuvākajam sākuma vai beigām
     */
    getDistanceToX(x) {
        if (isBetween(x, this.position.x, this.position.x + this.dimensions.width)) {
            return 0;
        }

        return Math.min(
            Math.abs(this.position.x - x), // Sākuma
            Math.abs((this.position.x + this.dimensions.width) - x) // Beigas
        )
    },

    getDistanceToY(y) {
        if (isBetween(y, this.position.y, this.position.y + this.dimensions.height)) {
            return 0;
        }

        return Math.min(
            Math.abs(this.position.y - y), // Sākuma
            Math.abs((this.position.y + this.dimensions.height) - y) // Beigas
        )
    },

    isY(y) {
        return isBetween(
            y,
            this.position.y - this.safePadding,
            this.position.y + this.dimensions.height + this.safePadding
        )
    },

    boundryX(x) {
        let min = 0;
        if (this.prev) {
            min = this.prev.position.x + this.prev.dimensions.width
        }

        let max = this.parentDimensions.width - this.dimensions.width;
        if (this.next) {
            max = this.next.position.x - this.dimensions.width;
        }

        return boundry(x, min, max);
    },

    boundryY(y) {
        return boundry(y, 0, this.parentDimensions.height - this.dimensions.height)
    }
}

export default Pin