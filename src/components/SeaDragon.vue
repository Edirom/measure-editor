<template>
    <div class="w-100 h-100">
        <div class="seadragon-container w-100 h-100"></div>
    </div>
</template>
<script lang="ts">
    import {Component, Prop, Vue, Watch} from 'vue-property-decorator';
    import {Image} from '@/data/Image';
    import {Viewer, IIIFTileSource, TileSource, ImageTileSource, TiledImage} from 'openseadragon';
    @Component({})
    export default class SeaDragonViewer extends Vue {
        @Prop() private image!: Image;
        private seadragon!: Viewer;
        private openedPath: string = '';
        private mounted() {
            this.createSeaDragon();
        }
        private beforeDestroy() {
            this.closeSeadragon();
        }
        private closeSeadragon() {
            if (this.seadragon && this.seadragon.isOpen()) {
                this.seadragon.close();
                this.openedPath = '';
            }
        }
        private finishedLoading() {
            this.$emit('finishedLoading');
        }
        private onLoaded(tiledImage: TiledImage): Promise<void> {
            if (tiledImage.getFullyLoaded()) {
                return Promise.resolve();
            }
            return new Promise((resolve) => {
                tiledImage.addOnceHandler('fully-loaded-change', () => {
                    resolve();
                });
            });
        }
        private onOpen() {
            this.onLoaded(this.seadragon.world.getItemAt(0)).then(() => {
                this.finishedLoading();
            }).catch((reason) => {
                console.error({reason});
                this.closeSeadragon();
            });
        }
        private createTileSource(): Promise<TileSource | null> {
            return new Promise((resolve, reject) => {
                // detect type of tile source. no other indication than the path itself
                let tileSource: TileSource | null = null;
                const imagepath = this.image.imagepath.toLowerCase();
                if (imagepath.endsWith('.jpg') || imagepath.endsWith('.png') ||
                    imagepath.startsWith('data:image') || imagepath.startsWith('blob:')) {
                    tileSource = new ImageTileSource({
                        url: this.image.imagepath,
                        // TODO: there should also be crossOriginPolicy: 'Anonymous', but for that the server has to
                        // TODO: define CORS headers. The option would allow for downsampling of the image in zoomed out
                        // TODO: states and mitigate a lot of the aliasing effects
                    });
                } else if (imagepath.indexOf('iiif') > -1 || imagepath.indexOf('://') > -1) {
                    // TODO: Again, CORS is in the way here. We should really load the manifest and pass that to
                    // TODO: OpenSeaDragon, but we cannot so we have to improvise for now
                    // fetch(imagepath + 'info.json').then((response) => {
                    //     response.json().then((manifest) => {
                    //         tileSource = new IIIFTileSource(manifest);
                    //         resolve(tileSource);
                    //     }).catch((reason) => {
                    //         reject(reason);
                    //     });
                    // }).catch((reason) => {
                    //     reject(reason);
                    // });
                    // return;

                    tileSource = new IIIFTileSource({
                        '@context': 'http://iiif.io/api/image/2/context.json',
                        '@id': this.image.imagepath,
                        'height': this.image.height,
                        'width': this.image.width,
                        'profile': [ 'http://iiif.io/api/image/2/level2.json' ],
                        'protocol': 'http://iiif.io/api/image',
                        'tiles': [{ scaleFactors: [ 1, 2, 4, 8, 16, 32 ], width: 1024 }],
                    });
                } else {
                    if (this.image.imagepath !== '') {
                        console.warn('Could not detect type of image', this.image);
                    }
                }
                resolve(tileSource);
            });
        }
        @Watch('image')
        private createSeaDragon() {
            if (!this.image || !this.image.imagepath) {
                this.closeSeadragon();
                return;
            }
            if (this.openedPath === this.image.imagepath) {
                // do not reload
                return;
            }
            this.$emit('startLoading');
            this.createTileSource().then((tileSource: TileSource | null) => {
                if (!tileSource) {
                    this.closeSeadragon();
                } else {
                    this.openedPath = this.image.imagepath;
                    if (!this.seadragon) {
                        const element = this.$el.querySelector('.seadragon-container');
                        if (!element) {
                            throw new Error('OpenSeadragon cannot find container');
                        }
                        this.seadragon = new Viewer({
                            element,
                            tileSources: [tileSource],
                            preserveOverlays: true,
                        });
                        this.seadragon.addHandler('open', () => this.onOpen());
                        this.$emit('created', this.seadragon);
                    } else {
                        this.seadragon.open([tileSource]);
                    }
                }
            }).catch((reason) => {
                console.error({reason});
                this.closeSeadragon();
            });
        }
    }
</script>
