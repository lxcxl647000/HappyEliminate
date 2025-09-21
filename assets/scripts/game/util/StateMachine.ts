
export interface IState {
    canTransitionTo(state: IState): boolean;
    onEnter(data: IEnterData): void;
    onLeave(): void;
    getName(): string;
}

export class IEnterData {
    from: IState;
}

export class StateWithMachine implements IState {
    protected stateMachine: StateMachine;
    constructor(stateMachine: StateMachine) {
        this.stateMachine = stateMachine;
    }
    canTransitionTo(state: IState): boolean { return false; };
    onEnter(data: IEnterData): void { }
    onLeave(): void { }
    getName(): string { return 'StateWithMachine'; }
}

export class StateMachine {
    private currentState: IState;
    private queue: { state: IState; data: IEnterData }[];
    private isProcessingQueue: boolean;

    constructor(initialState: IState) {
        this.queue = [];
        this.isProcessingQueue = false;

        this.currentState = initialState;
        initialState.onEnter({
            from: null
        });
    }

    public transitionTo(state: IState, data: IEnterData): void {
        this.queue.push({ state, data });
        // this.processQueue();
    }

    public processQueue(): void {
        if (this.isProcessingQueue) {
            return;
        }
        this.isProcessingQueue = true;

        while (this.queue.length > 0) {
            const { state, data } = this.queue.shift();
            if (this.currentState.canTransitionTo(state)) {
                data.from = this.currentState;
                this.currentState.onLeave();
                this.currentState = state;
                console.log(`[state] transition from ${data.from.getName()} to ${state.getName()}`);
                this.currentState.onEnter(data);
            } else {
                console.log(`[state] Cannot transition from ${this.currentState.getName()} to ${state.getName()}`);
            }
        }

        this.isProcessingQueue = false;
    }

    public getCurrentState(): IState {
        return this.currentState;
    }
}