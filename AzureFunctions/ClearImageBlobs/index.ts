import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { getContainerClient } from "../helper"
import { listBlobs } from "../ListImageBlobs/index"
import { deleteBlob, DeleteBlobResult } from "../DeleteImageBlob/index"
import { strict as assert } from 'assert';

class ClearBlobsResponse {
    clearedAllBlobs: boolean;
    unclearedBlobs: string[] | null;

    constructor(clearedAllBlobs: boolean, unclearedBlobs: string[] | null) {
        this.clearedAllBlobs = clearedAllBlobs;
        this.unclearedBlobs = unclearedBlobs;
        // If it cleared all blobs, shouldn't list any names in `unclearedBlobs`
        if (clearedAllBlobs) {
            assert((this.unclearedBlobs?.length ?? 0) == 0);
        }
    }
}

export async function httpTrigger(context: Context, req: HttpRequest): Promise<void> {
    context.log('(ClearImageBlobs) HTTP trigger function processed a request.');

    const result = await clearBlobs(context).catch(error => {
        context.log("(ClearImageBlobs) encountered error: " + error);
        context.res = {
            status: 500,
            body: "Failed to clear blobs"
        };
        return new ClearBlobsResponse(false, null);
    });

    if (result.clearedAllBlobs) {
        context.res = {
            status: 200,
            body: "Succesfully cleared blobs"
        };
    } else {
        context.res = {
            status: 500,
            body: result.unclearedBlobs ? "Failed to clear blobs" : `Failed to clear blobs: ${result.unclearedBlobs}`
        };
    }
};

/** Clears the image container of all blobs.
 * Returns a array of blobs that were unable to be deleted.
 * (If the return array is empty, succesfully cleared the container of all blobs)
 */
async function clearBlobs(context: Context): Promise<ClearBlobsResponse> {
    context.log("(ClearBlobs) Deleting all image blobs in the container");

    // let deleteReqs: [string, Promise<DeleteBlobResult>][];
    let deletePromises: Promise<[string, DeleteBlobResult]>[] = [];
    for (const blobName of await listBlobs(context)) {
        const req: Promise<[string, DeleteBlobResult]> = deleteBlob(context, blobName).then(
            result => { return [blobName, result]; },
            error => {
                context.log(`(ClearBlobs) Error when calling deleteBlob on ${blobName}: ${error}`);
                return [blobName, new DeleteBlobResult(false, false)];
            }
        );
        deletePromises.push(req);
    }

    let failedDeletions: string[] = []
    for await (const nameAndResult of deletePromises) {
        const name = nameAndResult[0];
        const result = nameAndResult[1];
        if (!result.blobDeleted) {
            failedDeletions.push(name);
        }
    }

    if (failedDeletions.length == 0) {
        context.log("(ClearBlobs) Finished deleting all blobs");
    } else {
        context.log(`(ClearBlobs) Failed to delete some blobs: ${failedDeletions}`);
    }

    return new ClearBlobsResponse(failedDeletions.length == 0, failedDeletions);
}
