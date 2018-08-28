import {getAttributes, mapChildren, requireName} from './utils';
import {XMLContainer} from './XMLContainer';

const tagName = 'graphic';

export class Graphic extends XMLContainer {
    public static fromDOM(node: Node) {
        requireName(node, tagName);
        const attrs = getAttributes(node);
        const width = parseInt(attrs.width, 10);
        const height = parseInt(attrs.height, 10);
        if (isNaN(width) || isNaN(height)) {
            console.warn('Got a graphic with nonsense width/height values', {attrs});
        }
        const graphic = new Graphic(attrs['xml:id'], attrs.target, width, height);
        mapChildren(node, graphic, {});
        return graphic;
    }
    constructor(
        public id: string,
        public target: string,
        public width: number,
        public height: number,
    ) {
        super();
    }
    public toXMLNode(createElement: (nodeName: string) => Element): Element {
        const element = createElement(tagName);
        element.setAttribute('xml:id', this.id);
        element.setAttribute('target', this.target);
        element.setAttribute('width', this.width.toString());
        element.setAttribute('height', this.height.toString());
        this.appendChildrenInOrder(createElement, element);
        return element;
    }
}
