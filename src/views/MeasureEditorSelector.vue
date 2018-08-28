<template>
  <div class="w-100 h-100 d-flex align-items-center editor-pane border-0 ml-0">
    <div class="m-auto">
      <pane-headline>Quelle ausw&auml;hlen</pane-headline>
      <div v-for="sheet in sheets">
        <router-link :to="'/measure-editor/' + sheet.id">
          <source-line class="text-black" :source="sheet"></source-line>
        </router-link>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
  import Component from 'vue-class-component';
  import Vue from 'vue';
  import {Mutation, Getter} from 'vuex-class';
  import {Sheet} from '@/data/Sheet';
  import SourceLine from '@/components/SourceLine.vue';
  import PaneHeadline from '@/components/PaneHeadline.vue';
  @Component({
      components: {PaneHeadline, SourceLine},
  })
  export default class MeasureEditorSheetSelector extends Vue {
      @Mutation('setHeadline') private setHeadline!: (s: string) => void;
      @Mutation('setCurrentEntity') private setCurrentEntity!: (s: string) => void;
      @Getter('sheets') private sheets!: { [id: number]: Sheet };
      private mounted() {
          this.setHeadline('Takte & Instrumente markieren');
          this.setCurrentEntity('');
      }
  }
</script>
