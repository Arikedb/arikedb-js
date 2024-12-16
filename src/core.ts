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

interface ArrayValue {
    name: string;
    int?: number[];
    float?: number[];
    string?: string[];
    bool?: boolean[];
}

interface ArrayGetOpt {
    name: string;
    n?: number;
}

class TsVariable {
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
    protected collection: Collection;

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

class Stack extends Array {

    public put(
        value: (number | string | boolean)[]
    ): Promise<MethodResult> {
        switch (this.vtype) {
            case ValueType.Int:
                return this.collection.stacksPut([{ name: this.name, int: value as number[] }]);
            case ValueType.Float:
                return this.collection.stacksPut([{ name: this.name, float: value as number[] }]);
            case ValueType.String:
                return this.collection.stacksPut([{ name: this.name, string: value as string[] }]);
            case ValueType.Bool:
                return this.collection.stacksPut([{ name: this.name, bool: value as boolean[] }]);
            default:
                throw new Error(`Invalid type: ${this.vtype} for stack ${this.name}`);
        }
    }

    public pop(
        n?: number
    ): Promise<ArrayValue[]> {
        switch (this.vtype as ValueType) {
            case ValueType.Int:
                return this.collection.stacksPop([{ name: this.name, n: n }]);
            case ValueType.Float:
                return this.collection.stacksPop([{ name: this.name, n: n }]);
            case ValueType.String:
                return this.collection.stacksPop([{ name: this.name, n: n }]);
            case ValueType.Bool:
                return this.collection.stacksPop([{ name: this.name, n: n }]);
            default:
                throw new Error(`Invalid type: ${this.vtype} for stack ${this.name}`);
        }
    }

}

class Fifo extends Array {

    public push(
        value: (number | string | boolean)[]
    ): Promise<MethodResult> {
        switch (this.vtype) {
            case ValueType.Int:
                return this.collection.fifosPush([{ name: this.name, int: value as number[] }]);
            case ValueType.Float:
                return this.collection.fifosPush([{ name: this.name, float: value as number[] }]);
            case ValueType.String:
                return this.collection.fifosPush([{ name: this.name, string: value as string[] }]);
            case ValueType.Bool:
                return this.collection.fifosPush([{ name: this.name, bool: value as boolean[] }]);
            default:
                throw new Error(`Invalid type: ${this.vtype} for fifo ${this.name}`);
        }
    }

    public pull(
        n?: number
    ): Promise<ArrayValue[]> {
        switch (this.vtype as ValueType) {
            case ValueType.Int:
                return this.collection.fifosPull([{ name: this.name, n: n }]);
            case ValueType.Float:
                return this.collection.fifosPull([{ name: this.name, n: n }]);
            case ValueType.String:
                return this.collection.fifosPull([{ name: this.name, n: n }]);
            case ValueType.Bool:
                return this.collection.fifosPull([{ name: this.name, n: n }]);
            default:
                throw new Error(`Invalid type: ${this.vtype} for stack ${this.name}`);
        }
    }

}

class SortedList extends Array {

    public insert(
        value: (number | string | boolean)[]
    ): Promise<MethodResult> {
        switch (this.vtype) {
            case ValueType.Int:
                return this.collection.sortedListsInsert([{ name: this.name, int: value as number[] }]);
            case ValueType.Float:
                return this.collection.fifosPush([{ name: this.name, float: value as number[] }]);
            case ValueType.String:
                return this.collection.fifosPush([{ name: this.name, string: value as string[] }]);
            case ValueType.Bool:
                return this.collection.fifosPush([{ name: this.name, bool: value as boolean[] }]);
            default:
                throw new Error(`Invalid type: ${this.vtype} for sorted list ${this.name}`);
        }
    }

    public biggest(
        n?: number
    ): Promise<ArrayValue[]> {
        switch (this.vtype as ValueType) {
            case ValueType.Int:
                return this.collection.sortedListsBiggest([{ name: this.name, n: n }]);
            case ValueType.Float:
                return this.collection.sortedListsBiggest([{ name: this.name, n: n }]);
            case ValueType.String:
                return this.collection.sortedListsBiggest([{ name: this.name, n: n }]);
            case ValueType.Bool:
                return this.collection.sortedListsBiggest([{ name: this.name, n: n }]);
            default:
                throw new Error(`Invalid type: ${this.vtype} for stack ${this.name}`);
        }
    }

