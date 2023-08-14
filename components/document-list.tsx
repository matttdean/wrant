'use client';

import React, {useState, useEffect, useRef} from 'react'
import { databases } from '@/appwrite';
import { IoIosArrowForward,  IoIosAdd } from 'react-icons/io';

export default function DocumentList({updateEditor, deleteDocument, newDocument}: any) {
    const [documents, setDocuments] = useState<any>([]);
    const [loading, setLoading] = useState(false);
    const [docListIsOpen, setDocListIsOpen] = useState(false);

    const docListRef = useRef<HTMLDivElement>(null)
    const toggleButtonRef = useRef<HTMLButtonElement>(null)
    const newButtonRef = useRef<HTMLButtonElement>(null)

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

    const toggleDocumentList = () => {
        docListRef.current!.classList.toggle('!translate-x-0');
        toggleButtonRef.current!.classList.toggle('rotate-180');
        setDocListIsOpen(!docListIsOpen);
    }
  return (
    <div ref={docListRef} className='fixed top-0 left-0 h-screen w-full sm:w-[29rem] z-10 bg-slate-400/20 dark:bg-slate-950/40 backdrop-blur-2xl -translate-x-[100%] sm:-translate-x-[25rem] transition'>
        <div className='absolute top-5 right-0 bottom-5 sm:w-[4rem] border-l border-slate-950 dark:border-slate-500/60'>
            <div className='absolute sm:hidden -top-5 bg-slate-400/20  dark:bg-slate-900 z-30 w-screen h-16 backdrop-blur-lg flex items-center'>
                <button onClick={toggleDocumentList} className='w-10 h-10  flex justify-center items-center text-2xl text-slate-950 dark:text-slate-600'><IoIosArrowForward /></button>
                <button onClick={newDocument} className='w-10 h-10  flex justify-center items-center text-3xl text-slate-950 dark:text-slate-600'><IoIosAdd /></button>
            </div>
                <button ref={toggleButtonRef} onClick={toggleDocumentList} className='transition absolute z-10 top-0 sm:top-5 right-3 sm:right-3 w-10 h-10  flex justify-center items-center text-2xl text-slate-950 dark:text-slate-600'><IoIosArrowForward /></button>
                <button
                ref={newButtonRef}
                onClick={
                    () => {
                        newDocument();
                        if(docListIsOpen) {
                            toggleDocumentList();
                        }
                    }
                } className='transition absolute z-10 top-20 right-3 sm:right-3 w-10 h-10  flex justify-center items-center text-3xl text-slate-950 dark:text-slate-600 active:translate-y-[2px]'><IoIosAdd /></button>
        </div>
    <div className='top-0 bottom-0 absolute flex gap-4 flex-wrap justify-center pl-6 w-10/12 sm:w-[25rem] overflow-scroll z-20 no-scrollbar my-5'>

        {loading ? <div>Loading...</div> :
        documents.map((document: any, index: any) => (
            <div className='relative w-full sm:w-[18rem] border-b border-slate-950 dark:border-slate-500/60 pb-5' key={document.$id}>
                <div 
                onClick={() => {
                    updateEditor(index)
                    toggleDocumentList();
                    }}
                className='group h-32 p-4 rounded-md mb-2 cursor-pointer'>
                    <h1 className='text-base sm:text-lg text-slate-950 dark:text-slate-400 font-semibold group-hover:underline dark:group-hover:no-underline dark:group-hover:text-slate-200'>{JSON.parse(document.editorstate).root.children[0].children[0].text.substring(0,50)}</h1>
                    <p className='text-sm sm:text-base text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-400'>{JSON.parse(document.editorstate).root.children[0].children[0].text.substring(0,50)}...</p>  
                </div>
                <div className='flex justify-between items-baseline'>
                    <p className='text-xs sm:text-sm pl-4 inline text-slate-600 dark:text-slate-700'>{document.$createdAt.substring(0, 10).replace(/-/g, '/')}</p>
                    <button
                    onClick={() => deleteDocument(document.$id)}
                    className=' text-sm sm:text-base float-right z-10 px-2 py-1 dark:bg-slate-700/10 rounded-md border border-slate-950 dark:border-slate-400/20 cursor-pointer hover:bg-slate-950 text-slate-950 dark:text-slate-500 hover:text-slate-100 dark:hover:text-slate-400 dark:hover:bg-slate-700/30'>Remove</button>
                </div>
            </div>
        ))
        }
    </div>
    </div>
  )
}
