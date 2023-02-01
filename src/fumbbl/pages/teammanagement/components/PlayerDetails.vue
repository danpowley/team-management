<template>
    <div class="playerdetails">
        <div class="playerdetailssection playerdetailsedit">
            <a href="#" @click.prevent="$emit('delete-player')" style="float: right;">Remove player</a>
            <div class="title">Edit</div>
            <p>Todo: decide what can be edited here.</p>
            <ul>
                <li>Name</li>
                <li>Gender</li>
                <li>Profile (after creation?)</li>
                <li>Player card image</li>
            </ul>
        </div>
        <div class="playerdetailssection playerdetailsrecord">
            <div class="title">Details</div>
            <p>Todo: decide what to display here.</p>
            <ul>
                <li>Games played: [data unavailable]</li>
                <li>Completions: {{ player ? player.getRecord().completions : '0' }}</li>
                <li>Touchdowns: {{ player ? player.getRecord().touchdowns : '0' }}</li>
                <li>Interceptions: {{ player ? player.getRecord().interceptions : '0' }}</li>
                <li>Casualties: {{ player ? player.getRecord().casualties : '0' }}</li>
                <li>MVPs: {{ player ? player.getRecord().mvps : '0' }}</li>
            </ul>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from 'vue-class-component';

@Component({
    components: {
    },
    props: {
        player: {
            validator: function (player) {
                return typeof player === 'object' || player === null;
            }
        },
    },
    watch: {
    }
})
export default class PlayerDetailsComponent extends Vue {
}
</script>