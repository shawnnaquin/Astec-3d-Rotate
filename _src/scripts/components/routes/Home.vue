<template>
	<canvas ref="canvas" :class="$style.canvas"></canvas>
</template>

<script>

	export default {

		data() {
			return {
				touch: {},
				xMin: 1,
				xMax: 24,
				yMin: 1,
				yMax: 11,

				originX: 0, // mousedown
				originY: 0, // mousedown

				curX: 12, 	// starting pos
				curY: 6, 	// starting pos

				newX: null,
				newY: null,

			}
		},

		computed: {

			canvas() {
				return this.$refs.canvas
			},
			ctx() {
				return this.canvas.getContext('2d')
			},

		},

		components: {

		},

		methods: {

			convertRange(x,y) {

				// fits new coordinates linearly into the new ranges

				let curXMin = 0; // change these to top / left if not using offsetX,offsetY
				let curYMin = 0;

				let curXMax = this.canvas.width;
				let curYMax = this.canvas.height;

				let rangeY 	= ( this.yMax - this.yMin ) / ( curYMax - curYMin );
				let newY 	= Math.round( ( y - curYMin ) * rangeY + this.yMin );

				let rangeX 	= ( this.xMax - this.xMin ) / ( curXMax - curXMin );
				let newX 	= Math.round( ( x - curXMin ) * rangeX + this.xMin );

				return {
					x: newX,
					y: newY
				};

			},

			getMove(x,y) {

				let coords = this.convertRange( x,y );

				let howFarX  = ( coords.x - this.originX );
				let unmoddedX = this.curX + howFarX;
				let modX = unmoddedX % this.xMax === 0 ? this.xMax : unmoddedX % this.xMax;

				let howFarY  = ( coords.y - this.originY );
				let unmoddedY = this.curY + howFarY;
				let modY = unmoddedY % this.yMax === 0 ? this.yMax : unmoddedY % this.yMax;

				this.newX = Math.abs( modX );
				this.newY = Math.abs( modY );

			},

			setCanvasSize() {
				this.canvas.width = window.innerWidth;
				this.canvas.height = window.innerHeight;
			},

			animate() {

				let x = this.newX ? this.newX : this.curX;
				let y = this.newY ? this.newY : this.curY;
				console.log( x,y );
				this.ctx.clearRect( 0, 0, this.canvas.width, this.canvas.height );
				this.ctx.beginPath();
				this.ctx.fillStyle = 'green';
				this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
				this.ctx.fill();

				requestAnimationFrame( this.animate );

			},

			mouseMove(event) {
				this.getMove( event.offsetX, event.offsetY );
			},

			mouseDown(event) {
			    this.touch.isPressed = true;
			    let coords = this.convertRange( event.offsetX, event.offsetY );
			    this.originX = coords.x;
			    this.originY = coords.y;

			    this.$nextTick(()=>{
					this.canvas.addEventListener('mousemove', this.mouseMove);
			    })
			},

			mouseUp(event) {
				this.curX = this.newX;
				this.curY = this.newY;
			    this.touch.isPressed = false;
				this.canvas.removeEventListener('mousemove', this.mouseMove);
			},

			resize(event) {
				this.setCanvasSize();
			},

			addListeners() {
				window.addEventListener( 'resize', this.resize );
				this.canvas.addEventListener( 'mousedown', this.mouseDown );
				this.canvas.addEventListener( 'mouseup', this.mouseUp );
			}

		},

		mounted() {
			this.setCanvasSize();
			this.addListeners();
			requestAnimationFrame( this.animate );
		}


	}

</script>


<style lang="scss" module>
	canvas {
		position:relative;
		top:0;
		left:0;
		width:100%;
		height:100%;
		transform: translate3d(0,0,0);
	}
</style>