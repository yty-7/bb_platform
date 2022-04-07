import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { HttpRequestBody } from "@azure/storage-blob";
import { getContainerClient, getImageBlobClient } from "../helper";

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
         const result = await uploadToBlobStore(context, req.rawBody).catch(_ => false);
         if (result != null) {
             context.res = {
                 status: 200,
                 body: `Successfully uploaded image data with name ${result}`
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

/**
 * Uploads `imageBody` to blob store, returning the name of the blob if it uploaded succesfully or
 * null if it failed. */
async function uploadToBlobStore(context: Context, rawBody: string): Promise<string | null> {
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

/** (TODO) Returns `true` if `body` can be decoded into a valid png file. */
function isValidImageFile(body: HttpRequestBody): boolean {
    // TODO how to determine this?
    return true;
}

export default httpTrigger;
