


import React, { useState, useMemo, useCallback, Children } from "react";
import { Editor, Transforms, createEditor, Descendant, Element as SlateElement, } from 'slate'
import isHotkey from 'is-hotkey'
import { Slate, Editable, withReact, useSlate } from 'slate-react'
import { withHistory } from 'slate-history'
import { BaseEditor } from 'slate'
import { ReactEditor } from 'slate-react'
import { HistoryEditor } from 'slate-history'
import escapeHtml from 'escape-html'
import { Text } from 'slate'
import { jsx } from 'slate-hyperscript'
import { Button, Icon, Toolbar } from './Component'
import { ToolBarO, ToolbarComponent, toggleMark } from './Toolbar'
import { CompareSharp } from "@mui/icons-material";

type CustomElement = { type: 'paragraph'; children: CustomText[]; align?: string }
type CustomText = { text: string; bold?: true; italic?: true; underline?: true; code?: true; }

declare module 'slate' {
    interface CustomTypes {
        Editor: BaseEditor & ReactEditor & HistoryEditor
        Element: CustomElement
        Text: CustomText
    }
}
const HOTKEYS = { 'mod+b': 'bold', 'mod+i': 'italic', 'mod+u': 'underline', 'mod+`': 'code', }


const Element = ({ attributes, children, element }) => {
    const style = { textAlign: element.align }
    switch (element.type) {
        case 'block-quote':
            return <blockquote style={style} {...attributes}>{children}</blockquote>

        case 'bulleted-list':
            return <ul style={style} {...attributes}>{children}</ul>

        case 'heading-one':
            return <h1 style={style} {...attributes}>{children}</h1>

        case 'heading-two':
            return <h2 style={style} {...attributes}>{children}</h2>

        case 'list-item':
            return <li style={style} {...attributes}>{children}</li>

        case 'numbered-list':
            return <ol style={style} {...attributes}>{children}</ol>

        default:
            return <p style={style} {...attributes}>{children}</p>

    }
}

const Leaf = ({ attributes, children, leaf }) => {
    if (leaf.bold) { children = <strong>{children}</strong> }

    if (leaf.code) { children = <code>{children}</code> }

    if (leaf.italic) { children = <em>{children}</em> }

    if (leaf.underline) { children = <u>{children}</u> }

    return <span {...attributes}>{children}</span>
}

//https://docs.slatejs.org/concepts/10-serializing
const serialize = node => {
    if (Text.isText(node)) {
        let string = escapeHtml(node.text)
        if (node.bold) {
            string = `<strong>${string}</strong>`
        }
        return string
    }

    const children = node.children.map(n => serialize(n)).join('')

    switch (node.type) {
        case 'quote':
            return `<blockquote><p>${children}</p></blockquote>`
        case 'paragraph':
            return `<p>${children}</p>`
        case 'link':
            return `<a href="${escapeHtml(node.url)}">${children}</a>`
        default:
            return children
    }
}

