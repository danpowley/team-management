import Axios from "axios";

export default class FumbblApi {

    public async setSpecialRule(teamId: number, ruleName: string, ruleValue: string): Promise<void> {
        const bodyFormData = new FormData();
        bodyFormData.append('rule', ruleName);
        bodyFormData.append('val', ruleValue);
        await Axios({
            method: "post",
            url: 'https://fumbbl.com/api/team/setSpecialRule/' + teamId,
            data: bodyFormData,
        });
    }

}