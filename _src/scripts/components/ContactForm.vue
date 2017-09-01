<template>
        <div :class="$style.wrapper">
            <h1>{{title}}</h1>
            <h2>{{subtitle}}</h2>
            <form ref="form" id="form" action="/ajax/contact" method="post">
                <label>
                    <span>First</span>
                    <input type="text" ref="first" name="first" data-error="false">
                </label>
                <label>
                    <span>Last</span>
                    <input type="text" ref="last" name="last" data-error="false">
                </label>
                <label>
                    <span>Email</span>
                    <input type="text" ref="email" name="email" data-error="false">
                </label>
                <label>
                    <span>Subject</span>
                    <input type="text" ref="subject" name="subject" data-error="false">
                </label>
                <label>
                    <span>Message</span>
                    <input type="text" ref="message" name="message" data-error="false">
                </label>

                <button type="submit" @click.prevent="submit">Submit</button>
            </form>
        </div>

</template>

<script>

    import API from 'app/api';

    export default {
        data() {
            return {
                title: 'Contact',
                subtitle: 'Send us a message',
                inputElems: []
            };
        },
        mounted(){
            this.inputElems.push(
                this.$refs.first,
                this.$refs.last,
                this.$refs.email,
                this.$refs.subject,
                this.$refs.message
            );
        },
        methods: {

            submit() {
                let formData = {};
                let hadErrors = false;
                for(let i = 0; i < this.inputElems.length; i++) {
                    // build form data object
                    formData[this.inputElems[i].name] = this.inputElems[i].value;

                    // TODO: check for errors on each input. set data-error to true if found
                    this.checkErrors(this.inputElems[i]);


                    // make sure no errors occured
                    if(this.inputElems[i].getAttribute('data-error') === "true") {
                        // NOTE: if you don't care about IE10, you can use this.inputElems[i].dataset.error
                        hadErrors = true;
                    }

                }

                // only submit if no errors
                if(this.hadErrors === false) {

                    API.post(this.$refs.form.action, formData, payload => {
                        console.log('success', payload);
                        setTimeout(this.resetForm, 3000);

                    }, error => {
                        console.log('error', error);
                        setTimeout(this.resetForm, 3000);

                    });
                }
            },
            resetForm() {
                let blurevt = new Event('blur');
                for(let i = 0; i < this.inputElems.length; i++) {
                    // clear form content
                    this.inputElems[i].value = '';
                    this.inputElems[i].dispatchEvent(blurevt);

                    this.inputElems[i].setAttribute('data-error', 'false')
                }
            },
            checkErrors(input) {
                // TODO: check for errors on the input
            }
        },
    }
</script>

<style lang="scss" module>

    .wrapper {

    }

</style>