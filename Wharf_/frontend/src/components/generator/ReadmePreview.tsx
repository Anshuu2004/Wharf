import { useState, useEffect, useRef } from 'react'
import { Card } from '../ui/Card'
import { 
FileText, Edit2, Eye, Split, Maximize2, Minimize2, Copy, Download, RefreshCw, Check, Type, Hash
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import 'github-markdown-css/github-markdown.css'
import 'katex/dist/katex.min.css'

// Mermaid Support
import mermaid from 'mermaid'

interface ReadmePreviewProps {
  content: string
  isGenerating?: boolean
  onContentChange?: (content: string) => void
}

type ViewMode = 'edit' | 'preview' | 'split'

export const ReadmePreview = ({ 
  content: initialContent, 
  isGenerating = false,
  onContentChange 
}: ReadmePreviewProps) => {
  const [content, setContent] = useState(initialContent)
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [mermaidRendered, setMermaidRendered] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)
  const previousInitialContent = useRef(initialContent)

  // Sync Content When Generation Updates
  useEffect(() => {
    if (previousInitialContent.current !== initialContent) {
      setContent(initialContent)
      previousInitialContent.current = initialContent
    }
  }, [initialContent])

  // Initialize Mermaid With Light Theme
  useEffect(() => {
    mermaid.initialize({
      theme: 'base',
      themeVariables: {
        background: '#ffffff',
        primaryColor: '#24292f',
        primaryBorderColor: '#d0d7de',
        primaryTextColor: '#24292f',
        lineColor: '#57606a',
        secondaryColor: '#f6f8fa',
        tertiaryColor: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
        fontSize: '14px',
        edgeLabelBackground: '#ffffff',
        nodeBorder: '#d0d7de',
        nodeTextColor: '#24292f',
        mainBkg: '#ffffff',
        nodeBackground: '#f6f8fa',
        nodeBorderColor: '#d0d7de',
        clusterBkg: '#f6f8fa',
        clusterBorder: '#d0d7de',
        defaultLinkColor: '#57606a',
        titleColor: '#24292f',
        edgeLabelColor: '#24292f',
        actorBorder: '#d0d7de',
        actorBkg: '#f6f8fa',
        actorTextColor: '#24292f',
        actorLineColor: '#57606a',
        signalColor: '#57606a',
        signalTextColor: '#24292f',
        labelBoxBkgColor: '#f6f8fa',
        labelBoxBorderColor: '#d0d7de',
        labelTextColor: '#24292f',
        loopTextColor: '#24292f',
        noteBorderColor: '#d0d7de',
        noteBkgColor: '#f6f8fa',
        noteTextColor: '#24292f',
        activationBorderColor: '#d0d7de',
        activationBkgColor: '#f6f8fa',
        sequenceNumberColor: '#24292f',
        sectionBkgColor: '#f6f8fa',
        altSectionBkgColor: '#f6f8fa',
        sectionBorderColor: '#d0d7de',
        sectionTextColor: '#24292f',
      },
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
      },
      securityLevel: 'loose',
    })
  }, [])

  // Render Mermaid Diagrams In Preview
  useEffect(() => {
    if (viewMode === 'edit') return

    const renderMermaid = async () => {
      if (!previewRef.current) return

      const mermaidElements =
        previewRef.current.querySelectorAll('.mermaid')

      if (mermaidElements.length === 0) {
        setMermaidRendered(false)
        return
      }

      try {
        let index = 0

        for (const element of mermaidElements) {
          const code = element.textContent || ''

          if (!code.trim()) continue

          try {
            element.removeAttribute('data-processed')

            const id = `mermaid-${Date.now()}-${index++}`

            const { svg } = await mermaid.render(id, code)

            element.innerHTML = svg
            element.classList.add('mermaid-rendered')
          } catch (error) {
            console.error('Mermaid render error:', error)

            element.innerHTML = `
              <div style="
                padding:16px;
                border:1px solid #d0d7de;
                background:#fff8f8;
                color:#cf222e;
                font-family:monospace;
                font-size:12px;
              ">
                Failed to render Mermaid diagram
              </div>
            `
          }
        }

        setMermaidRendered(true)
      } catch (error) {
        console.error(error)
      }
    }

    // Delay To Ensure DOM Is Ready
    const timeoutId = setTimeout(renderMermaid, 100)
    return () => clearTimeout(timeoutId)
  }, [content, viewMode, isFullscreen]) 

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    onContentChange?.(newContent)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'README.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  const viewModeOptions = [
    { id: 'edit', label: 'Edit', icon: Edit2 },
    { id: 'preview', label: 'Preview', icon: Eye },
    { id: 'split', label: 'Split', icon: Split },
  ] as const

  const markdownComponents = {
    code({ className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '')
      const language = match?.[1]

      // Mermaid
      if (language === 'mermaid') {
        return (
          <div
            className="mermaid my-4 overflow-x-auto"
            style={{
              background: '#ffffff',
              padding: '16px',
              border: '1px solid #d0d7de',
              borderRadius: '6px',
            }}
          >
            {String(children).replace(/\n$/, '')}
          </div>
        )
      }

      // Inline Code
      if (!className) {
        return (
          <code
            style={{
              backgroundColor: 'rgba(175,184,193,0.2)',
              color: '#24292f',
              padding: '0.2em 0.4em',
              borderRadius: '6px',
              fontSize: '85%',
              fontFamily:
                'ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,monospace',
            }}
            {...props}
          >
            {children}
          </code>
        )
      }

      // Code Blocks
      return (
        <SyntaxHighlighter
          style={oneLight}
          language={language || 'text'}
          PreTag="div"
          customStyle={{
            margin: '16px 0',
            borderRadius: '6px',
            border: '1px solid #d0d7de',
            background: '#f6f8fa',
            padding: '16px',
            fontSize: '14px',
          }}
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      )
    },

    a({ href, children, ...props }: any) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#0969da',
            textDecoration: 'none',
          }}
          {...props}
        >
          {children}
        </a>
      )
    },

    img({ src, alt, ...props }: any) {
      return (
        <img
          src={src}
          alt={alt}
          style={{
            maxWidth: '100%',
            height: 'auto',
          }}
          {...props}
        />
      )
    },

    pre({ children }: any) {
      return <>{children}</>
    },

    table({ children, ...props }: any) {
      return (
        <div className="overflow-x-auto my-4 border border-[#d0d7de] rounded-md">
          <table className="w-full border-collapse" {...props}>
            {children}
          </table>
        </div>
      )
    },

    thead({ children, ...props }: any) {
      return (
        <thead className="bg-[#f6f8fa]" {...props}>
          {children}
        </thead>
      )
    },

    th({ children, ...props }: any) {
      return (
        <th 
          className="border border-[#d0d7de] px-4 py-2 text-left font-semibold text-[#24292f]" 
          {...props}
        >
          {children}
        </th>
      )
    },

    td({ children, ...props }: any) {
      return (
        <td 
          className="border border-[#d0d7de] px-4 py-2 text-[#24292f] bg-white" 
          {...props}
        >
          {children}
        </td>
      )
    },

    ul({ children, ...props }: any) {
      return (
        <ul className="list-disc pl-6 my-3 space-y-1" {...props}>
          {children}
        </ul>
      )
    },

    ol({ children, ...props }: any) {
      return (
        <ol className="list-decimal pl-6 my-3 space-y-1" {...props}>
          {children}
        </ol>
      )
    },

    li({ children, ...props }: any) {
      return (
        <li className="mb-0.5 text-[#24292f]" {...props}>
          {children}
        </li>
      )
    },
  }

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-[999]' : ''}`}>
      <Card variant="hard" className={`
        overflow-x-hidden flex flex-col h-[600px] border-4 border-wharf-border-primary
        ${isFullscreen ? 'h-screen rounded-none border-0' : ''}
      `}>
        {/* Toolbar */}
        <div className="border-b-4 border-wharf-border-primary p-3 bg-wharf-surface-secondary flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-3">
            {/* Window Controls */}
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-wharf-error" />
              <div className="w-3 h-3 rounded-full bg-wharf-warning" />
              <div className="w-3 h-3 rounded-full bg-wharf-success" />
            </div>
            
            <span className="font-mono text-xs font-bold tracking-tight ml-2 text-wharf-text-secondary whitespace-nowrap">
              README.md
            </span>
            
            {isGenerating && (
              <span className="flex items-center gap-1.5 font-mono text-[10px] text-wharf-text-tertiary bg-wharf-surface-primary px-2 py-0.5 border border-wharf-border-secondary whitespace-nowrap">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Generating...
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Toggle */}
            <div className="flex border-2 border-wharf-border-primary overflow-hidden">
              {viewModeOptions.map((mode) => {
                const isActive = viewMode === mode.id
                const Icon = mode.icon
                return (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id)}
                    className={`
                      px-2.5 py-1 flex items-center gap-1.5 transition-all duration-200
                      ${isActive 
                        ? 'bg-wharf-text-primary text-wharf-surface-primary' 
                        : 'bg-wharf-surface-secondary hover:bg-wharf-surface-primary text-wharf-text-secondary'
                      }
                    `}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="font-mono text-[10px] font-bold hidden sm:inline">
                      {mode.label}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="w-px h-6 bg-wharf-border-secondary" />

            {/* Action Buttons */}
            <button
              onClick={handleCopy}
              className="p-1.5 border-2 border-wharf-border-primary bg-wharf-surface-primary hover:bg-wharf-surface-secondary transition-colors flex items-center gap-1.5"
            >
              {copied ? (
                <Check className="w-4 h-4 text-wharf-green" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              <span className="font-mono text-[10px] font-bold hidden sm:inline">
                {copied ? 'Copied!' : 'Copy'}
              </span>
            </button>

            <button
              onClick={handleDownload}
              className="p-1.5 border-2 border-wharf-border-primary bg-wharf-surface-primary hover:bg-wharf-surface-secondary transition-colors flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span className="font-mono text-[10px] font-bold hidden sm:inline">
                Download
              </span>
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 border-2 border-wharf-border-primary bg-wharf-surface-primary hover:bg-wharf-surface-secondary transition-colors"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Editor */}
          {(viewMode === 'edit') && (
            <div className={`
              flex flex-col relative
              ${viewMode === 'edit' ? 'w-full h-[400px] border-r-4 border-wharf-border-primary' : 'w-full'}
            `}>
              <div className="absolute top-0 right-0 p-2 opacity-50 z-10">
                <Edit2 className="w-4 h-4 text-wharf-text-tertiary" />
              </div>
              <textarea 
                className="w-full flex-1 p-4 bg-wharf-surface-primary outline-none resize-none font-mono text-sm text-wharf-text-primary custom-scrollbar overflow-y-auto"
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="# Your README content will appear here..."
                spellCheck={false}
              />
            </div>
          )}

          {(viewMode === 'split') && (
            <div className={`
              flex flex-col relative
              ${viewMode === 'split' ? 'w-1/2 border-r-4 border-wharf-border-primary' : 'w-full'}
            `}>
              <div className="absolute top-0 right-0 p-2 opacity-50 z-10">
                <Edit2 className="w-4 h-4 text-wharf-text-tertiary" />
              </div>
              <textarea 
                className="w-full flex-1 p-4 bg-wharf-surface-primary outline-none resize-none font-mono text-sm text-wharf-text-primary custom-scrollbar overflow-hidden"
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="# Your README content will appear here..."
                spellCheck={false}
              />
            </div>
          )}

          {/* Preview */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className={`
              flex flex-col relative bg-white
              ${viewMode === 'split' ? 'w-1/2' : 'w-full'}
            `}>
              <div className="absolute top-0 right-0 p-2 opacity-50 z-10">
                <Eye className="w-4 h-4 text-wharf-text-tertiary" />
              </div>
              
              <div 
                ref={previewRef}
                className="markdown-body github-readme-preview overflow-y-auto"
                style={{
                  backgroundColor: '#ffffff',
                  color: '#24292f',
                  padding: '24px',
                  maxWidth: '100%',
                  flex: 1,
                }}
              >
                {content ? (
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm, remarkMath]} 
                    rehypePlugins={[rehypeRaw, rehypeKatex]}
                    components={markdownComponents}
                  >
                    {content}
                  </ReactMarkdown>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-wharf-text-tertiary opacity-60">
                    <FileText className="w-16 h-16 mb-4" />
                    <p className="font-mono text-base font-bold">No content to preview</p>
                    <p className="font-mono text-sm mt-1">Generate documentation or start typing in the editor</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="border-t-4 border-wharf-border-primary p-2 bg-wharf-surface-secondary flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] text-wharf-text-tertiary whitespace-nowrap flex items-center gap-1.5">
              <FileText className="w-3 h-3" />
              Lines: {content.split('\n').length}
            </span>
            <span className="font-mono text-[10px] text-wharf-text-tertiary whitespace-nowrap flex items-center gap-1.5">
              <Type className="w-3 h-3" />
              Characters: {content.length}
            </span>
            <span className="font-mono text-[10px] text-wharf-text-tertiary hidden sm:inline whitespace-nowrap flex items-center gap-1.5">
              <Hash className="w-3 h-3" />
              Words: {content.split(/\s+/).filter(Boolean).length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-wharf-text-tertiary whitespace-nowrap flex items-center gap-1.5">
              {viewMode === 'edit' ? (
                <>
                  <Edit2 className="w-3 h-3" />
                  Editing
                </>
              ) : viewMode === 'preview' ? (
                <>
                  <Eye className="w-3 h-3" />
                  Preview
                </>
              ) : (
                <>
                  <Split className="w-3 h-3" />
                  Split View
                </>
              )}
            </span>
            {mermaidRendered && (
              <span className="font-mono text-[10px] text-wharf-green flex items-center gap-1 whitespace-nowrap">
                <Check className="w-3 h-3" />
                Mermaid ✓
              </span>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}