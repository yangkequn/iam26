import React, { useState } from "react";
import TextareaAutosize from '@mui/material/TextareaAutosize';
import { Editor, EditorState, RichUtils, DraftEditorCommand } from 'draft-js';
import 'draft-js/dist/Draft.css';

export const BindTextFieldModel = (model: any, key: string, events: any = {}) => ({
    defaultValue: model[key],
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        model[key] = event.target.value
        let fuc = events["onChange"]
        if (!!fuc) fuc(event)
    },
    //unfold events items , except item with key "onChange"
    ...Object.keys(events).filter(k => k !== "onChange").reduce((acc, k) => ({ ...acc, [k]: events[k] }), {})

})
export function Field2DivInnerText({ model, field, updateKey, callbacks = {}, placeholder = "" }: { model: any, field: string, updateKey: number, callbacks: any, placeholder: string }) {
    const withPlaceholder = (value: string) => value || placeholder
    const rmPlaceholder = (s: string) => (s || "").replace(placeholder, "")
    const onClickEvent: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void = e => {
        if (e.currentTarget.innerText !== rmPlaceholder(e.currentTarget.innerText)) e.currentTarget.innerText = rmPlaceholder(e.currentTarget.innerText)
    }
    const onBlurEvent = (e: React.FocusEvent<HTMLDivElement>) => {
        //AutoSave text to model       
        if (field in model) model[field] = rmPlaceholder(e.currentTarget.innerText as string);
        //Set display value
        e.currentTarget.innerText = withPlaceholder(model[field]);

        //OnBlur callback executed. AutoSave to db and update model is called here
        if ("onBlur" in callbacks && (typeof callbacks["onBlur"]) === "function") callbacks["onBlur"](e)
        console.log("ValueSet()", withPlaceholder(model[field]))
    }
    return <div key={updateKey} {...callbacks} contentEditable={true} suppressContentEditableWarning={true} placeholder={placeholder} dangerouslySetInnerHTML={{ __html: withPlaceholder(model[field]) }} onClick={onClickEvent} onBlur={onBlurEvent}

        //unfold events items , except item with key "onChange"
        {...Object.keys(callbacks).filter(k => k !== "onBlur").reduce((acc, k) => ({ ...acc, [k]: callbacks[k] }), {})}
    />

}
// export function Field2Draft({ model, field, updateKey, callbacks = {}, placeholder = "" }: { model: object, field: keyof object, updateKey: number, callbacks: object, placeholder: string }) {
//     //const ValueSet = () => !model[field] ? placeholder : model[field]
//     //const ValueGet = (e) => e.currentTarget.innerHTML.replace(placeholder, "")
//     const [editorState, setEditorState] = useState<EditorState>(EditorState.createEmpty());

//     const handleKeyCommand = (command: DraftEditorCommand, editorState: EditorState,eventTimeStamp: number) => {
//         let newState = RichUtils.handleKeyCommand(editorState, command);
//         setEditorState(newState)
//     }
//     const SetV = (v: EditorState) => { console.log("v.getCurrentContent()", v.getCurrentContent().getBlocksAsArray()); console.log(v); setEditorState(v) }
//     return <Editor editorState={editorState} onChange={SetV} placeholder={placeholder} handleKeyCommand={handleKeyCommand} />;
// }

