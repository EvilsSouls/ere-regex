interface Connection {
    numCrossing: number;
    relativePointingIndex: number | undefined | null; // Null = Matching State
    condition: {character?: string; maximum?: number; minimum?: number};
}

export default class State {
    readonly connections: Connection[];

    constructor() {
        this.connections = [];
    }

    /**
     * @description Joins all connections of a state to one new state. WILL relative pointer even if it's not undefined.
     * @param pointer The relative pointer to which the connection(s) should point to
     */
    patch(pointer: number): void {
        for(let i = 0; i < this.connections.length; i++) {
            if(this.connections[i].relativePointingIndex !== undefined) {console.warn("Patching together already defined connection! This will most definitly lead to mistakes.");}
            this.connections[i].relativePointingIndex = pointer;
        }
    }

    /**
     * @param relativePointingIndex A relative number to where the state should point. Undefined is a floating arrow (pointing to nothing), null points to the matching state. 
     * @param character The character that needs to be fulfilled to continue to the destination of the connection.
     * @param maximum The minimum amount of crossings that this connection needs to actually match the string.
     * @param minimum The maximmum amount of crossings that this connection needs to actually match the string.
     */
    addConnection(relativePointingIndex: number | undefined | null, character?: string, maximum?: number, minimum?: number): void {
        const connection: Connection = {
            numCrossing: 0,
            relativePointingIndex: relativePointingIndex,
            condition: {character: character, maximum: maximum, minimum: minimum}
        }

        this.connections.push(connection);
    }
}