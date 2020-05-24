import boundry from './boundry';
import createEl from './createEl';
import isBetween from './isBetween';
import setCssTransform from './setCssTransform';
import getElementOuterDimensions from './getElementOuterDimensions';

function roundToWholeStep(value, stepsCount, width) {
    let stepWidth = width / stepsCount;

    let remainder = value % stepWidth;
    
    // Ja atlikums ir mazāks par puse no stepWidth, tad x = x % stepWidth
    // Ja atlikums ir lielāks par puse no stepWidth, tad x = (x % stepWidth) + stepWidth
    if (remainder < (stepWidth / 2)) {
        // Remove remainder to go full step backwards
        return value - remainder;
    }
    else {
        // Go to next full step
        return (value - remainder) + stepWidth;
    }
}

function Pin(el) {
    this.el = el ? el : createEl('rangeslider__pin', 'a');

    this.vizualizeCb = function(){};

    this.prev = undefined;
    this.next = undefined;

    /**
     * Pin element real dimensions
     */
    this.dimensions = undefined;

    this.parentDimensions = undefined;

    this.safePadding = undefined;

    this.steps = {
        x: Infinity,
        y: Infinity
    }

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
    
    onVizualize(cb) {
        this.vizualizeCb = cb;
    },

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

        this.el.className = 'rangeslider__pin rangeslider__pin-'+this.index;
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

    setSteps(steps) {
        this.steps.x = steps.x;
        this.steps.y = steps.y;
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

        this.fireVizualize();
    },

    resize(isInitialSetup) {
        this.dimensions = getElementOuterDimensions(this.el);

        // Recalculate position based on parent element dimensions
        this.position.x = this.parentDimensions.width * this.value.x;
        this.position.y = this.parentDimensions.height * this.value.y;

        this.calcValue();

        if (!isInitialSetup) {
            this.vizualize();    
        }        
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

    getPosition() {
        return {
            x: this.boundryX(this.position.x + this.offset.x),
            y: this.boundryY(this.position.y + this.offset.y)
        }
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
        /**
         * Gadījumā, ja soļu skaits nav vesels skaitlis (piem., 8.5)
         * Pārbaudām tieši >0, jo steps.x=Infinity gadījumā ir NaN
         * Tikai decimāl skaitļa gadījumā būs >0
         */
        if (this.steps.x % 1 > 0) {
            // (700 / 8.5) * 8 - šādi dabūsim max platumu pilniem soļiem
            max = ((this.parentDimensions.width / this.steps.x) * Math.floor(this.steps.x)) - this.dimensions.width;
        }
        if (this.next) {
            max = this.next.position.x - this.dimensions.width;
        }

        /**
         * šeit x jau ir ierobežot min max robežās
         * tagad vajag piesiet x solim (step)
         *
         * soļa reālais platums - this.parentDimensions.width / steps
         */

        // Round x to whole steps
        if (this.steps.x !== Infinity) {
            x = roundToWholeStep(x, this.steps.x, this.parentDimensions.width);
        }

        return boundry(x, min, max);
    },

    boundryY(y) {
        return boundry(y, 0, this.parentDimensions.height - this.dimensions.height)
    },

    fireVizualize() {
        this.vizualizeCb(this);
    }
}

export default Pin