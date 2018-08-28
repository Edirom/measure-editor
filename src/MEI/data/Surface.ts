import {Extents} from './Extents';
import {Graphic} from './Graphic';
import {Zone} from './Zone';
import {getAttributes, mapChildren, requireName} from './utils';
import {XMLContainer} from './XMLContainer';

const tagName = 'surface';

export class Surface extends XMLContainer {
    public static fromDOM(node: Node): Surface {
        requireName(node, tagName);
        const attributes = getAttributes(node);
        const surface = new Surface(attributes['xml:id'], attributes.n, Extents.fromAttributes(attributes));
        mapChildren(node, surface, {
            graphic: (childNode, index) => {
                surface.graphic = Graphic.fromDOM(childNode);
                surface.parsedElements.push({element: surface.graphic, index});
            },
            zone: (childNode, index) => {
                surface.addZone(Zone.fromDOM(childNode), index);
            },
        });
        return surface;
    }
    public graphic?: Graphic;
    public zones: Zone[] = [];
    constructor(
        public id: string,
        // this is called "n" as the attribute in the tag but I suspect this to be the label
        public label?: string,
        public extents?: Extents,
    ) {
        super();
    }
    public toXMLNode(createElement: (nodeName: string) => Element): Element {
        const element = createElement(tagName);
        element.setAttribute('xml:id', this.id);
        if (this.label) {
            element.setAttribute('n', this.label);
        }
        if (this.extents) {
            this.extents.addAttributesToNode(element);
        }
        this.appendChildrenInOrder(createElement, element);
        return element;
    }
    public addZone(zone: Zone, index = 10000) {
        // order of zones does not really matter, so we just assume a high number
        this.zones.push(zone);
        this.parsedElements.push({element: zone, index});
    }
    public removeZone(zoneId: string) {
        const zoneIndex = this.zones.findIndex((z) => z.id === zoneId);
        if (zoneIndex > -1) {
            const parsedIndex = this.parsedElements.findIndex((el) => {
                return el.element instanceof Zone && el.element.id === zoneId;
            });
            if (parsedIndex > -1) {
                this.parsedElements.splice(parsedIndex, 1);
            } else {
                console.warn('Found element in zones but not in parsed elements');
            }
            this.zones.splice(zoneIndex, 1);
            return true;
        }
        return false;
    }
}
