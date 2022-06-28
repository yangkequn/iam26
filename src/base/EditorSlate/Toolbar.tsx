
import React, { Ref, PropsWithChildren } from "react";
import { Editor, Transforms, Element as SlateElement, } from 'slate'

//import { Button, Icon, Toolbar } from './Component'
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import CodeIcon from '@mui/icons-material/Code';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import LooksOneIcon from '@mui/icons-material/LooksOne';
import LooksTwoIcon from '@mui/icons-material/LooksTwo';
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';
import { cx, css } from '@emotion/css'
import { CustomElement } from "./index"

export const Button = React.forwardRef(
    ({ className, active, reversed, ...props }: PropsWithChildren<{ className: string, active: boolean, reversed: boolean, [key: string]: unknown }>, ref: Ref<HTMLSpanElement> | null) => (
        <span            {...props} ref={ref} className={cx(className,
            css`cursor: pointer;
          color: ${reversed
                    ? active
                        ? 'white'
                        : '#aaa'
                    : active
                        ? 'black'
                        : '#ccc'};
        `
        )}
        />
    )
)
export const Icon = React.forwardRef(({ className, ...props }: PropsWithChildren<{ className: string, [key: string]: unknown }>, ref: Ref<HTMLSpanElement> | null) =>
    <span {...props} ref={ref} className={cx('material-icons', className, css`font-size: 18px;vertical-align: text-bottom;`)} />
)
export const Menu = React.forwardRef(({ className, ...props }: PropsWithChildren<{ className: string, [key: string]: unknown }>, ref: Ref<HTMLDivElement> | null) => 
    <div {...props} ref={ref} className={cx(className, css`& > * {
            display: inline-block;
        }
        & > * + * {
            margin-left: 15px;
          }`)} />
)
export const Toolbar = React.forwardRef(({ className, ...props }: PropsWithChildren<{ className: string, [key: string]: unknown }>, ref: Ref<HTMLDivElement> | null) =>
    <Menu {...props} ref={ref} className={cx(className, css`position: relative; padding: 1px 18px 0px 10px; border-bottom: 2px solid #eee; margin-bottom: 10px; `)}
    />
)
export const MarkButton = ({ format, icon, editor }: { format: string, icon: any, editor: Editor }) => {
    return (
        <Button active={isMarkActive(editor, format)} onMouseDown={(event: any) => { event.preventDefault(); toggleMark(editor, format) }}      >
            <Icon>{icon}</Icon>
        </Button>
    )
}
export const BlockButton = ({ format, icon, editor }: { format: string, icon: any, editor: Editor }) => {
    return <Button active={isBlockActive(editor, format)}
        onMouseDown={(event: any) => { event.preventDefault(); toggleBlock(editor, format) }}      >
        <Icon>{icon}</Icon>
    </Button>
}

const isBlockActive = (editor: Editor, format: any) => {
    const { selection } = editor
    if (!selection) return false
    const blockType = TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type'
    const [match] = Array.from(
        Editor.nodes(editor, {
            at: Editor.unhangRange(editor, selection),
            match: (n: any) => !Editor.isEditor(n) && SlateElement.isElement(n) && n[blockType] === format,
        })
    )

    return !!match
}

const isMarkActive = (editor: Editor, format: string) => {
    const marks: any = Editor.marks(editor)
    return marks ? marks[format] === true : false
}

const toggleBlock = (editor: Editor, format: string) => {
    const isActive: boolean = isBlockActive(editor, format)
    const isList: boolean = LIST_TYPES.includes(format)

    Transforms.unwrapNodes(editor, {
        match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && LIST_TYPES.includes(n.type) && !TEXT_ALIGN_TYPES.includes(format),
        split: true,
    })
    //let newProperties: Partial<SlateElement>
    let newProperties: any = { type: format }
    if (TEXT_ALIGN_TYPES.includes(format)) {
        newProperties = { align: isActive ? undefined : format, }
    } else {
        newProperties = { type: isActive ? 'paragraph' : isList ? 'list-item' : format, }
    }
    Transforms.setNodes<SlateElement>(editor, newProperties)

    if (!isActive && isList) {
        const block: any = { type: format, children: [] }
        Transforms.wrapNodes(editor, block)
    }
}

export const toggleMark = (editor: Editor, format: string) => {
    const isActive = isMarkActive(editor, format)

    if (isActive) Editor.removeMark(editor, format)
    else Editor.addMark(editor, format, true)
}

const LIST_TYPES = ['numbered-list', 'bulleted-list']
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify']

export const ToolbarComponent = ({ editor }: { editor: Editor }): JSX.Element => (<Toolbar>
    <MarkButton format="bold" icon={<FormatBoldIcon />} editor={editor} />
    <MarkButton format="italic" icon={<FormatItalicIcon></FormatItalicIcon>} editor={editor} />
    <MarkButton format="underline" icon={<FormatUnderlinedIcon />} editor={editor} />
    <MarkButton format="code" icon={<CodeIcon />} editor={editor} />
    <BlockButton format="heading-one" icon={<LooksOneIcon />} editor={editor} />
    <BlockButton format="heading-two" icon={<LooksTwoIcon />} editor={editor} />
    <BlockButton format="block-quote" icon={<FormatQuoteIcon />} editor={editor} />
    <BlockButton format="numbered-list" icon={<FormatListNumberedIcon />} editor={editor} />
    <BlockButton format="bulleted-list" icon={<FormatListBulletedIcon />} editor={editor} />
    <BlockButton format="left" icon={<FormatAlignLeftIcon />} editor={editor} />
    <BlockButton format="center" icon={<FormatAlignCenterIcon />} editor={editor} />
    <BlockButton format="right" icon={<FormatAlignRightIcon />} editor={editor} />
    <BlockButton format="justify" icon={<FormatAlignJustifyIcon />} editor={editor} />
</Toolbar>)

export const ToolBarO = ({ editor }: { editor: Editor }) => <Toolbar>
    <MarkButton format="bold" icon="format_bold" editor={editor} />
    <MarkButton format="italic" icon="format_italic" editor={editor} />
    <MarkButton format="underline" icon="format_underlined" editor={editor} />
    <MarkButton format="code" icon="code" editor={editor} />
    <BlockButton format="heading-one" icon="looks_one" editor={editor} />
    <BlockButton format="heading-two" icon="looks_two" editor={editor} />
    <BlockButton format="block-quote" icon="format_quote" editor={editor} />
    <BlockButton format="numbered-list" icon="format_list_numbered" editor={editor} />
    <BlockButton format="bulleted-list" icon="format_list_bulleted" editor={editor} />
</Toolbar>