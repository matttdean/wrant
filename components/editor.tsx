'use client';

import {useEffect, useState, useRef} from 'react';

import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {OnChangePlugin} from '@lexical/react/LexicalOnChangePlugin';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { CLEAR_HISTORY_COMMAND } from "lexical";
import { CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { TRANSFORMERS } from "@lexical/markdown";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { databases, getDocuments, saveDocument } from '@/appwrite';
import { on } from 'events';
import DocumentList from './document-list';
import { Query } from 'appwrite';


const EDITOR_NODES = [
    AutoLinkNode,
    CodeNode,
    HeadingNode,
    LinkNode,
    ListNode,
    ListItemNode,
    QuoteNode,
  ];

const theme = {
}

function MyCustomAutoFocusPlugin() {
    const [editor] = useLexicalComposerContext();
  
    useEffect(() => {
      // Focus the editor when the effect fires!
      editor.focus();
    }, [editor]);
  
    return null;
}

function onError(error: Error) {
    console.error(error);
  }
  
  const UpdatePlugin = ({desiredUpdate, initialEditorState}:  any) => {
    const [editor] = useLexicalComposerContext();
  
    
    useEffect(() => {

        const setActiveEditor = () => {
            const editorState = editor.parseEditorState(
              JSON.stringify(desiredUpdate)
            );
            if (editorState.isEmpty()) return;
            editor.setEditorState(editorState);
            editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
          };
      
          setActiveEditor();

    }, [initialEditorState, desiredUpdate, editor])

    return <></>;
  };



export default function Editor() {
    const [loading, setLoading] = useState(false);
    const [initialEditorState, setInitialEditorState] = useState<string>("");
    const [currentDocument, setCurrentDocument] = useState<any>({});
    const [disabled, setDisabled] = useState(true);

    const [editorState, setEditorState] = useState<any>("");

    const messageRef = useRef<HTMLDivElement>(null);

    function onChange(editorState: any) {
         // Call toJSON on the EditorState object, which produces a serialization safe string
    const editorStateJSON = editorState.toJSON();
    // However, we still have a JavaScript object, so we need to convert it to an actual string with JSON.stringify
    setEditorState(JSON.stringify(editorStateJSON));
    if(editorStateJSON.root.children[0].children[0]) {
        setDisabled(false);
    } else {
        setDisabled(true);
    }
    }


    useEffect(() => {

    }, [editorState])

    const successMessage = (message:  string, type: string) => {
        messageRef.current!.innerText = message;
        if(type === 'success') {
            messageRef.current!.classList.add('success')
            setTimeout(() => {
                messageRef.current!.classList.remove('success')
            }, 2000)
        } else if(type === 'error') {
            messageRef.current!.classList.add('error')
            setTimeout(() => {
                messageRef.current!.classList.remove('error')
            }, 2000)
        }    
    }

    const updateEditor = (index: any)  => {
        setLoading(true);
        const documents = databases.listDocuments(
            process.env.NEXT_PUBLIC_DATABASE_ID!,
            process.env.NEXT_PUBLIC_EDITORSTATES_COLLECTION_ID!
        );
        documents.then(response => {
            setInitialEditorState(JSON.parse(response.documents[index].editorstate));
            setCurrentDocument(response.documents[index]);
            setLoading(false);
        }, error => {
            console.log(error);
            successMessage('Something went wrong...', 'error');
            setLoading(false);
        });
    }



    const updateEditorById = (id: any)  => {
        setLoading(true);
        const documents = databases.getDocument(
            process.env.NEXT_PUBLIC_DATABASE_ID!,
            process.env.NEXT_PUBLIC_EDITORSTATES_COLLECTION_ID!,
            id
        );
        documents.then(response => {
            setCurrentDocument(response);
            setLoading(false);
        }, error => {
            console.log(error);
            setLoading(false);
        });
    }


    const newDocument = () => {
        const newEditorState = '{\"root\":{\"children\":[{\"children\":[],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"paragraph\",\"version\":1}],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"root\",\"version\":1}}'
        setCurrentDocument({});
        setInitialEditorState(JSON.parse(newEditorState));
        setDisabled(true);
    }




    const updateDocument = (id: any, editorState: any) => {
        if(!currentDocument.$id) {
            saveDocument(editorState, updateEditorById, successMessage); 
        }  else {
            const documents = databases.updateDocument(
                process.env.NEXT_PUBLIC_DATABASE_ID!,
                process.env.NEXT_PUBLIC_EDITORSTATES_COLLECTION_ID!,
                id,
                {
                    "editorstate": editorState
                }
            );
            documents.then(response => {
                successMessage('Saved!', 'success');
            }, error => {
                successMessage('Something went wrong...', 'error');
                console.log(error);
            });
        }
    }

    const initialConfig = {
            namespace: 'my-editor',
            nodes: EDITOR_NODES,
            // editorState: initialEditorState,
            theme: {},
            onError,
        }

        const deleteDocument = (id: any) => {
            const documents = databases.deleteDocument(
                process.env.NEXT_PUBLIC_DATABASE_ID!,
                process.env.NEXT_PUBLIC_EDITORSTATES_COLLECTION_ID!,
                id
            );
            documents.then(response => {
                if(id === currentDocument.$id) {
                    setCurrentDocument({});
                    newDocument();
                }
                successMessage('Deleted!', 'success');
                console.log(response);
            }, error => {
                successMessage('Something went wrong...', 'error');
                console.log(error);
            });
        }

  return (
    <div className='w-11/12 sm:w-8/12 mb-10'>
        
    <div className='relative rounded-lg mt-10'>
        
        <LexicalComposer 
            initialConfig={initialConfig}>
            <RichTextPlugin
            contentEditable={ loading ? <div className='relative z-[1] p-5 text-slate-600 dark:text-slate-400 outline-none border border-slate-600/10  focus:border-slate-200 dark:border-slate-700 dark:focus:border-slate-600 rounded-lg min-h-screen sm:min-h-[22rem] bg-white dark:bg-slate-800'><span  className='animate-pulse'>getting data... ( ´･･)ﾉ(._.`)</span></div> : <ContentEditable className='relative z-[1] p-5 text-slate-600 dark:text-slate-400 outline-none border border-slate-600/10  focus:border-slate-200 dark:border-slate-700 dark:focus:border-slate-600 rounded-lg min-h-screen sm:min-h-[22rem] bg-white dark:bg-slate-800'/>}
            placeholder={<div className='absolute top-5 left-5 text-slate-400 pointer-events-none z-[1]'>Start wranting... p.s.... markdown works ╰(*°▽°*)╯</div>}
            ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <MyCustomAutoFocusPlugin />
            <OnChangePlugin onChange={onChange} />
            <div className='flex items-center'>
                <button 
                disabled={disabled}
                className='mr-5 hover:text-white dark:hover:bg-slate-950/40 dark:hover:text-slate-300 px-5 py-3 bg-slate-900 dark:bg-slate-900 rounded-lg my-5 text-slate-100 dark:text-slate-400 border border-slate-200/20 active:bg-slate-950 dark:active:bg-slate-950/80' 
                style={disabled ? {background: 'rgb(15 23 42)', color: 'rgb(148 163 184 / 0.6)', cursor: 'not-allowed'} : {pointerEvents: 'all', cursor: 'pointer', opacity: '1'}}
                onClick={() => updateDocument(currentDocument.$id, editorState)}>Save</button>
                {currentDocument.$id ? <p className='text-slate-600 text-xs sm:text-base'>This is the Article ID: <span className='text-slate-400'>{currentDocument.$id} </span><br/>created on {currentDocument.$createdAt.substring(0,10).replace(/-/g, '/')} updated at {currentDocument.$updatedAt.substring(0, 19).replace(/-/g, '/').replace(/T/g, ' ')}</p>: <p className='text-slate-600'>This is a new document</p>}
                <div ref={messageRef} className='absolute right-4 z-10 px-3 py-2 rounded-md flex justify-center items-center -translate-y-16 opacity-0'></div>
            </div>
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
            <UpdatePlugin initialEditorState={initialEditorState} desiredUpdate={initialEditorState} />
        </LexicalComposer>
 
    </div>
    <DocumentList updateEditor={updateEditor} deleteDocument={deleteDocument} newDocument={newDocument}/>
    </div>
  )
}
