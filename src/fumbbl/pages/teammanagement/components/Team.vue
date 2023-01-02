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
                    {{ getPosition(player.positionId).cost }}
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
    async mounted() {
    }

    public getPosition(positionId: number) {
        for (const position of this.$props.team.roster.positions) {
            if (positionId === position.id) {
                return position;
            }
        }
        throw new Error('Failed to find position for ' + positionId);
    }
}
</script>