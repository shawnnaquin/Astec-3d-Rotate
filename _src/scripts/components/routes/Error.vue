<template>
	<div :class="$style.container">
		<div :class="$style.content">
			<h1 :class="$style.title">Oops!</h1>
			<p :class="$style.body">Please check the URL</p>
		</div>
	</div>
</template>

<script>

	export default {

	}
</script>




<style lang="scss" module>
	.container{
		background-color: $outer-space;
		position: relative;
		height: 100vh;

		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		text-align: center;
	}

	.title{
		font-size:72px;
		font-family:$font-amnesty;
	}
</style>