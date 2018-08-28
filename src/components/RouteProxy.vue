<template>
    <div class="editor w-100 h-100">
        <router-view></router-view>
    </div>
</template>
<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    @Component({})
    export default class RouteProxy extends Vue {
    }
</script>
<style scoped lang="scss">
    @import '../scss/variables';
    .editor {
        background-color: $nav-background-color;
    }
</style>
