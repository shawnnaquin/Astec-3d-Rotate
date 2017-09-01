<template>
	<nav data-name="header" :class="$style.mainHeader">
		<a data-name="logo" :class="$style.home" href="//l2d.co/" title="L2D">
			<logo :class="$style.logo"></logo>
		</a>
	</nav>
</template>

<script>
	import logo from 'components/svgs/logo-alt';
	import TweenMax from 'TweenMax';


	export default {
		components: {
			logo,
		},


		mounted () {
			this.play();
		},


		methods: {
			play: function(){
				const timeline = new TimelineMax({
					delay: 1.75,
					paused: true,
					reverse: true,
					tweens: [
						TweenMax.fromTo(`.${this.$style.home}`, 0.5, {
							autoAlpha: 0,
							x: '-10%',
						}, {
							autoAlpha: 1,
							x: '0%',
						}),

						TweenMax.fromTo(`.${this.$style.back}`, 0.5, {
							autoAlpha: 0,
							x: '10%',
						}, {
							autoAlpha: 1,
							x: '0%',
						}),
					],
				});

				timeline.play();
			},
		},
	}
</script>

<style lang="scss" module>
	.main-header{
		top: 0;
		left: 0;
		position: fixed;
		z-index: z('header');
		pointer-events:none;
		padding-top: spacing(0.5);
		padding-left: spacing(0.5);
		padding-right: spacing(0.5);
	}

	.home{
		display: block;
	}

	.logo{
		width: spacing(1.5);
		fill: $white;
		pointer-events:all;
		transition:fill 200ms ease-in;
	}
	.home:hover {
		.logo {
			fill:$cinnabar;
			transition-timing-function: ease-out;
		}
	}
</style>