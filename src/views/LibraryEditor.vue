<template>
    <div class="d-flex editor-container">
        <div class="sidebar flex-content-size">
            <router-link to="/library"><fa-icon icon="chevron-left"></fa-icon></router-link>
        </div>
        <div class="flex-fill-space">
            <router-view></router-view>
        </div>
    </div>

</template>
<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import {library} from '@fortawesome/fontawesome-svg-core';
    import {faChevronLeft} from '@fortawesome/free-solid-svg-icons';
    library.add(faChevronLeft);
    @Component({})
    export default class LibraryEditor extends Vue {

    }
</script>
<style lang="scss">
    @import '../scss/variables';
    .editor-container {
        margin-left: -$page-margin-x;
        width: calc(100% + #{$page-margin-x});
        height: 100%;
        .sidebar {
            background-color: $active-link-color;
            height: 100%;
            & > * {
                padding: 40px 16px;
                color: white;
                display: block;
            }
        }
    }
</style>
