<template>
    <div class="w-100 h-100 d-flex align-items-center editor-pane border-0 ml-0">
        <div class="outerDropZone w-75 h-75" @drop.prevent="onFileDrop" @dragover.prevent>
            <div class="dropZone">
                <span class="display-1">Drop MEI file here</span>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
    import Vue from 'vue';
    import storeInstance from '@/store';
    import router from '@/router';

    export default class MeasureEditorSheetSelector extends Vue {

        private onFileDrop(event: DragEvent) {
            const dt = event.dataTransfer;

            if (dt != null) {
                const file = dt.files[0];

                const dummy = async () => {
                    await storeInstance.dispatch('fetchMEIFromFile', file);
                };
                dummy().catch((error) => console.error({error}))
                    .then(() => router.push({ name: 'editor', params: { id: file.name } }))
                    .catch((error) => console.error({error}));
            }
        }
    }
</script>

<style scoped>

    .outerDropZone {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #222831;
        text-align: center;

        border-radius: 2px;

        -webkit-box-shadow: 0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12);
        box-shadow: 0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12);
    }

    .dropZone {
        position: relative;
        top: 50%;
        transform: translate(0, -50%);
        text-align: center;
    }
</style>