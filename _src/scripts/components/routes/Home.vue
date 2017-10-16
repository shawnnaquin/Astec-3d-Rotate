<template>
	<div ref="container">

		<div :class="$style.logoContainer">
			<astec-logo :class="$style.logo"></astec-logo>
			<dilman-logo :class="$style.logo"></dilman-logo>
		</div>

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
			:tooltip-style=" {
				backgroundColor: '#fdcd0a',
				borderColor: '#fdcd0a',
				color: 'black'
			}"
			:process-style=" {
				backgroundColor: 'rgb(253,205,10)'
			}"
			:sliderStyle=" {
				backgroundColor: 'black'
			}"
		>
		</vue-slider>

		<canvas ref="canvas" :class="$style.canvas"></canvas>

	</div>
</template>

<script>

	import vueSlider from 'vue-slider-component';
	import ZingTouch from 'zingtouch';
	import astecLogo from 'components/svgs/astec-logo';
	import dilmanLogo from 'components/svgs/dilman-logo';

	export default {

		components: {
			'vue-slider' : vueSlider,
			'dilman-logo' : dilmanLogo,
			'astec-logo' : astecLogo
		},

		data() {
			return {

				swipe: false,

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
				zoomLevelMax: 3,
				zoomLevelMin: 1,
				zoomLevelInterval: 0.01,
				pinchZoomLevelInterval: 0.08,

				imageWidth: 2400,
				imageHeight: 1800,

				velocityThreshold: 0.2,
				// spinFramesAmount: 30,
				velocityMultiplier: 15,

				alpha: 1,
				alphaFrames: true,

				imageCount: 0,

				loaded: false,
				lastDirection: null,
				zt: null,
				spinFrameCount: 0,

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
					this.$store.commit('loaded');
				}
			}
		},

		methods: {

			// getters / converters
			//--------------------------------------------------------------------------------------------------------//
			// robert penners easing functions
			// easeOutSine(t, b, c, d) {
			// 	return c * Math.sin(t/d * (Math.PI/2)) + b;
			// },

			easeOutCirc( t, b, c, d) {
					return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
				},

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

				let lastDirection;
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

					if ( newX > 0 && unmoddedY <= yMaxThresh && unmoddedY > yMinThresh ) {
						this.lastDirection = oldX - newX > 0 ? -1 : 1;
					}

					if ( this.alphaFrames ) {
						TweenMax.fromTo( this, 0.05, {
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

				let atExtremesX = (value) => {
					// move right or left a 'value', called by conditional to move x if y is too far gone;
					// let altX = ( this.newX + value ) % this.xMax;
					// if ( altX > 0 ) {
					// 	this.newX = altX % this.xMax !== 0 ? altX % this.xMax : this.xMax + value;
					// }
					TweenMax.to( this, 0.3, {
						newY: ( this.yMax + 1 ) / 2,
						roundProps: ['newY'],
						ease:Power2.easeOut,
						onComplete: this.resetOrigin,
					});

					// this.resetOrigin();
				};

				if ( newX > 0 && unmoddedY <= yMaxThresh && unmoddedY > yMinThresh ) {

					// prevents weird things, like changing perspective across poles;
					// also creates a nextTick to operate on variables beforehand
					this.newX = newX;
					this.newY = newY;
					// console.log( report() );
					return;

				} else if ( unmoddedY <= yMinThresh ) {

					// trying to go across north pole!
					// heading north
					if( howFarX > 0 ) {
						// heading north-east;
						atExtremesX( -1 );
					} else if ( howFarX < 0 ) {
						// heading north-west;
						atExtremesX( 1 );
					} else {
						// can't assume the direction here, we need to know which way the user was travelling previously!
						// atExtremesX( this.lastDirection );
					}

					return;

				} else if ( unmoddedY >= yMaxThresh ) {

					// trying to go across south pole
					// heading south
					// don't worry about === 0, it doesn't make visual sense to move at that coord;
					if( howFarX > 0 ) {
						// heading south-east
						atExtremesX( -1 );
					} else if ( howFarX < 0 ) {
						// heading south-west
						atExtremesX( 1 );
					} else {
						// can't assume the direction here, we need to know which way the user was travelling previously!
						// atExtremesX( this.lastDirection );
					}

					return;

				} else if ( newX < 0 ) {

					// we've gone 360° and trying to cross the prime-meridian (vertical equator)
					this.newX = this.xMax + newX;
					return;

				} else {

					// whoops! mem leak
					// newY maybe negative?
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
				if ( this.mouse.isPressed && !this.swipe ) {
					console.log('mouseMove!');
					this.getMove( this.coords.x, this.coords.y );
				}
			},

			touchMove(event) {
				let touch_event = event.touches[0]; //first touch
				if ( this.touch.isPressed && !this.swipe ) {
					console.log('touchMove!');
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

			zingPinch(event) {
				if ( this.zoomLevel > this.zoomLevelMin ) {
					let t = (this.zoomLevel - this.pinchZoomLevelInterval );
					this.zoomLevel = Number( t.toFixed(2) );
				}
			},

			zingExpand(event) {
				if ( this.zoomLevel < this.zoomLevelMax ) {
					let t = (this.zoomLevel + this.pinchZoomLevelInterval );
					this.zoomLevel = Number( t.toFixed(2) );
				}
			},

			zingSwipe(event) {

				let eData = event.detail.data[0];
				let v = eData.velocity;
				let d = eData.currentDirection;

				if ( v > this.velocityThreshold ) {

					this.swipe = true;

					let q = Math.round( v * this.velocityMultiplier );

					if ( d > 90 && d < 270 ) {
						this.hardSpin( q, q*2 );
					} else {
						this.hardSpin( -q, q*2 );
					}

				}
			},

			hardSpinDone() {

			},

			hardSpin( movedist, framesAmount ) {

				let req;

				let done = ()=> {

					console.log('done');
					this.swipe = false;
					this.resetOrigin();
					this.spinFrameCount = 0;
					console.log('added, end');
					return;
				};

				let t = ()=> {
					cancelAnimationFrame( req );
					done();
				};

				this.canvas.addEventListener('mousedown', t );
				this.canvas.addEventListener('touchstart', t );
				this.canvas.addEventListener('touchmove', t );

				let loopIt = ()=> {

					if ( this.spinFrameCount < 100 ) {
						console.log('looping');
						let q = Math.round( this.easeOutCirc(this.spinFrameCount, this.curX, movedist, 100 ) );
						let v = q % this.xMax === 0 ? this.xMax : q % this.xMax;

						if ( v > 0 ) {
							this.newX = v;
						} else {
							this.newX = this.xMax + v;
						}

						this.spinFrameCount = this.spinFrameCount + 1;

						req = requestAnimationFrame( loopIt );

					} else {
						done();
					}
				};

				loopIt();

			},

			resetOrigin() {
				this.$nextTick( ()=> {
					this.curX = this.newX;
					this.curY = this.newY;
					this.$nextTick(()=>{
						this.originX = this.coords.x;
						this.originY = this.coords.y;
					});
				});
			},

			resize(event) {
				this.setCanvasSize();
			},

			// listener controllers
			//--------------------------------------------------------------------------------------------------------//

			addListeners() {

				this.zt = new ZingTouch.Region( this.$refs.container );
				this.zt.bind( this.$refs.canvas, 'swipe', this.zingSwipe );
				this.zt.bind( this.$refs.canvas, 'pinch', this.zingPinch );
				this.zt.bind( this.$refs.canvas, 'expand', this.zingExpand );

				window.addEventListener( 'resize', this.resize );

				this.canvas.addEventListener( 'mousedown', this.mouseDown );
				this.canvas.addEventListener( 'mouseup', this.mouseUp );

				this.canvas.addEventListener( 'touchstart', this.touchStart );
				this.canvas.addEventListener( 'touchend', this.touchEnd );

				this.canvas.addEventListener( 'mousemove', this.mouseMove );
				this.canvas.addEventListener( 'touchmove', this.touchMove );


			},

			removeListeners() {
				// console.log('listeners added');

				this.zt.unbind( this.$refs.canvas, 'swipe' );
				this.zt.unbind( this.$refs.canvas, 'pinch' );
				this.zt.unbind( this.$refs.canvas, 'expand' );

				window.removeEventListener( 'resize', this.resize );

				this.canvas.removeEventListener( 'mousedown', this.mouseDown );
				this.canvas.removeEventListener( 'mouseup', this.mouseUp );

				this.canvas.removeEventListener( 'touchstart', this.touchStart );
				this.canvas.removeEventListener( 'touchend', this.touchEnd );

				this.canvas.removeEventListener( 'mousemove', this.mouseMove );
				this.canvas.removeEventListener( 'touchmove', this.touchMove );

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
			console.log( this.$style.yellow );
		}


	}

</script>


<style lang="scss" module>

	$logo-ratio: 0.6654166667;

	.logo-container {
		position: absolute;

		top: auto;
		left: 0;
		bottom: 0;

		text-align: left;
		z-index: 2;
		pointer-events:none;
		text-align:center;
		width:auto;
		text-align:left;
		padding:12px;
		@include breakpoint(medium) {
			top: 0;
			bottom: auto;
		}
	}

	.logo {
		display:inline-block;
		fill:$mineshaft;
		width: 64px;
		margin-right: 12px;
		height: calc( 64px * #{$logo-ratio} );
		margin-right: 4px;
	}

	.slider {
		position:absolute;
		top:36px;
		left:25%;
		width:50%;
		z-index:1;
		top: 40px;
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