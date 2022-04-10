import { Context, HttpRequest } from "@azure/functions"
import { clearBlobs, ClearBlobsResponse } from "../blobstoreHelper"

export async function httpTrigger(context: Context, _: HttpRequest): Promise<void> {
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
