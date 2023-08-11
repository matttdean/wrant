import { Client, Databases, Query, Account, ID } from 'appwrite';

const client =  new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

// const account = new Account(client);

//Register User
// account.create(
//     ID.unique(),
//     'me@example.com',
//     'password',
//     'John Doe',
// ).then(response => {
//     console.log(response);
// }, error => {
//     console.log(error);
// })

// client.subscribe('files', response  => {
//     if(response.events.includes('buckets.*.files*.create')) {
//         console.log(response.payload);
//     }
// })

export const databases = new Databases(client);

export const getDocuments = () => {

    const documents = databases.listDocuments(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_EDITORSTATES_COLLECTION_ID!
    );

    documents.then(response => {
        console.log(response);
        return response.documents[0].editorstate;
    }, error => {
        console.log(error);
    });

}

export const saveDocument = (editorState: any) => {
const document = databases.createDocument(process.env.NEXT_PUBLIC_DATABASE_ID!, process.env.NEXT_PUBLIC_EDITORSTATES_COLLECTION_ID!, ID.unique(), 
{   
    "editorstate": editorState 
});

document.then(function (response) {
    console.log(response); // Success
}, function (error) {
    console.log(error); // Failure
});
}