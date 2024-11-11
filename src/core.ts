import * as grpc from "@grpc/grpc-js";
import { arike_pb } from "./arike_main";
import { arike_pb as auth_pb } from "./arike_auth";
import { arike_pb as collection_pb } from "./arike_collection";
import { arike_pb as ts_var_pb } from "./arike_ts_variable";
import { arike_pb as stack_pb } from "./arike_stack";
import { arike_pb as fifo_pb } from "./arike_fifo";
import { arike_pb as sorted_list_pb } from "./arike_sorted_list";
import { arike_pb as utils_pb } from "./arike_utils";
import { Status, ValueType, VarEvent, Event } from "./common"
import { readFileSync } from "fs";
import { Observable } from "rxjs";

export {ValueType, VarEvent, Event};

interface RequestClass {
    new (...args: any[]): any;
}

interface ConnectionOptions {
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    use_ssl_tls?: boolean;
    ca_path?: string;
    cert_path?: string;
    key_path?: string;
}

interface MethodResult {
    already_exists?: string[];
    license_exceeded?: string[];
    not_found?: string[];
    invalid_type?: string[];
}

interface TsValue {
    name: string;
    timestamp?: number;
    int?: number;
    float?: number;
    string?: string;
    bool?: boolean;
}

export class TsVariable {
    public name: string;
    public vtype: ValueType;
    private collection: Collection;

    constructor(
        name: string,
        vtype: ValueType,
        collection: Collection
    ) {
        this.name = name;
        this.vtype = vtype;
        this.collection = collection;
    }
}

class Array {
    public name: string;
    public vtype: ValueType;
    public size?: number;
    private collection: Collection;
    
    constructor(
        name: string,
        vtype: ValueType,
        collection: Collection,
        size?: number
    ) {
        this.name = name;
        this.vtype = vtype;
        this.collection = collection;
        this.size = size;
    }
}

export class Stack extends Array {

}

export class Fifo extends Array {

}

export class SortedList extends Array {

}

export class Collection {
    public name: string;
    private arikedb: Arikedb;

    constructor(name: string, arikedb: Arikedb) {
        this.name = name;
        this.arikedb = arikedb;
    }

    public tsVariables(
        pattern?: string
    ): Promise<TsVariable[]> {
        
        return new Promise((resolve, reject) => {
            if (this.arikedb.client == null) {
                reject(new Error("Not connected to the server."));
            } else {
                this.arikedb.exec_request(
                    this.arikedb.client.ListVariables,
                    ts_var_pb.ListVariablesRequest,
                    {
                        collection: this.name,
                        pattern: pattern
                    },
                    true,
                    (error: grpc.ServiceError, response: ts_var_pb.ListVariablesResponse) => {
                        if (error) {
                            reject(error);
                        }
                        if (response.status == utils_pb.StatusCode.OK) {
                            resolve(response.variables.map((v) => new TsVariable(v.name, ValueType[v.val_type] as unknown as ValueType, this)));
                        } else {
                            reject(new Error(`Failed to list variables: ${Status[response.status]}`));
                        }
                    }
                );
            }
        });
    }

    public tsVariable(
        name: string
    ): Promise<TsVariable> {
        
        return new Promise((resolve, reject) => {
            this.tsVariables(name)
            .then((variables) => {
                if (variables.length > 0) {
                    resolve(variables[0]);
                } else {
                    reject(new Error(`Variable ${name} not found.`));
                }
            }).catch(err => {
                reject(err);
            });
        });
    }

