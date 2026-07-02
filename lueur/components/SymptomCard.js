import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, LEVELS, shade } from '../lib/theme';

export default function SymptomCard({ symptom, value = 0, onChange }) {
  return (
    <View style={s.card}>
      {/* En-tête : icône + nom */}
      <View style={s.header}>
        <View style={[s.iconWrap, { backgroundColor: symptom.color + '22' }]}>
          <Ionicons name={symptom.icon} size={20} color={symptom.color} />
        </View>
        <Text style={s.label}>{symptom.label}</Text>
      </View>

      {/* 4 pastilles : du plus clair (Aucune) au plus foncé (Forte) */}
      <View style={s.dots}>
        {[0, 1, 2, 3].map((lvl) => {
          const selected = value === lvl;
          return (
            <Pressable
              key={lvl}
              onPress={() => onChange(lvl)}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel={`${symptom.label} : ${LEVELS[lvl]}`}
              style={[
                s.dot,
                { backgroundColor: shade(symptom.color, lvl) },
                lvl === 0 && s.dotEmpty,
                selected && [s.dotSelected, { shadowColor: symptom.color }],
              ]}
            />
          );
        })}
        <Text style={s.levelText}>{LEVELS[value]}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
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
    gap: 10,
  },
  dot: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  dotEmpty: {
    borderWidth: 1,
    borderColor: colors.line,
  },
  dotSelected: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 4,
  },
  levelText: {
    marginLeft: 4,
    fontSize: 14,
    color: colors.inkSoft,
  },
});
