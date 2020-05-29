import Pin from './Pin';
import findNodeByIndex from './findNodeByIndex';


/**
 * Atlasām tikai norādītos properties from data
 * Ja ir tikai viens prop, tad atgriežam to kā vērtību
 * Ja ir vairāki props, tad atgriežam objektu ar props name un value
 */
function pickValueIfSingleProp(props, data) {
    // Tikai viens props, atgriežam tā vērtīvu
    if (props.length == 1) {
        return data[props[0]];
    }

    // Savācam objektu ar prop name un vērtība
    let r = {};

    props.forEach(name => r[name] = data[name]);

    return r;
}

/**
 * Veidojam pins sarakstu
 * @param variable vai nu pins skaits, vai arī masīvs ar pin definīciju
 *     {
 *         value:{
 *             x:0..1,
 *             y:0..1
 *         },
 *         boundry: {
 *             min:
 *             max:
 *         }
 *     }
 */
function PinsList(values, container, onCreate) {
    this.vizualizeCb = undefined;

    // Atlasām jau dom esošos pin elementus, lai tos izmantotu
    let alreadyDefinedPinElements = container.querySelectorAll('.rangeslider__pin');

    // Create pins from configuration
    this.items = values.map((value, index) => {

        let pin = new Pin(findNodeByIndex(alreadyDefinedPinElements, index));

        pin.setIndex(index);
        pin.setValue(value);

        onCreate(pin);

        return pin
    })

    // Uzliekam kaimiņus
    for (let i = 0; i < this.items.length; i++) {
        if (i > 0) {
            this.items[i].setPrev(this.items[i-1]);
        }
        else {
            this.items[i].setPrev(null);
        }
        
        if (i < this.items.length-1) {
            this.items[i].setNext(this.items[i+1]);
        }
        else {
            this.items[i].setNext(null);
        }
    }
}
PinsList.prototype = {

    /**
     * @todo Pārtaisīt, lai events ir tikai uz to pin, kurš reāli maina pozīciju
     */
    onVizualize(cb) {
        this.vizualizeCb = cb;
    },

    vizualize(pin) {
        if (pin) {
            pin.vizualize();
        }
        else {
            this.items.forEach(pin => pin.vizualize());
        }

        this.vizualizeCb(this.items.map(pin => {
            return {
                index: pin.index,
                x: pin.getX(),
                y: pin.getY()
            }
        }))
    },

    resize(isInitialSetup) {
        this.items.forEach(pin => pin.resize(isInitialSetup))
    },

    setParentDimensions(parentDimensions) {
        this.items.forEach(pin => pin.setParentDimensions(parentDimensions))
    },

    /**
     * Savācam visu pins values
     */
    getValues(valueProps, convertValueCb) {
        return this.items.map(pin => pickValueIfSingleProp(valueProps, convertValueCb(pin.value)));
    },

    getPin(valueProps, pin, convertValueCb) {
        return {
            el: pin.el,
            position: pin.getPosition(),
            value: pickValueIfSingleProp(valueProps, convertValueCb(pin.value))
        }
    },

    /**
     * Meklējam pin, kurš atrodas norādītajās koordinātēs
     */
    findByPosition(x, y) {
        let pins = this.items.filter(pin => pin.isXY(x, y));

        /**
         * Apstrādāt gadījumu, kad ir atgriezti vairāki dēļ safePadding
         * safePadding dēļ pins var pārklāties
         * šajā gadījumā no atlasītajiem izvēlamies to, kuram x, y tuvāk bez safePadding
         *
         * @todo vēl jāapstrādā gadījums, ja pins pārklājas, tad te būtu jāatgriež
         * tas, kuram zIndex ir augstāks
         */
        if (pins.length > 1) {
            return this.findClosestPinToXY(pins, x, y);
        }

        return pins.length > 0 ? pins[0] : null;
    },

    findClosestPinToXY(pins, x, y) {
        let f = undefined;
        for (let i = 0; i < pins.length; i++) {
            if (f === undefined) {
                f = i;
            }
            else {
                if (pins[i].getDistanceToX(x) < pins[f].getDistanceToX(x)) {
                    f = i;
                }
            }
        }

        return pins[f];
    }
}

export default PinsList