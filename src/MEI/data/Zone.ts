import {Extents} from './Extents';
import {Measure} from './Measure';
import {getAttributes, mapChildren, requireName} from './utils';
import {XMLContainer} from './XMLContainer';

const tagName = 'zone';

export class Zone extends XMLContainer {
    public static fromDOM(node: Node): Zone {
        requireName(node, tagName);
        const attrs = getAttributes(node);
        const extents = Extents.fromAttributes(attrs);
        if (!extents) {
            throw new Error('Got a zone without extents');
        }
        const zone = new Zone(attrs['xml:id'], extents, attrs.type);
        mapChildren(node, zone, {});
        return zone;
    }
    public measures: Measure[] = [];
    constructor(
        public id: string,
        public extents: Extents,
        public type?: string,
    ) {
        super();
    }
    public toXMLNode(createElement: (nodeName: string) => Element): Element {
        const element = createElement(tagName);
        element.setAttribute('xml:id', this.id);
        if (this.type) {
            element.setAttribute('type', this.type);
        }
        this.extents.addAttributesToNode(element);
        this.appendChildrenInOrder(createElement, element);
        return element;
    }
}
