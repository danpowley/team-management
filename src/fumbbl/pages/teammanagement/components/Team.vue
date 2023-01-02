<template>
    <div class="team" v-if="team !== null">
        <table>
            <tr v-for="(player, index) in team.players" :key="index">
                <td>
                    {{ player.number }}
                </td>
                <td>
                    {{ player.position }}
                </td>
                <td>
                    {{ player.gender }}
                </td>
                <td>
                    {{ team.positionsLookup[player.positionId].cost }}
                </td>
            </tr>
        </table>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Axios from "axios";
import Component from 'vue-class-component';

@Component({
    components: {
    },
    props: {
        team: {
            type: Object,
            required: true,
        },
    }
})
export default class TeamComponent extends Vue {
    public positionsLookup: any = null;
    async mounted() {
    }
}
</script>