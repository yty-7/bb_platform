import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { getContainerClient } from "../helper"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('(ClearImageBlobs) HTTP trigger function processed a request.');

    const result = await clearBlobs(context).catch(error => {
        context.log("(ClearImageBlobs) encountered error: " + error);
        return false;
    });

    if (result) {
        context.res = {
            status: 200,
            body: "Succesfully cleared blobs"
        };
    } else {
        context.res = {
            status: 500,
            body: "Failed to clear blobs"
        };
    }
};

async function clearBlobs(context: Context): Promise<boolean> {
    return false;
    // TODO have to clear by deleting blobs one by one

    // const containerClient = await getContainerClient(context);

    // const deleteResponse = await containerClient.deleteIfExists();
    // if (!deleteResponse.succeeded) {
    //     context.log("(ClearBlobs) delete did not succeed")
    //     return false;
    // }

    // const createResponse = await containerClient.create();
    // if (createResponse.errorCode != null) {
    //     context.log(`(ClearBlobs) create failed with error code: ${createResponse.errorCode}`)
    //     return false;
    // }

    // return true;
}

export default httpTrigger;
