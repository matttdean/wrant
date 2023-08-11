'use client';

import React, {useState, useEffect} from 'react'
import { databases } from '@/appwrite';

export default function DocumentList({updateEditor, deleteDocument}: any) {
    const [documents, setDocuments] = useState<any>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
            const documents = databases.listDocuments(
                process.env.NEXT_PUBLIC_DATABASE_ID!,
                process.env.NEXT_PUBLIC_EDITORSTATES_COLLECTION_ID!
            );
            documents.then(response => {
                setDocuments(response.documents);
            }, error => {
                console.log(error);
            });
        setLoading(false);
    }, [documents])
  return (
    <div className='mt-5 flex gap-4 flex-wrap'>
        {loading ? <div>Loading...</div> :
        documents.map((document: any, index: any) => (
            <div onClick={() => updateEditor(index)}className='min-h-[10rem] relative p-4 pb-10 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 w-full sm:w-[18rem] rounded-md cursor-pointer dark:hover:bg-slate-700' key={document.$id}>
                <h1 className='text-xl dark:text-slate-900 font-semibold'>{document.$id}</h1>
                <p className='dark:text-slate-900'>{JSON.parse(document.editorstate).root.children[0].children[0].text}</p>
                <p 
                onClick={() => deleteDocument(document.$id)}
                className='absolute bottom-2 right-2 z-10 px-2 py-1 bg-slate-700 rounded-md mt-2 border border-slate-400/20 cursor-pointer hover:bg-slate-800/60'>Remove</p>
            </div>
        ))
        }
    </div>
  )
}
