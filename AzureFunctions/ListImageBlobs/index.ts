import { Context, HttpRequest } from "@azure/functions"
import { listBlobs } from "../blobstoreHelper"
import { responseWithMessage, responseWithMessageAndBlobName, ErrorCode, responseWithMessageAndBlobNames } from "../jsonHelper"

export async function httpTrigger(context: Context, _: HttpRequest): Promise<void> {
    context.log('(ListImageBlobs) HTTP trigger function processed a request.');

    const optBlobs = await listBlobs(context).catch(error => {
        context.log("(ListImageBlobs) encountered error: " + error);
        return null;
    });

    if (optBlobs == null) {
        context.res = responseWithMessage("Failed to list blobs", ErrorCode.INTERNAL_SERVER_ERROR);
    } else {
        const blobs = optBlobs!;
        context.res = responseWithMessageAndBlobNames("success", blobs, ErrorCode.OK);
    }
};
