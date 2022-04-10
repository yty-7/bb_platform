import { Context, HttpRequest } from "@azure/functions"
import { deleteBlob } from "../blobstoreHelper";

export async function httpTrigger(context: Context, req: HttpRequest): Promise<void> {
    context.log("(deleteImageBlob) HTTP trigger function processed a request.");
    const blobName = (req.body as string).trim();

    if (blobName.length == 0) {
        context.res = {
            status: 501,
            body: `Blob name must be non-empty`
        };
        return;
    }

    const result = await deleteBlob(context, blobName);

    if (result.blobDeleted) {
        context.res = {
            status: 200,
            body: `Succesfully deleted blob: "${blobName}"`
        };
    } else {
        if (result.blobDidNotExist) {
        context.res = {
            status: 501,
            body: `Failed to delete blob: "${blobName}" as it did not exist`
        };
        } else {
        context.res = {
            status: 500,
            body: `Failed to delete blob: "${blobName}"`
        };
        }
    }
};

export default httpTrigger;
