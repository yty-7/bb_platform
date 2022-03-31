import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { ContainerClient, StorageSharedKeyCredential, HttpRequestBody, BlockBlobClient } from "@azure/storage-blob";

// https://github.com/Azure/azure-sdk-for-js/blob/main/sdk/storage/storage-blob/samples/v12/typescript/src/listBlobsFlat.ts

// Load the .env file if it exists
import * as dotenv from "dotenv";
dotenv.config();

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request (UploadImageBlob).');

    if (req.body == null) {
        context.res = {
            status: 400,
            body: "No image was provided in body of request."
        };
        return;
    } else if (!isValidImageFile(req.body)) {
        context.res = {
            status: 400,
            body: "Failed to parse image data from request body."
        };
        return;
    } else {
        const result = uploadToBlobStore(context, req.rawBody);
        if (result) {
            context.res = {
                status: 200,
                body: "Successfully uploaded image data"
            };
            return;
        } else {
            context.res = {
                status: 500,
                body: "Unable to store image data"
            };
            return;
        }
    }
};

/** (TODO) Returns `true` if `body` can be decoded into a valid png file. */
function isValidImageFile(body: HttpRequestBody): boolean {
    // TODO how to determine this?
    return true;
}

/** Uploads `imageBody` to blob store, returning true if it uploaded succesfully. */
async function uploadToBlobStore(context: Context, rawBody: string): Promise<boolean> {
    const blobName = "image" + new Date().getTime();
    const optBlobClient = await createImageBlobClient(context, blobName);
    if (optBlobClient == null) {
        return false;
    }
    const blobClient = optBlobClient!;

    let response = await blobClient.upload(rawBody, Buffer.byteLength(rawBody));
    return response.errorCode !== undefined
}

async function createImageBlobClient(context: Context, blobName: string): Promise<BlockBlobClient | null> {
    const account = process.env.ACCOUNT_NAME || "";
    const accountKey = process.env.ACCOUNT_KEY || "";
    const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);

    const containerName = "images"
    const containerClient = new ContainerClient(
        `https://${account}.blob.core.windows.net/${containerName}`,
        sharedKeyCredential
    );
    const createContainerResponse = await containerClient.create();

    if (createContainerResponse.errorCode !== undefined) {
        context.log("CreateContainerResponse errorcode was not undefined!");
        return null;
    }

    return containerClient.getBlockBlobClient(blobName)
}



export default httpTrigger;
