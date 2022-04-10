import { Context, HttpRequest } from "@azure/functions"
import { ContainerClient, StorageSharedKeyCredential, HttpRequestBody, BlockBlobClient } from "@azure/storage-blob";
import { strict as assert } from 'assert';

/**
 * Helper module for interacting with Azure blob stores
 */

// Load the .env file if it exists
// Has the information for connecting to the azure storage container
import * as dotenv from "dotenv";
dotenv.config();

//
// ===== Exported Variables ====================
//
export const IMAGE_CONTAINER = "images";

//
// ===== Response Objects ====================
//

export class ClearBlobsResponse {
    clearedAllBlobs: boolean;
    unclearedBlobs: string[] | null;

    constructor(clearedAllBlobs: boolean, unclearedBlobs: string[] | null) {
        this.clearedAllBlobs = clearedAllBlobs;
        this.unclearedBlobs = unclearedBlobs;
        // If it cleared all blobs, shouldn't list any names in `unclearedBlobs`
        if (clearedAllBlobs) {
            assert((this.unclearedBlobs?.length ?? 0) == 0);
        }
    }
}

export class DeleteBlobResult {
    /**  Whether the blob was deleted*/
    blobDeleted: boolean;
    /**
     * True if the blob *definitely* did not exist when trying to be deleted. False
     * if unsure on its existence or not.
     * */
    blobDidNotExist: boolean;

    constructor(blobDeleted: boolean, blobDidNotExist: boolean) {
        this.blobDeleted = blobDeleted;
        this.blobDidNotExist = blobDidNotExist;
        // if blob was deleted, it must of had existed
        assert(!blobDeleted || (blobDeleted && !blobDidNotExist))
    }
}

//
// ===== Exported Functions =========================
//

/**
 * Uploads `imageBody` to blob store, returning the name of the blob if it uploaded succesfully or
 * null if it failed. */
export async function uploadToBlobStore(context: Context, rawBody: string): Promise<string | null> {
    const blobName = "image" + new Date().getTime();
    const optBlobClient = await getImageBlobClient(context, blobName).catch(_ => null);
    if (optBlobClient == null) {
        return null;
    }
    const blobClient = optBlobClient!;

    try {
        let response = await blobClient.upload(rawBody, Buffer.byteLength(rawBody));
        if (response.errorCode == null) {
            context.log(`(UploadPhotoBlob) Succesfully uploaded blob: ${blobName}`);
            return blobName;
        } else {
            context.log(`(UploadPhotoBlob) Failed to upload blob "${blobName}" with error code ${response.errorCode}`);
            return null;
        }
    } catch(error) {
        context.log("(UploadPhotoBlob) Error when uploading: " + error);
        return null;
    }
}

export async function listBlobs(context: Context): Promise<string[]> {
    const containerClient = await getContainerClient(context);
    let blobNames: string[] = []

    for await (const blob of containerClient.listBlobsFlat()) {
        blobNames.push(blob.name);
    }

    return blobNames;
}

/** Clears the image container of all blobs.
 * Returns a array of blobs that were unable to be deleted.
 * (If the return array is empty, succesfully cleared the container of all blobs)
 */
export async function clearBlobs(context: Context): Promise<ClearBlobsResponse> {
    context.log("(ClearBlobs) Deleting all image blobs in the container");

    // let deleteReqs: [string, Promise<DeleteBlobResult>][];
    let deletePromises: Promise<[string, DeleteBlobResult]>[] = [];
    for (const blobName of await listBlobs(context)) {
        const req: Promise<[string, DeleteBlobResult]> = deleteBlob(context, blobName).then(
            result => { return [blobName, result]; },
            error => {
                context.log(`(ClearBlobs) Error when calling deleteBlob on ${blobName}: ${error}`);
                return [blobName, new DeleteBlobResult(false, false)];
            }
        );
        deletePromises.push(req);
    }

    let failedDeletions: string[] = []
    for await (const nameAndResult of deletePromises) {
        const name = nameAndResult[0];
        const result = nameAndResult[1];
        if (!result.blobDeleted) {
            failedDeletions.push(name);
        }
    }

    if (failedDeletions.length == 0) {
        context.log("(ClearBlobs) Finished deleting all blobs");
    } else {
        context.log(`(ClearBlobs) Failed to delete some blobs: ${failedDeletions}`);
    }

    return new ClearBlobsResponse(failedDeletions.length == 0, failedDeletions);
}

export async function deleteBlob(context: Context, name: string): Promise<DeleteBlobResult> {
    const optImageBlobClient = await getImageBlobClient(context, name);
    if (optImageBlobClient == null) {
        context.log("Failed to get blob client for ${name}.");
        return new DeleteBlobResult(false, false);
    }
    const blobClient = optImageBlobClient!;
    const response = await blobClient.deleteIfExists();

    if (response.succeeded) {
        context.log(`(deleteImageBlob) Succesfully deleted blob ${name}`);
        return new DeleteBlobResult(true, false);
    } else {
        context.log(`(deleteImageBlob) Failed to delete blob ${name}; it never existed`);
        return new DeleteBlobResult(false, true);
    }
}

//
// ===== Private Functions =========================
//

/** Returns a client for `blobName` in the IMAGE_CONTAINER container */
async function getImageBlobClient(context: Context, blobName: string): Promise<BlockBlobClient | null> {
    const containerClient = await getContainerClient(context);
    return containerClient.getBlockBlobClient(blobName)
}

/**
 * Creates and returns a container client for the IMAGE_CONTAINER container.
 * If the contianer does not yet exist, creates it.
 * */
async function getContainerClient(context: Context): Promise<ContainerClient> {
    const account = process.env.ACCOUNT_NAME || "";
    const accountKey = process.env.ACCOUNT_KEY || "";
    const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);

    const containerName = IMAGE_CONTAINER;

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