    public createTsVariables(
        variables: [string, ValueType][]
    ): Promise<MethodResult> {

        return new Promise((resolve, reject) => {
            if (this.arikedb.client == null) {
                reject(new Error("Not connected to the server."));
            } else {
                this.arikedb.exec_request(
                    this.arikedb.client.CreateVariables,
                    ts_var_pb.CreateVariablesRequest,
                    {
                        collection: this.name,
                        variables: variables.map((v) => new ts_var_pb.TsVariableMeta({
                            name: v[0],
                            val_type: v[1] as unknown as utils_pb.ValType
                        }))
                    },
                    true,
                    (error: grpc.ServiceError, response: ts_var_pb.CreateVariablesResponse) => {
                        if (error) {
                            reject(error);
                        }
                        if (response.status == utils_pb.StatusCode.OK) {
                            resolve({
                                already_exists: response.already_exists
                            });
                        } else {
                            reject(new Error(`Failed to create variables: ${Status[response.status]}`));
                        }
                    }
                );
            }
        });
    }

    public deleteTsVariables(
        variables: string[]
    ): Promise<MethodResult> {
        
        return new Promise((resolve, reject) => {
            if (this.arikedb.client == null) {
                reject(new Error("Not connected to the server."));
            } else {
                this.arikedb.exec_request(
                    this.arikedb.client.DeleteVariables,
                    ts_var_pb.DeleteVariablesRequest,
                    {
                        collection: this.name,
                        variables: variables
                    },
                    true,
                    (error: grpc.ServiceError, response: ts_var_pb.DeleteVariablesResponse) => {
                        if (error) {
                            reject(error);
                        }
                        if (response.status == utils_pb.StatusCode.OK) {
                            resolve({
                                not_found: response.not_found
                            });
                        } else {
                            reject(new Error(`Failed to delete variables: ${Status[response.status]}`));
                        }
                    }
                );
            }
        });
    }

    public tsVariablesSet(
        values: TsValue[],
        timestamp?: number
    ): Promise<MethodResult> {

        return new Promise((resolve, reject) => {
            if (this.arikedb.client == null) {
                reject(new Error("Not connected to the server."));
            } else {
                this.arikedb.exec_request(
                    this.arikedb.client.SetVariables,
                    ts_var_pb.SetVariablesRequest,
                    {
                        collection: this.name,
                        values: values.map((v) => new ts_var_pb.TsVarValue({
                            name: v.name,
                            int_value: v.int,
                            float_value: v.float,
                            str_value: v.string,
                            bool_value: v.bool,
                            timestamp: v.timestamp
                        })),
                        timestamp: timestamp
                    },
                    true,
                    (error: grpc.ServiceError, response: ts_var_pb.SetVariablesResponse) => {
                        if (error) {
                            reject(error);
                        }
                        if (response.status == utils_pb.StatusCode.OK) {
                            resolve({
                                not_found: response.not_found,
                                invalid_type: response.invalid_type
                            });
                        } else {
                            reject(new Error(`Failed to set variables: ${Status[response.status]}`));
                        }
                    }
                );
            }
        });
    }

    public tsVariablesGet(
        variables: string[]
    ): Promise<TsValue[]> {

        return new Promise((resolve, reject) => {
            if (this.arikedb.client == null) {
                reject(new Error("Not connected to the server."));
            } else {
                this.arikedb.exec_request(
                    this.arikedb.client.GetVariables,
                    ts_var_pb.GetVariablesRequest,
                    {
                        collection: this.name,
                        names: variables
                    },
                    true,
                    (error: grpc.ServiceError, response: ts_var_pb.GetVariablesResponse) => {
                        if (error) {
                            reject(error);
                        }
                        if (response.status == utils_pb.StatusCode.OK) {
                            resolve(response.values.map((v) => {
                                switch (v.val_type) {
                                    case utils_pb.ValType.INT:
                                        return { name: v.name, timestamp: v.timestamp, int: v.int_value }
                                    case utils_pb.ValType.FLOAT:
                                        return { name: v.name, timestamp: v.timestamp, float: v.float_value }
                                    case utils_pb.ValType.STRING:
                                        return { name: v.name, timestamp: v.timestamp, string: v.str_value }
                                    case utils_pb.ValType.BOOL:
                                        return { name: v.name, timestamp: v.timestamp, bool: v.bool_value }
                                }
                            }));
                        } else {
                            reject(new Error(`Failed to get variables: ${Status[response.status]}`));
                        }
                    }
                );
            }
        });
    }

