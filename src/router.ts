import Vue from 'vue';
import Router from 'vue-router';
import Library from './views/Loader.vue';
import LibraryEditor from './views/LibraryEditor.vue';
import SheetEditor from './views/SheetEditor.vue';
import WorkEditor from './views/WorkEditor.vue';
import RouteProxy from './components/RouteProxy.vue';
// route level code-splitting
// this generates a separate chunk (measure-editor.[hash].js) for this route
// which is lazy-loaded when the route is visited.
const MeasureEditorSelector = () => {
    return import(/* webpackChunkName: "measure-editor" */ './views/MeasureEditorSelector.vue');
};
const MeasureEditor = () => import(/* webpackChunkName: "measure-editor" */ './views/MeasureEditor.vue');
const ConcordanceEditor = () => {
    return import(/* webpackChunkName: "concordance-editor" */ './views/ConcordanceEditor.vue');
};
const Annotations = () => import(/* webpackChunkName: "annotations" */ './views/Annotations.vue');
Vue.use(Router);

export default new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/library',
            component: RouteProxy,
            children: [
              {
                  path: '',
                  name: 'library',
                  component: Library,
              },
              {
                  path: 'edit',
                  component: LibraryEditor, // TODO: split these in separate chunks as well
                  children: [
                      {
                          path: 'sheet/:id',
                          component: SheetEditor,
                          props: true,
                      },
                      {
                          path: 'work/:id',
                          component: WorkEditor,
                          props: true,
                      },
                  ],
              },

            ],
        },
        {
            path: '/',
            name: 'home',
            redirect: '/library',
        },
        {
            path: '/measure-editor',
            component: RouteProxy,
            children: [
                {
                    path: '',
                    name: 'measure-editor-selector',
                    component: MeasureEditorSelector,
                },
                {
                    path: ':id',
                    name: 'measure-editor',
                    component: MeasureEditor,
                    props: true,
                },
            ],
        },
        {
            path: '/concordance-editor',
            component: RouteProxy,
            children: [
                {
                    path: '',
                    name: 'concordance-editor',
                    component: ConcordanceEditor,
                },
            ],
        },
        {
            path: '/annotations',
            name: 'annotations',
            component: Annotations,
        },
    ],
});
