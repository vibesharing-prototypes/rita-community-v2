import { Box, Typography } from "@mui/material";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor, Bold, Italic, Underline, Strikethrough,
  List, Link, Essentials, Paragraph,
  Heading, Indent, IndentBlock, BlockQuote, Undo,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";
import "./RichTextField.css";
import { useRef, useState } from "react";

/**
 * Shared rich-text inline editor used by the agenda item panel and the
 * meeting detail description. Displays HTML content in read mode and opens
 * a CKEditor on click; saves on blur outside the editor / its balloons.
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

export default function RichTextField({
  value, onSave, placeholder,
}: { value: string; onSave: (v: string) => void; placeholder: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<InstanceType<typeof ClassicEditor> | null>(null);

  const handleBlur = (_event: unknown, editor: InstanceType<typeof ClassicEditor>) => {
    // Delay so toolbar balloon clicks don't prematurely close the editor.
    setTimeout(() => {
      if (wrapperRef.current && !wrapperRef.current.contains(document.activeElement)) {
        const data = editor.getData();
        if (data !== value) onSave(data);
        setIsEditing(false);
      }
    }, 150);
  };

  if (!isEditing) {
    const isEmpty = !value || value === "<p></p>" || value === "<p>&nbsp;</p>" || value.trim() === "";
    return (
      <Box
        onClick={() => setIsEditing(true)}
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
      ref={wrapperRef}
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
        onBlur={handleBlur as Parameters<typeof CKEditor>[0]["onBlur"]}
      />
    </Box>
  );
}
