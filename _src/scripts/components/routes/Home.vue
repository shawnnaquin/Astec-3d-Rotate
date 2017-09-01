<template>
	<div data-name="home">
		<contact-form></contact-form>
	</div>
</template>

<script>


	import ContactForm from 'components/ContactForm';

	export default {

		components: {
			'contact-form': ContactForm,
		},


		mounted() {
			console.log("[home] mounted");
		}
	}
</script>


<style lang="scss" module>

</style>