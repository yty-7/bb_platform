import { Context, HttpRequest } from "@azure/functions"
import { listBlobs } from "../blobstoreHelper"

export async function httpTrigger(context: Context, _: HttpRequest): Promise<void> {
    context.log('(ListImageBlobs) HTTP trigger function processed a request.');

    const optBlobs = await listBlobs(context).catch(error => {
        context.log("(ListImageBlobs) encountered error: " + error);
        return null;
    });

    if (optBlobs == null) {
        context.res = {
            status: 500,
            body: "Failed to list blobs"
        };
    } else {
        const blobs = optBlobs!;
        context.res = {
            status: 200,
            body: "blobs: " + blobs
        };
    }
};
