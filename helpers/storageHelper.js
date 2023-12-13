const { BlobServiceClient } = require("@azure/storage-blob");
const { v1: uuidv1 } = require("uuid");
require("dotenv").config();

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;

if (!AZURE_STORAGE_CONNECTION_STRING) {
    throw Error('Azure Storage Connection string not found');
}

// Create the BlobServiceClient object with connection string
const blobServiceClient = BlobServiceClient.fromConnectionString(
    AZURE_STORAGE_CONNECTION_STRING
);

// Create a unique name for the container
const containerName = 'store' + uuidv1();

const uploadBlob = async (localFilePath, originalname) => {

    console.log('\nCreating container...');
    console.log('\t', containerName);

    // Get a reference to a container
    const containerClient = blobServiceClient.getContainerClient(containerName);
    // Create the container
    const createContainerResponse = await containerClient.create();
    console.log(
        `Container was created successfully.\n\trequestId:${createContainerResponse.requestId}\n\tURL: ${containerClient.url}`
    );

    // Create a unique name for the blob
    const blobName = 'workshop-file' + uuidv1() + `${originalname}`;

    // Get a block blob client
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Display blob name and url
    console.log(
        `\nUploading to Azure storage as blob\n\tname: ${blobName}:\n\tURL: ${blockBlobClient.url}`
    );

    const uploadBlobResponse = await blockBlobClient.uploadData(localFilePath);
    console.log(
        `Blob was uploaded successfully. requestId: ${uploadBlobResponse.requestId}`
    );
}

const listBlobsInContainer = async () => {
    console.log('\nListing blobs...');

    // List the blob(s) in the container.
    for await (const blob of containerClient.listBlobsFlat()) {
        // Get Blob Client from name, to get the URL
        const tempBlockBlobClient = containerClient.getBlockBlobClient(blob.name);

        // Display blob name and URL
        console.log(
            `\n\tname: ${blob.name}\n\tURL: ${tempBlockBlobClient.url}\n`
        );
    }
}

const downloadBlob = async () => {
    // Get blob content from position 0 to the end
    // In Node.js, get downloaded data by accessing downloadBlockBlobResponse.readableStreamBody
    // In browsers, get downloaded data by accessing downloadBlockBlobResponse.blobBody
    const downloadBlockBlobResponse = await blockBlobClient.download(0);
    console.log('\nDownloaded blob content...');
    console.log(
        '\t',
        await streamToText(downloadBlockBlobResponse.readableStreamBody)
    );
}

const deleteContainer = async () => {
    // Delete container
    console.log('\nDeleting container...');

    const deleteContainerResponse = await containerClient.delete();
    console.log(
        'Container was deleted successfully. requestId: ',
        deleteContainerResponse.requestId
    );
}

// Convert stream to text
async function streamToText(readable) {
    readable.setEncoding('utf8');
    let data = '';
    for await (const chunk of readable) {
        data += chunk;
    }
    return data;
}

module.exports = {
    uploadBlob,
    listBlobsInContainer,
    downloadBlob,
    deleteContainer,
}