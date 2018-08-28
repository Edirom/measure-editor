<template>
    <div id="overlay-entry" v-on:pointermove="mouseMove" v-on:pointerdown="mouseDown" v-on:pointerup="mouseUp"></div>
</template>
<script lang="ts">
    import {Component, Prop, Vue, Watch} from 'vue-property-decorator';
    import {Rect, Viewer} from 'openseadragon';
    import {OverlayPointerEvent} from '@/data/geometry/OverlayPointerEvent';
    import {
        Cache,
        Camera,
        Color,
        DataTexture, Line,
        Mesh,
        Object3D,
        OrthographicCamera,
        RGBAFormat,
        Scene,
        Texture,
        Vector2,
        Vector3,
        WebGLRenderer,
        WebGLRenderTarget,
    } from 'three';
    import {PrimitiveElement} from '@/data/measureEditor/PrimitiveElement';
    import {PointPolygon} from '@/data/geometry/PointPolygon';

    interface RendererInstance {
        renderer: WebGLRenderer;
        staticScene: Scene;
        dynamicScene: Scene;
    }

    // we can share this between all render instances
    // this will mean it will never be cleaned up, but since it is an empty scene anyway it should not matter
    const emptyScene = new Scene();
    @Component({})
    export default class SeaDragonOverlay extends Vue {
        @Prop() private viewer!: Viewer;
        @Prop() private mode!: string;
        @Prop() private staticElements!: PrimitiveElement[];
        @Prop() private dynamicElements!: PrimitiveElement[];
        @Prop() private disableMouseEvents!: boolean;
        private aspectRatio = 1;
        private rendererInstance!: RendererInstance;
        private camera: OrthographicCamera | null = null;
        // to avoid the allocations every time we re-render
        private sceneRenderTarget?: WebGLRenderTarget;
        private scenePixelBuffer?: Uint8Array;
        private lastDynamicElements: PrimitiveElement[] = [];

        @Watch('staticElements')
        private updateStaticElements() {
            if (!this.rendererInstance) {
                return;
            }
            const staticScene = this.rendererInstance.staticScene;
            if (this.staticElements && this.staticElements.length) {
                this.createTextureSceneFromPrimitives(this.staticElements).then((textureScene) => {
                    if (staticScene && staticScene !== emptyScene) {
                        this.disposeNode(staticScene);
                    }
                    this.rendererInstance.staticScene = textureScene;
                    requestAnimationFrame(this.runRenderLoop);
                }).catch((reason) => {
                    console.error({reason});
                });
            } else if (emptyScene && staticScene !== emptyScene) {
                this.disposeNode(staticScene);
                this.rendererInstance.staticScene = emptyScene;
                requestAnimationFrame(this.runRenderLoop);
            }
        }

        @Watch('dynamicElements')
        private updateDynamicElements() {
            if (!this.rendererInstance) {
                return;
            }
            if (this.lastDynamicElements.length === 0 && this.dynamicElements.length === 0) {
                // nothing was there before, nothing is there now => done
                return;
            }
            const dynamicScene = this.rendererInstance.dynamicScene;
            if (this.dynamicElements.length) {
                if (this.lastDynamicElements.length === this.dynamicElements.length) {
                    // compare the old and the new elements to determine if we have to do anything
                    let equal = true;
                    for (let i = 0; i < this.dynamicElements.length; ++i) {
                        const oldPrimitive = this.lastDynamicElements[i];
                        const newPrimitive = this.dynamicElements[i];
                        if (// oldPrimitive.id !== newPrimitive.id ||
                            oldPrimitive.label !== newPrimitive.label ||
                            oldPrimitive.isVisible !== newPrimitive.isVisible ||
                            !oldPrimitive.color.equals(newPrimitive.color) ||
                            oldPrimitive.points.length !== newPrimitive.points.length
                        ) {
                            equal = false;
                        } else {
                            for (let j = 0; j < newPrimitive.points.length; ++j) {
                                if (newPrimitive.points[j].x !== oldPrimitive.points[j].x ||
                                    newPrimitive.points[j].y !== oldPrimitive.points[j].y
                                ) {
                                    equal = false;
                                    break;
                                }
                            }
                        }
                        if (!equal) {
                            break;
                        }
                    }
                    if (equal) {
                        return;
                    }
                }
                this.lastDynamicElements = this.dynamicElements;
                this.createObjectSceneFromPrimitives(this.dynamicElements).then((objectScene) => {
                    if (dynamicScene && dynamicScene !== emptyScene) {
                        this.disposeNode(dynamicScene);
                    }
                    this.rendererInstance.dynamicScene = objectScene;
                    this.runRenderLoop();
                }).catch((reason) => {
                    console.error({reason});
                });
            } else if (emptyScene && dynamicScene !== emptyScene) {
                if (this.lastDynamicElements.length) {
                    this.lastDynamicElements = [];
                }
                this.disposeNode(dynamicScene);
                this.rendererInstance.dynamicScene = emptyScene;
                requestAnimationFrame(this.runRenderLoop);
            }
        }

        private mounted() {
            this.attachToViewer();
        }

        private beforeDestroy() {
            if (this.sceneRenderTarget) {
                this.sceneRenderTarget.dispose();
            }
            if (this.rendererInstance) {
                const instance = this.rendererInstance;
                if (instance.staticScene && instance.staticScene !== emptyScene) {
                    this.disposeNode(instance.staticScene);
                }
                if (instance.dynamicScene && instance.dynamicScene !== emptyScene) {
                    this.disposeNode(instance.dynamicScene);
                }

                if (instance.renderer) {
                    instance.renderer.dispose();
                }
            }
        }

        @Watch('viewer')
        private attachToViewer() {
            if (!this.viewer) {
                return;
            }
            this.viewer.addHandler('open', () => this.onOpen());
            if (this.viewer.isOpen()) {
                this.onOpen();
            }
        }

        private onOpen() {
            const bounds = this.viewer.world.getHomeBounds();
            const rect = new Rect(0, 0, bounds.width, bounds.height);
            this.aspectRatio = bounds.width / bounds.height;

            // viewbox needs values >= 100 to function properly
            if (this.aspectRatio > 1) {
                bounds.width *= this.aspectRatio;
                bounds.height *= this.aspectRatio;
            }
            this.setupTHREE(bounds.width, bounds.height);
            if (!this.viewer.getOverlayById(this.$el)) {
                this.viewer.addOverlay(this.$el, rect);
            } else {
                this.viewer.updateOverlay(this.$el, rect);
            }
        }

        private mouseDown(event: PointerEvent) {
            if (!this.disableMouseEvents) {
                event.stopPropagation();
                this.$emit('pointer-down', this.transformEventData(event));
            }
        }

        private mouseMove(event: PointerEvent) {
            if (!this.disableMouseEvents) {
                event.stopPropagation();
                this.$emit('mouse-move', this.transformEventData(event));
            }
        }

        private mouseUp(event: PointerEvent) {
            if (!this.disableMouseEvents) {
                event.stopPropagation();
                this.$emit('pointer-up', this.transformEventData(event));
            }
        }

        private mouseLeave(event: PointerEvent) {
            if (!this.disableMouseEvents) {
                event.stopPropagation();
                this.$emit('mouse-leave', this.transformEventData(event));
            }
        }

        private globalToLocalPoint(event: PointerEvent): { x: number, y: number } {
            // transform to local coordinates
            const rect = this.$el.getBoundingClientRect();
            const offsetX = event.clientX - rect.left;
            const offsetY = event.clientY - rect.top;
            const x = (100 * offsetX) / rect.width;
            const y = (100 * offsetY) / rect.height;
            return {x, y};
        }

        private transformEventData(event: PointerEvent): OverlayPointerEvent {
            return {
                point: this.globalToLocalPoint(event),
                event,
            };
        }

        private setupTHREE(width: number, height: number) {
            // values are already in the correct aspect ratios, so we can scale by the same factor
            const pixelHeight = height * 1000;
            const pixelWidth = width * 1000;
            if (!this.rendererInstance) {
                const renderer = new WebGLRenderer({
                    alpha: true,
                });
                if (!renderer) {
                    // should never happen
                    throw null;
                }
                renderer.autoClear = false;
                renderer.setClearColor(new Color(0, 0, 0), 0);
                renderer.setSize(pixelWidth, pixelHeight);
                const overlayElement = document.getElementById('overlay-entry');
                if (!overlayElement) {
                    // should never happen
                    throw null;
                }
                overlayElement.appendChild(renderer.domElement);
                this.rendererInstance = {
                    renderer,
                    staticScene: emptyScene,
                    dynamicScene: emptyScene,
                };
            }
            Cache.enabled = true;
            if (this.sceneRenderTarget) {
                this.sceneRenderTarget.dispose();
            }
            this.sceneRenderTarget = new WebGLRenderTarget(pixelWidth, pixelHeight);
            this.scenePixelBuffer = new Uint8Array(pixelWidth * pixelHeight * 4);
            if (!this.camera) {
                this.camera = new OrthographicCamera(0, 100, 0, 100, -500, 1000);
                this.camera.position.z = 5;
                this.camera.lookAt(new Vector3(0, 0, 0));
            }
            this.updateStaticElements();
            this.updateDynamicElements();
        }

        private async createTextureSceneFromPrimitives(primitives: PrimitiveElement[]): Promise<Scene> {
            if (primitives.length === 0 && emptyScene) {
                return emptyScene;
            }
            if (!this.camera) {
                // should never happen
                throw null;
            }
            const objectScene = await this.createObjectSceneFromPrimitives(primitives);
            const localPolygonTexture = this.renderSceneToTexture(objectScene, this.camera);
            this.disposeNode(objectScene);
            const scene = new Scene();
            scene.background = localPolygonTexture;
            return scene;
        }

        private async createObjectSceneFromPrimitives(primitives: PrimitiveElement[]): Promise<Scene> {
            if (primitives.length === 0 && emptyScene) {
                return emptyScene;
            }
            const scene = new Scene();
            for (const element of primitives) {
                if (!element.isVisible) {
                    continue;
                }
                const vertices = element.points.map((p) => new Vector2(p.x, p.y));
                const color = new Color(element.color.red, element.color.green, element.color.blue);
                const polygon = new PointPolygon(vertices, color, element.label);
                await polygon.addToScene(scene);
            }
            return scene;
        }


        private renderSceneToTexture(scene: Scene, camera: Camera): Texture {
            if (!this.rendererInstance || !this.sceneRenderTarget || !this.scenePixelBuffer) {
                // should never happen
                throw null;
            }
            const renderer = this.rendererInstance.renderer;
            const oldRenderTarget = renderer.getRenderTarget();
            const oldClearColor = renderer.getClearColor();
            const oldClearAlpha = renderer.getClearAlpha();
            const size = new Vector2();
            renderer.getSize(size);
            renderer.setRenderTarget(this.sceneRenderTarget);
            renderer.setClearColor(new Color(0, 0, 0), 0);
            renderer.clear(true, true, true);
            renderer.render(scene, camera);
            renderer.readRenderTargetPixels(this.sceneRenderTarget, 0, 0, size.x, size.y, this.scenePixelBuffer);
            const texture = new DataTexture(this.scenePixelBuffer, size.x, size.y, RGBAFormat);
            // important!
            texture.needsUpdate = true;
            renderer.setClearColor(oldClearColor, oldClearAlpha);
            renderer.setRenderTarget(oldRenderTarget);
            return texture;
        }

        private runRenderLoop() {
            if (!this.rendererInstance || !this.camera) {
                // this might happen, just wait for the next frame
                requestAnimationFrame(this.runRenderLoop);
                return;
            }
            const instance = this.rendererInstance;
            instance.renderer.clear(true, true, true);
            if (instance.staticScene) {
                instance.renderer.render(instance.staticScene, this.camera);
            }
            if (instance.dynamicScene) {
                instance.renderer.render(instance.dynamicScene, this.camera);
            }
        }

        private disposeNode(obj: Object3D) {
            obj.traverse((node) => {
                if (node instanceof Mesh || node instanceof Line) {
                    if (node.geometry) {
                        node.geometry.dispose();
                    }
                    if (node.material) {
                        if (node.material instanceof Array) {
                            for (const mat of node.material) {
                                mat.dispose();
                            }
                        } else {
                            node.material.dispose();
                        }
                    }
                } else if (node instanceof Scene) {
                    // in more recent versions the typings actually reflect that Scene does have dispose()
                    // the currently used version only has the implementation, so cast to any
                    (node as any).dispose();
                    if (node.background && node.background instanceof Texture) {
                        node.background.dispose();
                    }
                } else {
                    console.warn('Do not know how to dispose of', {node});
                }
            });
        }
    }
</script>
<style lang="scss">

    canvas {
        /* THREE sets the CSS width/height to the viewport values on the canvas' style. We need to override */
        width: 100% !important;
        height: 100% !important;
    }
</style>
