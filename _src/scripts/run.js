import 'babel-polyfill'
import Vue from 'vue'
import App from '../App'
// import './polyfills'
import router from 'app/router'
import http from 'app/http'
import store from 'store/index'
// import head from './head'
// import ga from './analytics'

new Vue({
	el: '#app',
	router,
	http,
	store,
	// head,
	template: '<app/>',
	components: { App }
});