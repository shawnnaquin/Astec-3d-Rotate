<template>
	<svg data-name="loader-circle" :data-index="index" :class="[$style.svg, $style['circle-' + index]]" version="1.1" viewBox="0 0 100 100">
		<circle :class="$style.circle" cx="50" cy="50" :r="r"/>
	</svg>
</template>

<script>
	import TweenMax from 'TweenMax';
	import DrawSVGPlugin from 'vendor/gsap/DrawSVGPlugin'

	export default {
		props: ['r', 'index'],

		mounted (){
			this.play();
		},

		methods: {
			play() {
				let target = `.${this.$style.circle}`;
				let duration = 1.2;
				let position = '+=.25';
				let timeline = new TimelineMax({
					repeat: -1,
				});

				timeline
					.fromTo(target, duration, { drawSVG: '0'}, {drawSVG: '100%'}, position)
					.to(target, duration, {drawSVG: '100% 100%'}, position);
			},
		},
	}
</script>

<style lang="scss" module>
	.svg{
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		position: absolute;
		z-index: z('normal');

		fill: none;
		stroke-width: 1px;
		stroke: $white;
	}


	.circle{
		transform-origin: center center;
	}


	.circle-1{
		stroke: $westar;
		transform: rotate(45deg);
	}


	.circle-2{
		stroke: $cinnabar;
		transform: rotate(225deg);
	}


	.circle-3{
		stroke: $cape-cod;
		transform: rotate(135deg);
	}


	.circle-4{
		stroke: rgba($black, 0.1);
		transform: rotate(270deg);
	}
</style>