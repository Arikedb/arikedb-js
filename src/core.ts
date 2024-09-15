import * as grpc from "@grpc/grpc-js";
import { arikedbpbuff } from "./arikedbpbuff";
import { Observable } from "rxjs";

export enum Epoch {
    Second = 0,
    Millisecond = 1,
    Microsecond = 2,
    Nanosecond = 3
} 

export enum Event {
    OnSet = 0,
    OnChange = 1,
    OnRise = 2,
    OnFall = 3,
    OnValueReachVal = 4,
    OnValueEqVal = 5,
    OnValueLeaveVal = 6,
    OnValueDiffVal = 7,
    OnCrossHighLimit = 8,
    OnCrossLowLimit = 9,
    OnOverHighLimit = 10,
    OnUnderLowLimit = 11,
    OnValueReachRange = 12,
    OnValueInRange = 13,
    OnValueLeaveRange = 14,
    OnValueOutRange = 15
}

export enum VariableType {
    I8 = 0,
    I16 = 1,
    I32 = 2,
    I64 = 3,
    I128 = 4,
    U8 = 5,
    U16 = 6,
    U32 = 7,
    U64 = 8,
    U128 = 9,
    F32 = 10,
    F64 = 11,
    STR = 12,
    BOOL = 13
}

export enum StatusCode {
    Ok = 0,
    LicenseExpired = 1,
    LicenseLimitsExceeded = 2,
    SessionExpired = 3,
    InternalError = 4,
    Unauthorized = 5,
    Unauthenticated = 6,
    CollectionNotFound = 7,
    InvalidRequest = 8
}

export class Collection {
    public name: string;

    constructor(name: string) {
        this.name = name;
    }
}

export class Variable {
    public name: string;
    public vtype: VariableType;
    public buffer_size: number;

    constructor(name: string, vtype: VariableType, buffer_size: number) {
        this.name = name;
        this.vtype = vtype;
        this.buffer_size = buffer_size;
    }
}

export class DataPoint {
    public name: string;
    public vtype: VariableType;
    public timestamp: number;
    public epoch: Epoch;
    public value: number | string | boolean;

    constructor(name: string, vtype: VariableType, timestamp: number, epoch: Epoch, value: number | string | boolean) {
        this.name = name;
        this.vtype = vtype;
        this.timestamp = timestamp;
        this.epoch = epoch;
        this.value = value;
    }
}

export class Result {
    public status: StatusCode;
    public collections?: Collection[];
    public variables?: Variable[];
    public datapoints?: DataPoint[];

    constructor(status: StatusCode, collections?: Collection[], variables?: Variable[], datapoints?: DataPoint[]) {
        this.status = status;
        this.collections = collections;
        this.variables = variables;
        this.datapoints = datapoints;
    }
}

export class VarEvent {
    public event: Event;
    public value?: number | string | boolean;
    public low_limit?: number | string | boolean;
    public high_limit?: number | string | boolean;

    constructor(event: Event, value?: number | string | boolean, low_limit?: number | string | boolean, high_limit?: number | string | boolean) {
        this.event = event;
        this.value = value;
        this.low_limit = low_limit;
        this.high_limit = high_limit;
    }
}

export class ArikedbCore {
    private client: arikedbpbuff.ArikedbRPCClient | null;

    constructor() {
        this.client = null;
    }

    public connect(host: string, port: number): ArikedbCore {
        this.client = new arikedbpbuff.ArikedbRPCClient(`${host}:${port}`, grpc.credentials.createInsecure());
        return this;
    }

    public disconnect() {
        if (this.client) {
            this.client.close();
            this.client = null;
        }
    }

    public listCollections(): Promise<Result> {
        return new Promise((resolve, reject) => {
            if (this.client === null || this.client === undefined || !this.client) {
                reject(new Error('Not connected to server'));
            } else {
                const request = new arikedbpbuff.ListCollectionsRequest();
                this.client.ListCollections(request, (error, response) => {
                    if (error) {
                        reject(error);
                    } else if (!response) {
                        reject(new Error('No response from server'));
                    } else {
                        var collections = response?.collections.map((collection) => new Collection(collection.name));
                        resolve(new Result(StatusCode.Ok, collections));
                    }
                });
            }
        });
    }

    public createCollections(collection_names: string[]): Promise<Result> {
        return new Promise((resolve, reject) => {
            if (this.client === null || this.client === undefined || !this.client) {
                reject(new Error('Not connected to server'));
            } else {
                const collections = collection_names.map(name => new arikedbpbuff.CollectionMeta({ name }));
                const request = new arikedbpbuff.CreateCollectionsRequest({collections: collections});
                this.client.CreateCollections(request, (error, response) => {
                    if (error) {
                        reject(error);
                    } else if (!response) {
                        reject(new Error('No response from server'));
                    } else {
                        resolve(new Result(StatusCode.Ok));
                    }
                });
            }
        });
    }

    public deleteCollections(collection_names: string[]): Promise<Result> {
        return new Promise((resolve, reject) => {
            if (this.client === null || this.client === undefined || !this.client) {
                reject(new Error('Not connected to server'));
            } else {
                const request = new arikedbpbuff.DeleteCollectionsRequest({names: collection_names});
                this.client.DeleteCollections(request, (error, response) => {
                    if (error) {
                        reject(error);
                    } else if (!response) {
                        reject(new Error('No response from server'));
                    } else {
                        resolve(new Result(StatusCode.Ok));
                    }
                });
            }
        });
    }

