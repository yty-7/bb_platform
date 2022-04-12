import { Context, HttpRequest } from "@azure/functions"
import { HttpRequestBody } from "@azure/storage-blob";
import { uploadToBlobStore } from "../blobstoreHelper";
import { ErrorCode, responseWithMessage, responseWithMessageAndBlobName} from "../jsonHelper";

export async function httpTrigger(context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request (UploadImageBlob).');

     if (req.body == null) {
         context.res = responseWithMessage("No image was provided in body of request.", ErrorCode.BAD_REQUEST);
         return;
     } else {
         const result = await uploadToBlobStore(context, req.rawBody).catch(_ => null);
         if (result != null) {
             context.res = responseWithMessageAndBlobName(
                 `Successfully uploaded image data with name ${result}`,
                 result,
                 ErrorCode.OK
             );
             return;
         } else {
             context.res = responseWithMessage("Unable to store image data", ErrorCode.INTERNAL_SERVER_ERROR);
             return;
         }
     }
};
