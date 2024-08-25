type ConnectionPointer = number | undefined | null; // Null = Matching State; Undefined = Floating Arrow; Number = Relative Pointer
type FinalConnectionPointer = number | null; // Null = Matching State; Number = Relative Pointer
export type { ConnectionPointer, FinalConnectionPointer };

/**
 * @todo Refactor Code to remove unneccessary "maximum", "minimum", and "numCrossing" values. As it's no longer planned to make Interval Expressions use these values. (Instead they should be expanded into regular State Machines using the other operators (maybe do this by making it call itself, but with a procedurally made RegEx, which is just the expanded Interval Expression)).
 */
interface Connection {
    relativePointingIndex: ConnectionPointer;
    character: string | undefined;
}

export default class State {
    readonly connections: Connection[];

    constructor() {
        this.connections = [];
    }

    /**
     * @description Clones `this` to remove any possible shallow copies.
     * @returns The exact same State, just without any pesky shallow copies
     */
    clone(): State {
        const clonedState = new State();
        for(const currentConnection of this.connections) {
            clonedState.addConnection(currentConnection.relativePointingIndex, currentConnection.character);
        }

        return(clonedState);
    }

    /**
     * @description Joins all floating connections of a state to one new state.
     * @param pointer The relative pointer to which the connection(s) should point to
     */
    patch(pointer: FinalConnectionPointer): void {
        for(let i = 0; i < this.connections.length; i++) {
            if(this.connections[i].relativePointingIndex === undefined) {this.connections[i].relativePointingIndex = pointer;}
        }
    }

    /**
     * @param relativePointingIndex A relative number to where the state should point. Undefined is a floating arrow (pointing to nothing), null points to the matching state. 
     * @param character The character that needs to be fulfilled to continue to the destination of the connection.
     */
    addConnection(relativePointingIndex: ConnectionPointer, character?: string): void {
        const connection: Connection = {
            relativePointingIndex: relativePointingIndex,
            character: character
        }

        this.connections.push(connection);
    }
}