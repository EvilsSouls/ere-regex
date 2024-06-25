import State from "./state";

export default class NFA extends Array<State> {
    constructor(...states: State[]) {
        super();
        this.concat(states);
    }

    /**
     * @description Concatenates two NFA State Machines and patches both together.
     * @param addend The NFA to add
     */
    joinNFAs(addend: NFA): void {
        this.at(-1)?.patch(1);
        this.concat(addend);
    }

    printNFA(nfa: NFA = this): string[] {
        for(let pointers: number[] = []; true;) {
            for(let i = 0; i < pointers.length; i++) {
                const currentPointer = pointers[i];
                const currentState = nfa[currentPointer];

                if(currentState.connections.length > 1) {
                    // Probably will need another for loop to loop over all the new connections and add their pointers to the pointers array.
                }

                // Reminder that this needs to be converted into string[]
                // Here add logic to add the connection's relativePointingIndex to the current Pointer
                // Uhhh there's probably a lot more, where the logic needs to be figured out.
            }
        }

        return(["This is tempoary!!"]);
    }
}