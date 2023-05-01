import Axios from "axios";
import FumbblApi from "../include/FumbblApi";

export default class FumbblApiDev extends FumbblApi {

    public async setSpecialRule(teamId: number, ruleName: string, ruleValue: string): Promise<void> {
        await Axios.post('http://localhost:3000/api/team/setSpecialRule/' + teamId, {
            rule: ruleName,
            val: ruleValue
        });
    }

    public async renameTeam(teamId: number, newName: string): Promise<void> {
        const data = {teamId: teamId, newName: newName};
        await Axios.post('http://localhost:3000/api/team/rename', data);
    }

}