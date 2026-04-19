import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useAuth } from '@/lib/auth'
import { DEMO_CHILDREN, type Child } from '@/lib/demoData'
import { Colors } from '@/lib/colors'

function ChildCard({ child }: { child: Child }) {
  const router = useRouter()
  const attColor = child.attendancePct >= 90 ? Colors.success : child.attendancePct >= 75 ? Colors.warning : Colors.danger
  const markColor = child.avgMarkPct
    ? child.avgMarkPct >= 75 ? Colors.success : child.avgMarkPct >= 60 ? '#3b82f6' : child.avgMarkPct >= 40 ? Colors.warning : Colors.danger
    : Colors.textMuted

  const feeColor = child.feeStatus === 'paid' ? Colors.success : child.feeStatus === 'partial' ? Colors.warning : Colors.danger
  const feeBg = child.feeStatus === 'paid' ? Colors.successSurface : child.feeStatus === 'partial' ? Colors.warningSurface : Colors.dangerSurface
  const feeLabel = child.feeStatus === 'paid' ? 'Fully Paid' : child.feeStatus === 'partial' ? 'Partial' : 'Unpaid'

  return (
    <TouchableOpacity
      style={styles.childCard}
      onPress={() => router.push({ pathname: '/child/[id]', params: { id: child.id } })}
      activeOpacity={0.85}
    >
      {/* Avatar + name row */}
      <View style={styles.childHeader}>
        <View style={[styles.avatar, { backgroundColor: child.avatarColor }]}>
          <Text style={styles.avatarText}>{child.avatarInitials}</Text>
        </View>
        <View style={styles.childInfo}>
          <Text style={styles.childName}>{child.firstName} {child.lastName}</Text>
          <Text style={styles.childMeta}>{child.className}  ·  {child.regNumber}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="trending-up-outline" size={16} color={markColor} />
          <View style={styles.statTexts}>
            <Text style={[styles.statValue, { color: markColor }]}>
              {child.avgMarkPct !== null ? `${child.avgMarkPct}%` : '—'}
            </Text>
            <Text style={styles.statLabel}>Avg Mark</Text>
          </View>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Ionicons name="calendar-outline" size={16} color={attColor} />
          <View style={styles.statTexts}>
            <Text style={[styles.statValue, { color: attColor }]}>{child.attendancePct}%</Text>
            <Text style={styles.statLabel}>Attendance</Text>
          </View>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Ionicons name="card-outline" size={16} color={feeColor} />
          <View style={styles.statTexts}>
            <Text style={[styles.statValue, { color: feeColor }]}>
              {child.feeBalance > 0 ? `$${child.feeBalance}` : 'Nil'}
            </Text>
            <Text style={styles.statLabel}>Balance</Text>
          </View>
        </View>
      </View>

      {/* Fee status pill */}
      <View style={[styles.feePill, { backgroundColor: feeBg }]}>
        <View style={[styles.feeDot, { backgroundColor: feeColor }]} />
        <Text style={[styles.feePillText, { color: feeColor }]}>{feeLabel}</Text>
        {child.feeBalance > 0 && (
          <Text style={[styles.feePillText, { color: feeColor }]}>  ·  US${child.feeBalance} outstanding</Text>
        )}
      </View>
    </TouchableOpacity>
  )
}

export default function DashboardScreen() {
  const { user, signOut } = useAuth()

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
          </View>
          <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
            <Ionicons name="log-out-outline" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* School banner */}
        <View style={styles.banner}>
          <View style={styles.bannerLeft}>
            <View style={styles.bannerIcon}>
              <Ionicons name="school" size={20} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.bannerTitle}>Zimbabwe Schools</Text>
              <Text style={styles.bannerSub}>Parent Portal · Term 1 2025</Text>
            </View>
          </View>
        </View>

        {/* Section title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Children</Text>
          <Text style={styles.sectionCount}>{DEMO_CHILDREN.length} enrolled</Text>
        </View>

        {/* Child cards */}
        {DEMO_CHILDREN.map(child => <ChildCard key={child.id} child={child} />)}

        {/* Quick links */}
        <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 12 }]}>Quick Actions</Text>
        <View style={styles.quickGrid}>
          {[
            { icon: 'megaphone-outline', label: 'Announcements', color: '#f59e0b', bg: '#fef3c7', route: '/(app)/announcements' },
            { icon: 'chatbubbles-outline', label: 'Messages',     color: '#3b82f6', bg: '#dbeafe', route: '/(app)/messages' },
            { icon: 'card-outline',        label: 'Fees & Payments',color: '#10b981', bg: '#d1fae5', route: '/(app)/fees' },
            { icon: 'document-text-outline',label: 'Report Cards', color: '#8b5cf6', bg: '#ede9fe', route: '/(app)/index' },
          ].map(item => (
            <TouchableOpacity key={item.label} style={[styles.quickItem, { backgroundColor: item.bg }]} activeOpacity={0.8}>
              <Ionicons name={item.icon as any} size={24} color={item.color} />
              <Text style={[styles.quickLabel, { color: item.color }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  greeting: { fontSize: 13, color: Colors.textSecondary },
  userName: { fontSize: 22, fontWeight: '800', color: Colors.text, letterSpacing: -0.3 },
  signOutBtn: { padding: 8, borderRadius: 12, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  banner: {
    backgroundColor: Colors.primarySurface, borderRadius: 18, padding: 16,
    marginBottom: 20, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', borderWidth: 1, borderColor: '#bfdbfe',
  },
  bannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bannerIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  bannerTitle: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  bannerSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  sectionCount: { fontSize: 12, color: Colors.textMuted },
  childCard: {
    backgroundColor: Colors.card, borderRadius: 20, padding: 16,
    marginBottom: 14, borderWidth: 1, borderColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  childHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  avatar: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  childInfo: { flex: 1 },
  childName: { fontSize: 16, fontWeight: '700', color: Colors.text },
  childMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  statsRow: { flexDirection: 'row', backgroundColor: Colors.bg, borderRadius: 14, padding: 12, marginBottom: 12 },
  statItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  statTexts: {},
  statValue: { fontSize: 15, fontWeight: '700' },
  statLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '500', marginTop: 1 },
  statDivider: { width: 1, backgroundColor: Colors.border, marginHorizontal: 4 },
  feePill: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, gap: 6 },
  feeDot: { width: 6, height: 6, borderRadius: 3 },
  feePillText: { fontSize: 12, fontWeight: '600' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickItem: { width: '47%', borderRadius: 18, padding: 16, alignItems: 'center', gap: 8 },
  quickLabel: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
})
