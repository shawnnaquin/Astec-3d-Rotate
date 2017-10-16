import Vue from 'vue';
import Vuex from 'vuex';

import mutations from './mutations';
import actions from './actions';

import settings from './modules/settings';

Vue.use(Vuex);

const state = {
    loaded: false
};

export default new Vuex.Store({
    state,
    actions,
    mutations,
    modules: {
        settings,
    }
});