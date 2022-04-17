import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { allItemsInTasks } from "../cosmosHelper";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    // TODO uploads the blob url with the tags from the computer vision API

    const items = await allItemsInTasks(context);

    context.res = {
        body: `some items fr: ${items}`
    };
};

export default httpTrigger;
