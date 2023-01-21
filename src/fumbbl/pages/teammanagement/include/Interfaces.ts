export type PlayerRowFoldOutMode = 'BUY' | 'MORE' | 'CLOSED';

export interface Position {
    id: number,
    name: string,
    cost: number,
    skills: string[],
    stats: PositionStats,
    quantityAllowed: number,
};

export interface PositionDataForBuyingPlayer {
    positionId: number,
    quantityHired: number,
    canAfford: boolean,
    position: Position,
}

export interface PositionStats {
    Movement: number,
    Strength: number,
    Agility: number,
    Passing: number | null,
    Armour: number,
}

export interface SetupTeamManagementSettings {
    roster: {
        name: string,
    },
    treasury: {
        start: number,
    },
    players: {
        start: number,
        max: number,
        positions: Position[],
    },
    dedicatedFans: {
        start: number,
        minStart: number,
        maxStart: number,
        cost: number,
    },
    rerolls: {
        max: number,
        cost: number,
    },
    sidelineStaff: {
        assistantCoaches: {
            max: number,
            cost: number,
        },
        cheerleaders: {
            max: number,
            cost: number,
        },
        apothecary: {
            allowed: boolean,
            cost: number,
        },
    }
};

export interface AddRemovePermissions {
    rerolls: {
        add: boolean,
        remove: boolean,
    },
    dedicatedFans: {
        add: boolean,
        remove: boolean,
    },
    assistantCoaches: {
        add: boolean,
        remove: boolean,
    },
    cheerleaders: {
        add: boolean,
        remove: boolean,
    },
    apothecary: {
        add: boolean,
        remove: boolean,
    },
};

export type TeamSheet = TeamNumber[];

export interface TeamNumber {
    teamNumber: number,
    player: any,
};