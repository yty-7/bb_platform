import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { ContainerClient, StorageSharedKeyCredential, HttpRequestBody, BlockBlobClient } from "@azure/storage-blob";
import { uploadToBlobStore, createImageBlobClient } from "../helper";

// https://github.com/Azure/azure-sdk-for-js/blob/main/sdk/storage/storage-blob/samples/v12/typescript/src/listBlobsFlat.ts

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

export default httpTrigger;
