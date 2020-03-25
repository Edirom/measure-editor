<template>
  <div class="container-fluid" id="app">
    <div id="headline" class="d-flex justify-content-between flex-content-size-auto">
      <h2>Measure Editor</h2>
      <h2>{{entityName}}</h2>
    </div>
    <div class="d-flex justify-content-start flex-fill-space">
      <div id="page" class="flex-fill-space">
        <router-view/>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';
  import {State} from 'vuex-class';

  @Component({})
  export default class App extends Vue {
    @State('currentEntity') private entityName!: string;


  }
</script>
<style scoped lang="scss">
  @import 'scss/variables';

  .container-fluid {
    padding: 0;
    min-height: 100vh;
  }
  #app {
    display: flex;
    flex-flow: column;
    height: 100%;
  }
  #headline {
    background-color: $dark-bg;
    h2 {
      margin: 14px 30px;
      color: white;
      font-weight: 100;
    }

    z-index: 1;

    -webkit-box-shadow: 0 2px 4px -1px rgba(0,0,0,.2), 0 4px 5px 0 rgba(0,0,0,.14), 0 1px 10px 0 rgba(0,0,0,.12);
    box-shadow: 0 2px 4px -1px rgba(0,0,0,.2), 0 4px 5px 0 rgba(0,0,0,.14), 0 1px 10px 0 rgba(0,0,0,.12);
  }
  #page {
    margin-left: $page-margin-x;
  }
</style>
