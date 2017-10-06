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

				imagePrefix: 'DoubleBarrel',
				imageDirectory: 'barrel',
				siteImageDirectory: '../assets/images',
				imageSeperator: '_',
				imageExtension: 'jpg',

				// xRotations: 4,

				flipped: false,
				loaded: false,
				images: {

				},
				coords: {

				}
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
		watch: {
		},
		methods: {

			// getters / converters
			//--------------------------------------------------------------------------------------------------------//

			twoDigit( num ) {
				return ( '0' + num ).slice(-2);
			},

			convertRange( x, y, fasterX ) {

				// fits new coordinates linearly into the new ranges
				// let m = fasterX ? this.xRotations : 1;

				let curXMin = 0; // change these to top / left if not using offsetX,offsetY
				let curYMin = 0;

				let curXMax = this.canvas.width;
				let curYMax = this.canvas.height;

				let rangeY 	= ( this.yMax - this.yMin ) / ( curYMax - curYMin );
				let newY 	= Math.round( ( y - curYMin ) * rangeY + this.yMin );

				let rangeX 	= ( this.xMax - this.xMin ) / ( curXMax - curXMin );
				let newX 	= Math.round( ( x - curXMin ) * rangeX + this.xMin );

				// if( fasterX ) {
				// 	newX = newX % 24 === 0 ? this.xMax : newX % 24;
				// }

				// console.log( newX );

				return {
					x: newX,
					y: newY
				};

			},

			getMove(x,y) {

				let howFarX  = ( x - this.originX );
				let unmoddedX = this.curX - howFarX;
				let modX = unmoddedX % this.xMax === 0 ? this.xMax : unmoddedX % this.xMax;

				let howFarY  = ( y - this.originY );
				let unmoddedY = this.curY + howFarY;
				let modY = unmoddedY % this.yMax === 0 ? this.yMax : unmoddedY % this.yMax;

				let newX = modX;
				let newY = modY;
				// let oldX = this.newX;
				// let oldY = this.newY;

				if ( newX > 0 && newY > 0 && unmoddedY <= this.yMax  && unmoddedY > this.yMin ) {
					// prevents weird things, like changing perspective across poles;
					// also creates a nextTick to operate on variables beoforehand
					this.newX = newX;
					this.newY = newY;
				}

				// console.log( this.newX, this.newY );
			},

			getImageUrl(y,x) {

				return this.siteImageDirectory +
						'/' +
						this.imageDirectory +
						'/' +
						this.imagePrefix +
						this.imageSeperator +
						y +
						this.imageSeperator +
						this.twoDigit( x ) +
						'.' +
						this.imageExtension;

			},

			getImage(y,x) {

				let name = String(y)+String(x);

				let img = new Image();
				img.src = this.getImageUrl( y,x );

				img.onload = () => {
					this.images[name] = img;
					if ( Object.keys( this.images ).length == this.yMax * this.yMin ) {
						this.loaded = true;
					} else {
						// still loading;
					}
				};

			},

			// event callbacks
			//--------------------------------------------------------------------------------------------------------//

			loadImages() {
				for ( let y = 0; y < this.yMax; y++ ) {
					for ( let x = 0; x < this.xMax; x++ ) {
						this.getImage( y+1,x+1 );
					}
				}
			},

			setCanvasSize() {
				this.canvas.width = window.innerWidth;
				this.canvas.height = window.innerHeight;
			},

			mouseMove(event) {
			    this.coords = this.convertRange( event.offsetX, event.offsetY );
				if( this.touch.isPressed ) {
					this.getMove( this.coords.x, this.coords.y );
				}
			},

			alternateMouseMove(event) {
			    this.coords = this.convertRange( event.offsetX, event.offsetY );
				this.newX = this.coords.x;
				this.newY = this.coords.y;
			},

			mouseDown(event) {
			    this.touch.isPressed = true;
			    this.originX = this.coords.x;
			    this.originY = this.coords.y;
			},

			mouseUp(event) {
				this.curX = this.newX;
				this.curY = this.newY;
			    this.touch.isPressed = false;
			},

			resize(event) {
				this.setCanvasSize();
			},

			// listener controllers
			//----------------------------------------------------=---------------------------------------------------//

			addListeners() {
				window.addEventListener( 'resize', this.resize );
				this.canvas.addEventListener('mousemove', this.mouseMove );
				this.canvas.addEventListener( 'mousedown', this.mouseDown );
				this.canvas.addEventListener( 'mouseup', this.mouseUp );
				// this.canvas.addEventListener( 'mousemove', this.alternateMouseMove );

			},

			// removeEventListeners() {
			// 	window.removeEventListener( 'resize', this.resize );
			// 	this.canvas.removeEventListener( 'mousedown', this.mouseDown );
			// 	this.canvas.removeEventListener( 'mouseup', this.mouseUp );
			// },

			// loop
			//----------------------------------------------------=---------------------------------------------------//

			animate() {

				let x = this.newX ? this.newX : this.curX;
				let y = this.newY ? this.newY : this.curY;
				let name = String(y) + String(x);
				let image = this.images[name];

				// console.log( x,y );

				// this.ctx.clearRect( 0, 0, this.canvas.width, this.canvas.height );
				// this.ctx.beginPath();
				// this.ctx.fillStyle = 'green';
				// this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
				// this.ctx.fill();

				if ( image ) {
					let m = 1;
					let width = 800 * m;
					let height = 600 * m;
					let left =  ( this.canvas.width - width ) / 2;
					let top =  ( this.canvas.height - height ) / 2;
					this.ctx.drawImage( image, left, top, width, height);
				}

				requestAnimationFrame( this.animate );

			},
		},

		mounted() {
			this.loadImages();
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