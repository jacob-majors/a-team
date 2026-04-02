'use client'

import { useState } from 'react'
import { Send, Plus } from 'lucide-react'
import { cn } from '@a-team/utils'

const channels = [
  { id: '1', name: 'all-team', description: 'Everyone' },
  { id: '2', name: 'coaches', description: 'Coaches only' },
  { id: '3', name: 'riders', description: 'Athletes' },
  { id: '4', name: 'parents', description: 'Parent communication' },
  { id: '5', name: 'race-day', description: 'Race coordination' },
]

const messages = [
  { id: '1', user: 'Coach Rivera', avatar: 'CR', content: "Don't forget — Saturday practice starts at 9 AM sharp. Bring water and snacks!", time: '10:32 AM', mine: false },
  { id: '2', user: 'Alex Chen', avatar: 'AC', content: 'Will there be a shuttle?', time: '10:45 AM', mine: false },
  { id: '3', user: 'You', avatar: 'ME', content: 'I can drive 3 kids if needed', time: '11:01 AM', mine: true },
  { id: '4', user: 'Coach Rivera', avatar: 'CR', content: 'Thanks! Please sign up in the volunteer section 🙌', time: '11:03 AM', mine: false },
  { id: '5', user: 'Maya Johnson', avatar: 'MJ', content: 'Excited for Saturday!!', time: '11:15 AM', mine: false },
]

export default function ChatPage() {
  const [activeChannel, setActiveChannel] = useState(channels[0]!)
  const [input, setInput] = useState('')

  return (
    <div className="flex h-[calc(100vh-9rem)] gap-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Channel list */}
      <div className="flex w-56 shrink-0 flex-col border-r border-gray-200">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <span className="font-semibold text-gray-900 text-sm">Channels</span>
          <button className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => setActiveChannel(channel)}
              className={cn(
                'w-full px-4 py-2.5 text-left transition-colors',
                activeChannel.id === channel.id
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              <p className="text-sm font-medium"># {channel.name}</p>
              <p className="text-xs text-gray-400">{channel.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex flex-1 flex-col min-w-0">
        <div className="border-b border-gray-200 px-6 py-3">
          <h2 className="font-semibold text-gray-900"># {activeChannel.name}</h2>
          <p className="text-xs text-gray-500">{activeChannel.description}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={cn('flex gap-3', msg.mine && 'flex-row-reverse')}>
              <div className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                msg.mine ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'
              )}>
                {msg.avatar}
              </div>
              <div className={cn('max-w-sm', msg.mine && 'items-end flex flex-col')}>
                <div className={cn('flex items-baseline gap-2', msg.mine && 'flex-row-reverse')}>
                  <span className="text-xs font-medium text-gray-700">{msg.user}</span>
                  <span className="text-xs text-gray-400">{msg.time}</span>
                </div>
                <div className={cn(
                  'mt-1 rounded-2xl px-3.5 py-2 text-sm',
                  msg.mine
                    ? 'bg-orange-500 text-white rounded-tr-sm'
                    : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                )}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 px-4 py-3">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Message #${activeChannel.name}...`}
              className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-400"
              onKeyDown={(e) => e.key === 'Enter' && setInput('')}
            />
            <button
              onClick={() => setInput('')}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white transition hover:bg-orange-600 disabled:opacity-40"
              disabled={!input.trim()}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