    public listVariables(collection_name: string): Promise<Result> {
        return new Promise((resolve, reject) => {
            if (this.client === null || this.client === undefined || !this.client) {
                reject(new Error('Not connected to server'));
            } else {
                const request = new arikedbpbuff.ListVariablesRequest({collection: collection_name});
                this.client.ListVariables(request, (error, response) => {
                    if (error) {
                        reject(error);
                    } else if (!response) {
                        reject(new Error('No response from server'));
                    } else {
                        const variables = response?.variables.map((variable) => new Variable(
                            variable.name,
                            variable.vtype as unknown as VariableType,
                            variable.buffer_size
                        ));
                        resolve(new Result(StatusCode.Ok, undefined, variables));
                    }
                });
            }
        });
    }

    public createVariables(collection_name: string, variables: Variable[]): Promise<Result> {
        return new Promise((resolve, reject) => {
            if (this.client === null || this.client === undefined || !this.client) {
                reject(new Error('Not connected to server'));
            } else {
                const vars_meta = variables.map(variable => new arikedbpbuff.VariableMeta({
                    name: variable.name,
                    vtype: variable.vtype as unknown as arikedbpbuff.VarType,
                    buffer_size: variable.buffer_size
                }))
                const request = new arikedbpbuff.CreateVariablesRequest({
                    collection: collection_name,
                    variables: vars_meta
                });
                this.client.CreateVariables(request, (error, response) => {
                    if (error) {
                        reject(error);
                    } else if (!response) {
                        reject(new Error('No response from server'));
                    } else {
                        resolve(new Result(StatusCode.Ok));
                    }
                });
            }
        });
    }

    public deleteVariables(collection_name: string, variable_names: string[]): Promise<Result> {
        return new Promise((resolve, reject) => {
            if (this.client === null || this.client === undefined || !this.client) {
                reject(new Error('Not connected to server'));
            } else {
                const request = new arikedbpbuff.DeleteVariablesRequest({
                    collection: collection_name,
                    names: variable_names
                });
                this.client.DeleteVariables(request, (error, response) => {
                    if (error) {
                        reject(error);
                    } else if (!response) {
                        reject(new Error('No response from server'));
                    } else {
                        resolve(new Result(StatusCode.Ok));
                    }
                });
            }
        });
    }

    public getVariables(collection_name: string, variable_names: string[], epoch: Epoch): Promise<Result> {
        return new Promise((resolve, reject) => {
            if (this.client === null || this.client === undefined || !this.client) {
                reject(new Error('Not connected to server'));
            } else {
                const request = new arikedbpbuff.GetVariablesRequest({
                    collection: collection_name,
                    names: variable_names,
                    epoch: epoch as unknown as arikedbpbuff.Epoch
                });
                this.client.GetVariables(request, (error, response) => {
                    if (error) {
                        reject(error);
                    } else if (!response) {
                        reject(new Error('No response from server'));
                    } else {
                        resolve(new Result(
                            StatusCode.Ok,
                            undefined,
                            undefined,
                            response.points.map(point => this.dataPoint_from_point(point))
                        ));
                    }
                });
            }
        });
    }

    public setVariables(
        collection_name: string,
        variable_names: string[],
        values: (number | string | boolean)[],
        timestamp: number = Date.now(),
        epoch: Epoch = Epoch.Millisecond
    ): Promise<Result> {

        return new Promise((resolve, reject) => {
            if (this.client === null || this.client === undefined || !this.client) {
                reject(new Error('Not connected to server'));
            } else {
                const request = new arikedbpbuff.SetVariablesRequest({
                    collection: collection_name,
                    names: variable_names,
                    values: values.map(value => String(value)),
                    timestamp: String(timestamp),
                    epoch: epoch as unknown as arikedbpbuff.Epoch
                });
                this.client.SetVariables(request, (error, response) => {
                    if (error) {
                        reject(error);
                    } else if (!response) {
                        reject(new Error('No response from server'));
                    } else {
                        resolve(new Result(StatusCode.Ok));
                    }
                });
            }
        });

    }

    public subscribeVariables(collection_name: string, variable_names: string[], events: VarEvent[]): Observable<DataPoint> {
        return new Observable<DataPoint>((observer) => {
            if (this.client === null || this.client === undefined || !this.client) {
                observer.error(new Error('Not connected to server'));
                return;
            }
            const request = new arikedbpbuff.SubscribeVariablesRequest({
                collection: collection_name,
                names: variable_names,
                events: events.map(event => new arikedbpbuff.VariableEvent({
                    event: event.event as unknown as arikedbpbuff.Event,
                    value: String(event.value),
                    low_limit: String(event.low_limit),
                    high_limit: String(event.high_limit)
                }))
            });
            const stream = this.client.SubscribeVariables(request);
    
            stream.on('data', (point: arikedbpbuff.VarDataPoint) => {
                const data_point = this.dataPoint_from_point(point);
                observer.next(data_point);
            });
    
            stream.on('end', () => {
                observer.complete();
            });
    
            stream.on('error', (error) => {
                observer.error(error);
            });

            return () => {
                stream.cancel();
            };
        });
    }

    private dataPoint_from_point(point: arikedbpbuff.VarDataPoint): DataPoint {
        const v_type = point.vtype as unknown as VariableType;
        var value: number | boolean | string = point.value;
        if (v_type === VariableType.BOOL) {
            value = point.value.toLowerCase() === 'true' || point.value.toLowerCase() === '1';
        } else if (v_type  === VariableType.STR) {
            value = String(value);
        } else {
            value = Number(value);
        }
        return new DataPoint(
            point.name,
            v_type,
            Number(point.timestamp),
            point.epoch as unknown as Epoch,
            value
        );
    }

}
