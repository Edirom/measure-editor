import {Surface} from './Surface';
import {mapChildren, requireName} from './utils';
import {XMLContainer} from './XMLContainer';

const tagName = 'facsimile';

export class Facsimile extends XMLContainer {
    public static fromDOM(node: Node) {
        requireName(node, tagName);
        const facsimile = new Facsimile();
        mapChildren(node, facsimile, {
            surface: (childNode, index) => {
                const surface = Surface.fromDOM(childNode);
                facsimile.surfaces.push(surface);
                facsimile.parsedElements.push({index, element: surface});
            },
        });
        return facsimile;
    }
    public surfaces: Surface[] = [];
    public toXMLNode(createElement: (nodeName: string) => Element): Element {
        const element = createElement(tagName);
        this.appendChildrenInOrder(createElement, element);
        return element;
    }
}