const deserialize = (el, markAttributes = {}) => {
    if (el.nodeType === Node.TEXT_NODE) {
        return jsx('text', markAttributes, el.textContent)
    } else if (el.nodeType !== Node.ELEMENT_NODE) {
        return null
    }

    const nodeAttributes = { ...markAttributes }

    // define attibutes for text nodes
    switch (el.nodeName) {
        case 'strong':
            nodeAttributes["bold"] = true
    }

    const children = Array.from(el.childNodes).map(node => deserialize(node, nodeAttributes)).flat()

    if (children.length === 0) {
        children.push(jsx('text', nodeAttributes, ''))
    }

    switch (el.nodeName) {
        case 'BODY':
            return jsx('fragment', {}, children)
        case 'BR':
            return '\n'
        case 'BLOCKQUOTE':
            return jsx('element', { type: 'quote' }, children)
        case 'P':
            return jsx('element', { type: 'paragraph' }, children)
        case 'A':
            return jsx('element', { type: 'link', url: el.getAttribute('href') }, children)
        default:
            return children
    }
}
export function Field2RichText({ model, field, updateKey, callbacks = {}, placeholder = "", autoFocus = false }:
    { model: object, field: string, updateKey: number, callbacks: object, placeholder: string, autoFocus: boolean }) {
    const editor = useMemo(() => withHistory(withReact(createEditor())), [])
    const [readonly, setReadonly] = useState(true)
    const onChange = (state) => {
        var html = serialize({ children: state })
        model[field] = html
        setValue(state)
    }
    const GetEditValue = (_value: string | null): Descendant[] => {
        let defaultDescendant = [{ type: 'paragraph', children: [{ text: '' },] }] as Descendant[]
        if (!_value) return defaultDescendant
        const doc = new DOMParser().parseFromString(model[field], 'text/html')
        if (!doc || !doc.body) return defaultDescendant
        var state = deserialize(doc.body)
        if (!state) return defaultDescendant
        return state as Descendant[]
    }
    const [value, setValue] = useState<Descendant[]>(GetEditValue(model[field]))
    //const [value, setValue] = useState<Descendant[]>([{ type: 'paragraph', children: [{ text: '' },], }])
    const onBlur = value => {
        if (!!callbacks["onBlur"]) callbacks["onBlur"](value);
        setReadonly(true)
    }
    const renderElement = useCallback(props => <Element {...props} />, [])
    const renderLeaf = useCallback(props => <Leaf {...props} />, [])
    // const renderElement = useCallback(({ attributes, children, element }) => {
    //     switch (element.type) {
    //       case 'quote':
    //         return <blockquote {...attributes}>{children}</blockquote>
    //       case 'link':
    //         return (
    //           <a {...attributes} href={element.url}>
    //             {children}
    //           </a>
    //         )
    //       default:
    //         return <p {...attributes}>{children}</p>
    //     }
    //   }, [])
    // const renderLeaf = useCallback(({ attributes, children, leaf }) => {
    //     return (
    //       <span
    //         {...attributes}
    //         style={{
    //           fontWeight: leaf.bold ? 'bold' : 'normal',
    //           fontStyle: leaf.italic ? 'italic' : 'normal',
    //         }}
    //       >
    //         {children}
    //       </span>
    //     )
    //   }, [])
    return <Slate editor={editor} value={value} onChange={onChange} key={updateKey}>
        {!readonly && <ToolbarComponent editor={editor}></ToolbarComponent>}
        <Editable renderElement={renderElement} renderLeaf={renderLeaf} autoFocus={autoFocus}
            onKeyDown={event => {
                for (const hotkey in HOTKEYS) {
                    if (isHotkey(hotkey, event as any)) {
                        event.preventDefault()
                        const mark = HOTKEYS[hotkey]
                        toggleMark(editor, mark)
                    }
                }
            }}
            placeholder={placeholder} onBlur={onBlur} onClick={e => setReadonly(false)} />
    </Slate>
}
export function Field2PainText({ model, field, updateKey, callbacks = {}, placeholder = "", autoFocus = false }:
    { model: object, field: string, updateKey: number, callbacks: object, placeholder: string, autoFocus: boolean }) {
    const editor = useMemo(() => withHistory(withReact(createEditor())), [])
    const onChange = (state) => {
        var html = serialize({ children: state })
        model[field] = html
        setValue(state)
    }
    const [value, setValue] = useState<Descendant[]>(!!model[field] ? deserialize(model[field]) : [{ type: 'paragraph', children: [{ text: '' },], }])
    const onBlur = value => {
        if (!!callbacks["onBlur"]) callbacks["onBlur"](value);
    }
    const renderElement = useCallback(props => <Element {...props} />, [])
    const renderLeaf = useCallback(props => <Leaf {...props} />, [])
    return <Slate editor={editor} value={value} onChange={onChange} key={updateKey}>
        <Editable renderElement={renderElement} autoFocus={autoFocus} renderLeaf={renderLeaf} placeholder={placeholder} onBlur={onBlur} />
    </Slate>
}