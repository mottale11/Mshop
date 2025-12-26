'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';

// Import Jodit safely for SSR
const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false });

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const config = useMemo(() => ({
        readonly: false,
        placeholder: placeholder || 'Start typings...',
        height: 300,
        buttons: [
            'bold', 'italic', 'underline', 'strikethrough', '|',
            'font', 'fontsize', 'brush', 'paragraph', '|',
            'ul', 'ol', '|',
            'outdent', 'indent', '|',
            'align', '|',
            'image', 'table', 'link', '|',
            'undo', 'redo', '|',
            'fullsize', 'preview' // 'source' can be added if HTML edit is needed
        ],
        showCharsCounter: false,
        showWordsCounter: false,
        showXPathInStatusbar: false
    }), [placeholder]);

    return (
        <div style={{ backgroundColor: 'white', color: 'black' }}>
            <JoditEditor
                value={value}
                config={config}
                onBlur={(newContent) => onChange(newContent)} // Use onBlur for performance or onChange for real-time
                onChange={() => { }} // Empty onChange to prevent readonly issue warnings in some versions, relying on onBlur for state update primarily or you can use it.
            // Actually Jodit's onBlur is safer for performance, but onChange is fine for small text.
            // Let's use onBlur for the main state update to avoid re-rendering loop issues with Jodit in React sometimes.
            />
        </div>
    );
}
