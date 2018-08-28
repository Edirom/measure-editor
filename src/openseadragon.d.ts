/* tslint:disable:ban-types no-empty-interface */
/*
Typings for openseadragon as per code documentation at
https://github.com/openseadragon/openseadragon/blob/master/src/*.js
Christian Stroehmeier 30/08/2018
extended on 29/09/2019
Most of the static variables and functions are missing
 */

declare module 'openseadragon' {
    enum Placement {
        // noinspection JSUnusedGlobalSymbols
        CENTER,
        TOP_LEFT,
        TOP,
        TOP_RIGHT,
        RIGHT,
        BOTTOM_RIGHT,
        BOTTOM,
        BOTTOM_LEFT,
        LEFT,
    }
    type PlaceholderFillStyle = string | CanvasGradient | CanvasPattern | Function;
    interface EventError {
        message: string;
        source: any;
    }
    interface TiledImageOptions {
        // it might be necessary to mark this as optional as well since SimpleImageOptions take care of that itself
        tileSource: string | Object | Function;
        index?: number;
        replace?: boolean;
        x?: number;
        y?: number;
        width?: number;
        height?: number;
        fitBounds?: Rect;
        fitBoundsPlacement?: Placement;
        clip?: Rect;
        opacity?: number;
        preload?: boolean;
        degrees?: number;
        compositeOperation?: string;
        crossOriginPolicy?: string;
        ajaxWithCredentials?: boolean;
        loadTilesWithAjax?: boolean;
        ajaxHeaders?: Object;
        success?: (item: TiledImage) => void;
        error?: (error: EventError) => void;
        collectionImmediately?: boolean;
        placeholderFillStyle?: PlaceholderFillStyle;
    }
    interface SimpleImageOptions extends TiledImageOptions {
        url: string;
    }
    interface Viewer extends EventSource {
        initialPage: number;
        element: Element;
        container: Element;
        canvas: Element;
        /* these might be private ?!
        overlays: Array<Overlay>;
        overlaysContainer: Element;
        */
        /* more complex types we hopefully do not need immediately
        TODO: declare these types as well
        viewport: Viewport;
        navigator: Navigator;
         */
        drawer: Drawer;
        world: World;
        isOpen: () => boolean;
        open: (tileSource: TileSource[]|string|TileSource, initialPage?: number) => Viewer;
        close: () => Viewer;
        destroy: () => void;
        isMouseNavEnabled: () => boolean;
        setMouseNavEnabled: (enabled: boolean) => Viewer;
        areControlsEnabled: () => boolean;
        setControlsEnabled: (enabled: boolean) => Viewer;
        setDebugMode: (debugMode: boolean) => void;
        isFullPage: () => boolean;
        setFullPage: (fullPage: boolean) => Viewer;
        setFullScreen: (fullScreen: boolean) => Viewer;
        isVisible: () => boolean;
        setVisible: (visible: boolean) => Viewer;
        addTiledImage: (options: TiledImageOptions) => void;
        addSimpleImage: (options: SimpleImageOptions) => void;
        forceRedraw: () => Viewer;
        bindSequenceControls: () => Viewer;
        bindStandardControls: () => Viewer;
        currentPage: () => number;
        goToPage: (page: number) => Viewer;
        addOverlay: (element: Element|string|Object, location: Point|Rect, placement?: Placement,
                     onDraw?: (position: Point, size: Rect, element: Element) => void) => Viewer;
        updateOverlay: (element: Element|string, location: Point|Rect, placement?: Placement) => Viewer;
        removeOverlay: (element: Element|string) => Viewer;
        clearOverlays: () => Viewer;
        getOverlayById: (element: Element|string) => Overlay;
        gestureSettingsByDeviceType: (type: string) => GestureSettings;
        removeReferenceStrip: () => void;
        addReferenceStrip: () => void;
    }
    // noinspection JSUnusedGlobalSymbols
    const Viewer: {
        new (options: ViewerOptions): Viewer;
    };
    interface Point {
        x: number;
        y: number;
        clone: () => Point;
        plus: (point: Point) => Point;
        minus: (point: Point) => Point;
        times: (factor: number) => Point;
        divide: (factor: number) => Point;
        negate: () => Point;
        distanceTo: (point: Point) => Point;
        squaredDistanceTo: (point: Point) => Point;
        apply: (func: (coord: number) => number) => Point;
        equals: (point: Point) => boolean;
        rotate: (degrees: number, pivot?: Point) => Point;
        toString: () => string;
    }
    interface EventData {
        eventSource: Object;
        userData: Object;
    }
    type EventHandler = (args: EventData) => void;
    interface EventSource {
        addOnceHandler: (eventName: string, handler: EventHandler, userData?: Object, times?: number) => void;
        addHandler: (eventName: string, handler: EventHandler, userData?: Object) => void;
        removeHandler: (eventName: string, handler: EventHandler) => void;
        remoteAllHandlers: (eventName: string) => void;
        getHandler: (eventName: string) => ((source: Object, args: EventData) => void);
        raiseEvent: (eventName: string, eventArgs: Object) => void;
    }
    interface TileSourceOptions {
        url?: string;
        referenceStripThumbnailUrl?: string;
        success?: (event: EventData) => void;
        ajaxWidthCredentials?: boolean;
        ajaxHeaders?: Object;
        width: number;
        height: number;
        tileSize?: number;
        tileWidth?: number;
        tileHeight?: number;
        tileOverlap?: number;
        minLevel?: number;
        maxLevel?: number;
    }
    interface TileSource extends EventSource {
        aspectRatio?: number;
        dimensions?: Point;
        tileOverlap?: number;
        minLevel?: number;
        maxLevel?: number;
        ready?: boolean;
        getTileSize?: (level: number) => number;
        getTileWidth?: (level: number) => number;
        getTileHeight?: (level: number) => number;
        getLevelScale?: (level: number) => number;
        getNumTiles?: (level: number) => Point;
        getPixelRatio?: (level: number) => Point;
        getClosestLevel?: () => number;
        getTileAtPoint?: (level: number, point: Point) => Point;
        getTileBounds?: (level: number, x: number, y: number, isSource: boolean) => Rect;
        getImageInfo?: (url: string) => void;
        supports?: (data: string|Object|any[]|Document, url: string) => boolean;
        configure?: (data: string|Object|any[]|Document, url: string) => Object;
        getTileUrl?: (level: number, x: number, y: number) => string;
        getTileAjaxHeaders?: (level: number, x: number, y: number) => Object;
        tileExists?: (level: number, x: number, y: number) => boolean;
    }
    // although TileSource has a constructor it seems to be considered somewhat of an abstract class so we should
    // not allow that
    /* const TileSource: {
        new (width: number | TileSourceOptions, height?: number, tileSize?: number, tileOverlap?: number,
             minLevel?: number, maxLevel?: number): TileSource;
    };*/
    interface IIIFTileSourceOptions extends TileSourceOptions {
        '@context'?: string;
        '@id': string;
        scale_factors?: number[];
        tile_width?: number;
        tile_height?: number;
        formats?: string[];
        protocol?: string;
        profile?: string[];
        tiles?: Array<{
            width: number;
            height?: number;
            scaleFactors: number[];
        }>;
    }
    interface IIIFTileSource extends TileSource {

    }
    // noinspection JSUnusedGlobalSymbols
    const IIIFTileSource: {
        new (options: IIIFTileSourceOptions): IIIFTileSource;
    };
    interface ImageTileSourceOptions {
        url: string;
        buildPyramid?: boolean;
        crossOriginPolicy?: string | boolean;
        ajaxWithCredentials?: string | boolean;
        useCanvas?: boolean;
    }
    interface ImageTileSource extends TileSource {
        getContext2D: (level: number, x: number, y: number) => CanvasRenderingContext2D;
    }
    // noinspection JSUnusedGlobalSymbols
    const ImageTileSource: {
        new (options: ImageTileSourceOptions): ImageTileSource;
    };
    interface NavImage {
        REST: string;
        GROUP: string;
        HOVER: string;
        DOWN: string;
    }
    interface NavImages {
        zoomIn?: NavImage;
        zoomOut?: NavImage;
        home?: NavImage;
        fullpage?: NavImage;
        rotateleft?: NavImage;
        rotateright?: NavImage;
        flip: NavImage;
        previous: NavImage;
        next: NavImage;
    }
    interface Rect {
        x: number;
        y: number;
        width: number;
        height: number;
        clone: () => Rect;
        containsPoint: (point: Point, epsilon?: number) => boolean;
        equals: (rectangle: Rect) => boolean;
        getAspectRatio: () => number;
        getBottomLeft: () => Point;
        getBottomRight: () => Point;
        getBoundingBox: () => Rect;
        getCenter: () => Point;
        getIntegerBoundingBox: () => Rect;
        getSize: () => Point;
        getTopLeft: () => Point;
        getTopRight: () => Point;
        intersection: (rect: Rect) => Rect;
        rotate: (degrees: number, pivot?: Point) => Rect;
        times: (factor: number) => Rect;
        toString: () => string;
        translate: (delta: number) => Rect;
        union: (rect: Rect) => Rect;
    }
    // noinspection JSUnusedGlobalSymbols
    const Rect: {
        new (x?: number, y?: number, width?: number, height?: number, degrees?: number): Rect;
    };
    interface Overlay {
        x?: number;
        y?: number;
        px?: number;
        py?: number;
        width?: number;
        height?: number;
        className?: string;
        id?: string;
        placement?: string;
    }
    interface GestureSettings {
        scrollToZoom?: boolean;
        clickToZoom?: boolean;
        dblClickToZoom?: boolean;
        pinchToZoom?: boolean;
        zoomToRefPoint?: boolean;
        flickEnabled?: boolean;
        flickMinSpeed?: number;
        flickMomentum?: number;
        pinchRotate?: boolean;
    }
    enum ControlAnchor {
        // noinspection JSUnusedGlobalSymbols
        NONE,
        TOP_LEFT,
        TOP_RIGHT,
        BOTTOM_RIGHT,
        BOTTOM_LEFT,
        ABSOLUTE,
    }
    interface ViewerOptions {
        id?: string;
        element?: Element;
        tileSources?: TileSource[] | string | TileSource | Function;
        tabIndex?: number;
        overlays?: Overlay[];
        xmlPath?: string;
        prefixUrl?: string;
        navImages?: NavImages;
        debugMode?: boolean;
        debugGridColor?: string;
        blendTime?: number;
        alwaysBlend?: boolean;
        autoHideControls?: boolean;
        immediateRender?: boolean;
        defaultZoomLevel?: number;
        opacity?: number;
        preload?: boolean;
        compositeOperation?: string;
        imageSmoothingEnabled?: boolean;
        placeholderFillStyle?: PlaceholderFillStyle;
        degrees?: number;
        flipped?: boolean;
        minZoomLevel?: number;
        maxZoomLevel?: number;
        homeFillsViewer?: boolean;
        panHorizontal?: boolean;
        panVertical?: boolean;
        constrainDuringPan?: boolean;
        wrapHorizontal?: boolean;
        wrapVertical?: boolean;
        minZoomImageRotation?: number;
        minZoomPixelRatio?: number;
        smoothTileEdgesMinZoom?: number;
        iOSDevice?: boolean;
        autoResize?: boolean;
        preserveImageSizeOnResize?: boolean;
        minScrollDeltaTime?: number;
        rotateIncrement?: number;
        pixelsPerWheelLine?: number;
        pixelsPerArrowPress?: number;
        visibilityRatio?: number;
        viewPortMargins?: {
            left?: number;
            top?: number;
            right?: number;
            bottom?: number;
        };
        imageLoaderLimit?: number;
        clickTimeThreshold?: number;
        clickDistThreshold?: number;
        dblClickTimeThreshold?: number;
        dblClickDistThreshold?: number;
        springStiffness?: number;
        animationTime?: number;
        gestureSettingsMouse?: GestureSettings;
        gestureSettingsTouch?: GestureSettings;
        gestureSettingsPen?: GestureSettings;
        gestureSettingsUnknown?: GestureSettings;
        zoomPerClick?: number;
        zoomPerScroll?: number;
        zoomPerSecond?: number;
        showNavigator?: boolean;
        navigatorId?: string;
        navigatorPosition?: string;
        navigatorSizeRatio?: number;
        navigatorMaintainSizeRatio?: boolean;
        navigatorTop?: number|string;
        navigatorLeft?: number|string;
        navigatorHeight?: number|string;
        navigatorWidth?: number|string;
        navigatorAutoResize?: boolean;
        navigatorAutoFade?: boolean;
        navigatorRotate?: boolean;
        navigatorBackground?: string;
        navigatorOpacity?: number;
        navigatorBorderColor?: string;
        navigatorDisplayRegionColor?: string;
        controlsFadeDelay?: number;
        controlsFadeLength?: number;
        maxImageCacheCount?: number;
        timeout?: number;
        useCanvas?: boolean;
        minPixelRatio?: number;
        mouseNavEnabled?: boolean;
        showNavigationControl?: boolean;
        navigationControlAnchor?: ControlAnchor;
        showZoomControl?: boolean;
        showHomeControl?: boolean;
        showFullPageControl?: boolean;
        showRotationControl?: boolean;
        showFlipControl?: boolean;
        showSequenceControl?: boolean;
        sequenceControlAnchor?: ControlAnchor;
        navPrevNextWrap?: boolean;
        zoomInButton?: string;
        zoomOutButton?: string;
        homeButton?: string;
        fullPageButton?: string;
        rotateLeftButton?: string;
        rotateRightButton?: string;
        previousButton?: string;
        nextButton?: string;
        sequenceMode?: boolean;
        initialPage?: number;
        preserveViewport?: boolean;
        preserveOverlays?: boolean;
        showReferenceStrip?: boolean;
        referenceStripScroll?: string;
        referenceStripElement?: Element;
        referenceStripHeight?: number;
        referenceStripWidth?: number;
        referenceStripPosition?: string;
        referenceStripSizeRatio?: number;
        collectionMode?: boolean;
        collectionRows?: number;
        collectionColumns?: number;
        collectionLayout?: string;
        collectionTileSize?: number;
        collectionTileMargin?: number;
        crossOriginPolicy?: string|boolean;
        ajaxWithCredentials?: boolean;
        loadTilesWithAjax?: boolean;
        ajaxHeaders?: Object;
    }
    interface ImageLoader {
        addJob: (options: {
            src?: string;
            loadWithAjax?: string;
            ajaxHeaders?: string;
            crossOriginPolicy?: string | boolean;
            ajaxWithCredentials?: boolean;
            callback?: Function;
            abort?: Function;
        }) => void;
        clear: () => void;
    }
    // noinspection JSUnusedGlobalSymbols
    const ImageLoader: {
        new (options: { jobLimit?: number, timeout?: number }): ImageLoader;
    };
    interface TileCache {
        cacheTile: (options: {
            tile: Tile;
            // image: Image; // this is a DOM Image. Since we cannot import this directly we skip definition for now
            tiledImage: TiledImage;
            cutoff?: number;
        }) => void;
        clearTilesFor: (tiledImage: TiledImage) => void;
        numTilesLoaded: () => number;
    }
    // noinspection JSUnusedGlobalSymbols
    const TileCache: {
        new (options: { maxImageCacheCount?: number }): TileCache;
    };
    interface TiledImageOptions {
        source: TileSource;
        viewer: Viewer;
        tileCache: TileCache;
        drawer: Drawer;
        imageLoader: ImageLoader;
        x?: number;
        y?: number;
        width?: number;
        height?: number;
        fitBounds?: Rect;
        fitBoundsPlacement?: Placement;
        clip?: Rect;
        springStiffness?: number;
        animationTime?: boolean;
        minZoomImageRatio?: number;
        wrapHorizontal?: boolean;
        wrapVertical?: boolean;
        immediateRender?: boolean;
        blendTime?: number;
        alwaysBlend?: boolean;
        minPixelRatio?: number;
        smoothTileEdgesMinZoom?: number;
        iOSDevice?: boolean;
        opacity?: number;
        preload?: boolean;
        compositeOperation?: string;
        debugMode?: boolean;
        placeholderFillStyle?: string | CanvasGradient | CanvasPattern | Function;
        // @ts-ignore
        crossOriginPolicy?: string | boolean;
        ajaxWithCredentials?: boolean;
        loadTilesWithAjax?: boolean;
        ajaxHeaders?: Object;
    }
    interface TiledImage extends EventSource {
        source: TileSource;
        destroy: () => void;
        draw: () => void;
        fitBounds: (bounds: Rect, anchor?: Placement, immediately?: boolean) => void;
        getBounds: (current?: boolean) => Rect;
        getBoundsNoRotate: (current?: boolean) => Rect;
        getClip: () => Rect | null;
        getClippedBounds: (current?: boolean) => Rect;
        getCompositeOperation: () => string;
        getContentSize: () => Point;
        getFullyLoaded: () => boolean;
        getOpacity: () => number;
        getPreload: () => boolean;
        getRotation: (current?: boolean) => number;
        imageToViewerElementCoordinates: (pixel: Point) => Point;
        imageToViewportCoordinates: (imageX: number | Point, imageY?: number, current?: boolean) => Point;
        imageToViewportRectangle: (imageX: number | Rect, imageY?: number,
                                   pixelWidth?: number, pixelHeight?: number, current?: boolean) => Rect;
        imageToViewportZoom: (imageZoon: number) => number;
        imageToWindowCoordinates: (pixel: Point) => Point;
        needsDraw: () => boolean;
        reset: () => void;
        setClip: (newClip: Rect | null) => void;
        setCompositeOperation: (compositeOperation: string) => void;
        setHeight: (height: number, immediately?: boolean) => void;
        setOpacity: (opacity: number) => void;
        setPosition: (position: Point, immediately?: boolean) => void;
        setPreload: (preload: boolean) => void;
        setRotation: (degrees: number, immediately?: boolean) => void;
        setWidth: (width: number, immediately?: boolean) => void;
        update: () => boolean;
        viewerElementToImageCoordinates: (pixel: Point) => Point;
        viewportToImageCoordinates: (viewerX: number | Point, viewerY?: number, current?: boolean) => Point;
        viewportToImageRect: (viewerX: number | Rect, viewerY?: number, pointWidth?: number, pointHeight?: number,
                              current?: boolean) => Rect;
        viewportToImageZoom: (viewportZoon: number) => number;
        windowToImageCoordinates: (pixel: Point) => Point;
    }
    // noinspection JSUnusedGlobalSymbols
    const TiledImage: {
        new (options: TiledImageOptions): TiledImage;
    };
    interface World extends EventSource {
        addItem: (item: TiledImage) => void;
        arrange: (options: {
            immediately?: boolean;
            layout?: string;
            rows?: number;
            columns?: number;
            tileSize?: number;
            tileMargin?: number;
        }) => void;
        draw: () => void;
        getContentFactor: () => number;
        getHomeBounds: () => Rect;
        getIndexOfItem: (item: TiledImage) => number;
        getItemAt: (index: number) => TiledImage;
        getItemCount: () => number;
        needsDraw: () => boolean;
        removeAll: () => void;
        removeItem: () => void;
        resetItems: () => void;
        setAutoRefigureSizes: (value?: boolean) => void;
        setItemIndex: (item: TiledImage, index: number) => void;
        update: () => void;
    }
    // noinspection JSUnusedGlobalSymbols
    const World: {
        new (options: { viewer: Viewer }): World;
    };
    interface Tile {
        // TODO: declare
    }
    interface Drawer {
        canvas: Element;
        container: Element;
        context: Object;
        element: Element;
        blendSketch: (options: {
            opacity: number;
            scale?: number;
            translate?: Point;
            compositeOperation?: string;
            bounds?: Rect;
        }) => void;
        canRotate: () => boolean;
        clear: () => void;
        destroy: () => void;
        drawTile: (tile: Tile, drawhingHandler: () => void, useSketch: boolean, scale?: number,
                   translate?: Point) => void;
        getCanvasSize: (sketch: boolean) => Point;
        getOpacity: () => number;
        setOpacity: (opacity: number) => Drawer;
        viewportToDrawerRectangle: (rectangle: Rect) => Rect;
    }
}
