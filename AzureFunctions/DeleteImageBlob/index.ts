import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { HttpRequestBody } from "@azure/storage-blob";
import { getImageBlobClient } from "../helper";
import { strict as assert } from 'assert';

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

export default httpTrigger;