    public tsVariablesSubscribe(
        variables: string[],
        events: VarEvent[],
    ): Observable<TsValue> {
        
        return new Observable((observer) => {
            if (this.arikedb.client == null) {
                observer.error(new Error("Not connected to the server."));
                return;
            } else {
                const request = new ts_var_pb.SubscribeVariablesRequest({
                    collection: this.name,
                    names: variables,
                    events: events.map((e) => new ts_var_pb.VariableEvent({
                        event: e.event as unknown as utils_pb.Event,
                        str_value: e.str_value,
                        str_low_limit: e.str_low_limit,
                        str_high_limit: e.str_high_limit,
                        int_value: e.int_value,
                        int_low_limit: e.int_low_limit,
                        int_high_limit: e.int_high_limit,
                        float_value: e.float_value,
                        float_low_limit: e.float_low_limit,
                        float_high_limit: e.float_high_limit,
                        bool_value: e.bool_value,
                        bool_low_limit: e.bool_low_limit,
                        bool_high_limit: e.bool_high_limit,
                    }))
                });

                let metadata = new grpc.Metadata();
                if (this.arikedb.token) {
                    metadata.add("authorization", this.arikedb.token);
                }

                const stream = this.arikedb.client.SubscribeVariables(request, metadata);

                stream.on('data', (ts_value: ts_var_pb.TsVarValue) => {
                    switch (ts_value.val_type) {
                        case utils_pb.ValType.INT:
                            observer.next({
                                name: ts_value.name,
                                timestamp: ts_value.timestamp,
                                int: ts_value.int_value
                            })
                            break;
                        case utils_pb.ValType.FLOAT:
                            observer.next({
                                name: ts_value.name,
                                timestamp: ts_value.timestamp,
                                float: ts_value.float_value
                            })
                            break;
                        case utils_pb.ValType.STRING:
                            observer.next({
                                name: ts_value.name,
                                timestamp: ts_value.timestamp,
                                string: ts_value.str_value
                            })
                            break;
                        case utils_pb.ValType.BOOL:
                            observer.next({
                                name: ts_value.name,
                                timestamp: ts_value.timestamp,
                                bool: ts_value.bool_value
                            })
                            break;
                    }
                });

                stream.on('end', () => {
                    observer.complete();
                });

                stream.on('error', (error: grpc.ServiceError) => {
                    observer.error(error);
                });

                return () => {
                    stream.cancel();
                };
            }
        });
    }

}

export class Arikedb {
    public client: arike_pb.ArikedbRPCClient | null;
    private host: string;
    private port: number;
    private username: string | undefined;
    private password: string | undefined;
    private use_ssl_tls: boolean | undefined;
    private ca_path: string | undefined;
    private cert_path: string | undefined;
    private key_path: string | undefined;
    public token: string | null | undefined;

    constructor(
        {
            host = 'localhost',
            port = 6923,
            username,
            password,
            use_ssl_tls,
            ca_path,
            cert_path,
            key_path,
        }: ConnectionOptions = {}
    ) {
        this.host = host;
        this.port = port;
        this.username = username;
        this.password = password;
        this.use_ssl_tls = use_ssl_tls;
        this.ca_path = ca_path;
        this.cert_path = cert_path;
        this.key_path = key_path;
        this.client = null;
        this.token = null;
    }

    public exec_request(
        method: Function,
        request_class: RequestClass,
        request_opts: any,
        add_meta: boolean,
        callback: Function
    ) {
        const request = new request_class(request_opts);
        let metadata = new grpc.Metadata();
        if (add_meta && this.token) {
            metadata.add("authorization", this.token);
        }
        const call: grpc.ClientUnaryCall = method(request, metadata, callback);
        call.on('metadata', (initialMetadata) => {
            const respMetadata = initialMetadata.getMap();
            if ('refresh_token' in respMetadata) {
              this.token = respMetadata['refresh_token'] as string;
            }
        });
    }

