import {Facsimile} from './Facsimile';
import {Body} from './Body';
import {mapChildren, requireName} from './utils';
import {XMLContainer} from './XMLContainer';

const tagName = 'music';

export class Music extends XMLContainer {
    public static fromDOM(node: Node): Music {
        requireName(node, tagName);
        const music = new Music();
        mapChildren(node, music, {
            facsimile: (childNode, index) => {
                music.facsimile = Facsimile.fromDOM(childNode);
                music.parsedElements.push({element: music.facsimile, index});
            },
            body: (childNode, index) => {
                music.body = Body.fromDOM(childNode);
                music.parsedElements.push({element: music.body, index});
            },
        });
        return music;
    }
    public facsimile?: Facsimile;
    public body?: Body;
    public toXMLNode(createElement: (nodeName: string) => Element): Element {
        const element = createElement(tagName);
        this.appendChildrenInOrder(createElement, element);
        return element;
    }
}
