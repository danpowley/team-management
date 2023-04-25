<template>
    <transition name="modal-fade">
        <div class="modalbackdrop">
            <div class="modal"
                 :class="getModalClasses()"
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
                    <div>
                        <button v-for="(label, eventName) in buttonsConfig" class="teambutton" @click="$emit(eventName)">{{ label }}</button>
                    </div>
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
        modalSize: {
            type: String,
            required: false,
            default: 'medium',
        }
    },
})
export default class ModalComponent extends Vue {
    private close() {
        this.$emit('close');
    }

    private getModalClasses(): any {
        return {
            modalsmall: this.$props.modalSize === 'small',
            modalmedium: this.$props.modalSize === 'medium',
            modallarge: this.$props.modalSize === 'large',
        }
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