using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using System;
using System.IO;
using System.Threading.Tasks;

namespace PhotoBlobStore
{
    class Program
    {
        static async Task Main()
        {
            Console.WriteLine("Hello world");
            // get the connection string
            string connectionString = Environment.GetEnvironmentVariable("AZURE_STORAGE_CONNECTION_STRING");

            // make blob service client
            BlobServiceClient blobServiceClient = new BlobServiceClient(connectionString);

            // container name
            string containerName = "quickstartblobs" + Guid.NewGuid().ToString();

            // create container and return container client object
            BlobContainerClient containerClient = await blobServiceClient.CreateBlobContainerAsync(containerName);

            //
            // Uploading Blob to Container
            //

            string localPath = "./data/";
            string fileName = "quickstart" + Guid.NewGuid().ToString() + ".txt";
            string localFilePath = Path.Combine(localPath, fileName);

            // Write text to file
            await File.WriteAllTextAsync(localFilePath, "Hello, World!");

            // Get a reference to a blob
            BlobClient blobClient = containerClient.GetBlobClient(fileName);

            // Upload data from the local file
            Console.WriteLine("Uploading Blob Storage as blob: \n\t {0}\n", blobClient.Uri);
            await blobClient.UploadAsync(localFilePath, true);

            //
            // Listing Blobs in a container
            //
            // https://docs.microsoft.com/en-us/azure/storage/blobs/storage-quickstart-blobs-dotnet?tabs=environment-variable-linux

            // List all blobs in the container
            Console.WriteLine("Listing blobs...");
            await foreach (BlobItem blobItem in containerClient.GetBlobsAsync())
            {
                Console.WriteLine("\t", blobItem.Name);
            }

            //
            // Downloading a Blob
            //
            string downloadFilePath = localFilePath.Replace(".txt", "DOWNLOADED.txt");
            Console.WriteLine("\nDownloading blob to \n\t{0}\n", downloadFilePath);
            // Download blob contents and save it to a file
            await blobClient.DownloadToAsync(downloadFilePath);

            //
            // Delete a COntainer
            //

            // Cleaning Up
            Console.Write("Press any key to begin clean up");
            Console.ReadLine();
            Console.WriteLine("Deleting blob container...");
            await containerClient.DeleteAsync();

            Console.WriteLine("Deleting the local source and downloaded files...");
            File.Delete(localFilePath);
            File.Delete(downloadFilePath);

            Console.WriteLine("Done");
        }
    }
}
