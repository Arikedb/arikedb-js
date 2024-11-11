/**
 * Generated by the protoc-gen-ts.  DO NOT EDIT!
 * compiler version: 3.21.12
 * source: arike_utils.proto
 * git: https://github.com/thesayyn/protoc-gen-ts */
import * as pb_1 from "google-protobuf";
export namespace arike_pb {
    export enum StatusCode {
        OK = 0,
        LICENSE_EXPIRED = 1,
        LICENSE_LIMITS_EXCEEDED = 2,
        SESSION_EXPIRED = 3,
        INTERNAL_ERROR = 4,
        UNAUTHORIZED = 5,
        UNAUTHENTICATED = 6,
        COLLECTION_NOT_FOUND = 7,
        VARIABLE_NOT_FOUND = 8,
        INVALID_REQUEST = 9,
        TYPE_ERROR = 10,
        UNKNOWN = 11
    }
    export enum Event {
        ON_SET = 0,
        ON_CHANGE = 1,
        ON_KEEP = 2,
        ON_RISE = 3,
        ON_FALL = 4,
        ON_REACH_VAL = 5,
        ON_EQ_VAL = 6,
        ON_LEAVE_VAL = 7,
        ON_DIFF_VAL = 8,
        ON_CROSS_HIGH_LIMIT = 9,
        ON_CROSS_LOW_LIMIT = 10,
        ON_OVER_HIGH_LIMIT = 11,
        ON_UNDER_LOW_LIMIT = 12,
        ON_REACH_RANGE = 13,
        ON_IN_RANGE = 14,
        ON_LEAVE_RANGE = 15,
        ON_OUT_RANGE = 16
    }
    export enum ValType {
        INT = 0,
        FLOAT = 1,
        STRING = 2,
        BOOL = 3
    }
}