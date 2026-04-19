import { useState } from 'react'
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import {
  DEMO_CHILDREN, DEMO_MARKS, DEMO_ATTENDANCE, DEMO_HOMEWORK,
  gradeColor,
} from '@/lib/demoData'
import { Colors } from '@/lib/colors'

type Tab = 'marks' | 'attendance' | 'homework'

const TYPE_COLOR: Record<string, string> = {
  test: '#3b82f6', exam: '#ef4444', class_assessment: '#10b981',
  project: '#f59e0b', practical: '#8b5cf6',
}
const TYPE_LABEL: Record<string, string> = {
  test: 'Test', exam: 'Exam', class_assessment: 'CA', project: 'Project', practical: 'Practical',
}
const ATT_COLOR: Record<string, string> = {
  present: Colors.success, absent: Colors.danger, late: Colors.warning, excused: '#3b82f6',
}
const ATT_ICON: Record<string, string> = {
  present: 'checkmark-circle', absent: 'close-circle', late: 'time', excused: 'information-circle',
}

export default function ChildDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('marks')

  const child = DEMO_CHILDREN.find(c => c.id === id)
  if (!child) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: Colors.textSecondary }}>Child not found.</Text>
        </View>
      </SafeAreaView>
    )
  }

  const marks = DEMO_MARKS[child.id] ?? []
  const attendance = DEMO_ATTENDANCE[child.id] ?? []
  const homework = DEMO_HOMEWORK[child.classId] ?? []

  const presentCount = attendance.filter(a => a.status === 'present' || a.status === 'late').length
  const attPct = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : null

  const avgMark = marks.length > 0 ? Math.round(marks.reduce((s, m) => s + m.pct, 0) / marks.length) : null

  const today = new Date().toISOString().slice(0, 10)
  const overdueHw = homework.filter(h => h.dueDate < today).length
  const pendingHw = homework.filter(h => h.dueDate >= today).length

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: 'marks', label: 'Marks', icon: 'ribbon-outline' },
    { key: 'attendance', label: 'Attendance', icon: 'calendar-outline' },
    { key: 'homework', label: 'Homework', icon: 'book-outline' },
  ]

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Back header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.childName}>{child.firstName} {child.lastName}</Text>
          <Text style={styles.childMeta}>{child.className}  ·  {child.regNumber}</Text>
        </View>
        <View style={[styles.avatarSmall, { backgroundColor: child.avatarColor }]}>
          <Text style={styles.avatarSmallText}>{child.avatarInitials}</Text>
        </View>
      </View>

      {/* Summary bar */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, avgMark ? { color: gradeColor(avgMark) } : {}]}>
            {avgMark !== null ? `${avgMark}%` : '—'}
          </Text>
          <Text style={styles.summaryLabel}>Average</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, {
            color: attPct !== null ? (attPct >= 90 ? Colors.success : attPct >= 75 ? Colors.warning : Colors.danger) : Colors.textMuted
          }]}>
            {attPct !== null ? `${attPct}%` : '—'}
          </Text>
          <Text style={styles.summaryLabel}>Attendance</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: overdueHw > 0 ? Colors.danger : Colors.success }]}>
            {pendingHw}
          </Text>
          <Text style={styles.summaryLabel}>Due Soon</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: child.feeBalance > 0 ? Colors.danger : Colors.success }]}>
            {child.feeBalance > 0 ? `$${child.feeBalance}` : 'Nil'}
          </Text>
          <Text style={styles.summaryLabel}>Fee Bal.</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabItem, tab === t.key && styles.tabItemActive]}
            onPress={() => setTab(t.key)}
          >
            <Ionicons
              name={t.icon as any}
              size={16}
              color={tab === t.key ? Colors.primary : Colors.textMuted}
            />
            <Text style={[styles.tabLabel, tab === t.key && styles.tabLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Marks tab ── */}
        {tab === 'marks' && (
          marks.length === 0
            ? <EmptyState icon="ribbon-outline" message="No marks recorded yet." />
            : marks.map(m => (
              <View key={m.id} style={styles.markCard}>
                <View style={styles.markLeft}>
                  <View style={[styles.typePill, { backgroundColor: TYPE_COLOR[m.type] + '1A' }]}>
                    <Text style={[styles.typeText, { color: TYPE_COLOR[m.type] }]}>{TYPE_LABEL[m.type]}</Text>
                  </View>
                  <Text style={styles.markTitle}>{m.title}</Text>
                  <Text style={styles.markSubject}>{m.subject}</Text>
                  <Text style={styles.markDate}>{new Date(m.date).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                </View>
                <View style={styles.markRight}>
                  <Text style={[styles.markScore, { color: gradeColor(m.pct) }]}>{m.rawScore}/{m.maxMarks}</Text>
                  <View style={[styles.gradeChip, { backgroundColor: gradeColor(m.pct) + '1A' }]}>
                    <Text style={[styles.gradeText, { color: gradeColor(m.pct) }]}>{m.grade}</Text>
                  </View>
                  <Text style={[styles.markPct, { color: gradeColor(m.pct) }]}>{m.pct}%</Text>
                </View>
              </View>
            ))
        )}

        {/* ── Attendance tab ── */}
        {tab === 'attendance' && (
          <>
            <View style={styles.attSummaryCard}>
              {(['present', 'late', 'absent', 'excused'] as const).map(s => {
                const count = attendance.filter(a => a.status === s).length
                return (
                  <View key={s} style={styles.attSumItem}>
                    <Ionicons name={ATT_ICON[s] as any} size={22} color={ATT_COLOR[s]} />
                    <Text style={[styles.attSumCount, { color: ATT_COLOR[s] }]}>{count}</Text>
                    <Text style={styles.attSumLabel}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text>
                  </View>
                )
              })}
            </View>
            {attendance.length === 0
              ? <EmptyState icon="calendar-outline" message="No attendance records yet." />
              : attendance.map(rec => (
                <View key={rec.id} style={styles.attRow}>
                  <Ionicons name={ATT_ICON[rec.status] as any} size={22} color={ATT_COLOR[rec.status]} />
                  <Text style={styles.attDate}>
                    {new Date(rec.date).toLocaleDateString('en-ZW', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                  <View style={[styles.attPill, { backgroundColor: ATT_COLOR[rec.status] + '1A' }]}>
                    <Text style={[styles.attPillText, { color: ATT_COLOR[rec.status] }]}>
                      {rec.status.charAt(0).toUpperCase() + rec.status.slice(1)}
                    </Text>
                  </View>
                </View>
              ))
            }
          </>
        )}

        {/* ── Homework tab ── */}
        {tab === 'homework' && (
          homework.length === 0
            ? <EmptyState icon="book-outline" message="No homework assigned yet." />
            : homework.map(hw => {
              const daysLeft = Math.ceil((new Date(hw.dueDate).getTime() - new Date(today).getTime()) / 86400000)
              const overdue = daysLeft < 0
              const urgent = daysLeft >= 0 && daysLeft <= 2
              return (
                <View key={hw.id} style={[styles.hwCard, overdue && styles.hwCardOverdue]}>
                  <View style={styles.hwHeader}>
                    <View style={[styles.hwIcon, { backgroundColor: overdue ? Colors.dangerSurface : urgent ? Colors.warningSurface : Colors.primarySurface }]}>
                      <Ionicons
                        name={overdue ? 'alert-circle-outline' : 'book-outline'}
                        size={18}
                        color={overdue ? Colors.danger : urgent ? Colors.warning : Colors.primary}
                      />
                    </View>
                    <View style={styles.hwMeta}>
                      <Text style={styles.hwTitle}>{hw.title}</Text>
                      <Text style={styles.hwSubject}>{hw.subject}  ·  {hw.className}</Text>
                    </View>
                    <View style={[styles.hwDuePill, { backgroundColor: overdue ? Colors.dangerSurface : urgent ? Colors.warningSurface : Colors.bg }]}>
                      <Text style={[styles.hwDueText, { color: overdue ? Colors.danger : urgent ? Colors.warning : Colors.textSecondary }]}>
                        {overdue ? `${Math.abs(daysLeft)}d ago` : daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft}d`}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.hwDesc}>{hw.description}</Text>
                  <Text style={styles.hwDate}>
                    Set {new Date(hw.setDate).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short' })}  ·  Due {new Date(hw.dueDate).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                </View>
              )
            })
        )}

      </ScrollView>
    </SafeAreaView>
  )
}

function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name={icon as any} size={36} color={Colors.border} />
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 4, paddingBottom: 14, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  headerTitle: { flex: 1 },
  childName: { fontSize: 18, fontWeight: '800', color: Colors.text, letterSpacing: -0.2 },
  childMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  avatarSmall: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  avatarSmallText: { fontSize: 14, fontWeight: '800', color: '#fff' },
  summaryBar: {
    flexDirection: 'row', backgroundColor: Colors.card, marginHorizontal: 16,
    borderRadius: 18, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 16, fontWeight: '800', color: Colors.text },
  summaryLabel: { fontSize: 9, color: Colors.textMuted, fontWeight: '600', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.3 },
  summaryDivider: { width: 1, backgroundColor: Colors.border },
  tabs: {
    flexDirection: 'row', marginHorizontal: 16, backgroundColor: Colors.card,
    borderRadius: 16, padding: 4, marginBottom: 14, borderWidth: 1, borderColor: Colors.border,
  },
  tabItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 9, borderRadius: 12 },
  tabItemActive: { backgroundColor: Colors.primarySurface },
  tabLabel: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
  tabLabelActive: { color: Colors.primary },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 40, gap: 10 },
  // Marks
  markCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card,
    borderRadius: 16, padding: 14, borderWidth: 1, borderColor: Colors.border,
  },
  markLeft: { flex: 1, gap: 3 },
  typePill: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 2 },
  typeText: { fontSize: 10, fontWeight: '700' },
  markTitle: { fontSize: 14, fontWeight: '700', color: Colors.text },
  markSubject: { fontSize: 12, color: Colors.textSecondary },
  markDate: { fontSize: 11, color: Colors.textMuted },
  markRight: { alignItems: 'center', gap: 4 },
  markScore: { fontSize: 18, fontWeight: '800', fontVariant: ['tabular-nums'] },
  gradeChip: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  gradeText: { fontSize: 14, fontWeight: '800' },
  markPct: { fontSize: 12, fontWeight: '600' },
  // Attendance
  attSummaryCard: {
    flexDirection: 'row', backgroundColor: Colors.card, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 2,
  },
  attSumItem: { flex: 1, alignItems: 'center', gap: 4 },
  attSumCount: { fontSize: 18, fontWeight: '800' },
  attSumLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '600' },
  attRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card,
    borderRadius: 14, padding: 12, borderWidth: 1, borderColor: Colors.border,
  },
  attDate: { flex: 1, fontSize: 13, fontWeight: '600', color: Colors.text },
  attPill: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  attPillText: { fontSize: 12, fontWeight: '700' },
  // Homework
  hwCard: {
    backgroundColor: Colors.card, borderRadius: 18, padding: 14,
    borderWidth: 1, borderColor: Colors.border,
  },
  hwCardOverdue: { borderColor: '#fca5a5', backgroundColor: '#fff7f7' },
  hwHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  hwIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  hwMeta: { flex: 1 },
  hwTitle: { fontSize: 14, fontWeight: '700', color: Colors.text },
  hwSubject: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  hwDuePill: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, flexShrink: 0 },
  hwDueText: { fontSize: 12, fontWeight: '700' },
  hwDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19, marginBottom: 8 },
  hwDate: { fontSize: 11, color: Colors.textMuted },
  // Empty state
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 14, color: Colors.textMuted },
})
