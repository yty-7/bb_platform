/**
 * Helper module for returning json responses and proper error codes
 */

export enum ErrorCode {
    OK = 200,
    BAD_REQUEST = 400,
    INTERNAL_SERVER_ERROR = 500,
    NOT_IMPLEMENTED = 501,
}

class ResultResponse {
    message: string;
    constructor(message: string) {
        this.message = message;
    }
}

class BlobResponse {
    message: string;
    blobName: string;
    constructor(message: string, blobName: string) {
        this.message = message;
        this.blobName = blobName;
    }
}

class BlobsResponse {
    message: string;
    blobNames: string[];
    constructor(message: string, blobNames: string[]) {
        this.message = message;
        this.blobNames = blobNames;
    }
}

//
// ===== Exported Functions ===============
//
export function responseWithMessage(message: string, reason: ErrorCode): { [key: string]: any } {
    const response = new ResultResponse(message);
    return httpResponseObject(reason, JSON.stringify(response));
}

export function responseWithMessageAndBlobName(message: string, blobName: string, reason: ErrorCode): { [key: string]: any } {
    const response = new BlobResponse(message, blobName);
    return httpResponseObject(reason, JSON.stringify(response));
}

export function responseWithMessageAndBlobNames(message: string,
                                               blobNames: string[],
                                               reason: ErrorCode): { [key: string]: any } {
    const response = new BlobsResponse(message, blobNames);
    return httpResponseObject(reason, JSON.stringify(response));
}

//
// ===== Private Functions ===============
//
function httpResponseObject(errorCode: number, jsonResponse: string): { [key: string]: any } {
    return {
        status: errorCode,
        body: jsonResponse
    };
}
