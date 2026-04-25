import { useState } from 'react'
import { 
  Button, 
  Input, 
  Badge, 
  Card, 
  Modal, 
  Spinner, 
  Tabs, 
  Tooltip,
  ToastProvider,
  useToast 
} from '../components/ui'
import type { TabItem } from '../components/ui'

// Separate component that uses useToast
const ToastDemo = () => {
  const { showToast } = useToast()

  return (
    <div className="flex gap-4 flex-wrap">
      <Button onClick={() => showToast('Success! Your action was completed.', 'success')}>
        Show Success Toast
      </Button>
      <Button variant="danger" onClick={() => showToast('Error! Something went wrong.', 'error')}>
        Show Error Toast
      </Button>
      <Button variant="secondary" onClick={() => showToast('Warning! Check your input.', 'warning')}>
        Show Warning Toast
      </Button>
      <Button variant="ghost" onClick={() => showToast('Info: New update available.', 'info')}>
        Show Info Toast
      </Button>
    </div>
  )
}

const ComponentPlayground = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [inputError, setInputError] = useState('')

  // Tabs configuration
  const tabs: TabItem[] = [
    {
  id: 'buttons',
  label: 'Buttons',
  content: (
    <div className="space-y-8">
      {/* Primary Variants */}
      <div>
        <h3 className="font-display font-black text-xl mb-4">Button Variants</h3>
        <div className="flex gap-4 flex-wrap">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="success">Success</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="warning">Warning</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="gradient">Gradient ✨</Button>
        </div>
      </div>
      
      {/* Sizes */}
      <div>
        <h3 className="font-display font-black text-xl mb-4">Button Sizes</h3>
        <div className="flex gap-4 items-center flex-wrap">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </div>
      
      {/* With Icons */}
      <div>
        <h3 className="font-display font-black text-xl mb-4">With Icons</h3>
        <div className="flex gap-4 flex-wrap">
          <Button icon={<span>📁</span>}>Generate README</Button>
          <Button variant="success" icon={<span>✓</span>} iconPosition="right">
            Saved
          </Button>
          <Button variant="danger" icon={<span>🗑️</span>}>
            Delete
          </Button>
          <Button variant="gradient" icon={<span>✨</span>}>
            Magic
          </Button>
        </div>
      </div>
      
      {/* States */}
      <div>
        <h3 className="font-display font-black text-xl mb-4">Button States</h3>
        <div className="flex gap-4 flex-wrap">
          <Button loading>Generating...</Button>
          <Button disabled>Disabled</Button>
          <Button fullWidth>Full Width Button</Button>
        </div>
      </div>
      
      {/* CTA Example */}
      <div>
        <h3 className="font-display font-black text-xl mb-4">Call to Action Examples</h3>
        <div className="flex gap-4 flex-wrap">
          <Button variant="gradient" size="lg" icon={<span>🚀</span>}>
            Deploy Now
          </Button>
          <Button variant="primary" size="lg">
            Get Started
          </Button>
          <Button variant="outline" size="lg">
            Learn More
          </Button>
        </div>
      </div>
    </div>
  ),
},
    {
      id: 'inputs',
      label: 'Inputs',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="font-display font-black text-xl mb-4">Basic Inputs</h3>
            <div className="space-y-4 max-w-md">
              <Input 
                label="Username" 
                placeholder="Enter username"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Input 
                label="Email" 
                type="email" 
                placeholder="user@example.com"
              />
              <Input 
                label="Password" 
                type="password" 
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <div>
            <h3 className="font-display font-black text-xl mb-4">Input States</h3>
            <div className="space-y-4 max-w-md">
              <Input 
                label="Error State" 
                placeholder="This has an error"
                error={inputError || "This field is required"}
                onChange={(e) => {
                  setInputError('')
                  setInputValue(e.target.value)
                }}
              />
              <Input 
                label="With Icon" 
                icon={<span>🔍</span>}
                placeholder="Search..."
              />
              <Input 
                label="Disabled" 
                disabled 
                value="Disabled input"
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'badges',
      label: 'Badges',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="font-display font-black text-xl mb-4">Badge Variants</h3>
            <div className="flex gap-4 flex-wrap">
              <Badge variant="teal">Teal</Badge>
              <Badge variant="coral">Coral</Badge>
              <Badge variant="lavender">Lavender</Badge>
              <Badge variant="gold">Gold</Badge>
              <Badge variant="default">Default</Badge>
            </div>
          </div>
          
          <div>
            <h3 className="font-display font-black text-xl mb-4">Badge Sizes</h3>
            <div className="flex gap-4 items-center flex-wrap">
              <Badge size="sm">Small</Badge>
              <Badge size="md">Medium</Badge>
            </div>
          </div>
          
          <div>
            <h3 className="font-display font-black text-xl mb-4">Badges with Icons</h3>
            <div className="flex gap-4 flex-wrap">
              <Badge variant="teal" icon={<span>✓</span>}>Success</Badge>
              <Badge variant="coral" icon={<span>✗</span>}>Error</Badge>
              <Badge variant="gold" icon={<span>⭐</span>}>Featured</Badge>
            </div>
          </div>
          
          <div>
            <h3 className="font-display font-black text-xl mb-4">Tech Stack Example</h3>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="teal">React</Badge>
              <Badge variant="coral">TypeScript</Badge>
              <Badge variant="lavender">Tailwind</Badge>
              <Badge variant="gold">Vite</Badge>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'cards',
      label: 'Cards',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card variant="default">
              <h3 className="font-display font-black text-xl mb-2">Default Card</h3>
              <p className="text-wharf-text-secondary">This is a standard card with no shadow.</p>
            </Card>
            
            <Card variant="hard">
              <h3 className="font-display font-black text-xl mb-2">Hard Shadow Card</h3>
              <p className="text-wharf-text-secondary">This card has the brutalist hard shadow.</p>
            </Card>
            
            <Card variant="hard-sm" hoverable>
              <h3 className="font-display font-black text-xl mb-2">Hoverable Card</h3>
              <p className="text-wharf-text-secondary">Hover over me — I move and lose shadow!</p>
            </Card>
            
            <Card 
              header={<span className="font-black">Custom Header</span>}
              footer={<Button size="sm">Action</Button>}
            >
              <p className="text-wharf-text-secondary">Card with custom header and footer sections.</p>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: 'modals',
      label: 'Modals',
      content: (
        <div className="space-y-6">
          <Button onClick={() => setIsModalOpen(true)}>
            Open Modal
          </Button>
          
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Modal Title"
            size="md"
          >
            <div className="space-y-4">
              <p>This is a brutalist modal window.</p>
              <p>It has hard shadows, sharp borders, and no rounded corners.</p>
              <Input placeholder="Example input inside modal" />
            </div>
          </Modal>
        </div>
      ),
    },
    {
      id: 'spinners',
      label: 'Spinners',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="font-display font-black text-xl mb-4">Spinner Sizes</h3>
            <div className="flex gap-8 items-center">
              <Spinner size="sm" />
              <Spinner size="md" />
              <Spinner size="lg" />
            </div>
          </div>
          
          <div>
            <h3 className="font-display font-black text-xl mb-4">Spinner Variants</h3>
            <div className="flex gap-8 items-center">
              <Spinner variant="teal" />
              <Spinner variant="coral" />
              <Spinner variant="lavender" />
              <Spinner variant="gold" />
            </div>
          </div>
          
          <div>
            <h3 className="font-display font-black text-xl mb-4">Loading States</h3>
            <div className="flex gap-4">
              <Button loading>Loading</Button>
              <div className="flex items-center gap-3">
                <Spinner size="sm" />
                <span className="font-mono text-sm">Fetching data...</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'tooltips',
      label: 'Tooltips',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="font-display font-black text-xl mb-4">Tooltip Positions</h3>
            <div className="flex gap-8 items-center justify-center py-12">
              <Tooltip content="Top tooltip" position="top">
                <Button size="sm">Top</Button>
              </Tooltip>
              <Tooltip content="Bottom tooltip" position="bottom">
                <Button size="sm">Bottom</Button>
              </Tooltip>
              <Tooltip content="Left tooltip" position="left">
                <Button size="sm">Left</Button>
              </Tooltip>
              <Tooltip content="Right tooltip" position="right">
                <Button size="sm">Right</Button>
              </Tooltip>
            </div>
          </div>
          
          <div>
            <h3 className="font-display font-black text-xl mb-4">Real World Examples</h3>
            <div className="flex gap-4 items-center">
              <Tooltip content="Generate documentation for this repo">
                <Badge variant="teal" className="cursor-help">README.md</Badge>
              </Tooltip>
              <Tooltip content="View health score breakdown">
                <Badge variant="coral" className="cursor-help">Health: 85%</Badge>
              </Tooltip>
              <Tooltip content="Click to copy to clipboard">
                <Button size="sm" variant="secondary">Copy</Button>
              </Tooltip>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'toasts',
      label: 'Toasts',
      content: <ToastDemo />,
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b-4 border-wharf-border-primary bg-wharf-surface-secondary sticky top-0 z-50">
        <div className="container py-6">
          <h1 className="font-display font-black text-4xl tracking-tighter">
            WHARF <span className="text-wharf-teal">UI Playground</span>
          </h1>
          <p className="font-mono text-sm text-wharf-text-secondary mt-2">
            Component testing and visual regression — Neo-brutalist design system
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        <Tabs tabs={tabs} defaultTabId="buttons" />
      </div>

      {/* Footer */}
      <div className="border-t-4 border-wharf-border-primary bg-wharf-surface-secondary mt-8">
        <div className="container py-4 text-center">
          <p className="font-mono text-xs text-wharf-text-tertiary">
            Built with React + TypeScript + Tailwind CSS v4
          </p>
        </div>
      </div>
    </div>
  )
}

// Wrapper with ToastProvider
const ComponentPlaygroundWithProvider = () => {
  return (
    <ToastProvider>
      <ComponentPlayground />
    </ToastProvider>
  )
}

export default ComponentPlaygroundWithProvider