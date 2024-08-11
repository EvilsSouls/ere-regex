type ConnectionPointer = number | undefined | null; // Null = Matching State; Undefined = Floating Arrow; Number = Relative Pointer
type FinalConnectionPointer = number | null; // Null = Matching State; Number = Relative Pointer
export type { ConnectionPointer, FinalConnectionPointer };

/**
 * @todo Refactor Code to remove unneccessary "maximum", "minimum", and "numCrossing" values. As it's no longer planned to make Interval Expressions use these values. (Instead they should be expanded into regular State Machines using the other operators (maybe do this by making it call itself, but with a procedurally made RegEx, which is just the expanded Interval Expression)).
 */
interface Connection {
    numCrossing: number;
    relativePointingIndex: ConnectionPointer;
    condition: {character?: string; maximum?: number; minimum?: number};
}

export default class State {
    readonly connections: Connection[];

    constructor() {
        this.connections = [];
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
     * @param maximum The minimum amount of crossings that this connection needs to actually match the string.
     * @param minimum The maximmum amount of crossings that this connection needs to actually match the string.
     */
    addConnection(relativePointingIndex: ConnectionPointer, character?: string, maximum?: number, minimum?: number): void {
        const connection: Connection = {
            numCrossing: 0,
            relativePointingIndex: relativePointingIndex,
            condition: {character: character, maximum: maximum, minimum: minimum}
        }

        this.connections.push(connection);
    }
}