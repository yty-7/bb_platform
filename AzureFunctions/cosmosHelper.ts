/**
 * Helper module for managing the cosmos DB
 */

import { Context, HttpRequest } from "@azure/functions"
import { CosmosClient, Database, Container } from "@azure/cosmos"

// Load the .env file if it exists
// Has the information for connecting to the azure storage container
import * as dotenv from "dotenv";
dotenv.config();

export async function allItemsInTasks(context: Context): Promise<any> {
    const tasks = tasksContainer(context);
    const querySpec = {
        query: "SELECT * FROM c"
    };

    const { resources: items } = await tasks.items
        .query(querySpec)
        .fetchAll();

    context.log(`(UploadCosmosDB) type of query response items is ${typeof items}`);
    const first = items[0];
    context.log(`(UploadCosmosDB) id ${first.id}`);
    context.log(`(UploadCosmosDB) category ${first.category}`);
    context.log(`(UploadCosmosDB) description ${first.description}`);
    return items;
}

function tasksContainer(context: Context): Container {
    const containerId = "Items";
    return tasksDatabase(context).container(containerId);
}

function tasksDatabase(context: Context): Database {
    const client = cosmosClient(context);
    const databaseID = "ToDoList";
    return client.database(databaseID);
}

function cosmosClient(context: Context): CosmosClient {
    const endpoint = process.env.COSMOS_DB_ENDPOINT || "";
    const key = process.env.COSMOS_DB_KEY || "";
    return new CosmosClient({ endpoint, key });
}
