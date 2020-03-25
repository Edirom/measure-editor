<template>
    <div class="w-100 h-100 d-flex align-items-center editor-pane border-0 ml-0">
        Loading…
    </div>
</template>
<script lang="ts">
    import {Component, Prop, Vue} from 'vue-property-decorator';
    import storeInstance from '@/store';
    import router from '@/router';

    @Component
    export default class API extends Vue {

        @Prop() private url!: string;

        private mounted() {

            const splitBySlash = this.url.split('/');
            const sheetName = splitBySlash[splitBySlash.length - 1].split('.xml', 1)[0];

            const dummy = async () => {
                await storeInstance.dispatch('fetchMEIFromURL', this.url);
            };
            dummy().catch((error) => console.error({error}))
                .then(() => router.push({ name: 'editor', params: { id: sheetName } }))
                .catch((error) => console.error({error}));
        }
    }
</script>

<style scoped>

</style>