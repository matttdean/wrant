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

    const [editorState, setEditorState] = useState<any>("");

    const editorStateRef = useRef();

    function onChange(editorState: any) {
         // Call toJSON on the EditorState object, which produces a serialization safe string
    const editorStateJSON = editorState.toJSON();
    // However, we still have a JavaScript object, so we need to convert it to an actual string with JSON.stringify
    setEditorState(JSON.stringify(editorStateJSON));
    }


    const updateEditor = (index: any)  => {
        const documents = databases.listDocuments(
            process.env.NEXT_PUBLIC_DATABASE_ID!,
            process.env.NEXT_PUBLIC_EDITORSTATES_COLLECTION_ID!
        );
        documents.then(response => {
            setInitialEditorState(JSON.parse(response.documents[index].editorstate));
        }, error => {
            console.log(error);
        });
    }

    useEffect(() => {
        setLoading(true);
            const documents = databases.listDocuments(
                process.env.NEXT_PUBLIC_DATABASE_ID!,
                process.env.NEXT_PUBLIC_EDITORSTATES_COLLECTION_ID!
            );
            documents.then(response => {
                console.log(JSON.parse(response.documents[0].editorstate));
                setInitialEditorState(JSON.parse(response.documents[0].editorstate));
            }, error => {
                console.log(error);
            });
        setLoading(false);
    }, [])


    const initialConfig = {
            namespace: 'my-editor',
            nodes: EDITOR_NODES,
            // editorState: initialEditorState,
            theme: {},
            onError,
        }

  return (
    <div className='w-11/12 sm:w-8/12'>
    <div className='relative  bg-white dark:bg-slate-800 rounded-lg mt-10'>
        { loading ? <div>Loading...</div> :
        <LexicalComposer 
            initialConfig={initialConfig}>
            <RichTextPlugin
            contentEditable={<ContentEditable className='relative z-[1] p-5 text-slate-600 dark:text-slate-400 outline-none border border-slate-600/10  focus:border-slate-200 dark:border-slate-700 dark:focus:border-slate-600 rounded-lg min-h-screen sm:min-h-[22rem]'/>}
            placeholder={<div className='absolute top-5 left-5 text-slate-400 pointer-events-none z-[0]'>Enter some text...</div>}
            ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <MyCustomAutoFocusPlugin />
            <OnChangePlugin onChange={onChange} />
            <button className='mx-5 hover:text-slate-500 px-5 py-3 bg-slate-900 rounded-lg my-5 text-slate-400 border border-slate-200/20 active:bg-slate-950/80' onClick={() => saveDocument(editorState)}>Save</button>
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
            <UpdatePlugin initialEditorState={initialEditorState} desiredUpdate={initialEditorState} />
        </LexicalComposer>
    }
    </div>
    <DocumentList updateEditor={updateEditor}/>
    </div>
  )
}