    public smallest(
        n?: number
    ): Promise<ArrayValue[]> {
        switch (this.vtype as ValueType) {
            case ValueType.Int:
                return this.collection.sortedListsSmallest([{ name: this.name, n: n }]);
            case ValueType.Float:
                return this.collection.sortedListsSmallest([{ name: this.name, n: n }]);
            case ValueType.String:
                return this.collection.sortedListsSmallest([{ name: this.name, n: n }]);
            case ValueType.Bool:
                return this.collection.sortedListsSmallest([{ name: this.name, n: n }]);
            default:
                throw new Error(`Invalid type: ${this.vtype} for stack ${this.name}`);
        }
    }

}

class Collection {
    public name: string;
    private client: Arikedb;

    constructor(name: string, arikedb: Arikedb) {
        this.name = name;
        this.client = arikedb;
    }

    public tsVariables(
        pattern?: string
    ): Promise<TsVariable[]> {
        
        return new Promise((resolve, reject) => {
            if (this.client.client == null) {
                reject(new Error("Not connected to the server."));
            } else {
                this.client.exec_request(
                    this.client.client.ListVariables,
                    ts_var_pb.ListVariablesRequest,
                    {
                        collection: this.name,
                        pattern: pattern
                    },
                    true,
                    (error: grpc.ServiceError, response: ts_var_pb.ListVariablesResponse) => {
                        if (error) {
                            reject(error);
                        } else if (response.status == utils_pb.StatusCode.OK) {
                            resolve(response.variables.map((v) => new TsVariable(v.name, v.val_type as unknown as ValueType, this)));
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
            if (this.client.client == null) {
                reject(new Error("Not connected to the server."));
            } else {
                this.client.exec_request(
                    this.client.client.CreateVariables,
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
                        } else if (response.status == utils_pb.StatusCode.OK) {
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
        names: string[]
    ): Promise<MethodResult> {
        
        return new Promise((resolve, reject) => {
            if (this.client.client == null) {
                reject(new Error("Not connected to the server."));
            } else {
                this.client.exec_request(
                    this.client.client.DeleteVariables,
                    ts_var_pb.DeleteVariablesRequest,
                    {
                        collection: this.name,
                        names: names
                    },
                    true,
                    (error: grpc.ServiceError, response: ts_var_pb.DeleteVariablesResponse) => {
                        if (error) {
                            reject(error);
                        } else if (response.status == utils_pb.StatusCode.OK) {
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
            if (this.client.client == null) {
                reject(new Error("Not connected to the server."));
            } else {
                this.client.exec_request(
                    this.client.client.SetVariables,
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
                        } else if (response.status == utils_pb.StatusCode.OK) {
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
        names: string[]
    ): Promise<TsValue[]> {

        return new Promise((resolve, reject) => {
            if (this.client.client == null) {
                reject(new Error("Not connected to the server."));
            } else {
                this.client.exec_request(
                    this.client.client.GetVariables,
                    ts_var_pb.GetVariablesRequest,
                    {
                        collection: this.name,
                        names: names
                    },
                    true,
                    (error: grpc.ServiceError, response: ts_var_pb.GetVariablesResponse) => {
                        if (error) {
                            reject(error);
                        } else if (response.status == utils_pb.StatusCode.OK) {
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
            if (this.client.client == null) {
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
                if (this.client.token) {
                    metadata.add("authorization", this.client.token);
                }

                const stream = this.client.client.SubscribeVariables(request, metadata);

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

    public stacks(
        pattern?: string
    ): Promise<Stack[]> {

        return new Promise((resolve, reject) => {
            if (this.client.client == null) {
                reject(new Error("Not connected to the server."));
            } else {
                this.client.exec_request(
                    this.client.client.ListStacks,
                    stack_pb.ListStacksRequest,
                    {
                        collection: this.name,
                        pattern: pattern
                    },
                    true,
                    (error: grpc.ServiceError, response: stack_pb.ListStacksResponse) => {
                        if (error) {
                            reject(error);
                        } else if (response.status == utils_pb.StatusCode.OK) {
                            resolve(response.stacks.map((s) => new Stack(s.name, s.val_type as unknown as ValueType, this, s.max_size)));
                        } else {
                            reject(new Error(`Failed to list stacks: ${Status[response.status]}`));
                        }
                    }
                );
            }
        });
    }

    public stack(
        name: string
    ): Promise<Stack> {
        
        return new Promise((resolve, reject) => {
            this.stacks(name)
            .then((stack) => {
                if (stack.length > 0) {
                    resolve(stack[0]);
                } else {
                    reject(new Error(`Stack ${name} not found.`));
                }
            }).catch(err => {
                reject(err);
            });
        });
    }

    public createStacks(
        stacks: [string, ValueType, number?][]
    ): Promise<MethodResult> {

        return new Promise((resolve, reject) => {
            if (this.client.client == null) {
                reject(new Error("Not connected to the server."));
            } else {
                this.client.exec_request(
                    this.client.client.CreateStacks,
                    stack_pb.CreateStacksRequest,
                    {
                        collection: this.name,
                        stacks: stacks.map((s) => new stack_pb.StackMeta({
                            name: s[0],
                            val_type: s[1] as unknown as utils_pb.ValType,
                            max_size: s.length > 2 ? s[2] : undefined
                        }))
                    },
                    true,
                    (error: grpc.ServiceError, response: stack_pb.CreateStacksResponse) => {
                        if (error) {
                            reject(error);
                        } else if (response.status == utils_pb.StatusCode.OK) {
                            resolve({
                                already_exists: response.already_exists
                            });
                        } else {
                            reject(new Error(`Failed to create stacks: ${Status[response.status]}`));
                        }
                    }
                );
            }
        });
    }

    public deleteStacks(
        names: string[]
    ): Promise<MethodResult> {

        return new Promise((resolve, reject) => {
            if (this.client.client == null) {
                reject(new Error("Not connected to the server."));
            } else {
                this.client.exec_request(
                    this.client.client.DeleteStacks,
                    stack_pb.DeleteStacksRequest,
                    {
                        collection: this.name,
                        names: names
                    },
                    true,
                    (error: grpc.ServiceError, response: stack_pb.DeleteStacksResponse) => {
                        if (error) {
                            reject(error);
                        } else if (response.status == utils_pb.StatusCode.OK) {
                            resolve({
                                not_found: response.not_found
                            });
                        } else {
                            reject(new Error(`Failed to delete stacks: ${Status[response.status]}`));
                        }
                    }
                );
            }
        });
    }

    public stacksPut(
        values: ArrayValue[]
    ): Promise<MethodResult> {

        return new Promise((resolve, reject) => {
            if (this.client.client == null) {
                reject(new Error("Not connected to the server."));
            } else {
                this.client.exec_request(
                    this.client.client.PutStacks,
                    stack_pb.PutStacksRequest,
                    {
                        collection: this.name,
                        values: values.map((v) => new stack_pb.StackValue({
                            name: v.name,
                            int_value: v.int,
                            float_value: v.float,
                            str_value: v.string,
                            bool_value: v.bool
                        }))
                    },
                    true,
                    (error: grpc.ServiceError, response: stack_pb.PutStacksResponse) => {
                        if (error) {
                            reject(error);
                        } else if (response.status == utils_pb.StatusCode.OK) {
                            resolve({
                                not_found: response.not_found,
                                invalid_type: response.invalid_type
                            });
                        } else {
                            reject(new Error(`Failed to put stacks: ${Status[response.status]}`));
                        }
                    }
                );
            }
        });
    }

    public stacksPop(
        names: ArrayGetOpt[]
    ): Promise<ArrayValue[]> {

        return new Promise((resolve, reject) => {
            if (this.client.client == null) {
                reject(new Error("Not connected to the server."));
            } else {
                this.client.exec_request(
                    this.client.client.PopStacks,
                    stack_pb.PopStacksRequest,
                    {
                        collection: this.name,
                        names_counts: names.map((n) => new stack_pb.StackNamesCount({
                            name: n.name,
                            n: n.n ?? 1
                        }))
                    },
                    true,
                    (error: grpc.ServiceError, response: stack_pb.PopStacksResponse) => {
                        if (error) {
                            reject(error);
                        } else if (response.status == utils_pb.StatusCode.OK) {
                            resolve(response.values.map((v) => {
                                switch (v.val_type) {
                                    case utils_pb.ValType.INT:
                                        return { name: v.name, int: v.int_value }
                                    case utils_pb.ValType.FLOAT:
                                        return { name: v.name, float: v.float_value }
                                    case utils_pb.ValType.STRING:
                                        return { name: v.name, string: v.str_value }
                                    case utils_pb.ValType.BOOL:
                                        return { name: v.name, bool: v.bool_value }
                                }
                            }));
                        } else {
                            reject(new Error(`Failed to pop stacks: ${Status[response.status]}`));
                        }
                    }
                );
            }
        });
    }

    public fifos(
        pattern?: string
    ): Promise<Fifo[]> {

        return new Promise((resolve, reject) => {
            if (this.client.client == null) {
                reject(new Error("Not connected to the server."));
            } else {
                this.client.exec_request(
                    this.client.client.ListFifos,
                    fifo_pb.ListFifosRequest,
                    {
                        collection: this.name,
                        pattern: pattern
                    },
                    true,
                    (error: grpc.ServiceError, response: fifo_pb.ListFifosResponse) => {
                        if (error) {
                            reject(error);
                        } else if (response.status == utils_pb.StatusCode.OK) {
                            resolve(response.fifos.map((f) => new Fifo(f.name, f.val_type as unknown as ValueType, this, f.max_size)));
                        } else {
                            reject(new Error(`Failed to list fifos: ${Status[response.status]}`));
                        }
                    }
                );
            }
        });
    }

    public fifo(
        name: string
    ): Promise<Fifo> {
        
        return new Promise((resolve, reject) => {
            this.fifos(name)
            .then((fifo) => {
                if (fifo.length > 0) {
                    resolve(fifo[0]);
                } else {
                    reject(new Error(`Fifo ${name} not found.`));
                }
            }).catch(err => {
                reject(err);
            });
        });
    }

    public createFifos(
        fifos: [string, ValueType, number?][]
    ): Promise<MethodResult> {

        return new Promise((resolve, reject) => {
            if (this.client.client == null) {
                reject(new Error("Not connected to the server."));
            } else {
                this.client.exec_request(
                    this.client.client.CreateFifos,
                    stack_pb.CreateStacksRequest,
                    {
                        collection: this.name,
                        stacks: fifos.map((f) => new fifo_pb.FifoMeta({
                            name: f[0],
                            val_type: f[1] as unknown as utils_pb.ValType,
                            max_size: f.length > 2 ? f[2] : undefined
                        }))
                    },
                    true,
                    (error: grpc.ServiceError, response: fifo_pb.CreateFifosResponse) => {
                        if (error) {
                            reject(error);
                        } else if (response.status == utils_pb.StatusCode.OK) {
                            resolve({
                                already_exists: response.already_exists
                            });
                        } else {
                            reject(new Error(`Failed to create fifos: ${Status[response.status]}`));
                        }
                    }
                );
            }
        });
    }

    public deleteFifos(
        names: string[]
    ): Promise<MethodResult> {

        return new Promise((resolve, reject) => {
            if (this.client.client == null) {
                reject(new Error("Not connected to the server."));
            } else {
                this.client.exec_request(
                    this.client.client.DeleteFifos,
                    fifo_pb.DeleteFifosRequest,
                    {
                        collection: this.name,
                        names: names
                    },
                    true,
                    (error: grpc.ServiceError, response: fifo_pb.DeleteFifosResponse) => {
                        if (error) {
                            reject(error);
                        } else if (response.status == utils_pb.StatusCode.OK) {
                            resolve({
                                not_found: response.not_found
                            });
                        } else {
                            reject(new Error(`Failed to delete fifos: ${Status[response.status]}`));
                        }
                    }
                );
            }
        });
    }

    public fifosPush(
        values: ArrayValue[]
    ): Promise<MethodResult> {

        return new Promise((resolve, reject) => {
            if (this.client.client == null) {
                reject(new Error("Not connected to the server."));
            } else {
                this.client.exec_request(
                    this.client.client.PushFifos,
                    fifo_pb.PushFifosRequest,
                    {
                        collection: this.name,
                        values: values.map((v) => new fifo_pb.FifoValue({
                            name: v.name,
                            int_value: v.int,
                            float_value: v.float,
                            str_value: v.string,
                            bool_value: v.bool
                        }))
                    },
                    true,
                    (error: grpc.ServiceError, response: fifo_pb.PushFifosResponse) => {
                        if (error) {
                            reject(error);
                        } else if (response.status == utils_pb.StatusCode.OK) {
                            resolve({
                                not_found: response.not_found,
                                invalid_type: response.invalid_type
                            });
                        } else {
                            reject(new Error(`Failed to push fifos: ${Status[response.status]}`));
                        }
                    }
                );
            }
        });
    }

    public fifosPull(
        names: ArrayGetOpt[]
    ): Promise<ArrayValue[]> {

        return new Promise((resolve, reject) => {
            if (this.client.client == null) {
                reject(new Error("Not connected to the server."));
            } else {
                this.client.exec_request(
                    this.client.client.PullFifos,
                    fifo_pb.PullFifosRequest,
                    {
                        collection: this.name,
                        names_counts: names.map((n) => new fifo_pb.FifoNamesCount({
                            name: n.name,
                            n: n.n ?? 1
                        }))
                    },
                    true,
                    (error: grpc.ServiceError, response: fifo_pb.PullFifosResponse) => {
                        if (error) {
                            reject(error);
                        } else if (response.status == utils_pb.StatusCode.OK) {
                            resolve(response.values.map((v) => {
                                switch (v.val_type) {
                                    case utils_pb.ValType.INT:
                                        return { name: v.name, int: v.int_value }
                                    case utils_pb.ValType.FLOAT:
                                        return { name: v.name, float: v.float_value }
                                    case utils_pb.ValType.STRING:
                                        return { name: v.name, string: v.str_value }
                                    case utils_pb.ValType.BOOL:
                                        return { name: v.name, bool: v.bool_value }
                                }
                            }));
                        } else {
                            reject(new Error(`Failed to pull fifos: ${Status[response.status]}`));
                        }
                    }
                );
            }
        });
    }

    public sortedLists(
        pattern?: string
    ): Promise<SortedList[]> {

        return new Promise((resolve, reject) => {
            if (this.client.client == null) {
                reject(new Error("Not connected to the server."));
            } else {
                this.client.exec_request(
                    this.client.client.ListSortedLists,
                    sorted_list_pb.ListSortedListsRequest,
                    {
                        collection: this.name,
                        pattern: pattern
                    },
                    true,
                    (error: grpc.ServiceError, response: sorted_list_pb.ListSortedListsResponse) => {
                        if (error) {
                            reject(error);
                        } else if (response.status == utils_pb.StatusCode.OK) {
                            resolve(response.sorted_lists.map((sl) => new SortedList(sl.name, sl.val_type as unknown as ValueType, this, sl.max_size)));
                        } else {
                            reject(new Error(`Failed to list sorted lists: ${Status[response.status]}`));
                        }
                    }
                );
            }
        });
    }

    public sortedList(
        name: string
    ): Promise<SortedList> {
        
        return new Promise((resolve, reject) => {
            this.sortedLists(name)
            .then((sl) => {
                if (sl.length > 0) {
                    resolve(sl[0]);
                } else {
                    reject(new Error(`Sorted List ${name} not found.`));
                }
            }).catch(err => {
                reject(err);
            });
        });
    }

    public createSortedLists(
        sorted_lists: [string, ValueType, number?][]
    ): Promise<MethodResult> {

        return new Promise((resolve, reject) => {
            if (this.client.client == null) {
                reject(new Error("Not connected to the server."));
            } else {
                this.client.exec_request(
                    this.client.client.CreateSortedLists,
                    sorted_list_pb.CreateSortedListsRequest,
                    {
                        collection: this.name,
                        sorted_lists: sorted_lists.map((sl) => new sorted_list_pb.SortedListMeta({
                            name: sl[0],
                            val_type: sl[1] as unknown as utils_pb.ValType,
                            max_size: sl.length > 2 ? sl[2] : undefined
                        }))
                    },
                    true,
                    (error: grpc.ServiceError, response: sorted_list_pb.CreateSortedListsResponse) => {
                        if (error) {
                            reject(error);
                        } else if (response.status == utils_pb.StatusCode.OK) {
                            resolve({
                                already_exists: response.already_exists
                            });
                        } else {
                            reject(new Error(`Failed to create sorted lists: ${Status[response.status]}`));
                        }
                    }
                );
            }
        });
    }

    public deleteSortedLists(
        names: string[]
    ): Promise<MethodResult> {

        return new Promise((resolve, reject) => {
            if (this.client.client == null) {
                reject(new Error("Not connected to the server."));
            } else {
                this.client.exec_request(
                    this.client.client.DeleteSortedLists,
                    sorted_list_pb.DeleteSortedListsRequest,
                    {
                        collection: this.name,
                        names: names
                    },
                    true,
                    (error: grpc.ServiceError, response: sorted_list_pb.DeleteSortedListsResponse) => {
                        if (error) {
                            reject(error);
                        } else if (response.status == utils_pb.StatusCode.OK) {
                            resolve({
                                not_found: response.not_found
                            });
                        } else {
                            reject(new Error(`Failed to delete sorted lists: ${Status[response.status]}`));
                        }
                    }
                );
            }
        });
    }

    public sortedListsInsert(
        values: ArrayValue[]
    ): Promise<MethodResult> {

        return new Promise((resolve, reject) => {
            if (this.client.client == null) {
                reject(new Error("Not connected to the server."));
            } else {
                this.client.exec_request(
                    this.client.client.InsertSortedLists,
                    sorted_list_pb.InsertSortedListsRequest,
                    {
                        collection: this.name,
                        values: values.map((v) => new sorted_list_pb.SortedListValue({
                            name: v.name,
                            int_value: v.int,
                            float_value: v.float,
                            str_value: v.string,
                            bool_value: v.bool
                        }))
                    },
                    true,
                    (error: grpc.ServiceError, response: sorted_list_pb.InsertSortedListsResponse) => {
                        if (error) {
                            reject(error);
                        } else if (response.status == utils_pb.StatusCode.OK) {
                            resolve({
                                not_found: response.not_found,
                                invalid_type: response.invalid_type
                            });
                        } else {
                            reject(new Error(`Failed to insert sorted lists: ${Status[response.status]}`));
                        }
                    }
                );
            }
        });
    }

    public sortedListsBiggest(
        names: ArrayGetOpt[]
    ): Promise<ArrayValue[]> {

        return new Promise((resolve, reject) => {
            if (this.client.client == null) {
                reject(new Error("Not connected to the server."));
            } else {
                this.client.exec_request(
                    this.client.client.BiggestSortedLists,
                    sorted_list_pb.BiggestSortedListsRequest,
                    {
                        collection: this.name,
                        names_counts: names.map((n) => new sorted_list_pb.SortedListNamesCount({
                            name: n.name,
                            n: n.n ?? 1
                        }))
                    },
                    true,
                    (error: grpc.ServiceError, response: sorted_list_pb.BiggestSortedListsResponse) => {
                        if (error) {
                            reject(error);
                        } else if (response.status == utils_pb.StatusCode.OK) {
                            resolve(response.values.map((v) => {
                                switch (v.val_type) {
                                    case utils_pb.ValType.INT:
                                        return { name: v.name, int: v.int_value }
                                    case utils_pb.ValType.FLOAT:
                                        return { name: v.name, float: v.float_value }
                                    case utils_pb.ValType.STRING:
                                        return { name: v.name, string: v.str_value }
                                    case utils_pb.ValType.BOOL:
                                        return { name: v.name, bool: v.bool_value }
                                }
                            }));
                        } else {
                            reject(new Error(`Failed to get biggest from sorted lists: ${Status[response.status]}`));
                        }
                    }
                );
            }
        });
    }

    public sortedListsSmallest(
        names: ArrayGetOpt[]
    ): Promise<ArrayValue[]> {

        return new Promise((resolve, reject) => {
            if (this.client.client == null) {
                reject(new Error("Not connected to the server."));
            } else {
                this.client.exec_request(
                    this.client.client.SmallestSortedLists,
                    sorted_list_pb.SmallestSortedListsRequest,
                    {
                        collection: this.name,
                        names_counts: names.map((n) => new sorted_list_pb.SortedListNamesCount({
                            name: n.name,
                            n: n.n ?? 1
                        }))
                    },
                    true,
                    (error: grpc.ServiceError, response: sorted_list_pb.SmallestSortedListsResponse) => {
                        if (error) {
                            reject(error);
                        } else if (response.status == utils_pb.StatusCode.OK) {
                            resolve(response.values.map((v) => {
                                switch (v.val_type) {
                                    case utils_pb.ValType.INT:
                                        return { name: v.name, int: v.int_value }
                                    case utils_pb.ValType.FLOAT:
                                        return { name: v.name, float: v.float_value }
                                    case utils_pb.ValType.STRING:
                                        return { name: v.name, string: v.str_value }
                                    case utils_pb.ValType.BOOL:
                                        return { name: v.name, bool: v.bool_value }
                                }
                            }));
                        } else {
                            reject(new Error(`Failed to get smallest from sorted lists: ${Status[response.status]}`));
                        }
                    }
                );
            }
        });
    }

}

class Arikedb {
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

    public disconnect(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.client) {
                reject(new Error("Not connected to the server."));
            } else {
                this.client.close();
                this.client = null;
                resolve();
            }
        });
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
                        } else if (response.status == utils_pb.StatusCode.OK) {
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
                        } else if (response.status == utils_pb.StatusCode.OK) {
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
                        } else if (response.status == utils_pb.StatusCode.OK) {
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

export {
    ValueType,
    VarEvent,
    Event,
    TsValue,
    ConnectionOptions,
    MethodResult,
    ArrayValue,
    TsVariable,
    Stack,
    Fifo,
    SortedList,
    Collection,
    Arikedb,
};
