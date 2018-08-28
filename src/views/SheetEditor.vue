<template>
    <div class="w-100 h-100">
        <div class="alert alert-danger" v-if="error">
            Cannot find a sheet with id {{ id }}
        </div>
        <div v-else class="d-flex w-100 h-100 justify-content-between">
            <div class="editor-pane w-25">
                <pane-headline>Eigenschaften / Metadaten</pane-headline>
                <div class="form-group">
                    <label class="col-form-label" for="title">Titel</label>
                    <input class="form-control" id="title" v-model="currentSheet.name" />
                </div>
                <div class="form-group">
                    <label class="col-form-label" for="composer">Komponist</label>
                    <input class="form-control" id="composer" v-model="currentSheet.composer" />
                </div>
                <div class="form-group">
                    <label class="col-form-label" for="year">Jahr</label>
                    <input class="form-control" id="year" v-model="currentSheet.year" />
                </div>
                <div class="form-group">
                    <label class="col-form-label" for="signature">Signatur</label>
                    <input class="form-control" id="signature" v-model="currentSheet.signature" />
                </div>
                <div class="form-group">
                    <label class="col-form-label" for="description">Beschreibung</label>
                    <textarea id="description" class="form-control" v-model="currentSheet.description"></textarea>
                </div>
            </div>
            <div class="editor-pane h-100 w-75">
                <div class="d-flex justify-content-between w-100 h-100">
                    <div class="w-50 padding-right">
                        <pane-headline>Bilddateien</pane-headline>
                        <div v-for="image in currentSheet.images" class="d-flex justify-content-between mb-1"
                             @click="setImage(image)">
                            <div class="d-flex justify-content-start mw-75">
                                <source-line :source="image">
                                    <template slot="prefix">
                                        <div class="icon">
                                            <fa-icon icon="grip-vertical"></fa-icon>
                                        </div>
                                    </template>
                                </source-line>
                            </div>
                            <div>
                                <button class="btn btn-outline-primary btn-40" @click="renameImage(image)">
                                    <fa-icon icon="i-cursor"></fa-icon>
                                </button>
                                <button class="btn btn-danger btn-40" @click="removeImage(image)">
                                    <fa-icon icon="trash"></fa-icon>
                                </button>
                            </div>
                        </div>
                        <input multiple type="file" ref="file" style="display: none" @change="filesSelected" accept="image/*">
                        <div class="dropzone" @drop="droppedFiles" @dragover="$event.preventDefault()" @click="selectFiles">
                            <div class="description">
                                <span v-if="startedUploads === completedUploads">Weitere Bilder hochladen...</span>
                                <span v-else><fa-icon class="fa-spin" icon="spinner"></fa-icon></span>
                            </div>
                        </div>
                    </div>
                    <div class="image-container flex-fill h-100">
                        <div class="image h-100" v-if="currentImage">
                            <sea-dragon :image="currentImage"></sea-dragon>
                        </div>
                    </div>
                </div>
            </div>
            <modal v-if="showModal" @close="modalClosed()">
                <template slot="header">
                    Bild umbenennen
                </template>
                <template slot="body">
                    <input class="form-control" v-model="currentImage.name" />
                </template>
            </modal>
        </div>
    </div>
