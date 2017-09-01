import API from 'app/api'
import * as types from 'store/mutation-types'


const module = 'settings';


const state = {
	list: {},
	status: 'failed', // failed or success
}


const getters = {
	getSettings (state) {
		return state.list;
	},
}


const actions = {
	retrieveSettings (context) {
		if(Object.keys(state.list).length === 0){
			console.log('[settings] call api');
			API.retrieve(module,

				// success
				response => {
					context.commit(types.SETTINGS_SUCCESS, response);
				},

				// error
				response => {
					context.commit(types.SETTINGS_FAILED);
				}
			);
		} else {
			console.log('[settings] get from state');
		}
	},
}


const mutations = {
	[types.SETTINGS_SUCCESS] (state, settings) {
		state.list = settings;
		state.status = 'success';
	},

	[types.SETTINGS_FAILED] (state, permalink) {
		state.status = 'failed';
	},
}


export default {
	state,
	getters,
	actions,
	mutations,
}