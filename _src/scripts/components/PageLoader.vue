<template>
	<div data-name="loader-wrapper" :class="$style.wrapper">
		<div data-name="loader-container" :class="$style.container">
			<logo :class="$style.logo"></logo>

			<div data-name="loader-circles" :class="$style.circles">
				<template v-for="(circle, index) in circles" >
					<loader-circle data-name="loader-circle" :index="(index + 1)" :r="circle.r"></loader-circle>
				</template>
			</div>
		</div>
	</div>
</template>

<script>
	import TweenMax from 'TweenMax'
	import LoaderCircle from 'components/svgs/loader-circle'
	import logo from 'components/svgs/a-logo'

	export default {

		components: {
			logo,
			'loader-circle': LoaderCircle,
		},

		data () {
			return {
				circles: [],
				timeline: null,
			};
		},

		created (){
			for(var i = 2; i <= 5; i++){
				this.circles.push({
					r: i * 8,
				});
			}
		},

		mounted (){
			this.play();
		},

		methods: {
			play() {
				TweenMax.to(`.${this.$style.logo}`, 2, {
					repeat: -1,
					scale: 0.95,
					yoyo: true,
				});

				// fade everything in
				TweenMax.to(`.${this.$style.container}`, 1, {
					opacity: 1,
				});
			},
		},
	}
</script>

<style lang="scss" module>
	.wrapper{
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		position: fixed;
		z-index: z('loader');

		transition: all ease-in 0.3s;

		background-color: $mineshaft;
	}


	.container{
		top: 50%;
		left: 50%;
		width: spacing(10);
		height: spacing(10);
		position: absolute;
		z-index: z('normal');

		transform: translateY(-50%) translateX(-50%);

		stroke-width: 1px;

		opacity: 0;
	}


	.logo{
		top: 50%;
		left: 50%;
		width: spacing(2);
		position: absolute;
		z-index: z('normal');

		transform: translateY(-50%) translateX(-50%);

		fill: $white;
	}

</style>