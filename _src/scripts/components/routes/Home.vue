<template>
	<div>

		<vue-slider
			ref="slider"
			v-model="zoomLevel"
			:max="zoomLevelMax"
			:min="zoomLevelMin"
			:interval="zoomLevelInterval"
			:transition="0.2"
			:real-time="true"
			:width="'50%'"
			:class="$style.slider"
		>
		</vue-slider>
		<canvas ref="canvas" :class="$style.canvas"></canvas>

	</div>
</template>

<script>

	import vueSlider from 'vue-slider-component'

	export default {

		components: {
			'vue-slider' : vueSlider
		},

		data() {
			return {

				mouse: {
					isPressed: false
				},
				touch: {
					isPressed: false
				},

				xMin: 1,
				xMax: 48,
				yMin: 1,
				yMax: 23,

				originX: 0, // mousedown
				originY: 0, // mousedown

				curX: 24, // starting pos
				curY: 12, // starting pos

				newX: 24,
				newY: 12,

				oldX: 24,
				oldY: 12,

				imagePrefix: 'DB',
				imageDirectory: 'hardware-barrel',
				siteImageDirectory: '../assets/images',
				imageSeperator: '_',
				imageExtension: 'jpg',

				zoomLevel: 1,
				zoomLevelMax: 2,
				zoomLevelMin: 1,
				zoomLevelInterval: 0.01,

				imageWidth: 1600,
				imageHeight: 1200,

				alpha: 1,
				alphaFrames: false,

				imageCount: 0,

				loaded: false,

				images: {

				},

				coords: {

				},

			}
		},

		computed: {

			totalImages() {
				return this.yMax * this.xMax;
			},
			canvas() {
				return this.$refs.canvas;
			},
			ctx() {
				return this.canvas.getContext('2d');
			},

		},

		watch: {

			'loaded': function(event) {
				if ( event ) {
					this.addListeners();
					requestAnimationFrame( this.animate );
				}
			}
		},

		methods: {

			// getters / converters
			//--------------------------------------------------------------------------------------------------------//

			twoDigit( num ) {
				return ( '0' + num ).slice(-2);
			},

			convertRange( x, y ) {

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

				const yMinThresh = this.yMin + 1;
				const yMaxThresh = this.yMax - 1;

				let howFarX  = x - this.originX;
				let unmoddedX = this.curX - howFarX;
				let modX = unmoddedX % this.xMax === 0 ? this.xMax : unmoddedX % this.xMax;

				let howFarY  = y - this.originY;
				let unmoddedY = this.curY + howFarY;
				let modY = unmoddedY % this.yMax === 0 ? this.yMax : unmoddedY % this.yMax;

				let newX = modX;
				let newY = modY;
				let oldX = this.newX;
				let oldY = this.newY;

				if( oldY != newY || oldX != newX ) {
					// set the old one and tween it out
					// console.log( 'hit', this.alpha );

					this.oldX = oldX;
					this.oldY = oldY;

					if ( this.alphaFrames ) {
						TweenMax.fromTo( this, 0.1, {
							alpha: 1,
						},{
							alpha: 0,
							ease: Circ.easeOut,
						});
					}

				}

				let report = ()=> {
					return {
						x: {
							thisNewX: this.newX,
							newX: newX,
							modX: modX,
							unModX: unmoddedX,
							howFarX: howFarX,
							oldX: oldX
						},
						y: {
							thisNewY: this.newY,
							newY: newY,
							modY: modY,
							unModY: unmoddedY,
							howFarY: howFarY,
							oldY: oldY
						},
						extras: {
							yMinThresh: yMinThresh,
							yMaxThresh: yMaxThresh
						}
					};
				};

				// use report(), watch out for mem leak!

				if ( newX > 0 && unmoddedY <= yMaxThresh && unmoddedY > yMinThresh ) {

					// prevents weird things, like changing perspective across poles;
					// also creates a nextTick to operate on variables beforehand
					this.newX = newX;
					this.newY = newY;

					return;

				} else if ( unmoddedY <= yMinThresh ) {

					// trying to go across north pole!
					// heading north

					let changeX = (value) => {

						let altX = ( this.newX + value ) % this.xMax;
						this.newX = altX % this.xMax !== 0 ? altX % this.xMax : this.xMax;

						// reset the origins since the program doesn't know we're out of bounds;
						this.$nextTick(()=> {
							if ( this.mouse.isPressed ) {
								this.mouseUp();
								this.$nextTick(()=>{
									this.mouseDown();
								});
							} else if ( this.touch.isPressed ) {
								this.mouseUp();
								this.$nextTick(()=>{
									this.mouseDown();
								});
							}
						});

					};

					if( howFarX > 0 ) {
						// heading north-east;
						changeX( -1 );
					} else if ( howFarX <= 0 ) {
						// heading north-west;
						changeX( 1 );
					}

					return;

				} else if ( unmoddedY >= yMaxThresh ) {

					// trying to go across south pole
					// heading south

					if( howFarX > 0 ) {
						// heading south-east
					} else if ( howFarX <= 0 ) {
						// heading south-west
					}

					return;

				} else if ( newX < 0 ) {

					// we've gone 360° and trying to cross the prime-meridian (vertical equator)
					this.newX = this.xMax + newX;
					return;

				} else {

					// whoops! mem leak
					console.warn('mem leak!', report() );

				}

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

				img.onload = () => {

					this.imageCount = this.imageCount + 1;
					this.images[name] = img;

					// for some reason Object.keys( this.images ).length returns the wrong number;
					// use imageCount instead

					if ( this.imageCount == this.totalImages ) {
						this.loaded = true;
						console.log('loaded!');
					} else {
						// still loading;
						console.log('still loading');
					}
				};

				img.src = this.getImageUrl( y,x );

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
			    this.coords = this.convertRange( event.clientX, event.clientY );
				if ( this.mouse.isPressed ) {
					// console.log('mouseMove!');
					this.getMove( this.coords.x, this.coords.y );
				}
			},

			touchMove(event) {
				let touch_event = event.touches[0]; //first touch
				if ( this.touch.isPressed ) {
				    this.coords = this.convertRange( touch_event.clientX, touch_event.clientY );
					this.getMove( this.coords.x, this.coords.y );
				}
			},

			mouseDown(event) {
			    this.originX = this.coords.x;
			    this.originY = this.coords.y;
			    this.mouse.isPressed = true;
			},

			mouseUp(event) {
				this.curX = this.newX;
				this.curY = this.newY;
			    this.mouse.isPressed = false;
			},

			touchStart(event) {
				let touch_event = event.touches[0]; //first touch
			    this.coords = this.convertRange( touch_event.clientX, touch_event.clientY );
		        this.originX = this.coords.x;
		        this.originY = this.coords.y;
			    this.touch.isPressed = true;
			},

			touchEnd(event) {
				// console.log('touchEnd!');
				this.curX = this.newX;
				this.curY = this.newY;
			    this.touch.isPressed = false;
			},

			resize(event) {
				this.setCanvasSize();
			},

			// listener controllers
			//--------------------------------------------------------------------------------------------------------//

			addListeners() {
				console.log('listeners added');
				window.addEventListener( 'resize', this.resize );

				this.canvas.addEventListener( 'mousedown', this.mouseDown );
				this.canvas.addEventListener( 'mouseup', this.mouseUp );

				this.canvas.addEventListener( 'touchstart', this.touchStart );
				this.canvas.addEventListener( 'touchend', this.touchEnd );

				this.canvas.addEventListener( 'mousemove', this.mouseMove );
				this.canvas.addEventListener( 'touchmove', this.touchMove );

			},

			// loop
			//--------------------------------------------------------------------------------------------------------//

			animate() {

				let x = this.newX ? this.newX : this.curX;
				let y = this.newY ? this.newY : this.curY;
				let name = String(y) + String(x);
				let image = this.images[name];

				let oldX = this.oldX ? this.oldX : this.curX;
				let oldY = this.oldY ? this.oldY : this.curY;
				let oldName = String(oldY) + String(oldX);
				let oldImage = this.images[oldName];

				let width =  ( this.imageWidth / this.zoomLevelMax ) * this.zoomLevel;
				let height = ( this.imageHeight / this.zoomLevelMax ) * this.zoomLevel;
				let left =  ( this.canvas.width - width ) / 2;
				let top =  ( this.canvas.height - height ) / 2;

				this.ctx.clearRect( 0, 0, this.canvas.width, this.canvas.height );

				this.ctx.fillStyle = 'white';
				this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

				if ( this.alphaFrames ) {
					this.ctx.globalAlpha = 1;
					this.ctx.save();
				}

			   	if ( image ) {
			   		this.ctx.drawImage( image, left, top, width, height);
			   	}

			   	if ( this.alphaFrames && oldImage ) {

		   			if ( this.alpha !== 1 || this.alpha !== 0 ) {
		   				this.ctx.restore();
		   				this.ctx.globalAlpha = this.alpha;
		   		   		this.ctx.drawImage( oldImage, left, top, width, height);
		   			}

			   	}

				requestAnimationFrame( this.animate );

			},
		},

		mounted() {
			this.loadImages();
			this.setCanvasSize();
		}


	}

</script>


<style lang="scss" module>

	.slider {
		position:relative;
		top:36px;
		left:25%;
		width:50%;
		z-index:1;
	}

	canvas {
		position:relative;
		top:0;
		left:0;
		width:100%;
		height:100%;
		transform: translate3d(0,0,0);
	}
</style>