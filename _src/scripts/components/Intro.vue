<template>
    <div id="intro" :class="$style.container">
        <h1 :class="$style.title">Site Title</h1>
    </div>
</template>

<script>

    export default {
        data() {
            return {

            }
        },

        created() {

        },

        mounted() {

        }
    }
</script>

<style lang="scss" module>
    .container {
        position: relative;
        height: 100vh;
        background:$mineshaft;
    }
    .title {
        text-align: center;
    }
</style>