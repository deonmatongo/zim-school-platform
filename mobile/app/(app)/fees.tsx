import { useState } from 'react'
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { DEMO_CHILDREN, DEMO_FEES } from '@/lib/demoData'
import { Colors } from '@/lib/colors'

export default function FeesScreen() {
  const [activeIdx, setActiveIdx] = useState(0)
  const child = DEMO_CHILDREN[activeIdx]
  const fees = DEMO_FEES[child.id] ?? []

  const totalBilled = fees.reduce((s, f) => s + f.amountBilled, 0)
  const totalPaid   = fees.reduce((s, f) => s + f.amountPaid, 0)
  const balance     = totalBilled - totalPaid
  const pct = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0

  const statusColor = (s: string) => s === 'paid' ? Colors.success : s === 'partial' ? Colors.warning : Colors.danger
  const statusBg    = (s: string) => s === 'paid' ? Colors.successSurface : s === 'partial' ? Colors.warningSurface : Colors.dangerSurface
  const statusLabel = (s: string) => s === 'paid' ? 'Paid' : s === 'partial' ? 'Partial' : 'Overdue'

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Fee Statement</Text>
      </View>

      {/* Child switcher */}
      <View style={styles.switcher}>
        {DEMO_CHILDREN.map((c, i) => (
          <TouchableOpacity
            key={c.id}
            style={[styles.switcherTab, i === activeIdx && styles.switcherTabActive]}
            onPress={() => setActiveIdx(i)}
          >
            <Text style={[styles.switcherText, i === activeIdx && styles.switcherTextActive]}>
              {c.firstName}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Summary card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={[styles.summaryAvatar, { backgroundColor: child.avatarColor }]}>
              <Text style={styles.summaryAvatarText}>{child.avatarInitials}</Text>
            </View>
            <View>
              <Text style={styles.summaryName}>{child.firstName} {child.lastName}</Text>
              <Text style={styles.summaryClass}>{child.className}</Text>
            </View>
          </View>

          <View style={styles.summaryStats}>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatLabel}>Total Billed</Text>
              <Text style={styles.summaryStatValue}>${totalBilled.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatLabel}>Paid</Text>
              <Text style={[styles.summaryStatValue, { color: Colors.success }]}>${totalPaid.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatLabel}>Balance</Text>
              <Text style={[styles.summaryStatValue, { color: balance > 0 ? Colors.danger : Colors.success }]}>
                ${balance.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressWrap}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${pct}%` as any, backgroundColor: pct >= 100 ? Colors.success : pct >= 50 ? Colors.warning : Colors.danger }]} />
            </View>
            <Text style={styles.progressLabel}>{pct}% paid</Text>
          </View>
        </View>

        {/* Fee line items */}
        <Text style={styles.sectionTitle}>Breakdown</Text>
        {fees.map(fee => (
          <View key={fee.id} style={styles.feeItem}>
            <View style={styles.feeLeft}>
              <Text style={styles.feeDescription}>{fee.description}</Text>
              <Text style={styles.feeTerm}>{fee.termLabel}  ·  Due {new Date(fee.dueDate).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
            </View>
            <View style={styles.feeRight}>
              <Text style={styles.feeAmount}>${fee.amountBilled.toLocaleString()}</Text>
              <View style={[styles.statusPill, { backgroundColor: statusBg(fee.status) }]}>
                <Text style={[styles.statusText, { color: statusColor(fee.status) }]}>{statusLabel(fee.status)}</Text>
              </View>
            </View>
          </View>
        ))}

        {/* Contact admin */}
        {balance > 0 && (
          <View style={styles.contactBox}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.primary} style={{ flexShrink: 0 }} />
            <Text style={styles.contactText}>
              To make a payment or arrange a payment plan, contact the bursar at <Text style={{ fontWeight: '700' }}>admin@zimschools.ac.zw</Text> or call <Text style={{ fontWeight: '700' }}>+263 242 123 456</Text>.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  topBar: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  topTitle: { fontSize: 22, fontWeight: '800', color: Colors.text, letterSpacing: -0.3 },
  switcher: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 16, backgroundColor: Colors.card, borderRadius: 16, padding: 4, borderWidth: 1, borderColor: Colors.border },
  switcherTab: { flex: 1, paddingVertical: 8, borderRadius: 12, alignItems: 'center' },
  switcherTabActive: { backgroundColor: Colors.primary },
  switcherText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  switcherTextActive: { color: '#fff' },
  scroll: { flex: 1 },
  content: { padding: 20, paddingTop: 0, paddingBottom: 40 },
  summaryCard: {
    backgroundColor: Colors.card, borderRadius: 20, padding: 20, marginBottom: 20,
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  summaryAvatar: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  summaryAvatarText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  summaryName: { fontSize: 16, fontWeight: '700', color: Colors.text },
  summaryClass: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  summaryStats: { flexDirection: 'row', backgroundColor: Colors.bg, borderRadius: 14, padding: 12, marginBottom: 14, gap: 4 },
  summaryStatItem: { flex: 1, alignItems: 'center' },
  summaryStatLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '500', marginBottom: 3 },
  summaryStatValue: { fontSize: 17, fontWeight: '800', color: Colors.text },
  progressWrap: { gap: 6 },
  progressBar: { height: 8, backgroundColor: Colors.bg, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressLabel: { fontSize: 11, color: Colors.textMuted, textAlign: 'right' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  feeItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.card, borderRadius: 16, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  feeLeft: { flex: 1, marginRight: 12 },
  feeDescription: { fontSize: 14, fontWeight: '600', color: Colors.text },
  feeTerm: { fontSize: 11, color: Colors.textMuted, marginTop: 3 },
  feeRight: { alignItems: 'flex-end', gap: 6 },
  feeAmount: { fontSize: 16, fontWeight: '800', color: Colors.text },
  statusPill: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  contactBox: {
    flexDirection: 'row', gap: 10, backgroundColor: Colors.primarySurface,
    borderRadius: 16, padding: 14, marginTop: 8, borderWidth: 1, borderColor: '#bfdbfe',
  },
  contactText: { flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
})
