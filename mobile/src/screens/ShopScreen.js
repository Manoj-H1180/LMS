// ─── NexusLearn Mobile — Shop Screen ──────────────────────────────────────
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, typography, cardStyle } from '../utils/theme';
import { SHOP_ITEMS } from '../utils/constants';
import { saveUser } from '../utils/api';

const ITEM_ICONS = {
  sparkles: '✨', palette: '🎨', crown: '👑', brain: '🧠', shield: '🛡️',
};

export default function ShopScreen({ user, onUpdateUser }) {
  const handleAction = async (item) => {
    const isOwned    = user.inventory?.includes(item.id);
    const isEquipped = (item.type === 'theme' && user.activeTheme === item.themeId) ||
                       (item.type === 'title' && user.title === item.titleValue);

    if (isOwned && !isEquipped) {
      // Equip it
      let updated = { ...user };
      if (item.type === 'theme') updated = { ...updated, activeTheme: item.themeId };
      if (item.type === 'title') updated = { ...updated, title: item.titleValue };
      if (item.id === 'item_streak_freeze') updated = { ...updated, streakFrozen: true };
      onUpdateUser(updated);
      await saveUser({ ...updated, username: user.username });
      Alert.alert('✅ Equipped!', `${item.name} has been activated.`);
      return;
    }
    if (isEquipped) {
      Alert.alert('Already Active', `${item.name} is currently active.`);
      return;
    }

    // Purchase
    if (user.coins < item.cost) {
      Alert.alert('Not Enough Coins', `You need ${item.cost - user.coins} more coins.\n\nEarn coins by completing lessons and quizzes!`);
      return;
    }

    Alert.alert(
      `Unlock ${item.name}?`,
      `This will cost ${item.cost} coins. You have ${user.coins} coins.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Buy Now',
          onPress: async () => {
            const updatedInventory = [...(user.inventory || []), item.id];
            let updated = { ...user, coins: user.coins - item.cost, inventory: updatedInventory };
            if (item.type === 'theme') updated = { ...updated, activeTheme: item.themeId };
            if (item.type === 'title') updated = { ...updated, title: item.titleValue };
            if (item.id === 'item_streak_freeze') updated = { ...updated, streakFrozen: true };
            onUpdateUser(updated);
            await saveUser({ ...updated, username: user.username });
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={['#151c2e', '#0b0d17']} style={styles.header}>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>🛍️ ACADEMY REWARD BAZAAR</Text>
          </View>
          <Text style={styles.headerTitle}>Rewards & Shop</Text>
          <Text style={styles.headerSub}>Redeem learning points for themes, titles, and power-ups.</Text>

          {/* Balance */}
          <View style={styles.balanceCard}>
            <Text style={{ fontSize: 28 }}>🪙</Text>
            <View>
              <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
              <Text style={styles.balanceVal}>{user.coins} <Text style={{ fontSize: 16, fontWeight: '600' }}>PTS</Text></Text>
            </View>
          </View>
        </LinearGradient>

        {/* Items Grid */}
        <View style={styles.grid}>
          {SHOP_ITEMS.map(item => {
            const isOwned    = user.inventory?.includes(item.id);
            const isEquipped = (item.type === 'theme' && user.activeTheme === item.themeId) ||
                               (item.type === 'title' && user.title === item.titleValue);
            const canAfford  = user.coins >= item.cost;

            return (
              <View key={item.id} style={[styles.itemCard, isEquipped && styles.itemCardEquipped]}>
                {/* Item header */}
                <View style={styles.itemHeader}>
                  <View style={styles.iconBox}>
                    {item.previewColors ? (
                      <LinearGradient colors={item.previewColors} style={styles.iconGradient}>
                        <Text style={{ fontSize: 18 }}>{ITEM_ICONS[item.icon] || '✨'}</Text>
                      </LinearGradient>
                    ) : (
                      <View style={[styles.iconGradient, { backgroundColor: 'rgba(99,102,241,0.15)' }]}>
                        <Text style={{ fontSize: 18 }}>{ITEM_ICONS[item.icon] || '✨'}</Text>
                      </View>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemType}>{item.type}</Text>
                  </View>
                  <View style={styles.costBadge}>
                    <Text style={styles.costText}>🪙 {item.cost}</Text>
                  </View>
                </View>

                <Text style={styles.itemDesc}>{item.description}</Text>

                {/* Color preview for themes */}
                {item.previewColors && (
                  <LinearGradient colors={item.previewColors} style={styles.colorPreview} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
                )}

                {/* Action button */}
                <TouchableOpacity onPress={() => handleAction(item)} style={styles.actionBtn}
                  disabled={isEquipped}>
                  <LinearGradient
                    colors={isEquipped
                      ? ['rgba(16,185,129,0.15)', 'rgba(16,185,129,0.15)']
                      : isOwned
                        ? [colors.accent, colors.accentAlt]
                        : canAfford
                          ? [colors.accent, colors.accentAlt]
                          : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.05)']}
                    style={styles.actionBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <Text style={[styles.actionBtnText,
                      isEquipped && { color: colors.green },
                      !isOwned && !canAfford && { color: colors.textDim }]}>
                      {isEquipped ? '✅ Currently Active'
                        : isOwned ? '✨ Equip / Activate'
                        : canAfford ? `🪙 Unlock for ${item.cost} PTS`
                        : `Need ${item.cost - user.coins} more PTS`}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: colors.bg },

  header:         { paddingTop: 16, paddingBottom: spacing.xl, paddingHorizontal: spacing.lg, alignItems: 'center' },
  headerBadge:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.full, borderWidth: 1, borderColor: 'rgba(245,158,11,.4)', backgroundColor: 'rgba(245,158,11,.1)', marginBottom: spacing.sm },
  headerBadgeText:{ fontSize: 11, fontWeight: '700', color: colors.goldLight },
  headerTitle:    { ...typography.displayMd, textAlign: 'center', marginBottom: 4 },
  headerSub:      { ...typography.bodyMd, textAlign: 'center', marginBottom: spacing.lg, paddingHorizontal: spacing.md },

  balanceCard:  { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: 'rgba(245,158,11,0.12)', borderRadius: radius.lg, borderWidth: 2, borderColor: 'rgba(245,158,11,0.4)', padding: spacing.md, paddingHorizontal: spacing.xl },
  balanceLabel: { fontSize: 10, fontWeight: '800', color: '#fde68a', textTransform: 'uppercase', letterSpacing: 0.8 },
  balanceVal:   { fontSize: 28, fontWeight: '900', color: colors.goldLight, lineHeight: 34 },

  grid:         { padding: spacing.lg, gap: spacing.md },
  itemCard:     { ...cardStyle, padding: spacing.md, gap: spacing.md },
  itemCardEquipped:{ borderColor: colors.accent, backgroundColor: 'rgba(99,102,241,0.06)' },
  itemHeader:   { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconBox:      { width: 48, height: 48, borderRadius: radius.md, overflow: 'hidden' },
  iconGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  itemName:     { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  itemType:     { fontSize: 10, fontWeight: '700', color: colors.textDim, textTransform: 'uppercase', marginTop: 2 },
  costBadge:    { flexDirection: 'row', alignItems: 'center' },
  costText:     { fontSize: 14, fontWeight: '800', color: colors.goldLight },
  itemDesc:     { fontSize: 13, color: colors.textMuted, lineHeight: 18 },
  colorPreview: { height: 6, borderRadius: radius.full },
  actionBtn:    { borderRadius: radius.md, overflow: 'hidden' },
  actionBtnGradient:{ paddingVertical: 12, alignItems: 'center' },
  actionBtnText:{ fontSize: 14, fontWeight: '700', color: '#fff' },
});
