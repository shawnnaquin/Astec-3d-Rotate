<template>
	<div data-name="main-footer" :class="$style.mainFooter">

		<div :class="$style.social">
			<a :class="$style.socialLink" :href="settings.instagram" target="_blank" >
				<instagram-icon :class="$style.icon" ></instagram-icon>
			</a>
			<a :class="$style.socialLink" :href="settings.twitter" target="_blank" >
				<twitter-icon :class="$style.icon" ></twitter-icon>
			</a>
			<a :class="$style.socialLink" :href="settings.facebook" target="_blank" >
				<facebook-icon :class="$style.icon" ></facebook-icon>
			</a>
		</div>

		<div :class="$style.contact">
			{{ settings.site_name }} &copy; {{ year }} <span :class="$style.divider">/</span>
			{{ settings.phone }} <span :class="$style.divider">/</span>
			<a :href="'mailto:' + settings.email">{{ settings.email }}</a> <span :class="$style.divider">/</span>
			{{ settings.city }}, {{ settings.state }}
		</div>

	</div>
</template>

<script>

	import instagramIcon from 'components/svgs/instagram-icon';
	import twitterIcon from 'components/svgs/twitter-icon';
	import facebookIcon from 'components/svgs/facebook-icon';

	export default {
	    data() {
	      return {
			settings: this.$store.state.settings.list
		  }
		},
		computed: {
			year() {
				return new Date().getFullYear();
			},
		},
		mounted() {
		  console.log(this.settings);
		},
		components: {
			'instagram-icon':instagramIcon,
			'twitter-icon': twitterIcon,
			'facebook-icon': facebookIcon
		}
	}
</script>

<style lang="scss" module>

	.main-footer {
		@include grid-column(12,0);
		padding-top: spacing(1);
		padding-bottom: spacing(3.5);

		font-size: 16px;
		font-weight:600;
		line-height: 1.5;
		text-align: center;
		color: rgba($westar, 0.5);
		background:$outer-space;
	}

	.divider {
		display: inline-block;
		padding-left: spacing(0.5);
		padding-right: spacing(0.5);
		font-weight:600;
	}

	.social {
		text-align:center;
		margin-bottom:16px;
	}

	.social-link {
		display:inline-block;
		margin:0 8px 8px 8px;
		&:hover {
			.icon {
				fill:rgba($westar, 0.5);
			}
		}
	}
	.icon {
		display:block;
		float:left;
		width:30px;
		height:30px;
		fill:rgba($westar,0.2);
		transition:fill 200ms ease-in;
	}

	a {
		color: inherit;
		transition: color linear 0.3s;
		&:focus,
		&:hover{
			color: $white;
		}
	}

	.contact {
		text-align:center;
		color:rgba($westar,0.2);
	}

</style>