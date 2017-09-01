import Vue from 'vue'

export default {
	retrieve(module, success, error){
		let url = `/data/${module}.json`;


			Vue.http.get(url)
				.then(
					response => {
						success(response.body);
					},

					// error
					response => {
						error(response.body);
					}
				);
	},

	post(url, body, success, error) {

		Vue.http.post(url, body, {emulateJSON: true})
			.then(
				response => {
					success(response.body);
				},
				// error
				response => {
					error(response.body);
				}
			)
	},
}