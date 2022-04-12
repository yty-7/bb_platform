import { Context, HttpRequest } from "@azure/functions"
import { deleteBlob } from "../blobstoreHelper";
import { ErrorCode, responseWithMessage } from "../jsonHelper";

export async function httpTrigger(context: Context, req: HttpRequest): Promise<void> {
    context.log("(deleteImageBlob) HTTP trigger function processed a request.");
    const blobName = (req.body as string).trim();

    if (blobName.length == 0) {
        context.res = responseWithMessage("Blob name must be non-empty", ErrorCode.BAD_REQUEST);
        return;
    }

    const result = await deleteBlob(context, blobName);

    if (result.blobDeleted) {
        context.res = responseWithMessage(`Succesfully deleted blob: "${blobName}"`, ErrorCode.OK);
    } else {
        if (result.blobDidNotExist) {
            context.res = responseWithMessage(`Failed to delete blob: "${blobName}" as it did not exist`, ErrorCode.BAD_REQUEST);
        } else {
            context.res = responseWithMessage(`Failed to delete blob: "${blobName}"`, ErrorCode.BAD_REQUEST);
        }
    }
};

export default httpTrigger;
