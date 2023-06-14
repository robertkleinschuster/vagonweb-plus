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
        let operators = null
        if (['DB', 'OeBB'].includes(operator)) {
            operators = [
                'Österreichische Bundesbahnen',
                'DB Fernverkehr AG',
            ];

            if (type.includes(':')) {
                type = type.split(':')[1];
            }

            if (nr.includes(':')) {
                nr = nr.split(':')[1];
            }

            if (nr.includes('|')) {
                nr = nr.split('|')[0];
            }
        }

        if (['CD'].includes(operator)) {
            operators = [
                'Ceske Drahy',
            ];

            if (type.includes(':')) {
                type = type.split(':')[1];
            }

            if (nr.includes(':')) {
                nr = nr.split(':')[1];
            }

            if (nr.includes('|')) {
                nr = nr.split('|')[0];
            }

            if (nr.includes('/')) {
                nr = nr.split('/')[0];
            }
        }

        if (['START'].includes(operator)) {
            operators = [
                'MAV',
            ];

            if (type.includes(':')) {
                type = type.split(':')[1];
            }

            if (nr.includes(':')) {
                nr = nr.split(':')[1];
            }

            if (nr.includes('|')) {
                nr = nr.split('|')[0];
            }

            if (nr.includes('/')) {
                nr = nr.split('/')[0];
            }
        }


        if (['PKPIC'].includes(operator)) {
            operators = [
                'PKP Intercity',
            ];

            if (type.includes(':')) {
                type = '';
            }

            if (nr.includes(':')) {
                nr = nr.split(':')[1];
            }

            if (nr.includes('|')) {
                nr = nr.split('|')[0];
            }

            if (nr.includes('/')) {
                nr = nr.split('/')[0];
            }
        }

        if (['CFR'].includes(operator)) {
            operators = [
                'Rumänische Eisenbahnen Caile Ferate Romane',
            ];

            if (type.includes(':')) {
                type = '';
            }

            if (nr.includes(':')) {
                nr = nr.split(':')[1];
            }

            if (nr.includes('|')) {
                nr = nr.split('|')[0];
            }

            if (nr.includes('/')) {
                nr = nr.split('/')[0];
            }
        }

        if (operators) {
            const response = await fetch(`https://v6.db.transport.rest/trips?query=${type + ' ' + nr}&operatorNames=${operators.join(',')}&onlyCurrentlyRunning=false&stopovers=false&remarks=false&subStops=false&entrances=false&language=de&fromWhen=today%2000:00&untilWhen=today%2023:59`, {signal: this.controller.signal})
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
                destination: data.trip.destination.name,
                remarks: data.trip.remarks ?? [],
                arrivalPlatform: data.trip.arrivalPlatform ?? data.trip.plannedArrivalPlatform
            };
        }
        return null;
    }

    public abort() {
        this.controller.abort()
        this.controller = new AbortController()
    }
}