</template>
<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import {Prop, Watch} from 'vue-property-decorator';
    import {Mutation, Getter, Action} from 'vuex-class';
    import {Sheet} from '@/data/Sheet';
    import {faGripVertical, faTrash, faSpinner, faICursor} from '@fortawesome/free-solid-svg-icons';
    import {library} from '@fortawesome/fontawesome-svg-core';
    import SourceLine from '@/components/SourceLine.vue';
    import {Image as SheetImage} from '@/data/Image';
    import SeaDragon from '@/components/SeaDragon.vue';
    import PaneHeadline from '@/components/PaneHeadline.vue';
    import Modal from '@/components/Modal.vue';
    library.add(faGripVertical);
    library.add(faTrash);
    library.add(faSpinner);
    library.add(faICursor);
    @Component({
        components: {
            SeaDragon,
            SourceLine,
            PaneHeadline,
            Modal,
        },
    })
    export default class SheetEditor extends Vue {
        @Prop() private id!: string;
        @Getter('sheets') private sheets!: Sheet[];
        @Action('addSheet') private addSheet!: (s: Sheet) => void;
        @Action('modifySheet') private modifySheet!: (s: Sheet) => void;
        @Action('addImage') private addImage!: (i: SheetImage) => Promise<SheetImage>;
        @Action('addImageToSheet') private addImageToSheet!:
            (data: {image: SheetImage, sheetId: string}) => Promise<SheetImage>;
        @Action('removeImageFromSheet') private removeImageFromSheet!:
            (data: {image: SheetImage, sheetId: string}) => void;
        @Action('updateImage') private updateImage!: (data: SheetImage) => void;
        @Mutation('setHeadline') private setHeadline!: (s: string) => void;
        @Mutation('setCurrentEntity') private setCurrentEntity!: (s: string) => void;
        private currentSheet: Sheet = new Sheet('', '', '');
        private currentImage: SheetImage | null = null;
        private error = false;
        private completedUploads = 0;
        private startedUploads = 0;
        private showModal = false;
        @Watch('sheets')
        private updateSheets() {
            let headline = 'Bibliothek > Notentext ';
            const idAsNumber = parseInt(this.id, 10);
            if (!isNaN(idAsNumber)) {
                headline += 'bearbeiten';
                if (!this.sheets.hasOwnProperty(idAsNumber)) {
                    this.error = true;
                } else {
                    this.error = false;
                    this.currentSheet = this.sheets[idAsNumber];
                }
            } else {
                headline += 'erstellen';
            }
            this.setHeadline(headline);
            this.setCurrentEntity(this.currentSheet.displayName);
        }
        private mounted() {
            this.updateSheets();
        }
        private beforeDestroy() {
            if (this.currentSheet.id === '' && this.currentSheet.composer !== '' && this.currentSheet.name !== '') {
                // new entity with values, save now
                this.addSheet(this.currentSheet);
            } else if (this.currentSheet.id !== '') {
                this.modifySheet(this.currentSheet);
            }
        }
        private setImage(image: SheetImage) {
            this.currentImage = image;
        }
        private droppedFiles(event: DragEvent) {
            event.preventDefault();
            if (event.dataTransfer.items) {
                for (const item of event.dataTransfer.items) {
                    // the compiler does seem to think item is of type File
                    // directly casting to DataTransferItem does not work either
                    const dataTransferItem = (item as any);
                    if (dataTransferItem.kind === 'file') {
                        this.handleFile(dataTransferItem.getAsFile());
                    }
                }
            } else {
                for (const file of event.dataTransfer.files) {
                    this.handleFile(file);
                }
            }
        }

        private selectFiles() {
            (this.$refs.file as any).click();
        }

        private filesSelected(event: Event) {
            for (const file of (event.target as any).files) {
                this.handleFile(file);
            }
        }

        private renameImage(image: SheetImage) {
            this.currentImage = image;
            this.showModal = true;
        }

        private modalClosed() {
            this.updateImage(this.currentImage!);
            this.showModal = false;
        }

        private removeImage(image: SheetImage) {
            this.removeImageFromSheet({
                image,
                sheetId: this.currentSheet.id,
            });
        }

        private handleFile(file: File) {
            const allowedTypes = /image.*/;

            if (file.type.match(allowedTypes)) {
                const reader = new FileReader();
                const uploadFile = (url: string, width: number, height: number) => {
                    const img = new SheetImage('', file.name, url, width, height);
                    this.startedUploads++;
                    this.addImage(img).then((createdImg) => {
                        this.addImageToSheet({
                            image: createdImg,
                            sheetId: this.currentSheet.id,
                        }).then(() => {
                            this.completedUploads++;
                        }).catch(() => {
                            this.completedUploads++;
                        });
                    }).catch((error) => {
                        // handled somewhere else
                        this.completedUploads++;
                    });
                };
                reader.onload = () => {
                    const domImg = new Image();
                    domImg.onload = () => {
                        uploadFile(reader.result as string, domImg.width, domImg.height);
                    };
                    domImg.src = reader.result as string;
                };

                reader.readAsDataURL(file);
            }
        }
    }
</script>
<style scoped lang="scss">
    @import '../scss/variables';
    .editor-pane:first-child {
        width: 33%;
        padding-left: $page-margin-x;
    }
    .editor-pane:last-child {
        width: 66%;
    }
    .image-container {
        background-color: $dark-bg;
    }
    .padding-right {
        padding-right: $page-margin-x;
    }
    .mw-75 {
        max-width: 75%;
    }
</style>
