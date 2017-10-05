<template>
    <div :class="$style.wrapper">

        <div v-if="loaded" :class="$style.loaded">
            <!-- <main-header></main-header> -->
            <!-- <intro></intro> -->

            <router-view></router-view>

            <!-- <main-footer></main-footer> -->
        </div>
<!--
        <transition name="fade">
            <page-loader v-if="animateLoader"></page-loader>
        </transition>
 -->
    </div>
</template>

<script>
    import WebFont from 'webfontloader'
    import intro from 'components/Intro';
    import MainHeader from 'components/MainHeader'
    import PageLoader from 'components/PageLoader'
    import MainFooter from 'components/MainFooter'

    export default {
        components: {
            intro,
            'main-header': MainHeader,
            'page-loader': PageLoader,
            'main-footer': MainFooter
        },


        data() {
            return {
                loaded: false,
                animateLoader: true
            }
        },



        beforeCreate() {
            WebFont.load({
                google: {
                    families: ['Play:400,700','Source+Sans+Pro:400,600']
                },
                typekit: {
                    id: 'ljm2bgk',
                    families: ['skolar-sans-latin-extended'],
                },
                custom: {
                    families: ['Amnesty Trade Gothic Cn'],
                    urls: ['/assets/css/fonts.css'],
                },
            });

        },

        watch: {
            "$store.state.settings.list": function() {
                this.loaded = true;

                setTimeout(() => {
                    this.animateLoader = false;
                }, 1500);
            }
        },

        created() {
            this.$store.dispatch('retrieveSettings');
        },

        mounted() {
            console.log("[app] mounted");
        }
    }
</script>


<style lang="scss" module>
    .wrapper,
    .loaded {
        height:100%;
    }
</style>

<style lang="scss">
    @include foundation-global-styles;

    html,
    body {
        height:100%;
        overflow:hidden;
    }

    /* transitions
	------------------------------------------------------------------------------------------------------------------*/
    /* Enter and leave animations can use different */
    /* durations and timing functions.              */
    .fade-enter-active {
        transition: all .33s ease;
    }

    .fade-enter,
    .fade-leave-to{
        transition: all .33s ease;
        opacity: 0;
    }

</style>