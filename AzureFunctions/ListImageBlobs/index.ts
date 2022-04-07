import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { getContainerClient } from "../helper"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
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

async function listBlobs(context: Context): Promise<string[]> {
    const containerClient = await getContainerClient(context);
    let blobNames: string[] = []

    for await (const blob of containerClient.listBlobsFlat()) {
        blobNames.push(blob.name);
    }

    return blobNames;
}

export default httpTrigger;
