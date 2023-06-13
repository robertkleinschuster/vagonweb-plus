export interface Train {
    type: string;
    nr: string;
    title: string;
    name: string;
    route: string;
    operator: string;
    web: string;
    api: string;
}

export interface TrainDetails {
    route?: string;
    info?: string;
    badges?: {
        src: string,
        title?: string
    }[],
    carriages?: {
        src: string,
        width: string,
        height: string
    }[],
    links?: {
        href: string,
        name: string
    }[]
}

export class Client {
    private controller = new AbortController();

    public async search(query: string): Promise<Train[]> {
        const response = await fetch(`https://vagonweb-api.snappy.blue/v1/search/?q=${query}`, {signal: this.controller.signal})
        return await response.json();
    }

    public async train(operator: string, nr: string): Promise<TrainDetails> {
        const response = await fetch(`https://vagonweb-api.snappy.blue/v1/train/?operator=${operator}&nr=${nr}`, {signal: this.controller.signal})
        return await response.json();
    }

    private async findHaFASTripId(operator: string, type: string, nr: string) {
        if (['DB', 'OeBB'].includes(operator)) {
            let hafasOperator = operator == 'DB' ? 'DB Fernverkehr AG' : 'Österreichische Bundesbahnen'
            const response = await fetch(`https://v6.db.transport.rest/trips?query=${type + ' ' + nr}&operatorNames=${hafasOperator}&onlyCurrentlyRunning=true&stopovers=false&remarks=true&subStops=false&entrances=false&language=de`, {signal: this.controller.signal})
            if (response.ok) {
                const data = await response.json();
                return data.trips[0]?.id;
            }
        }

        return null;
    }


    public async realtime(operator: string, type: string, nr: string) {
        const tripId = await this.findHaFASTripId(operator, type, nr);
        if (tripId) {
            const response = await fetch(`https://v6.db.transport.rest/trips/${tripId}?stopovers=false&remarks=true&polyline=false&language=de`, {signal: this.controller.signal});
            const data = await response.json();
            return {
                delay: data.trip.arrivalDelay / 60,
                arrival: new Date(data.trip.arrival ?? data.trip.plannedArrival),
                departure: new Date(data.trip.departure ?? data.trip.plannedDeparture),
                destination: data.trip.destination.name
            };
        }
        return null;
    }

    public abort() {
        this.controller.abort()
        this.controller = new AbortController()
    }
}