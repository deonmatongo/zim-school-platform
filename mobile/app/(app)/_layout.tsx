import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/lib/colors'
import { View } from 'react-native'

function TabIcon({ name, focused }: { name: any; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={name} size={24} color={focused ? Colors.primary : Colors.textMuted} />
    </View>
  )
}

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.tabBar,
          borderTopColor: Colors.tabBarBorder,
          borderTopWidth: 1,
          height: 82,
          paddingBottom: 20,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="announcements"
        options={{
          title: 'Updates',
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'megaphone' : 'megaphone-outline'} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'chatbubbles' : 'chatbubbles-outline'} focused={focused} />,
          tabBarBadge: 2,
        }}
      />
      <Tabs.Screen
        name="fees"
        options={{
          title: 'Fees',
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'card' : 'card-outline'} focused={focused} />,
        }}
      />
    </Tabs>
  )
}
