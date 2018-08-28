<template>
    <div class="d-flex justify-content-start my-auto" v-if="source !== undefined">
        <slot name="prefix"></slot>
        <div class="icon">
            <fa-icon :icon="iconForType(source.type)"></fa-icon>
        </div>
        <div class="of-el">
            {{ source.name }}
        </div>
    </div>
</template>
<script lang="ts">

    import { Component, Prop, Vue } from 'vue-property-decorator';
    import { Source } from '@/data/Source';
    import {library} from '@fortawesome/fontawesome-svg-core';
    import {faFileAudio, faFileImage, faFileAlt, faQuestion} from '@fortawesome/free-solid-svg-icons';

    library.add(faFileImage);
    library.add(faFileAudio);
    library.add(faFileAlt);
    library.add(faQuestion);

    @Component({})
    export default class SourceLine extends Vue {
        @Prop() private source!: Source;
        private iconForType(type: string) {
            switch (type) {
                case 'image':
                case 'sheet':
                    return 'file-image';
                case 'audio':
                    return 'file-audio';
                case 'text':
                    return 'file-alt';
            }
            return 'question';
        }
    }
</script>
<style scoped lang="scss">
    .of-el {
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
    }
</style>