    public connect(): Promise<Arikedb> {
        return new Promise((resolve, reject) => {
            const credentials = this.use_ssl_tls
            ? grpc.credentials.createSsl(
                this.ca_path ? readFileSync(this.ca_path) : undefined,
                this.key_path ? readFileSync(this.key_path) : undefined,
                this.cert_path ? readFileSync(this.cert_path) : undefined
              )
            : grpc.credentials.createInsecure();

            this.client = new arike_pb.ArikedbRPCClient(`${this.host}:${this.port}`, credentials);

            if (this.username && this.password) {
                this.exec_request(
                    this.client.Authenticate,
                    auth_pb.AuthenticateRequest,
                    {
                        username: this.username,
                        password: this.password
                    },
                    true,
                    (error: grpc.ServiceError, response: auth_pb.AuthenticateResponse) => {
                        if (error) {
                            reject(error);
                        } else if (response.status == utils_pb.StatusCode.OK) {
                            this.token = response.token;
                            resolve(this);
                        } else {
                            reject(new Error(`Authentication failed: ${Status[response.status]}`));
                        }
                    }
                );
            } else {
                resolve(this);
            }
        });
    }

    public disconnect() {
        if (this.client) {
            this.client.close();
            this.client = null;
        }
    }

    public collections(
        pattern?: string
    ): Promise<Collection[]> {

        return new Promise((resolve, reject) => {
            if (!this.client) {
                reject(new Error("Not connected to the server."));
            } else {
                this.exec_request(
                    this.client.ListCollections,
                    collection_pb.ListCollectionsRequest,
                    {
                        pattern: pattern
                    },
                    true,
                    (error: grpc.ServiceError, response: collection_pb.ListCollectionsResponse) => {
                        if (error) {
                            reject(error);
                        }
                        if (response.status == utils_pb.StatusCode.OK) {
                            resolve(response.collections.map((c) => new Collection(c.name, this)));
                        } else {
                            reject(new Error(`Failed to list collections: ${Status[response.status]}`));
                        }
                    }
                );
            }
        });
    }

    public collection(
        name: string
    ): Promise<Collection> {

        return new Promise((resolve, reject) => {
            this.collections(name)
            .then((collections) => {
                if (collections.length > 0) {
                    resolve(collections[0]);
                } else {
                    reject(new Error(`Collection ${name} not found.`));
                }
            }).catch(err => {
                reject(err);
            });
        });
    }

    public createCollections(
        names: string[]
    ): Promise<MethodResult> {

        return new Promise((resolve, reject) => {
            if (!this.client) {
                reject(new Error("Not connected to the server."));
            } else {
                this.exec_request(
                    this.client.CreateCollections,
                    collection_pb.CreateCollectionsRequest,
                    {
                        collections: names.map((n) => new collection_pb.CollectionMeta({ name: n }))
                    },
                    true,
                    (error: grpc.ServiceError, response: collection_pb.CreateCollectionsResponse) => {
                        if (error) {
                            reject(error);
                        }
                        if (response.status == utils_pb.StatusCode.OK) {
                            resolve({
                                already_exists: response.already_exists,
                                license_exceeded: response.license_exceeded
                            });
                        } else {
                            reject(new Error(`Failed to create collections: ${Status[response.status]}`));
                        }
                    }
                );
            }
        });
    }

    public deleteCollections(
        names: string[]
    ): Promise<void> {

        return new Promise((resolve, reject) => {
            if (!this.client) {
                reject(new Error("Not connected to the server."));
            } else {
                this.exec_request(
                    this.client.DeleteCollections,
                    collection_pb.DeleteCollectionsRequest,
                    {
                        names: names
                    },
                    true,
                    (error: grpc.ServiceError, response: collection_pb.DeleteCollectionsResponse) => {
                        if (error) {
                            reject(error);
                        }
                        if (response.status == utils_pb.StatusCode.OK) {
                            resolve();
                        } else {
                            reject(new Error(`Failed to delete collections: ${Status[response.status]}`));
                        }
                    }
                );
            }
        });
    }

}
