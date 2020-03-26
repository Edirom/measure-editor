<template>
    <div class="w-100 h-100">
        <div class="d-flex w-100 h-100" v-if="!error">
            <div class="measure-toolbar flex-content-size-auto editor-pane h-100">
                <div class="d-flex justify-content-between flex-column h-100">
                    <div class="d-flex justify-content-start w-100 flex-column">
                        <pane-headline>Optionen</pane-headline>
                        <div class="toolbar-element">
                            <toolbar ref="toolbar"
                                     :staticElements="staticElements"
                                     :dynamicElements="dynamicElements"
                                     v-on:createPrimitive="createPrimitive"
                                     v-on:changePrimitiveById="changePrimitiveById"
                                     v-on:deletePrimitiveById="deletePrimitiveById"
                                     v-on:clearDynamicPrimitives="clearDynamicPrimitives"
                                     v-on:createDynamicPrimitive="createDynamicPrimitive"
                                     v-on:changeDynamicPrimitiveById="changeDynamicPrimitiveById"
                                     v-on:deleteDynamicPrimitiveById="deleteDynamicPrimitiveById"
                                     v-on:requestRenamePrimitiveById="requestRenamePrimitiveById"
                                     @mouseStateChange="mouseStateChanged"
                                     @hidePrimitives="hidePrimitives"
                                     @showPrimitives="showPrimitives"
                            >
                            </toolbar>
                        </div>
                        <div class="toolbar-element">
                            <pane-headline>Abschnitte</pane-headline>
                            <div class="scroll">
                                <div v-for="segment in segments" class="mb-1" @click="selectSegment(segment)"
                                     :class="{'active': selectedSegment === segment}" v-bind:key="segment.id">
                                    <editor-segment :name="segment.name" :color="segment.color" :id="segment.id"
                                                    @name-change="changeName" @delete="deleteSegment">
                                    </editor-segment>
                                </div>
                            </div>
                            <div class="d-flex w-100 justify-content-end">
                                <button class="btn btn-40 btn-add" @click="createSegment()">
                                    <fa-icon icon="plus"></fa-icon>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="d-flex justify-content-end flex-column">
                        <div class="toolbar-element">
                            <pane-headline>Navigation</pane-headline>
                            <div class="page-navigation input-group">
                                <button class="btn input-group-prepend" @click="previousPage()">
                                    &lt;
                                </button>
                                <input class="form-control mw-3" v-model="page" :max="pageCount()" step="1"/>
                                <button class="btn input-group-append input-group-prepend">
                                    /
                                </button>
                                <input class="form-control mw-3" disabled :value="pageCount()"/>
                                <button class="btn input-group-append" @click="nextPage()">
                                    &gt;
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex-fill absolute-center" v-if="seaDragonIsLoading">
                <div class="d-flex w-100 h-100 justify-content-around">
                    <div class="d-flex flex-column h-100 justify-content-around">
                        <div>
                            <fa-icon icon="spinner" size="3x" spin></fa-icon>
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex-fill drawing-area" :class="{'invisible': seaDragonIsLoading}" @contextmenu="onContextMenu">
                <keep-alive>
                    <sea-dragon :image="currentImage" @created="viewerCreated"
                                @startLoading="startLoading" @finishedLoading="finishedLoading"></sea-dragon>
                </keep-alive>
                <sea-dragon-overlay v-if="viewerReady" :staticElements="staticElements"
                                    :dynamicElements="dynamicElements" :viewer="viewer"
                                    :disableMouseEvents="!editorMouseEventsEnabled"
                                    v-on:pointer-down="overlayMouseDown"
                                    v-on:pointer-up="overlayMouseUp"
                                    v-on:mouse-move="overlayMouseMove">
                </sea-dragon-overlay>
            </div>
        </div>
        <modal v-if="showModal" @close="modalClosed()">
            <template slot="header">
                Takt umbenennen
            </template>
            <template slot="body">
                <input class="form-control" v-model="currentEntity.name" @keypress="modalKeypress"/>
            </template>
        </modal>
    </div>
