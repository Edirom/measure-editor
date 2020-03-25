export abstract class XMLContainer {
    public unknownChildren: Array<{index: number; node: Node}> = [];
    public parsedElements: Array<{index: number; element: XMLContainer}> = [];
    public abstract toXMLNode(createElement: (nodeName: string) => Element): Element;
    protected appendChildrenInOrder(createElement: (nodeName: string) => Element, element: Element) {
        // just to make sure we have a break condition no matter this looks like determine the max index
        const childrenByIndex: Array<{element?: XMLContainer; index: number; node?: Node}> = this.parsedElements;
        childrenByIndex.concat(this.unknownChildren).sort((a, b) => {
            return a.index - b.index;
        }).forEach((el) => {
            if (el.element) {
                element.appendChild(el.element.toXMLNode(createElement));
            } else if (el.node) {
                element.appendChild(el.node);
            } else {
                console.warn('Found a child element that has neither node nor container',
                    {el, data: this});
            }
        });
    }
}
