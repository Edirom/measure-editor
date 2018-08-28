import {Score} from './Score';
import {getAttributes, mapChildren, requireName} from './utils';
import {XMLContainer} from './XMLContainer';

const tagName = 'mdiv';

export class MDiv extends XMLContainer {
    public static fromDOM(node: Node): MDiv {
        requireName(node, tagName);
        const attrs = getAttributes(node);
        const mdiv = new MDiv(attrs['xml:id'], attrs.n, attrs.label);
        mapChildren(node, mdiv, {
            score: (childNode, index) => {
                const score = Score.fromDOM(childNode);
                mdiv.scores.push(score);
                mdiv.parsedElements.push({element: score, index});
            },
        });
        return mdiv;
    }
    public scores: Score[] = [];
    constructor(
        public id: string,
        public n?: string,
        public label?: string,
    ) {
        super();
    }
    public toXMLNode(createElement: (nodeName: string) => Element): Element {
        const element = createElement(tagName);
        element.setAttribute('xml:id', this.id);
        if (this.n) {
            element.setAttribute('n', this.n);
        }
        if (this.label) {
            element.setAttribute('label', this.label);
        }
        this.appendChildrenInOrder(createElement, element);
        return element;
    }
}
