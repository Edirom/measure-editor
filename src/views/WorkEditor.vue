<template>
    <div class="w-100 h-100">
        <div class="alert alert-danger" v-if="error">
            Cannot find a work with id {{ id }}
        </div>
        <div v-else class="editor-pane border-0 w-100 h-100 m-0">
            <div class="form-group">
                <label for="title" class="col-form-label">Titel</label>
                <input id="title" class="form-control" v-model="currentWork.title"/>
            </div>
            <div class="form-group">
                <label for="composer" class="col-form-label">Komponist</label>
                <input id="composer" class="form-control" v-model="currentWork.composer"/>
            </div>
            <div class="form-group">
                <label for="year" class="col-form-label">Jahr</label>
                <input id="year" class="form-control" v-model="currentWork.year"/>
            </div>
            <div class="form-group">
                <label for="signature" class="col-form-label">Signatur</label>
                <input id="signature" class="form-control" v-model="currentWork.signature"/>
            </div>
            <div class="form-group">
                <label for="description" class="col-form-label">Beschreibung</label>
                <textarea id="description" class="form-control" v-model="currentWork.description"></textarea>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
    import {Mutation, Getter, Action} from 'vuex-class';
    import {Work} from '@/data/Work';
    import {Prop, Vue, Component, Watch} from 'vue-property-decorator';
    @Component({})
    export default class WorkEditor extends Vue {
        @Prop() private id!: string;
        @Getter('works') private works!: { [id: number]: Work };
        @Action('addWork') private addWork!: (w: Work) => void;
        @Action('modifyWork') private modifyWork!: (w: Work) => void;
        @Mutation('setHeadline') private setHeadline!: (s: string) => void;
        @Mutation('setCurrentEntity') private setCurrentEntity!: (s: string) => void;
        private error = false;
        private currentWork: Work = new Work('', '', []);
        private mounted() {
            this.updateWorks();
        }
        @Watch('works')
        private updateWorks() {
            let headline = 'Bibliothek > Werk ';
            const idAsNumber = parseInt(this.id, 10);
            if (!isNaN(idAsNumber)) {
                headline += 'bearbeiten';
                if (!this.works.hasOwnProperty(idAsNumber)) {
                    this.error = true;
                } else {
                    this.error = false;
                    this.currentWork = this.works[idAsNumber];
                }
            } else {
                headline += 'erstellen';
            }
            this.setHeadline(headline);
            this.setCurrentEntity(this.currentWork.displayName);
        }
        private beforeDestroy() {
            if (this.currentWork.id === '' && this.currentWork.title !== '') {
                this.addWork(this.currentWork);
            } else if (this.currentWork.id !== '') {
                this.modifyWork(this.currentWork);
            }
        }
    }
</script>
