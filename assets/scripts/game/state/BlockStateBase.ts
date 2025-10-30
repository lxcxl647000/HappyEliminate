
export interface IState {
    checkToState(state: IState): boolean;
    onStateEnter(data: IStateEnterData): void;
    onStateLeave(): void;
}

export class IStateEnterData {
    from: IState;
}

export class BlockState implements IState {
    protected state: BlockStateBase;
    constructor(state: BlockStateBase) {
        this.state = state;
    }
    checkToState(state: IState): boolean { return false; };
    onStateEnter(data: IStateEnterData): void { }
    onStateLeave(): void { }
}

export class BlockStateBase {
    private curState: IState;
    private stateQueue: { state: IState; data: IStateEnterData }[];
    private isShifting: boolean;

    constructor(state: IState) {
        this.stateQueue = [];
        this.isShifting = false;

        this.curState = state;
        state.onStateEnter({
            from: null
        });
    }

    public toState(state: IState, data: IStateEnterData): void {
        this.stateQueue.push({ state, data });
    }

    public shift(): void {
        if (this.isShifting) {
            return;
        }
        this.isShifting = true;

        while (this.stateQueue.length > 0) {
            const { state, data } = this.stateQueue.shift();

            if (this.curState.checkToState(state)) {
                data.from = this.curState;
                this.curState.onStateLeave();
                this.curState = state;
                this.curState.onStateEnter(data);
            } else {
            }
        }

        this.isShifting = false;
    }

    public getCurrentState(): IState {
        return this.curState;
    }
}