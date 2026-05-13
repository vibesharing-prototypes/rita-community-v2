import { Box, Button, Stack, Typography } from "@mui/material";
import InfoIcon from "@diligentcorp/atlas-react-bundle/icons/Info";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor, Bold, Italic, Underline, Strikethrough,
  List, Link, Essentials, Paragraph,
  Heading, Indent, IndentBlock, BlockQuote, Undo,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";
import "./RichTextField.css";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";

/**
 * Shared rich-text inline editor used by the agenda item panel and the
 * meeting detail description. Displays HTML content in read mode; clicking
 * the body opens a CKEditor. Exits only via explicit Save / Cancel (or via
 * the imperative handle below) — clicking elsewhere on the page no longer
 * auto-commits, so callers can fully control the "leaving with unsaved
 * changes" experience.
 */

const ckEditorConfig = {
  plugins: [
    Essentials, Paragraph, Heading, Bold, Italic, Underline, Strikethrough,
    List, Link, Indent, IndentBlock, BlockQuote, Undo,
  ],
  toolbar: {
    items: ["bold", "italic", "underline", "strikethrough", "|", "bulletedList", "numberedList", "|", "outdent", "indent", "|", "link", "blockQuote", "|", "undo", "redo"],
  },
  licenseKey: "GPL",
};

export type RichTextFieldHandle = {
  /** True while the CKEditor is open. */
  isEditing: () => boolean;
  /** True when the editor is open and content has changed since open. */
  isDirty: () => boolean;
  /** Commit the current editor content and close. No-op if not editing. */
  save: () => void;
  /** Discard any in-progress edits and close. No-op if not editing. */
  discard: () => void;
};

type Props = {
  value: string;
  onSave: (v: string) => void;
  placeholder: string;
  onEditingChange?: (isEditing: boolean) => void;
  onDirtyChange?: (isDirty: boolean) => void;
};

const RichTextField = forwardRef<RichTextFieldHandle, Props>(function RichTextField(
  { value, onSave, placeholder, onEditingChange, onDirtyChange },
  ref,
) {
  const [isEditing, setIsEditing] = useState(false);
  const editorRef = useRef<InstanceType<typeof ClassicEditor> | null>(null);
  // Mirror the open / dirty state into refs so the imperative handle reads
  // the latest values regardless of re-render timing.
  const isEditingRef = useRef(false);
  const isDirtyRef = useRef(false);

  const setEditingFlag = (next: boolean) => {
    isEditingRef.current = next;
    setIsEditing(next);
    onEditingChange?.(next);
  };

  const setDirtyFlag = (next: boolean) => {
    if (isDirtyRef.current === next) return;
    isDirtyRef.current = next;
    onDirtyChange?.(next);
  };

  const closeEditor = () => {
    setDirtyFlag(false);
    setEditingFlag(false);
  };

  const handleSave = () => {
    if (!isEditingRef.current) return;
    const data = editorRef.current?.getData() ?? value;
    if (data !== value) onSave(data);
    closeEditor();
  };

  const handleCancel = () => {
    if (!isEditingRef.current) return;
    closeEditor();
  };

  useImperativeHandle(ref, () => ({
    isEditing: () => isEditingRef.current,
    isDirty: () => isDirtyRef.current,
    save: handleSave,
    discard: handleCancel,
  // handlers close over component state via refs; stable identity is fine.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  if (!isEditing) {
    const isEmpty = !value || value === "<p></p>" || value === "<p>&nbsp;</p>" || value.trim() === "";
    return (
      <Box
        onClick={() => setEditingFlag(true)}
        sx={{
          cursor: "text",
          minHeight: 22,
          borderRadius: "4px",
          py: "2px",
          px: "4px",
          mx: "-4px",
          fontSize: 'var(--lens-semantic-font-text-body-font-size)',
          lineHeight: 'var(--lens-semantic-font-text-body-line-height)',
          fontFamily: "inherit",
          "&:hover": { backgroundColor: "action.hover" },
          "& p": { margin: 0, fontSize: 'var(--lens-semantic-font-text-body-font-size)', lineHeight: 'var(--lens-semantic-font-text-body-line-height)', fontFamily: "inherit" },
          "& p + p, & p + ul, & p + ol, & ul + p, & ol + p": { marginTop: "8px" },
          "& ul, & ol": { mt: 0, mb: 0, pl: "20px", fontSize: 'var(--lens-semantic-font-text-body-font-size)', lineHeight: 'var(--lens-semantic-font-text-body-line-height)' },
          "& li": { fontSize: 'var(--lens-semantic-font-text-body-font-size)', lineHeight: 'var(--lens-semantic-font-text-body-line-height)' },
          "& a": { color: "primary.main" },
          "& strong": { fontWeight: 'var(--lens-core-font-weight-semi-bold)' },
          "& blockquote": { borderLeft: "3px solid", borderColor: "divider", pl: 1, ml: 0, my: "4px" },
        }}
      >
        {isEmpty ? (
          <Typography sx={{ fontSize: 'var(--lens-semantic-font-text-body-font-size)', lineHeight: 'var(--lens-semantic-font-text-body-line-height)', color: "text.disabled", fontStyle: "italic" }}>
            {placeholder}
          </Typography>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: value }} />
        )}
      </Box>
    );
  }

  return (
    <Box
      className="rich-text-field"
      sx={{
        "& .ck-editor__editable": { minHeight: "80px", fontSize: 'var(--lens-semantic-font-text-body-font-size)', fontFamily: "inherit" },
        "& .ck.ck-editor__main>.ck-editor__editable": { borderRadius: "0 0 4px 4px" },
        "& .ck.ck-toolbar": { borderRadius: "4px 4px 0 0" },
      }}
    >
      <CKEditor
        editor={ClassicEditor}
        config={ckEditorConfig}
        data={value}
        onReady={(editor) => {
          editorRef.current = editor as InstanceType<typeof ClassicEditor>;
          editor.focus();
        }}
        onChange={(_event, editor) => {
          // Mark dirty as soon as the document drifts from its opening value.
          const data = (editor as InstanceType<typeof ClassicEditor>).getData();
          setDirtyFlag(data !== value);
        }}
      />

      {/* Lock notice + explicit Save / Cancel.
          Buttons use onMouseDown (with preventDefault) so they don't steal
          focus from the editor before we read its data on save. */}
      <Stack
        direction="row"
        alignItems="center"
        gap={1}
        sx={{ mt: "8px" }}
      >
        <Stack direction="row" alignItems="center" gap="6px" sx={{ flex: 1, minWidth: 0, color: "var(--lens-semantic-color-type-muted)" }}>
          <InfoIcon style={{ width: 20, height: 20, flexShrink: 0, color: "var(--lens-semantic-color-type-muted)" }} />
          <Typography sx={{
            fontSize: 'var(--lens-semantic-font-text-md-font-size)',
            lineHeight: 'var(--lens-semantic-font-text-md-line-height)',
            letterSpacing: 'var(--lens-semantic-letter-spacing-sm)',
            color: "inherit",
          }}>
            Content is locked for other users while editing.
          </Typography>
        </Stack>

        <Button
          size="small"
          variant="text"
          onMouseDown={(e) => { e.preventDefault(); handleCancel(); }}
        >
          Cancel
        </Button>
        <Button
          size="small"
          variant="contained"
          onMouseDown={(e) => { e.preventDefault(); handleSave(); }}
        >
          Save
        </Button>
      </Stack>
    </Box>
  );
});

export default RichTextField;
