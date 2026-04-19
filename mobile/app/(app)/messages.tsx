import { useState } from 'react'
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { DEMO_MESSAGES } from '@/lib/demoData'
import { Colors } from '@/lib/colors'

export default function MessagesScreen() {
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState(DEMO_MESSAGES)

  function sendMessage() {
    if (!draft.trim()) return
    setMessages(prev => [...prev, {
      id: `msg-${Date.now()}`,
      senderId: 'dev-parent',
      senderName: 'Demo Parent',
      senderRole: 'parent',
      recipientId: 'teacher-1',
      body: draft.trim(),
      createdAt: new Date().toISOString(),
      read: true,
    }])
    setDraft('')
  }

  const unreadCount = messages.filter(m => !m.read && m.senderId !== 'dev-parent').length

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.topTitle}>Messages</Text>
          {unreadCount > 0 && <Text style={styles.topSub}>{unreadCount} unread</Text>}
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {messages.map(msg => {
            const isMe = msg.senderId === 'dev-parent'
            const roleColor: Record<string, string> = { teacher: Colors.primary, admin: Colors.danger, parent: Colors.success }
            const roleLabel: Record<string, string> = { teacher: 'Teacher', admin: 'Admin', parent: 'You' }
            return (
              <View key={msg.id} style={[styles.msgRow, isMe && styles.msgRowMe]}>
                {!isMe && (
                  <View style={[styles.msgAvatar, { backgroundColor: roleColor[msg.senderRole] + '22' }]}>
                    <Text style={[styles.msgAvatarText, { color: roleColor[msg.senderRole] }]}>
                      {msg.senderName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </Text>
                  </View>
                )}
                <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                  {!isMe && (
                    <View style={styles.bubbleHeader}>
                      <Text style={[styles.senderName, { color: roleColor[msg.senderRole] }]}>{msg.senderName}</Text>
                      <View style={[styles.rolePill, { backgroundColor: roleColor[msg.senderRole] + '18' }]}>
                        <Text style={[styles.roleText, { color: roleColor[msg.senderRole] }]}>{roleLabel[msg.senderRole]}</Text>
                      </View>
                    </View>
                  )}
                  <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>{msg.body}</Text>
                  <Text style={[styles.bubbleTime, isMe && styles.bubbleTimeMe]}>
                    {new Date(msg.createdAt).toLocaleTimeString('en-ZW', { hour: '2-digit', minute: '2-digit' })}
                    {!msg.read && !isMe && <Text style={styles.unreadDot}>  ●</Text>}
                  </Text>
                </View>
              </View>
            )
          })}
        </ScrollView>

        {/* Compose bar */}
        <View style={styles.composeBar}>
          <TextInput
            style={styles.composeInput}
            placeholder="Write a message…"
            placeholderTextColor={Colors.textMuted}
            value={draft}
            onChangeText={setDraft}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !draft.trim() && styles.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!draft.trim()}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  topBar: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  topTitle: { fontSize: 22, fontWeight: '800', color: Colors.text, letterSpacing: -0.3 },
  topSub: { fontSize: 12, color: Colors.danger, fontWeight: '600', marginTop: 2 },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 16, gap: 12 },
  msgRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-end' },
  msgRowMe: { flexDirection: 'row-reverse' },
  msgAvatar: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  msgAvatarText: { fontSize: 13, fontWeight: '700' },
  bubble: {
    maxWidth: '78%', borderRadius: 18, padding: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  bubbleThem: { backgroundColor: Colors.card, borderTopLeftRadius: 4, borderWidth: 1, borderColor: Colors.border },
  bubbleMe: { backgroundColor: Colors.primary, borderTopRightRadius: 4 },
  bubbleHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  senderName: { fontSize: 12, fontWeight: '700' },
  rolePill: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  roleText: { fontSize: 10, fontWeight: '700' },
  bubbleText: { fontSize: 14, color: Colors.text, lineHeight: 20 },
  bubbleTextMe: { color: '#fff' },
  bubbleTime: { fontSize: 10, color: Colors.textMuted, marginTop: 4 },
  bubbleTimeMe: { color: 'rgba(255,255,255,0.6)', textAlign: 'right' },
  unreadDot: { color: Colors.danger, fontSize: 8 },
  composeBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    padding: 12, paddingBottom: Platform.OS === 'ios' ? 16 : 12,
    backgroundColor: Colors.card, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  composeInput: {
    flex: 1, fontSize: 15, color: Colors.text,
    backgroundColor: Colors.bg, borderRadius: 16, paddingHorizontal: 16,
    paddingVertical: 12, maxHeight: 100, borderWidth: 1, borderColor: Colors.border,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: Colors.textMuted },
})
