<template>
    <div class="w-100 h-100 d-flex align-items-center editor-pane border-0 ml-0">
        <div class="m-auto">
            <pane-headline>Werk ausw&auml;hlen</pane-headline>
            <div v-for="work in works">
                <router-link :to="'/concordance-editor/' + work.id">
                    <div class="d-flex justify-content-start text-black">
                        <div class="icon">
                            <fa-icon icon="book"></fa-icon>
                        </div>
                        <div>
                            {{ work.name }}
                        </div>
                    </div>
                </router-link>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
    import {faBook} from '@fortawesome/free-solid-svg-icons';
    import {library} from '@fortawesome/fontawesome-svg-core';
    import { Component, Vue } from 'vue-property-decorator';
    import {Mutation, Getter} from 'vuex-class';
    import {Work} from '@/data/Work';
    import PaneHeadline from '@/components/PaneHeadline.vue';

    library.add(faBook);

    @Component({
        components: {PaneHeadline},
    })
    export default class ConcordanceEditor extends Vue {
        @Mutation('setHeadline') private setHeadline!: (s: string) => void;
        @Mutation('setCurrentEntity') private setCurrentEntity!: (s: string) => void;
        @Getter('works') private works!: { [id: number]: Work };
        private mounted() {
            this.setHeadline('Konkordanzen');
            this.setCurrentEntity('');
        }
    }
</script>
