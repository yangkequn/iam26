import React  from "react";
import TextareaAutosize from '@mui/material/TextareaAutosize';
import { Editor, EditorState, RichUtils } from 'draft-js';
import 'draft-js/dist/Draft.css';


export const BindTextFieldModel = (model: object, key: string, events: object = {}) => ({
    defaultValue: model[key],
    onChange: event => {
        model[key] = event.target.value
        let fuc = events["onChange"]
        if (!!fuc) fuc(event)
    },
    //unfold events items , except item with key "onChange"
    ...Object.keys(events).filter(k => k !== "onChange").reduce((acc, k) => ({ ...acc, [k]: events[k] }), {})

})
export function Field2DivInnerText({ model, field, updateKey, callbacks = {}, placeholder = "" }: { model: object, field: string, updateKey: number, callbacks: object, placeholder: string }) {
    const ValueSet = () => !model[field] ? placeholder : model[field]
    const ValueGet = (e) => e.currentTarget.innerText.replace(placeholder, "")
    return <div key={updateKey} {...callbacks} contentEditable={true} suppressContentEditableWarning={true} placeholder={placeholder} dangerouslySetInnerHTML={{ __html: ValueSet() }}
        onClick={e => { if (e.currentTarget.innerText !== ValueGet(e)) e.currentTarget.innerText = ValueGet(e) }}
        onBlur={e => {
            //AutoSave text to model
            model[field] = ValueGet(e);
            //Set display value
            e.currentTarget.innerText = ValueSet();

            //OnBlur callback executed. AutoSave to db and update model is called here
            if (!!callbacks["onBlur"] && typeof callbacks["onBlur"] === "function") callbacks["onBlur"](e)
            console.log("ValueSet()", ValueSet())
        }}

        //unfold events items , except item with key "onChange"
        {...Object.keys(callbacks).filter(k => k !== "onBlur").reduce((acc, k) => ({ ...acc, [k]: callbacks[k] }), {})} />

}
export function Field2DivInnerHTML({ model, field, updateKey, callbacks = {}, placeholder = "" }: { model: object, field: string, updateKey: number, callbacks: object, placeholder: string }) {
    const ValueSet = () => !model[field] ? placeholder : model[field]
    const ValueGet = (e) => e.currentTarget.innerHTML.replace(placeholder, "")
    return <div key={updateKey} {...callbacks} contentEditable={true} suppressContentEditableWarning={true} placeholder={placeholder} dangerouslySetInnerHTML={{ __html: model[field] }}
        onClick={e => { if (e.currentTarget.innerHTML !== ValueGet(e)) e.currentTarget.innerHTML = ValueGet(e) }}
        onBlur={e => {
            //AutoSave text to model
            model[field] = e.currentTarget.innerHTML;
            //Set display value
            e.currentTarget.innerHTML = ValueSet()
            //OnBlur callback executed. AutoSave to db and update model is called here
            if (!!callbacks["onBlur"] && typeof callbacks["onBlur"] === "function") callbacks["onBlur"](e)
        }}

        //unfold events items , except item with key "onChange"
        {...Object.keys(callbacks).filter(k => k !== "onBlur").reduce((acc, k) => ({ ...acc, [k]: callbacks[k] }), {})} />

}
export function Field2Draft({ model, field, updateKey, callbacks = {}, placeholder = "" }: { model: object, field: string, updateKey: number, callbacks: object, placeholder: string }) {
    //const ValueSet = () => !model[field] ? placeholder : model[field]
    //const ValueGet = (e) => e.currentTarget.innerHTML.replace(placeholder, "")
    const handleKeyCommand = (command, editorState) => {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        setEditorState(newState)
    }
    const [editorState, setEditorState] = React.useState(() => EditorState.createEmpty(),);
    const SetV = (v:EditorState) => {console.log("v.getCurrentContent()",v.getCurrentContent().getBlocksAsArray()); console.log(v); setEditorState(v) }
    return <Editor editorState={editorState} onChange={SetV} placeholder={placeholder} handleKeyCommand={handleKeyCommand} />;
    // return <div key={updateKey} {...callbacks} contentEditable={true} suppressContentEditableWarning={true} placeholder={placeholder} dangerouslySetInnerHTML={{ __html: model[field] }}
    //     onBlur={e => {
    //         //AutoSave text to model
    //         model[field] = e.currentTarget.innerHTML;
    //         //OnBlur callback executed. AutoSave to db and update model is called here
    //         if (!!callbacks["onBlur"] && typeof callbacks["onBlur"] === "function") callbacks["onBlur"](e)
    //         //
    //         e.currentTarget.textContent = ValueSet()
    //     }}

    //     //unfold events items , except item with key "onChange"
    //     {...Object.keys(callbacks).filter(k => k !== "onBlur").reduce((acc, k) => ({ ...acc, [k]: callbacks[k] }), {})} />

}

export function Field2Textarea({ model, field, updateKey, callbacks = {}, placeholder = "", maxRows }: { model: object, field: string, updateKey: number, callbacks: object, placeholder: string, maxRows: number }) {
    return <TextareaAutosize maxRows={maxRows} placeholder={placeholder} defaultValue={model[field]} key={updateKey}
        aria-label="maximum height"

        onClick={(e) => { e.currentTarget.textContent = model[field].replace(placeholder, ""); e.currentTarget.focus() }}
        onBlur={e => {
            //AutoSave text to model
            model[field] = e.currentTarget.textContent;
            //OnBlur callback executed. AutoSave to db and update model is called here
            if (!!callbacks["onBlur"] && typeof callbacks["onBlur"] === "function") callbacks["onBlur"](e)
        }}

        //unfold events items , except item with key "onChange"
        {...Object.keys(callbacks).filter(k => k !== "onBlur").reduce((acc, k) => ({ ...acc, [k]: callbacks[k] }), {})}
    />
}