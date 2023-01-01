import Vue from "vue";
import TeamManagement from "./fumbbl/pages/teammanagement/TeamManagement.vue";

Vue.config.productionTip = false

new Vue({
  render: h => h(TeamManagement),
}).$mount('#vuecontent')