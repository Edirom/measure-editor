import {MDiv} from './MDiv';
import {mapChildren, requireName} from './utils';
import {XMLContainer} from './XMLContainer';

const tagName = 'body';

export class Body extends XMLContainer {
    public static fromDOM(node: Node): Body {
        requireName(node, tagName);
        const body = new Body();
        mapChildren(node, body, {
            mdiv: (childNode, index) => {
                const mdiv = MDiv.fromDOM(childNode);
                body.mdivs.push(mdiv);
                body.parsedElements.push({index, element: mdiv});
            },
        });
        return body;
    }
    // not sure what this stands for
    public mdivs: MDiv[] = [];
    public toXMLNode(createElement: (nodeName: string) => Element): Element {
        const element = createElement(tagName);
        this.appendChildrenInOrder(createElement, element);
        return element;
    }
}
