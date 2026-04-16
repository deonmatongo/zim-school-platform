'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { messagesApi, teachersApi, parentApi } from '@/lib/api/client'
import { toast } from 'sonner'
import {
  MessageCircle, Send, Plus, Loader2, ArrowLeft,
  Search, ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

interface Message {
  id: string; thread_id: string; body: string; created_at: string; read_at: string | null
  sender: { id: string; first_name: string; last_name: string; role: string }
  recipient: { id: string; first_name: string; last_name: string; role: string }
  student: { id: string; first_name: string; last_name: string } | null
}

interface Thread {
  thread_id: string
  other: { id: string; first_name: string; last_name: string; role: string }
  student: { id: string; first_name: string; last_name: string } | null
  lastMsg: Message
  messages: Message[]
  unread: number
}

function buildThreads(messages: Message[], currentUserId: string): Thread[] {
  const map: Record<string, Thread> = {}
  for (const msg of messages) {
    const other = msg.sender.id === currentUserId ? msg.recipient : msg.sender
    if (!map[msg.thread_id]) {
      map[msg.thread_id] = { thread_id: msg.thread_id, other, student: msg.student, lastMsg: msg, messages: [], unread: 0 }
    }
    map[msg.thread_id].messages.push(msg)
    map[msg.thread_id].lastMsg = msg
    if (!msg.read_at && msg.sender.id !== currentUserId) map[msg.thread_id].unread++
  }
  return Object.values(map).sort((a, b) => b.lastMsg.created_at.localeCompare(a.lastMsg.created_at))
}

function MessagesContent() {
  const searchParams = useSearchParams()
  const initialThread = searchParams.get('thread')

  const [messages, setMessages] = useState<Message[]>([])
  const [threads, setThreads] = useState<Thread[]>([])
  const [activeThread, setActiveThread] = useState<string | null>(initialThread)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState('dev-parent')

  // For new message dialog
  const [composeOpen, setComposeOpen] = useState(false)
  const [teachers, setTeachers] = useState<{ id: string; first_name: string; last_name: string }[]>([])
  const [children, setChildren] = useState<{ students: { id: string; first_name: string; last_name: string } }[]>([])
  const [composeForm, setComposeForm] = useState({ recipient_id: '', student_id: '', body: '' })
  const [composing, setComposing] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // In dev mode the parent's id comes from x-user-id header set by middleware
    // We detect by checking which mock data we're getting
    messagesApi.list().then(res => {
      const msgs = (res.data as Message[]) ?? []
      setMessages(msgs)
      // Infer current user from messages (first sender that appears as a parent)
      const parentMsg = msgs.find(m => m.sender.role === 'parent')
      if (parentMsg) setCurrentUserId(parentMsg.sender.id)
      setLoading(false)
    })
    // Load teachers and children for compose dialog
    Promise.all([teachersApi.list(), parentApi.children()]).then(([t, c]) => {
      setTeachers((t.data as any[]) ?? [])
      setChildren((c.data as any[]) ?? [])
    })
  }, [])

  useEffect(() => {
    setThreads(buildThreads(messages, currentUserId))
  }, [messages, currentUserId])

  useEffect(() => {
    if (threads.length > 0 && !activeThread) {
      setActiveThread(threads[0].thread_id)
    }
  }, [threads, activeThread])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeThread, threads])

  const activeThreadData = threads.find(t => t.thread_id === activeThread)

  async function sendReply(e: React.FormEvent) {
    e.preventDefault()
    if (!reply.trim() || !activeThreadData) return
    setSending(true)
    const res = await messagesApi.send({
      recipient_id: activeThreadData.other.id,
      student_id: activeThreadData.student?.id ?? null,
      thread_id: activeThread,
      body: reply.trim(),
    })
    if ((res as any).error) { toast.error('Failed to send message'); setSending(false); return }
    // Optimistic update
    const newMsg: Message = {
      id: (res as any).data?.id ?? `tmp-${Date.now()}`,
      thread_id: activeThread!,
      body: reply.trim(),
      created_at: new Date().toISOString(),
      read_at: null,
      sender: { id: currentUserId, first_name: 'You', last_name: '', role: 'parent' },
      recipient: activeThreadData.other,
      student: activeThreadData.student,
    }
    setMessages(prev => [...prev, newMsg])
    setReply('')
    setSending(false)
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  async function sendNewMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!composeForm.recipient_id || !composeForm.body.trim()) return
    setComposing(true)
    const res = await messagesApi.send({
      recipient_id: composeForm.recipient_id,
      student_id: composeForm.student_id || null,
      body: composeForm.body.trim(),
    })
    setComposing(false)
    if ((res as any).error) { toast.error('Failed to send'); return }
    toast.success('Message sent')
    setComposeOpen(false)
    setComposeForm({ recipient_id: '', student_id: '', body: '' })
    // Refresh messages
    messagesApi.list().then(r => setMessages((r.data as Message[]) ?? []))
  }

  function formatTime(iso: string) {
    const d = new Date(iso)
    const today = new Date()
    const diffDays = Math.floor((today.getTime() - d.getTime()) / 86400000)
    if (diffDays === 0) return d.toLocaleTimeString('en-ZW', { hour: '2-digit', minute: '2-digit' })
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return d.toLocaleDateString('en-ZW', { weekday: 'short' })
    return d.toLocaleDateString('en-ZW', { day: 'numeric', month: 'short' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Messages</h1>
          <p className="text-sm text-slate-500 mt-0.5">Communicate directly with teachers.</p>
        </div>
        <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
          <DialogTrigger render={<Button size="sm" />}>
            <Plus className="h-4 w-4 mr-1.5" /> New Message
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Message</DialogTitle></DialogHeader>
            <form onSubmit={sendNewMessage} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label>To (Teacher)</Label>
                <select
                  value={composeForm.recipient_id}
                  onChange={e => setComposeForm(f => ({ ...f, recipient_id: e.target.value }))}
                  className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                >
                  <option value="">Select teacher…</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                  ))}
                </select>
              </div>
              {children.length > 0 && (
                <div className="space-y-1.5">
                  <Label>Regarding <span className="text-slate-400 font-normal">(optional)</span></Label>
                  <select
                    value={composeForm.student_id}
                    onChange={e => setComposeForm(f => ({ ...f, student_id: e.target.value }))}
                    className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">General enquiry</option>
                    {children.map((c: any) => (
                      <option key={c.students.id} value={c.students.id}>
                        {c.students.first_name} {c.students.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="space-y-1.5">
                <Label>Message</Label>
                <textarea
                  value={composeForm.body}
                  onChange={e => setComposeForm(f => ({ ...f, body: e.target.value }))}
                  rows={4}
                  placeholder="Write your message here…"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                  required
                />
              </div>
              <div className="flex gap-3 pt-1">
                <Button type="submit" disabled={composing}>
                  {composing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Send className="mr-1.5 h-3.5 w-3.5" /> Send
                </Button>
                <Button type="button" variant="ghost" onClick={() => setComposeOpen(false)}>Cancel</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {threads.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center">
            <MessageCircle className="h-7 w-7 text-slate-300" />
          </div>
          <p className="text-sm font-semibold text-slate-600">No messages yet</p>
          <p className="text-xs text-slate-400">Send a message to a teacher to get started.</p>
        </div>
      ) : (
        <div className="flex gap-4 flex-1 min-h-0">

          {/* Thread list */}
          <div className="w-72 shrink-0 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-slate-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  placeholder="Search conversations…"
                  className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-white"
                  readOnly
                />
              </div>
            </div>
            <div className="overflow-y-auto flex-1 divide-y divide-slate-50">
              {threads.map(thread => (
                <button
                  key={thread.thread_id}
                  onClick={() => setActiveThread(thread.thread_id)}
                  className={`w-full text-left flex items-start gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors ${activeThread === thread.thread_id ? 'bg-blue-50/60' : ''}`}
                >
                  <div className="h-9 w-9 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-700 shrink-0 mt-0.5">
                    {thread.other.first_name[0]}{thread.other.last_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {thread.other.first_name} {thread.other.last_name}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0">{formatTime(thread.lastMsg.created_at)}</span>
                    </div>
                    {thread.student && (
                      <p className="text-[10px] text-blue-500 font-medium truncate">re: {thread.student.first_name} {thread.student.last_name}</p>
                    )}
                    <p className={`text-xs truncate mt-0.5 ${thread.unread > 0 ? 'font-semibold text-slate-700' : 'text-slate-400'}`}>
                      {thread.lastMsg.body}
                    </p>
                  </div>
                  {thread.unread > 0 && (
                    <span className="h-4 w-4 rounded-full bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center shrink-0 mt-1">
                      {thread.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Message thread */}
          <div className="flex-1 min-w-0 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
            {activeThreadData ? (
              <>
                {/* Thread header */}
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-50 shrink-0">
                  <div className="h-9 w-9 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-700 shrink-0">
                    {activeThreadData.other.first_name[0]}{activeThreadData.other.last_name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {activeThreadData.other.first_name} {activeThreadData.other.last_name}
                    </p>
                    <p className="text-xs text-slate-400 capitalize">
                      {activeThreadData.other.role}
                      {activeThreadData.student && ` · About ${activeThreadData.student.first_name} ${activeThreadData.student.last_name}`}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  {activeThreadData.messages.map((msg, idx) => {
                    const isMe = msg.sender.id === currentUserId
                    const showDate = idx === 0 || new Date(msg.created_at).toDateString() !== new Date(activeThreadData.messages[idx - 1].created_at).toDateString()
                    return (
                      <div key={msg.id}>
                        {showDate && (
                          <div className="flex items-center gap-3 my-3">
                            <div className="h-px flex-1 bg-slate-100" />
                            <span className="text-[10px] text-slate-400 font-medium">
                              {new Date(msg.created_at).toLocaleDateString('en-ZW', { weekday: 'short', day: 'numeric', month: 'short' })}
                            </span>
                            <div className="h-px flex-1 bg-slate-100" />
                          </div>
                        )}
                        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                              isMe
                                ? 'bg-blue-600 text-white rounded-br-sm'
                                : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                            }`}>
                              {msg.body}
                            </div>
                            <span className="text-[10px] text-slate-400 px-1">
                              {new Date(msg.created_at).toLocaleTimeString('en-ZW', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={bottomRef} />
                </div>

                {/* Reply box */}
                <form onSubmit={sendReply} className="px-4 py-3 border-t border-slate-50 flex items-end gap-3 shrink-0">
                  <textarea
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(e as any) } }}
                    rows={1}
                    placeholder="Write a reply… (Enter to send)"
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-white resize-none min-h-[38px] max-h-[120px]"
                    style={{ height: 'auto' }}
                  />
                  <Button type="submit" size="sm" disabled={sending || !reply.trim()} className="shrink-0">
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center flex-col gap-2">
                <MessageCircle className="h-8 w-8 text-slate-200" />
                <p className="text-sm text-slate-400">Select a conversation</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>}>
      <MessagesContent />
    </Suspense>
  )
}
