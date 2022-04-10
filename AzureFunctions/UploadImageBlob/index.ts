import { Context, HttpRequest } from "@azure/functions"
import { HttpRequestBody } from "@azure/storage-blob";
import { uploadToBlobStore } from "../blobstoreHelper";

export async function httpTrigger(context: Context, req: HttpRequest): Promise<void> {
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

/** (TODO) Returns `true` if `body` can be decoded into a valid png file. */
function isValidImageFile(body: HttpRequestBody): boolean {
    // TODO how to determine this?
    return true;
}
