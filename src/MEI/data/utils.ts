import {XMLContainer} from './XMLContainer';

export function requireName(node: Node, name: string) {
    if (node.nodeName !== name) {
        throw new Error('Could not parse node "' + node.nodeName + '" (expected ' + name + ')');
    }
}

export function mapChildren(node: Node, container: XMLContainer, map: {
    [nodeName: string]: (childNode: Node, index: number) => void,
}) {
    for (let i = 0; i < node.childNodes.length; ++i) {
        const child = node.childNodes[i];
        // TODO: store this somewhere to be able to save it back
        if (child.nodeType === Node.COMMENT_NODE ||
            child.nodeType === Node.TEXT_NODE ||
            !map.hasOwnProperty(child.nodeName)) {
            container.unknownChildren.push({node: child, index: i});
        } else {
            map[child.nodeName](child, i);
        }
    }
}

export function getAttributes(node: Node) {
    if (!(node instanceof Element)) {
        throw new Error('Cannot cast "' + node.nodeName + '" to Element');
    }
    const el = (node as Element);
    const attrMap: {[key: string]: string} = {};
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < el.attributes.length; ++i) {
        attrMap[el.attributes[i].name] = el.attributes[i].value;
    }
    return attrMap;
}
