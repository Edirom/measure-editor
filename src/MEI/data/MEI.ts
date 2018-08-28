// for ease of development we will mimic the structure of an XML
// this will make it possible to implement features bit by bit without losing data from imported XML
import {Music} from './Music';
import {requireName, mapChildren} from './utils';
import {XMLContainer} from './XMLContainer';

const tagName = 'mei';

export class MEI extends XMLContainer {
    public static fromDOM(node: Node): MEI {
        requireName(node, tagName);
        const mei = new MEI();
        mapChildren(node, mei, {
            music: (child, index) => {
                mei.music = Music.fromDOM(child);
                mei.parsedElements.push({element: mei.music, index});
            },
        });
        return mei;
    }
    public music?: Music;
    public toXMLNode(createElement: (nodeName: string) => Element): Element {
        const namespace = 'http://www.music-encoding.org/ns/mei';
        // we ignore the supplied document to be able to ensure the namespace
        const nsDoc = document.implementation.createDocument(namespace, 'mei', null);
        const createElementProxy = (nodeName: string): Element => {
            return nsDoc.createElementNS(namespace, nodeName);
        };
        this.appendChildrenInOrder(createElementProxy, nsDoc.documentElement);
        return nsDoc.documentElement;
    }
}
