<template>
  <div class="h-100 w-100 library-container d-flex">
    <div class="editor-pane">
      <pane-headline>Werke</pane-headline>
    <!--
      <collapsible v-for="work in works" :title="work.displayName" :key="work.id">
        <template slot="controls">
          <router-link class="btn btn-edit btn-40" :to="'/library/edit/work/' + work.id">
            <fa-icon icon="cog"></fa-icon>
          </router-link>
          <button class="btn btn-danger btn-40" @click="deleteWork(work)">
            <fa-icon icon="trash"></fa-icon>
          </button>
        </template>
        <div class="d-flex w-100 justify-content-between" v-for="source in work.sources"
             :key="uniqueSourceIdentifier(source)">
          <source-line :source="source"></source-line>
          <div>
            <button class="btn btn-outline-danger btn-40" @click="removeSourceFromWork({ workId: work.id, source })">
              <fa-icon icon="minus"></fa-icon>
            </button>
          </div>
        </div>
        <div class="dropzone" @dragover="dragOver($event)" @drop="drop($event, work)">
          <div class="description">
            Weitere Quellen aus der Liste hierher ziehen.
          </div>
        </div>
      </collapsible>
    -->
      <div class="d-flex justify-content-end collapsible-padding">
        <div>
          <router-link to="/library/edit/work/add" class="btn btn-add btn-40">
            <fa-icon icon="plus"></fa-icon>
          </router-link>
        </div>
      </div>
    </div>
    <div class="editor-pane">
      <pane-headline>Quellen</pane-headline>
        <collapsible :title="'Notentexte'">
            <div class="d-flex w-100 justify-content-between" v-for="source in sheets" :key="source.id"
                 draggable="true" @dragstart="dragStart($event, source)">
                <source-line :source="source"></source-line>
                <div>
                    <router-link :to="'/library/edit/sheet/' + source.id" class="btn btn-edit btn-40">
                        <fa-icon icon="cog"></fa-icon>
                    </router-link>
                    <button class="btn btn-danger btn-40" @click="deleteSheet(source)">
                        <fa-icon icon="trash"></fa-icon>
                    </button>
                </div>
            </div>
            <div class="d-flex w-100 justify-content-end">
                <router-link :to="'/library/edit/sheet/add'" class="btn btn-add btn-40">
                    <fa-icon icon="plus"></fa-icon>
                </router-link>
            </div>
        </collapsible>
      <div class="p-2 border-info border-top border-bottom border-left border-right">
        <pane-headline>Coming soon</pane-headline>
        <collapsible :title="'Schrifttexte'"></collapsible>
        <collapsible :title="'Bilder'"></collapsible>
        <collapsible :title="'Aufnahmen'"></collapsible>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Collapsible from '@/components/Collapsible.vue';
import SourceLine from '@/components/SourceLine.vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
    faCog,
    faMinus,
    faPlus,
    faTrash,
} from '@fortawesome/free-solid-svg-icons';
import {Work} from '@/data/Work';
import {Action, Getter, Mutation} from 'vuex-class';
import {Sheet} from '@/data/Sheet';
import {TextSource} from '@/data/TextSource';
import {Image} from '@/data/Image';
import {AudioRecording} from '@/data/AudioRecording';
import {Source} from '@/data/Source';
import {WorkSource} from '@/types';
import PaneHeadline from '@/components/PaneHeadline.vue';

library.add(faTrash);
library.add(faCog);
library.add(faMinus);
library.add(faPlus);


@Component({
  components: {
    PaneHeadline,
    Collapsible,
    SourceLine,
  },
})
export default class Library extends Vue {
  // @Getter('works') private works!: { [id: number]: Work };
  @Getter('sheets') private sheets!: { [id: number]: Sheet };
  // @Getter('texts') private texts!: { [id: number]: TextSource };
  @Getter('images') private images!: { [id: number]: Image };
  // @Getter('recordings') private recordings!: { [id: number]: AudioRecording };
  // @Action('addSourceToWork') private addSourceToWork!: (w: WorkSource) => void;
  // @Action('removeSourceFromWork') private removeSourceFromWork!: (w: WorkSource) => void;
  @Mutation('setHeadline') private setHeadline!: (s: string) => void;
  @Mutation('setCurrentEntity') private setCurrentEntity!: (s: string) => void;
  // @Action('deleteWork') private deleteWork!: (w: Work) => void;
  @Action('deleteSheet') private deleteSheet!: (s: Sheet) => void;
  @Action('deleteImage') private deleteImage!: (i: Image) => void;
  // @Action('deleteRecording') private deleteRecording!: (r: AudioRecording) => void;
  // @Action('deleteText') private deleteText!: (t: TextSource) => void;
  private sourceProperties = {};
  private mounted() {
      this.setHeadline('Bibliothek');
      this.setCurrentEntity('');
  }
  private uniqueSourceIdentifier(source: Source) {
      return source.id + source.type;
  }

  private dragStart($event: DragEvent, source: Source) {
      $event.dataTransfer.setData('id', source.id.toString());
      $event.dataTransfer.setData('type', source.type);
      $event.dataTransfer.effectAllowed = 'copy';
  }

  private dragOver($event: DragEvent) {
      $event.dataTransfer.dropEffect = 'copy';
      $event.preventDefault();
  }

  private drop($event: DragEvent, work: Work) {
      // $event.preventDefault();
      // let source: Source | null = null;
      // const id = parseInt($event.dataTransfer.getData('id'), 10);
      // const type = $event.dataTransfer.getData('type');
      // if (work.sources.find((s) => s.id === id && s.type === type)) {
      //     // already in list, do nothing
      //     return;
      // }
      // switch (type) {
      //     case 'sheet':
      //         source = this.sheets[id];
      //         break;
      //     case 'image':
      //         source = this.images[id];
      //         break;
      //     case 'audio':
      //         source = this.recordings[id];
      //         break;
      //     case 'text':
      //         source = this.texts[id];
      //         break;
      //     default:
      //         console.warn('Unsupported source type');
      // }
      // if (source) {
      //     this.addSourceToWork({
      //         source,
      //         workId: work.id,
      //     });
      // }
  }

}
</script>
<style scoped lang="scss">
  @import '../scss/variables';
  .library-container {
    .editor-pane {
      width: 50%;
      &:last-child {
          padding-right: $page-margin-x;
      }
    }

    .collapsible-padding {
      padding-right: $collapsible-padding-x;
    }
  }
</style>
