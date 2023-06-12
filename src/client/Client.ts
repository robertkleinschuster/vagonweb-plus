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
    public async search(query: string): Promise<Train[]> {
        const response = await fetch(`https://vagonweb-api.snappy.blue/v1/search/?q=${query}`)
        return await response.json();
    }

    public async train(operator: string, nr: string): Promise<TrainDetails> {
        const response = await fetch(`https://vagonweb-api.snappy.blue/v1/train/?operator=${operator}&nr=${nr}`)
        return await response.json();
    }
}