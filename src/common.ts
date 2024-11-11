import { arike_pb as utils_pb } from "./arike_utils";

export enum ValueType {
    Int = 0,
    Float = 1,
    String = 2,
    Bool = 3
}

export enum Event {
    OnSet = 0,
    OnChange = 1,
    OnKeep = 2,
    OnRise = 3,
    OnFall = 4,
    OnValueReachVal = 5,
    OnValueEqVal = 6,
    OnValueLeaveVal = 7,
    OnValueDiffVal = 8,
    OnCrossHighLimit = 9,
    OnCrossLowLimit = 10,
    OnOverHighLimit = 11,
    OnUnderLowLimit = 12,
    OnValueReachRange = 13,
    OnValueInRange = 14,
    OnValueLeaveRange = 15,
    OnValueOutRange = 16,
}

export enum Status {
    Ok = 0,
    LicenseExpired = 1,
    LicenseLimitsExceeded = 2,
    SessionExpired = 3,
    InternalError = 4,
    Unauthorized = 5,
    Unauthenticated = 6,
    CollectionNotFound = 7,
    VariableNotFound = 8,
    InvalidRequest = 9,
    TypeError = 10,
    Unknown = 11,
}

export class VarEvent {
    public event: Event;
    public str_value?: string;
    public str_low_limit?: string;
    public str_high_limit?: string;
    public int_value?: number;
    public int_low_limit?: number;
    public int_high_limit?: number;
    public float_value?: number;
    public float_low_limit?: number;
    public float_high_limit?: number;
    public bool_value?: boolean;
    public bool_low_limit?: boolean;
    public bool_high_limit?: boolean;

    constructor(
        event: Event,
        value?: number | string | boolean,
        low_limit?: number | string | boolean,
        high_limit?: number | string | boolean,
        type?: ValueType
    ) {
        this.event = event;

        this.str_value = type === ValueType.String ? value as string : undefined;
        this.str_low_limit = type === ValueType.String ? low_limit as string : undefined;
        this.str_high_limit = type === ValueType.String ? high_limit as string : undefined;

        this.int_value = type === ValueType.Int ? value as number : undefined;
        this.int_low_limit = type === ValueType.Int ? low_limit as number : undefined;
        this.int_high_limit = type === ValueType.Int ? high_limit as number : undefined;

        this.float_value = type === ValueType.Float ? value as number : undefined;
        this.float_low_limit = type === ValueType.Float ? low_limit as number : undefined;
        this.float_high_limit = type === ValueType.Float ? high_limit as number : undefined;

        this.bool_value = type === ValueType.Bool ? value as boolean : undefined;
        this.bool_low_limit = type === ValueType.Bool ? low_limit as boolean : undefined;
        this.bool_high_limit = type === ValueType.Bool ? high_limit as boolean : undefined;
    }
}
