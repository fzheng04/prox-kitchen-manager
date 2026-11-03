import { NativeTabs } from 'expo-router/native-tabs';

import { Colors, Fonts } from '@/constants/theme';

/**
 * Native tab bar (iOS/Android): List, Compare, Kitchen, Discover, Trips. Kitchen (`index`) sits in
 * the middle and is the tab the app opens on. The web version lives in app-tabs.web.tsx; keep the
 * two in sync.
 * On iOS 26+ the system draws the bar background, so backgroundColor only applies on older iOS.
 */
export default function AppTabs() {
  return (
    <NativeTabs
      backgroundColor={Colors.surfaceHeader}
      iconColor={{ default: 'rgba(255,255,255,0.55)', selected: Colors.indicator }}
      indicatorColor="rgba(255,255,255,0.13)"
      labelStyle={{
        default: { color: 'rgba(255,255,255,0.55)', fontFamily: Fonts.bodyMedium },
        selected: { color: Colors.white, fontFamily: Fonts.bodySemibold },
      }}>
      <NativeTabs.Trigger name="list">
        <NativeTabs.Trigger.Label>List</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'checklist', selected: 'checklist' }} md="checklist" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="compare">
        <NativeTabs.Trigger.Label>Compare</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'scalemass', selected: 'scalemass.fill' }} md="balance" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Kitchen</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'refrigerator', selected: 'refrigerator.fill' }} md="kitchen" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="discover">
        <NativeTabs.Trigger.Label>Discover</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'sparkles', selected: 'sparkles' }} md="auto_awesome" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="trips">
        <NativeTabs.Trigger.Label>Trips</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'cart', selected: 'cart.fill' }} md="shopping_cart" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
