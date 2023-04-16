<template>
    <transition name="modal-fade">
        <div class="modalbackdrop">
            <div class="modal"
                 role="dialog"
                 aria-labelledby="modalTitle"
                 aria-describedby="modalDescription"
            >
                <header class="modalheader" id="modalTitle">
                    <slot name="header"></slot>
                    <button
                        v-if="excludeCloseTopRight !== true"
                        type="button"
                        class="modalclose"
                        @click="close"
                        aria-label="Close modal"
                    >x</button>
                </header>

                <section class="modalbody" id="modalDescription">
                    <slot name="body"></slot>
                </section>

                <section class="modalbuttons" v-if="buttonsConfig">
                    <button v-for="(label, eventName) in buttonsConfig" class="teambutton" @click="$emit(eventName)">{{ label }}</button>
                </section>
            </div>
        </div>
    </transition>
</template>

<script lang="ts">
import Vue from "vue";
import Component from 'vue-class-component';

@Component({
    props: {
        excludeCloseTopRight: {
            type: Boolean,
            required: false,
            default: false,
        },
        buttonsConfig: {
            type: Object,
            required: false,
        },
    },
})
export default class ModalComponent extends Vue {
    private close() {
        this.$emit('close');
    }
}
</script>

<style>
.modal-fade-enter,
.modal-fade-leave-to {
    opacity: 0;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity .5s ease;
}
</style>