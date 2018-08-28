<template>
  <div class="container-fluid" id="app">
    <div id="headline" class="d-flex justify-content-between flex-content-size-auto">
      <h2>{{headlineState}}</h2>
      <h2>{{entityName}}</h2>
    </div>
    <div class="d-flex justify-content-start flex-fill-space">
      <div id="nav" class="flex-content-size">
        <router-link to="/library">
          <fa-icon icon="book" size="2x"></fa-icon>
        </router-link>
        <router-link to="/measure-editor">
          <fa-icon icon="edit" size="2x"></fa-icon>
        </router-link>
        <router-link to="/concordance-editor">
          <fa-icon icon="random" size="2x"></fa-icon>
        </router-link>
        <router-link to="/annotations">
          <fa-icon icon="comment-alt" size="2x"></fa-icon>
        </router-link>
        <!--
        <router-link to="/export">
          <fa-icon icon="file-export" size="2x"></fa-icon>
        </router-link>
        -->
      </div>
      <div id="page" class="flex-fill-space">
        <router-view/>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
  import { library } from '@fortawesome/fontawesome-svg-core';
  import {faBook, faCommentAlt, faEdit, faFileExport, faRandom} from '@fortawesome/free-solid-svg-icons';
  import { Component, Vue } from 'vue-property-decorator';
  import {State} from 'vuex-class';

  library.add(faBook);
  library.add(faEdit);
  library.add(faRandom);
  // should be comment-alt-edit but that is pro only
  library.add(faCommentAlt);
  library.add(faFileExport);

  @Component({})
  export default class App extends Vue {
      @State('headline') private headlineState!: string;
      @State('currentEntity') private entityName!: string;
  }
</script>
<style scoped lang="scss">
  @import './scss/variables';
  .container-fluid {
    padding: 0;
    min-height: 100vh;
  }
  #app {
    display: flex;
    flex-flow: column;
    height: 100%;
  }
  #nav {
    background-color: $nav-background-color;
    border-right: $nav-border-width solid $border-color;
    a {
      padding: 1em;
      color: #2c3e50;
      display: block;
      margin-right: -$nav-border-width;
      border-color: $nav-background-color;
      border-right-color: $border-color;
      border-width: $nav-border-width;
      border-left-width: 0;
      border-style: solid;
      &.router-link-active {
        color: $active-link-color;
        background-color: $nav-active-background;
        border-color: $border-color;
        border-right-color: $nav-active-background;
      }
      &:first-child {
        border-top-color: $nav-active-background;
      }
      &:last-child {
        border-bottom-color: $nav-active-background;
      }
    }
  }
  #page {
    margin-left: $page-margin-x;
  }
  #headline {
    background-color: $dark-bg;
    h2 {
      margin: 14px 30px;
      color: white;
    }
  }
</style>
