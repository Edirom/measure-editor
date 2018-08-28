import {Section} from './Section';
import {mapChildren, requireName} from './utils';
import {XMLContainer} from './XMLContainer';

const tagName = 'score';

export class Score extends XMLContainer {
    public static fromDOM(node: Node): Score {
        requireName(node, tagName);
        const score = new Score();
        mapChildren(node, score, {
            section: (childNode, index) => {
                const section = Section.fromDOM(childNode);
                score.sections.push(section);
                score.parsedElements.push({element: section, index});
            },
        });
        return score;
    }
    public sections: Section[] = [];
    public toXMLNode(createElement: (nodeName: string) => Element): Element {
        const element = createElement(tagName);
        this.appendChildrenInOrder(createElement, element);
        return element;
    }
}
