<template>
  <div class="collapsible-container">
    <div class="title d-flex justify-content-between" :class="{ show: !collapsed }">
      <div class="d-flex justify-content-start my-auto">
        <a class="icon" href="#" @click="toggleCollapse">
          <fa-icon icon="chevron-right" :class="{'fa-rotate-90': !collapsed}"></fa-icon>
        </a>
        <div>{{ title }}</div>
      </div>
      <div>
        <slot name="controls"></slot>
      </div>
    </div>
    <div class="content collapse" :class="{ show: !collapsed }">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

library.add(faChevronRight);

@Component({})
export default class Collapsible extends Vue {
  @Prop() private title!: string;
  private collapsed = true;

  private toggleCollapse($event: PointerEvent) {
      $event.preventDefault();
      this.collapsed = !this.collapsed;
  }
}
</script>

<style scoped lang="scss">
  @import '../scss/variables';
  $border-radius: 10px;
  $border-width: 2px;
  .collapsible-container {
    background-color: $nav-background-color;
    margin-bottom: 10px;
    .title {
      border-radius: $border-radius;
      background-color: black;
      color: white;
      a:not(.btn) {
        color: white;
      }
      padding: $collapsible-padding-y $collapsible-padding-x;
      &.show {
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
      }
    }
    .content {
      padding: $collapsible-padding-y $collapsible-padding-x;
      border-bottom-left-radius: $border-radius;
      border-bottom-right-radius: $border-radius;
      border-width: $border-width;
      border-color: $border-color;
      border-top-width: 0;
      border-style: solid;

      & > * {
        margin-top: $collapsible-padding-y;
      }
    }
  }
</style>
