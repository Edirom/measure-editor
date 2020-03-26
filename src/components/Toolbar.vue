<template>
    <div class="d-flex w-100 justify-content-start">
        <!-- this is kind of awkward but btn-group-vertical marks the width as 100% -->
        <div class="btn-group-vertical btn-group-toggle width-40px">
            <label class="btn btn-40 btn-outline-primary"
                   :class="tool === 'pan' ? 'active' : ''">
                <input type="radio" name="tool" v-model="tool" :value="'pan'"/>
                <fa-icon icon="hand-pointer"></fa-icon>
            </label>
            <label class="btn btn-40 btn-outline-primary"
                   :class="tool === 'mark' ? 'active' : ''">
                <input type="radio" name="tool" v-model="tool" :value="'mark'"/>
                <fa-icon icon="marker"></fa-icon>
            </label>
            <label class="btn btn-40 btn-outline-primary"
                   :class="tool === 'edit' ? 'active' : ''">
                <input type="radio" name="tool" v-model="tool" :value="'edit'"/>
                <fa-icon icon="pencil-alt"></fa-icon>
            </label>
            <label class="btn btn-40 btn-outline-primary"
                   :class="tool === 'cut' ? 'active' : ''">
                <input type="radio" name="tool" v-model="tool" :value="'cut'"/>
                <fa-icon icon="cut"></fa-icon>
            </label>
            <label class="btn btn-40 btn-outline-primary"
                   :class="tool === 'delete' ? 'active' : ''">
                <input type="radio" name="tool" v-model="tool" :value="'delete'"/>
                <fa-icon icon="eraser"></fa-icon>
            </label>
            <label class="btn btn-40 btn-outline-primary"
                   :class="tool === 'rename' ? 'active' : ''">
                <input type="radio" name="tool" v-model="tool" :value="'rename'"/>
                <fa-icon icon="i-cursor"></fa-icon>
            </label>
            <label class="btn btn-40 btn-outline-primary"
                   :class="tool === 'autorename' ? 'active' : ''">
                <input type="radio" name="tool" v-model="tool" :value="'autorename'"/>
                <fa-icon icon="i-cursor"></fa-icon>
            </label>
            <label class="btn btn-40 btn-outline-primary"
                   :class="tool === 'segment' ? 'active' : ''">
                <input type="radio" name="tool" v-model="tool" :value="'segment'"/>
                <fa-icon icon="columns"></fa-icon>
            </label>
        </div>
        <div class="flex-fill">
            <div class="height-40px v-center">Bild bewegen</div>
            <div class="height-40px v-center">Markieren</div>
            <div class="height-40px v-center">Bearbeiten</div>
            <div class="height-40px v-center">Schneiden</div>
            <div class="height-40px v-center">L&ouml;schen</div>
            <div class="height-40px v-center">Umbenennen</div>
            <div class="height-40px v-center">Automatisch Durchzählen</div>
            <div class="height-40px v-center">Abschnitt hinzuf&uuml;gen</div>
        </div>
    </div>
