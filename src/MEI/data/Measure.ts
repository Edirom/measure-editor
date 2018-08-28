import {getAttributes, mapChildren, requireName} from './utils';
import {XMLContainer} from './XMLContainer';

const tagName = 'measure';

export class Measure extends XMLContainer {
    public static fromDOM(node: Node): Measure {
        requireName(node, tagName);
        const attrs = getAttributes(node);
        const measure = new Measure(attrs['xml:id'], attrs.n, attrs.label || attrs.n || '', attrs.facs);
        mapChildren(node, measure, {});
        return measure;
    }
    constructor(
        public id: string,
        public n: string,
        public label: string,
        public facs: string,
    ) {
        super();
    }
    public toXMLNode(createElement: (nodeName: string) => Element): Element {
        const element = createElement(tagName);
        element.setAttribute('xml:id', this.id);
        element.setAttribute('n', this.n);
        element.setAttribute('label', this.label);
        // TODO: update property first
        element.setAttribute('facs', this.facs);
        this.appendChildrenInOrder(createElement, element);
        return element;
    }
}
