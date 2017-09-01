import Vue from 'vue'
import VueRouter from 'vue-router'

// components
import Home from 'components/routes/Home'
import Error from 'components/routes/Error'
// import VueAnalytics from 'vue-analytics'
import vueSmoothScroll from 'vue-smooth-scroll'

Vue.use(vueSmoothScroll);
Vue.use(VueRouter);

// Vue.use(VueAnalytics, {
//   id: 'UA-24367662-1',
//   router
// });

let router = new VueRouter({
    mode: 'history',
    routes: [
        /* redirects
        --------------------------------------------------------------------------------------------------------------*/
        {
            path: '/index.html',
            redirect: '/',
        },

        {
            path: '/home',
            redirect: '/',
        },



        /* routes
        --------------------------------------------------------------------------------------------------------------*/
        {
            path: '/',
            name: 'home',
            component: Home,
            meta: {
                sequence: 1,
            },
        },

        {
            path: '*',
            name: 'error',
            component: Error,
            meta: {
                sequence: 100,
            },
        },
    ],
});

export default router;