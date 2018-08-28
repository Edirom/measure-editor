<template>
    <div class="h-100 w-100 d-flex">
        <div class="editor-pane w-100">
            <pane-headline>Notentexte</pane-headline>
            <div>
                <div v-for="sheet in sheets" :key="sheet.id" class="w-100">
                    <collapsible :title="sheet.name">
                        <template slot="controls">
                            <button class="btn btn-info btn-40" @click="exportMEI(sheet)">
                                <fa-icon icon="download"></fa-icon>
                            </button>
                            <router-link class="btn btn-edit btn-40" :to="'/measure-editor/' + sheet.id">
                                <fa-icon icon="cog"></fa-icon>
                            </router-link>
                            <button class="btn btn-danger btn-40" @click="deleteSheet(sheet)">
                                <fa-icon icon="trash"></fa-icon>
                            </button>
                        </template>
                        <div class="w-100 d-flex justify-content-between" v-for="source in sheet.images" :key="source.id">
                            <div :class="{'missing': source.imagepath === ''}">
                                <source-line :source="source"></source-line>
                            </div>
                            <div>
                                <button v-if="source.imagepath === ''" class="btn btn-edit btn-40" @click="uploadImage(source)">
                                    <fa-icon icon="upload"></fa-icon>
                                </button>
                                <button class="btn btn-danger btn-40" @click="deleteImage(source)">
                                    <fa-icon icon="trash"></fa-icon>
                                </button>
                            </div>
                        </div>
                        <div class="d-flex w-100 justify-content-end">
                            <button class="btn btn-add btn-40">
                                <fa-icon icon="plus"></fa-icon>
                            </button>
                        </div>
                    </collapsible>
                </div>
                <div class="d-flex w-100 justify-content-end">
                    <button class="btn btn-add btn-40" @click="uploadMEI()">
                        <fa-icon icon="plus"></fa-icon>
                    </button>
                </div>
            </div>
        </div>
        <modal v-if="showImageModal" @close="modalClosed()">
            <template slot="header">
                Bild ausw&auml;hlen
            </template>
            <template slot="body">
                <div>
                    <input class="form-control-file" type="file" ref="file" @change="filesSelected" accept="image/*"/>
                    <hr/>
                    <div class="form-group">
                        <label for="imageUrl">Oder URL angeben:</label>
                        <input class="form-control" id="imageUrl" v-model="imageUrl" />
                    </div>
                </div>
            </template>
        </modal>
        <modal v-if="showMEIModal" @close="modalClosed()">
            <template slot="header">
                MEI ausw&auml;hlen
            </template>
            <template slot="body">
                <div>
                    <input class="form-control-file" type="file" ref="file" @change="filesSelected" accept="application/xml"/>
                </div>
            </template>
        </modal>
    </div>
</template>
<script lang="ts">
    import {Vue, Component} from 'vue-property-decorator';
    import {Action, Getter, Mutation} from 'vuex-class';
    import {Sheet} from '@/data/Sheet';
    import {Image} from '@/data/Image';
    import PaneHeadline from '@/components/PaneHeadline.vue';
    import Collapsible from '@/components/Collapsible.vue';
    import SourceLine from '@/components/SourceLine.vue';
    import { library } from '@fortawesome/fontawesome-svg-core';
    import {
        faCog,
        faMinus,
        faPlus,
        faTrash,
        faUpload,
        faDownload,
    } from '@fortawesome/free-solid-svg-icons';
    import Modal from '@/components/Modal.vue';

    library.add(faTrash);
    library.add(faCog);
    library.add(faMinus);
    library.add(faPlus);
    library.add(faUpload);
    library.add(faDownload);

    @Component({
        components: {
            PaneHeadline,
            Collapsible,
            SourceLine,
            Modal,
        },
    })
    export default class Loader extends Vue {
        @Getter('sheets') private sheets!: { [id: string]: Sheet };
        @Getter('images') private images!: { [id: string]: Image };
        @Mutation('setHeadline') private setHeadline!: (s: string) => void;
        @Mutation('setCurrentEntity') private setCurrentEntity!: (s: string) => void;
        @Action('deleteSheet') private deleteSheet!: (s: Sheet) => void;
        @Action('deleteImage') private deleteImage!: (i: Image) => void;
        @Action('updateImage') private updateImage!: (i: Image) => void;
        @Action('loadMEI') private loadMEI!: (data: {text: string, sheetName: string}) => void;
        private showImageModal = false;
        private showMEIModal = false;
        private linkedImage?: Image;
        private imageUrl: string = '';
        public mounted() {
            this.setHeadline('Bibliothek');
            this.setCurrentEntity('');
        }
        public modalClosed() {
            this.showImageModal = false;
            this.showMEIModal = false;
            this.linkedImage = undefined;
            this.imageUrl = '';
        }
        public uploadMEI() {
            this.showMEIModal = true;
        }
        public uploadImage(img: Image) {
            this.linkedImage = img;
            this.showImageModal = true;
        }
        private filesSelected(event: Event) {
            for (const file of (event.target as any).files) {
                this.handleFile(file);
            }
        }
        private handleFile(file: File) {
            if (this.showMEIModal) {
                const reader = new FileReader();
                reader.onload = () => {
                    const fileName = file.name.split('.xml')[0];
                    const text = reader.result as string;
                    this.loadMEI({text, sheetName: fileName});
                };
                reader.readAsText(file);
            } else {
                if (this.linkedImage) {
                    this.linkedImage.imagepath = URL.createObjectURL(file);
                    this.updateImage(this.linkedImage);
                    this.imageUrl = '';
                } else {
                    console.warn('Loaded image but do not know where to put it');
                }
            }
        }
        private exportMEI(sheet: Sheet) {
            if (sheet.parentMEI) {
                const preamble = '<?xml version="1.0" encoding="UTF-8"?>\n';
                const xmlDoc = sheet.parentMEI.toXMLNode(document.createElement);
                const serializer = new XMLSerializer();
                const fullText = preamble + serializer.serializeToString(xmlDoc);
                const element = document.createElement('a');
                element.setAttribute('href', 'data:application/xml;charset=utf-8,' + encodeURIComponent(fullText));
                element.setAttribute('download', sheet.name + '.xml');
                element.style.display = 'none';
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
            }
        }
    }
</script>
<style scoped lang="scss">
    .missing {
        color: red;
    }
    .btn-info {
        margin-right: 3px;
    }
</style>
