import {PrimitiveElement} from '@/data/measureEditor/PrimitiveElement';

export class EditorToolEvents {
    constructor(public createPrimitive: (element: PrimitiveElement) => void,
                public changePrimitiveById: (id: string, element: PrimitiveElement) => void,
                public deletePrimitiveById: (id: string) => void,
                public clearDynamicPrimitives: () => void,
                public createDynamicPrimitive: (element: PrimitiveElement) => void,
                public changeDynamicPrimitiveById: (id: string, element: PrimitiveElement) => void,
                public deleteDynamicPrimitiveById: (id: string) => void,
                public requestRenamePrimitiveById: (id: string) => void,
                public hidePrimitives: (exceptId: string) => void,
                public showPrimitives: () => void,
                public requestToolChange: (toolName: string) => void) {

    }

    public changePrimitive(element: PrimitiveElement) {
        this.changePrimitiveById(element.id, element);
    }

    public deletePrimitive(element: PrimitiveElement) {
        this.deletePrimitiveById(element.id);
    }

    public changeDynamicPrimitive(element: PrimitiveElement) {
        this.changeDynamicPrimitiveById(element.id, element);
    }

    public deleteDynamicPrimitive(element: PrimitiveElement) {
        this.deleteDynamicPrimitiveById(element.id);
    }
}