</template>
<script lang="ts">
    import {Component, Prop, Vue, Watch} from 'vue-property-decorator';
    import {OverlayPointerEvent} from '@/data/geometry/OverlayPointerEvent';
    import {
        AutoRenameTool,
        ClickType,
        CutTool,
        DeleteTool,
        EditorMouseEvent,
        EditorTool,
        EditorToolEvents,
        EditTool,
        MarkerTool,
        RenameTool,
    } from '@/data/measureEditor/tools';
    import {Point} from '@/data/measureEditor/Point';
    import {PrimitiveElement} from '@/data/measureEditor/PrimitiveElement';
    import {
        faColumns,
        faCut,
        faEraser,
        faHandPointer,
        faICursor,
        faMarker,
        faPencilAlt,
    } from '@fortawesome/free-solid-svg-icons';
    import {library} from '@fortawesome/fontawesome-svg-core';

    library.add(faColumns);
    library.add(faCut);
    library.add(faEraser);
    library.add(faHandPointer);
    library.add(faICursor);
    library.add(faMarker);
    library.add(faPencilAlt);


    @Component({})
    export default class Toolbar extends Vue {
        private tool = 'mark';
        private lastMousePosition: Point = new Point(0, 0);
        @Prop() private staticElements!: PrimitiveElement[];
        @Prop() private dynamicElements!: PrimitiveElement[];
        private editorToolEvents: EditorToolEvents = new EditorToolEvents(
            this.createPrimitive,
            this.changePrimitiveById,
            this.deletePrimitiveById,
            this.clearDynamicPrimitives,
            this.createDynamicPrimitive,
            this.changeDynamicPrimitiveById,
            this.deleteDynamicPrimitiveById,
            this.requestRenamePrimitiveById,
            this.hidePrimitives,
            this.showPrimitives,
            this.requestToolChange,
        );
        private currentTool: EditorTool | null = new MarkerTool(this.editorToolEvents);

        public editorPointerUp(event: OverlayPointerEvent) {
            const currentPosition = new Point(event.point.x, event.point.y);
            if (this.currentTool) {
                const clickType = event.event.button === 0 ? ClickType.Left : ClickType.Right;
                this.currentTool.handleEvent(new EditorMouseEvent(clickType, currentPosition, this.lastMousePosition),
                    this.staticElements, this.dynamicElements);
            }
            this.lastMousePosition = currentPosition;
        }

        public editorPointerDown(event: OverlayPointerEvent) {
            // TODO: not needed?
        }

        public editorPointerMove(event: OverlayPointerEvent) {
            const currentPosition = new Point(event.point.x, event.point.y);
            if (this.currentTool) {
                this.currentTool.handleEvent(
                    new EditorMouseEvent(ClickType.None, currentPosition, this.lastMousePosition), this.staticElements,
                    this.dynamicElements);
            }
            this.lastMousePosition = currentPosition;
        }

        @Watch('tool')
        private selectTool() {
            this.resetToolState();
            if (this.tool === 'mark') {
                this.currentTool = new MarkerTool(this.editorToolEvents);
            } else if (this.tool === 'edit') {
                this.currentTool = new EditTool(this.editorToolEvents);
            } else if (this.tool === 'cut') {
                this.currentTool = new CutTool(this.editorToolEvents);
            } else if (this.tool === 'delete') {
                this.currentTool = new DeleteTool(this.editorToolEvents);
            } else if (this.tool === 'rename') {
                this.currentTool = new RenameTool(this.editorToolEvents);
            } else if (this.tool === 'autorename') {
                this.currentTool = new AutoRenameTool(this.editorToolEvents);
            } else {
                this.currentTool = null;
            }
            if (this.currentTool) {
                this.currentTool.onToolSelected(this.staticElements);
            }
            this.$emit('mouseStateChange', this.currentTool !== null);
        }

        private resetToolState() {
            this.showPrimitives();
            this.clearDynamicPrimitives();
        }

        private createPrimitive(element: PrimitiveElement) {
            this.$emit('createPrimitive', element);
        }

        private changePrimitiveById(id: string, element: PrimitiveElement) {
            this.$emit('changePrimitiveById', {id, element});
        }

        private deletePrimitiveById(id: string) {
            this.$emit('deletePrimitiveById', id);
        }

        private clearDynamicPrimitives() {
            this.$emit('clearDynamicPrimitives');
        }

        private createDynamicPrimitive(element: PrimitiveElement) {
            this.$emit('createDynamicPrimitive', element);
        }

        private changeDynamicPrimitiveById(id: string, element: PrimitiveElement) {
            this.$emit('changeDynamicPrimitiveById', {id, element});
        }

        private deleteDynamicPrimitiveById(id: string) {
            this.$emit('deleteDynamicPrimitiveById', id);
        }

        private requestRenamePrimitiveById(id: string) {
            this.$emit('requestRenamePrimitiveById', id);
        }

        private hidePrimitives(exceptId: string) {
            this.$emit('hidePrimitives', exceptId);
        }

        private showPrimitives() {
            this.$emit('showPrimitives');
        }

        private requestToolChange(toolName: string) {
            this.tool = toolName;
        }
    }
</script>
<style scoped lang="scss">
    .width-40px {
        width: 40px;
    }

    .height-40px {
        height: 40px;
        vertical-align: middle;
        line-height: 40px;
        padding-left: 10px;
    }
</style>
