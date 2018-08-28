<template>
    <div>
        <h4><slot></slot></h4>
        <hr/>
    </div>
</template>
<script lang="ts">
    import {Component, Vue} from 'vue-property-decorator';
    @Component({})
    export default class PaneHeadline extends Vue {
    }
</script>
<style scoped lang="scss">
    @import '../scss/variables';
    hr {
        color: $border-color;
    }
</style>
