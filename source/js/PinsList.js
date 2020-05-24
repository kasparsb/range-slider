import formatPinsConfiguration from './formatPinsConfiguration';
import Pin from './Pin';

function findNodeByIndex(nodeList, index) {
    if (index < nodeList.length) {
        return nodeList[index];
    }
    return false;
}

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
function PinsList(pinsConfiguartion, safePadding, container) {
    this.container = container;

    // Atlasām jau dom esošos pin elementus, lai tos izmantotu
    let alreadyDefinedPinElements = container.querySelectorAll('.rangeslider__pin');

    pinsConfiguartion = formatPinsConfiguration(pinsConfiguartion);

    // Create pins from configuration
    this.items = pinsConfiguartion.map(conf => {

        let pin = new Pin(findNodeByIndex(alreadyDefinedPinElements, conf.index));

        pin.setIndex(conf.index);
        pin.setValue(conf.value);
        pin.setBoundry(conf.boundry);

        pin.setSafePadding(safePadding);

        this.container.appendChild(pin.el)

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
    vizualize() {
        this.items.forEach(pin => pin.vizualize());
    },

    resize(parentDimensions) {
        this.items.forEach(pin => pin.resize())
    },

    setParentDimensions(parentDimensions) {
        this.items.forEach(pin => pin.setParentDimensions(parentDimensions))
    },

    /**
     * Savācam visu pins values
     */
    getValues(props) {
        return this.items.map(pin => pickValueIfSingleProp(props, pin.value));
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