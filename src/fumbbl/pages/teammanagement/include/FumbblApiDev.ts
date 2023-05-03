import FumbblApi from "../include/FumbblApi";
import ApiResponse from "./ApiResponse";

export default class FumbblApiDev extends FumbblApi {

    // some endpoints will only work if we go via a special proxy in development
    protected getProxyUrl(apiUrl: string): string {
        return 'http://localhost:3000' + apiUrl;
    }

    public async setSpecialRule(teamId: number, ruleName: string, ruleValue: string): Promise<ApiResponse> {
        const url = this.getProxyUrl('/api/team/setSpecialRule/' + teamId);
        const data = {rule: ruleName, val: ruleValue};
        // note we are not using a form post here as we cannot get that to work with our proxy express server
        return await this.post(url, data);
    }

    public async renameTeam(teamId: number, newName: string): Promise<ApiResponse> {
        const url = this.getProxyUrl('/api/team/rename');
        const data = {teamId: teamId, newName: newName};
        return await this.post(url, data);
    }

    public async addAssistantCoach(teamId: number): Promise<ApiResponse> {
        return await this.simplePostWithOnlyTeamIdInBody(teamId, this.getProxyUrl('/api/team/addAssistantCoach'));
    }
}