</template>
<script lang="ts">
    import {Component, Prop, Vue, Watch} from 'vue-property-decorator';
    import {library} from '@fortawesome/fontawesome-svg-core';
    import {
        faPlus,
        faSpinner,
    } from '@fortawesome/free-solid-svg-icons';
    import PaneHeadline from '@/components/PaneHeadline.vue';
    import EditorSegment from '@/components/EditorSegment.vue';
    import {Sheet} from '@/data/Sheet';
    import {Action, Getter, Mutation} from 'vuex-class';
    import SeaDragon from '@/components/SeaDragon.vue';
    import {Segment} from '@/data/Segment';
    import {Image} from '@/data/Image';
    import {Viewer} from 'openseadragon';
    import SeaDragonOverlay from '@/components/SeaDragonOverlay.vue';
    import {Measure} from '@/data/Measure';
    import {OverlayPointerEvent} from '@/data/geometry/OverlayPointerEvent';
    import Modal from '@/components/Modal.vue';
    import {MeasureOnSheet} from '@/types';
    import {Mutations} from '@/store';
    import Toolbar from '@/components/Toolbar.vue';
    import {Point} from '@/data/measureEditor/Point';
    import {PrimitiveElement} from '@/data/measureEditor/PrimitiveElement';
    import {RGB} from '@/data/measureEditor/RGB';

    library.add(faPlus);
    library.add(faSpinner);

    const primitiveToMeasure = (element: PrimitiveElement): Measure => {
        return new Measure(element.label, {points: element.points});
    };

    @Component({
        components: {
            SeaDragonOverlay,
            SeaDragon,
            PaneHeadline,
            EditorSegment,
            Modal,
            Toolbar,
        },
    })
    export default class Editor extends Vue {
        public $refs!: {
            toolbar: Toolbar;
        };
        private staticElements: PrimitiveElement[] = [];
        private dynamicElements: PrimitiveElement[] = [];
        private segments: Segment[] = [];
        private sheet!: Sheet;
        private page = 1;
        private error = false;
        private childViewer!: Viewer;
        private viewerReady = false;
        private showModal = false;
        private selectedSegment: Segment | null = null;
        private editorMouseEventsEnabled = true;
        private currentEntity?: Measure;
        private seaDragonIsLoading = false;

        private get viewer(): Viewer {
            return this.childViewer;
        }

        private set viewer(viewer: Viewer) {
            this.childViewer = viewer;
        }

        private get currentImage(): Image {
            return this.sheet.images[Math.min(this.page, this.pageCount()) - 1];
        }

        @Prop() private id!: string;
        @Getter('sheets') private sheets!: { [id: string]: Sheet };
        @Getter('measuresOnPage') private measuresOnPage!: (sheetId: string, page: number) => Measure[];
        @Mutation('setHeadline') private setHeadline!: (s: string) => void;
        @Mutation('setCurrentEntity') private setCurrentEntity!: (s: string) => void;
        @Action('addMeasureToSheet') private addMeasureToSheet!:
            (data: MeasureOnSheet) => void;
        @Action('removeMeasureFromSheet') private removeMeasureFromSheet!:
            (data: MeasureOnSheet) => void;
        // @Action('splitMeasure') private splitMeasure!:
        //     (data: MeasureSplit) => void;
        @Action('updateMeasure') private updateMeasure!: (m: Measure) => void;
        @Action(Mutations.ADD_SEGMENT_TO_SHEET) private addSegmentToSheet!:
            (data: { segment: Segment; sheetId: string }) => void;
        @Action(Mutations.REMOVE_SEGMENT_FROM_SHEET) private removeSegmentFromSheet!:
            (data: { segment: Segment; sheetId: string }) => void;
        @Action(Mutations.UPDATE_SEGMENT) private updateSegment!: (s: Segment) => void;

        private createMockElements() {
            this.staticElements = [];
            for (const measure of this.measuresOnPage(this.sheet.id, this.page - 1)) {
                const points = measure.geometry.points.map((p) => new Point(p.x, p.y));
                this.staticElements.push(new PrimitiveElement(measure.id, measure.getName(), new RGB(1.0, 0.0, 0.0),
                    points));
            }
        }

        @Watch('page')
        private sanitizePage() {
            this.page = Math.max(1, Math.min(this.page, this.pageCount()));
            this.dynamicElements = [];
            this.createMockElements();
        }

        @Watch('sheets')
        private updateSheets() {
            this.error = true;
            if (!this.sheets) {
                return;
            }
            if (Object.hasOwnProperty.call(this.sheets, this.id)) {
                this.sheet = this.sheets[this.id];
                this.error = false;
                this.segments = this.sheet.segments;
                this.setCurrentEntity(this.sheet.name);
                this.createMockElements();
            }
        }

        private beforeMount() {
            this.setHeadline('Takte & Instrumente markieren');
            this.updateSheets();
        }

        // TODO: add color progression
        private getNextColor(): string {
            const hue = this.segments.length * 25;
            return 'hsl(' + hue + ', 90%, 60%)';
        }

        private createSegment(): void {
            this.addSegmentToSheet({
                segment: {
                    id: '',
                    name: 'Neu',
                    color: this.getNextColor(),
                    sheetId: this.sheet.id,
                },
                sheetId: this.sheet.id,
            });
        }

        private deleteSegment(id: string): void {
            const segment = this.segments.find((s) => s.id === id);
            if (segment) {
                this.removeSegmentFromSheet({
                    segment,
                    sheetId: this.sheet.id,
                });
            }
        }

        private pageCount(): number {
            return this.sheet.images.length;
        }

        private previousPage(): void {
            if (this.page > 1) {
                this.page--;
            }
        }

        private nextPage(): void {
            if (this.page < this.pageCount()) {
                this.page++;
            }
        }

        private changeName(event: { id: string; name: string }) {
            const segment = this.segments.find((s) => s.id === event.id);
            if (segment) {
                segment.name = event.name;
                this.updateSegment(segment);
            }
        }

        private viewerCreated(viewer: Viewer) {
            this.viewerReady = true;
            this.viewer = viewer;
        }

        private createPrimitive(element: PrimitiveElement) {
            this.addMeasureToSheet({
                measure: primitiveToMeasure(element),
                sheetId: this.sheet.id,
                page: this.page - 1,
                imageId: this.currentImage.id,
            });
        }

        private changePrimitiveById(e: { id: string; element: PrimitiveElement }) {
            const measure = primitiveToMeasure(e.element);
            measure.id = e.id;
            this.updateMeasure(measure);
        }

        private deletePrimitiveById(id: string) {
            const dummy = new Measure('', {points: []});
            dummy.id = id;
            this.removeMeasureFromSheet({
                measure: dummy,
                sheetId: this.sheet.id,
                page: this.page - 1,
                imageId: this.currentImage.id,
            });
        }

        private clearDynamicPrimitives() {
            this.dynamicElements = [];
        }

        private createDynamicPrimitive(element: PrimitiveElement) {
            // to force an update we need a new array allocation anyway
            this.dynamicElements = this.dynamicElements.concat([element]);
        }

        private changeDynamicPrimitiveById(e: { id: string; element: PrimitiveElement }) {
            for (let i = 0; i < this.dynamicElements.length; ++i) {
                if (this.dynamicElements[i].id === e.id) {
                    this.dynamicElements[i] = e.element;
                    // force update
                    this.dynamicElements = this.dynamicElements.slice();
                    return;
                }
            }
            // TODO: error? element not found
        }

        private deleteDynamicPrimitiveById(id: string) {
            for (let i = 0; i < this.dynamicElements.length; ++i) {
                if (this.dynamicElements[i].id === id) {
                    this.dynamicElements.splice(i, 1);
                    // force update
                    this.dynamicElements = this.dynamicElements.slice();
                    return;
                }
            }
            // TODO: error? element not found
        }

        private requestRenamePrimitiveById(id: string) {
            const measure = this.measuresOnPage(this.sheet.id, this.page - 1).find((el) => {
                return el.id === id;
            });
            if (measure) {
                this.currentEntity = measure;
                this.showModal = true;
            }
        }

        private overlayMouseUp(event: OverlayPointerEvent) {
            if (this.$refs && this.$refs.toolbar) {
                this.$refs.toolbar.editorPointerUp(event);
            }
        }

        private overlayMouseDown(event: OverlayPointerEvent) {
            if (this.$refs && this.$refs.toolbar) {
                this.$refs.toolbar.editorPointerDown(event);
            }
        }

        private overlayMouseMove(event: OverlayPointerEvent) {
            if (this.$refs && this.$refs.toolbar) {
                this.$refs.toolbar.editorPointerMove(event);
            }
        }

        private onContextMenu(event: PointerEvent) {
            // disable context menu for seadragon
            event.preventDefault();
        }

        private selectSegment(segment: Segment) {
            this.selectedSegment = segment;
        }

        private modalClosed() {
            this.showModal = false;
            if (this.currentEntity) {
                this.updateMeasure(this.currentEntity);
            }
        }

        private mouseStateChanged(ev: boolean) {
            this.editorMouseEventsEnabled = ev;
        }

        private changeVisibilityState(state: boolean, exceptId?: string) {
            for (const el of this.staticElements) {
                if (exceptId && el.id === exceptId) {
                    continue;
                }
                el.isVisible = state;
            }
            this.staticElements = this.staticElements.slice();
        }

        private hidePrimitives(exceptId: string) {
            this.changeVisibilityState(false, exceptId);
        }

        private showPrimitives() {
            this.changeVisibilityState(true);
        }

        private startLoading() {
            this.seaDragonIsLoading = true;
        }

        private finishedLoading() {
            this.seaDragonIsLoading = false;
        }

        private modalKeypress(ev: KeyboardEvent) {
            if (ev.key === 'Enter') {
                this.modalClosed();
            }
        }
    }
</script>
<style scoped lang="scss">
    @import '../scss/variables';

    .drawing-area {
        --default-box-color: lightgreen;
        background: $dark-bg;
    }

    .toolbar-element {
        margin-bottom: 2rem;
    }

    .active {
        background: $border-color;
    }

    .mw-3 {
        max-width: 3rem;
    }

    .scroll {
        overflow-y: auto;
        max-height: 20vh;
    }

    .absolute-center {
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
    }
</style>
