import { Context, HttpRequest } from "@azure/functions"
import { clearBlobs, ClearBlobsResponse } from "../blobstoreHelper"
import { responseWithMessage, ErrorCode, responseWithMessageAndBlobNames } from "../jsonHelper";

export async function httpTrigger(context: Context, _: HttpRequest): Promise<void> {
    context.log('(ClearImageBlobs) HTTP trigger function processed a request.');

    const result = await clearBlobs(context).catch(error => {
        context.log("(ClearImageBlobs) encountered error: " + error);
        return new ClearBlobsResponse(false, null);
    });

    if (result.clearedAllBlobs) {
        context.res = responseWithMessage( "Succesfully cleared blobs", ErrorCode.OK);
    } else {
        if (result.unclearedBlobs) {
            const unclearedBlobs = result.unclearedBlobs!;
            context.res = responseWithMessageAndBlobNames(`Failed to clear blobs: ${result.unclearedBlobs}`,
                                                          unclearedBlobs,
                                                          ErrorCode.INTERNAL_SERVER_ERROR);
        } else {
            context.res = responseWithMessage("Failed to clear blobs", ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }
};
