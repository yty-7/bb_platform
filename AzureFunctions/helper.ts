import { Context, HttpRequest } from "@azure/functions"
import { ContainerClient, StorageSharedKeyCredential, HttpRequestBody, BlockBlobClient } from "@azure/storage-blob";

// Load the .env file if it exists
import * as dotenv from "dotenv";
dotenv.config();

/** Uploads `imageBody` to blob store, returning true if it uploaded succesfully. */
export async function uploadToBlobStore(context: Context, rawBody: string): Promise<boolean> {
    const blobName = "image" + new Date().getTime();
    const optBlobClient = await createImageBlobClient(context, blobName).catch(_ => null);
    if (optBlobClient == null) {
        return false;
    }
    const blobClient = optBlobClient!;

    try {
        let response = await blobClient.upload(rawBody, Buffer.byteLength(rawBody));
        return response.errorCode == null
    } catch(error) {
        context.log("(PhotoBlob) Error when uploading: " + error);
        return false;
    }
}

/**
 * Creates and returns a container client for the "images" container.
 * If the contianer does not yet exist, creates it.
 * */
export async function createContainerClient(context: Context): Promise<ContainerClient> {
    const account = process.env.ACCOUNT_NAME || "";
    const accountKey = process.env.ACCOUNT_KEY || "";
    const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);

    const containerName = "images"

    context.log("(createContainerClient) Creating container client with account: " + account);
    context.log("(createContainerClient) Using container name: " + containerName);

    const containerClient = new ContainerClient(
        `https://${account}.blob.core.windows.net/${containerName}`,
        sharedKeyCredential
    );

    // Create if it doesn't yet exist
    let containerExists = await containerClient.exists().catch(_ => false);
    if (!containerExists) {
        context.log(`(createContainerClient) Creating the ${containerName} container...`);
        try {
            let response = await containerClient.create();
            if (response.errorCode != null) {
                context.log(`(createContainerClient) Failed to create contianer with error code ${response.errorCode}`);
            } else {
                context.log(`(createContainerClient) Created container ${containerName}!`);
            }
        } catch (error) {
            context.log(`(createContainerClient) Failed to create container ${containerName}: ` + error);
        }
    }

    return containerClient;
}

/** Returns a client for `blobName` in the "images" container */
export async function createImageBlobClient(context: Context, blobName: string): Promise<BlockBlobClient | null> {
    const containerClient = await createContainerClient(context);
    return containerClient.getBlockBlobClient(blobName)
}
