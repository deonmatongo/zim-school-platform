import { ScrollView, View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { DEMO_ANNOUNCEMENTS } from '@/lib/demoData'
import { Colors } from '@/lib/colors'

export default function AnnouncementsScreen() {
  const announcements = DEMO_ANNOUNCEMENTS.filter(a => a.audience === 'all' || a.audience === 'parents')

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Announcements</Text>
        <Text style={styles.topCount}>{announcements.length} updates</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {announcements.map(ann => (
          <View key={ann.id} style={[styles.card, ann.pinned && styles.cardPinned]}>
            <View style={styles.cardTop}>
              <View style={[styles.iconWrap, ann.pinned ? styles.iconWrapPinned : styles.iconWrapNormal]}>
                <Ionicons
                  name={ann.pinned ? 'pin' : 'megaphone-outline'}
                  size={16}
                  color={ann.pinned ? Colors.warning : Colors.primary}
                />
              </View>
              <View style={styles.cardMeta}>
                <View style={styles.audienceRow}>
                  {ann.pinned && (
                    <View style={styles.pinnedBadge}>
                      <Text style={styles.pinnedText}>Pinned</Text>
                    </View>
                  )}
                  <View style={[styles.audienceBadge, ann.audience === 'parents' ? styles.audienceParents : styles.audienceAll]}>
                    <Text style={[styles.audienceText, ann.audience === 'parents' ? { color: Colors.primary } : { color: Colors.success }]}>
                      {ann.audience === 'parents' ? 'Parents' : 'Everyone'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <Text style={styles.annTitle}>{ann.title}</Text>
            <Text style={styles.annBody}>{ann.body}</Text>

            <View style={styles.cardFooter}>
              <Ionicons name="person-outline" size={12} color={Colors.textMuted} />
              <Text style={styles.cardFooterText}>{ann.author}</Text>
              <Text style={styles.cardFooterDot}>·</Text>
              <Text style={styles.cardFooterText}>
                {new Date(ann.createdAt).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' })}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  topBar: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  topTitle: { fontSize: 22, fontWeight: '800', color: Colors.text, letterSpacing: -0.3 },
  topCount: { fontSize: 12, color: Colors.textMuted },
  scroll: { flex: 1 },
  content: { padding: 20, paddingTop: 4, paddingBottom: 40 },
  card: {
    backgroundColor: Colors.card, borderRadius: 20, padding: 16,
    marginBottom: 14, borderWidth: 1, borderColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  cardPinned: { borderColor: '#fcd34d', borderWidth: 1.5 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  iconWrapPinned: { backgroundColor: Colors.warningSurface },
  iconWrapNormal: { backgroundColor: Colors.primarySurface },
  cardMeta: { flex: 1 },
  audienceRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  pinnedBadge: { backgroundColor: Colors.warningSurface, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  pinnedText: { fontSize: 11, fontWeight: '700', color: Colors.warning },
  audienceBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  audienceParents: { backgroundColor: Colors.primarySurface },
  audienceAll: { backgroundColor: Colors.successSurface },
  audienceText: { fontSize: 11, fontWeight: '600' },
  annTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 6, lineHeight: 22 },
  annBody: { fontSize: 14, color: Colors.textSecondary, lineHeight: 21, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardFooterText: { fontSize: 11, color: Colors.textMuted },
  cardFooterDot: { fontSize: 11, color: Colors.textMuted },
})
