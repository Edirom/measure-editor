import {Measure} from './Measure';
import {getAttributes, mapChildren, requireName} from './utils';
import {XMLContainer} from './XMLContainer';

const tagName = 'section';

export class Section extends XMLContainer {
    public static fromDOM(node: Node): Section {
        requireName(node, tagName);
        const attrs = getAttributes(node);
        const section = new Section(attrs['xml:id'], attrs.type);
        mapChildren(node, section, {
            measure: (childNode, index) => {
                section.addMeasure(Measure.fromDOM(childNode), index);
            },
        });
        return section;
    }
    public measures: Measure[] = [];
    constructor(
        public id?: string,
        public type?: string,
    ) {
        super();
    }
    public toXMLNode(createElement: (nodeName: string) => Element): Element {
        const element = createElement(tagName);
        if (this.id) {
            element.setAttribute('xml:id', this.id);
        }
        if (this.type) {
            element.setAttribute('type', this.type);
        }
        this.appendChildrenInOrder(createElement, element);
        return element;
    }
    public addMeasure(measure: Measure, index = 10000) {
        this.measures.push(measure);
        this.parsedElements.push({element: measure, index});
    }
    public removeMeasure(measureId: string) {
        const measureIndex = this.measures.findIndex((m) => m.id === measureId);
        if (measureIndex > -1) {
            const parsedIndex = this.parsedElements.findIndex((el) => {
                return el.element instanceof Measure && el.element.id === measureId;
            });
            if (parsedIndex > -1) {
                this.parsedElements.splice(parsedIndex, 1);
            } else {
                console.warn('Found element in measures but not in parsed elements');
            }
            this.measures.splice(measureIndex, 1);
            return true;
        }
        return false;
    }
}
