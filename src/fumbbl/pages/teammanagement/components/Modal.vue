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
                        <button v-for="eventName in buttonEvents" :key="eventName" class="teambutton" @click="$emit(eventName)">{{ getButtonLabel(eventName) }}</button>
                    </div>
                </section>
            </div>
        </div>
    </transition>
</template>

<script lang="ts">
import Vue from "vue";
import Component from 'vue-class-component';

const ModalComponentProps = Vue.extend({
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
});

@Component
export default class ModalComponent extends ModalComponentProps {
    public close() {
        this.$emit('close');
    }

    public getModalClasses(): any {
        return {
            modalsmall: this.modalSize === 'small',
            modalmedium: this.modalSize === 'medium',
            modallarge: this.modalSize === 'large',
        }
    }

    public get buttonEvents(): string[] {
        return Object.keys(this.buttonsConfig);
    }

    public getButtonLabel(eventName: string): string {
        return this.buttonsConfig[eventName];
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