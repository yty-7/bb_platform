import { Context, HttpRequest } from "@azure/functions"
import { ContainerClient, StorageSharedKeyCredential, HttpRequestBody, BlockBlobClient } from "@azure/storage-blob";

// Load the .env file if it exists
import * as dotenv from "dotenv";
dotenv.config();

/**
 * Creates and returns a container client for the "images" container.
 * If the contianer does not yet exist, creates it.
 * */
export async function getContainerClient(context: Context): Promise<ContainerClient> {
    const account = process.env.ACCOUNT_NAME || "";
    const accountKey = process.env.ACCOUNT_KEY || "";
    const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);

    const containerName = "images"

    context.log("(getContainerClient) Creating container client with account: " + account);
    context.log("(getContainerClient) Using container name: " + containerName);

    const containerClient = new ContainerClient(
        `https://${account}.blob.core.windows.net/${containerName}`,
        sharedKeyCredential
    );

    // Create if it doesn't yet exist
    let containerExists = await containerClient.exists().catch(_ => false);
    if (!containerExists) {
        context.log(`(getContainerClient) Creating the ${containerName} container...`);
        try {
            let response = await containerClient.create();
            if (response.errorCode != null) {
                context.log(`(getContainerClient) Failed to create contianer with error code ${response.errorCode}`);
            } else {
                context.log(`(getContainerClient) Created container ${containerName}!`);
            }
        } catch (error) {
            context.log(`(getContainerClient) Failed to create container ${containerName}: ` + error);
        }
    }

    return containerClient;
}

/** Returns a client for `blobName` in the "images" container */
export async function getImageBlobClient(context: Context, blobName: string): Promise<BlockBlobClient | null> {
    const containerClient = await getContainerClient(context);
    return containerClient.getBlockBlobClient(blobName)
}
