// Une carte représentant un symptôme sur l'écran "Aujourd'hui".
// Affiche l'icône, le nom, et trois pastilles d'intensité (Léger / Modéré / Fort).
// Taper une pastille règle le niveau ; retaper la même pastille remet à zéro.

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, levels } from '../lib/theme';

export default function SymptomCard({ symptom, value = 0, onChange }) {
  // value : 0 (aucun) à 3 (fort)
  const setLevel = (level) => {
    // si on retape le niveau déjà actif, on revient à 0
    onChange(value === level ? 0 : level);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: symptom.color + '22' }]}>
          <Ionicons name={symptom.icon} size={20} color={symptom.color} />
        </View>
        <Text style={styles.label}>{symptom.label}</Text>
      </View>

      <View style={styles.dots}>
        {[1, 2, 3].map((level) => {
          const active = value >= level;
          return (
            <Pressable
              key={level}
              onPress={() => setLevel(level)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`${symptom.label} : ${levels[level]}`}
              style={[
                styles.dot,
                {
                  backgroundColor: active ? symptom.color : colors.empty,
                  borderColor: active ? colors.ink : 'transparent',
                },
              ]}
            />
          );
        })}
        <Text style={styles.levelText}>{levels[value]}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
    flex: 1,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
  },
  levelText: {
    marginLeft: spacing.xs,
    fontSize: 14,
    color: colors.inkSoft,
  },
});
