import { useState, useEffect } from 'react'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { FileText, Clock, Trash } from 'lucide-react'
import api from '../../lib/api'

export const ProfileHistoryView = ({ onSelect }: { onSelect?: (content: string) => void }) => {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/profile/history')
        if (res.data?.success) {
          const historicalData = res.data.data;
          setHistory(Array.isArray(historicalData) ? historicalData : []);
        }
      } catch (err) {
        console.error('Failed to fetch profile history:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/profile/${id}`)
      setHistory(h => h.filter(item => item.id !== id))
    } catch (err) {
      console.error('Failed to delete history item:', err)
    }
  }

  if (loading) {
    return <div className="text-center py-12 font-mono text-wharf-text-tertiary">Loading history...</div>
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-wharf-text-tertiary mx-auto mb-4 opacity-50" />
        <h3 className="font-display font-black text-xl tracking-tighter">No History Yet</h3>
        <p className="font-mono text-sm text-wharf-text-tertiary mt-2">
          Your generated profile READMEs will appear here
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {history.map((item) => (
        <Card key={item.id} variant="hard-sm" className="p-4 hover:translate-y-[-2px] transition-all">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="font-display font-black text-lg">@{item.username}</h4>
              <p className="font-mono text-xs text-wharf-text-tertiary flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3" />
                {new Date(item.generatedAt).toLocaleDateString()}
              </p>
            </div>
            <Badge variant="cyan" size="sm">{item.template}</Badge>
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t-2 border-wharf-border-secondary">
            {onSelect && (
              <Button variant="ghost" size="sm" onClick={() => onSelect(item.content)}>
                View Content
              </Button>
            )}
            <button 
              onClick={() => handleDelete(item.id)}
              className="p-2 text-wharf-text-tertiary hover:text-wharf-error transition-colors"
            >
              <Trash className="w-4 h-4" />
            </button>
          </div>
        </Card>
      ))}
    </div>
  )
}
