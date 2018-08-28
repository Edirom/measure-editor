<template>
    <div class="d-flex w-100 justify-content-between">
        <div class="d-flex justify-content-start">
            <div :style="{background: color}" class="mr-2">&nbsp;</div>
            <input v-model="internalName" v-if="edit" @blur="editBlur()"/>
            <div v-else class="my-auto">{{ name }}</div>
        </div>
        <div class="d-flex justify-content-end">
            <button class="btn btn-40 btn-outline-primary" @click="editClick()">
                <fa-icon icon="i-cursor"></fa-icon>
            </button>
            <button class="btn btn-40 btn-danger" @click="deleteItem()">
                <fa-icon icon="trash"></fa-icon>
            </button>
        </div>
    </div>
</template>
<script lang="ts">
    import {Component, Prop, Vue} from 'vue-property-decorator';
    import {faICursor, faTrash} from '@fortawesome/free-solid-svg-icons';
    import {library} from '@fortawesome/fontawesome-svg-core';
    import {Segment} from '../data/Segment';
    library.add(faICursor);
    library.add(faTrash);
    @Component({})
    export default class EditorSegment extends Vue {
        private edit = false;
        @Prop() private id!: number;
        @Prop() private name!: string;
        @Prop() private color!: string;
        get internalName() {
            return this.name;
        }
        set internalName(newName) {
            this.$emit('name-change', {
                id: this.id,
                name: newName,
            });
        }
        private editBlur() {
            this.edit = false;
        }
        private editClick() {
            this.edit = !this.edit;
        }
        private deleteItem() {
            this.$emit('delete', this.id);
        }
    }
</script>
