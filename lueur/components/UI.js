// Petits composants d'interface partagés (Field, Btn, Toggle).
// Un seul endroit pour la forme des champs, des boutons et des interrupteurs,
// pour que tous les écrans se ressemblent.

import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../lib/theme';

export function Field({ label, iconName, error, ...inputProps }) {
  const [focus, setFocus] = useState(false);
  return (
    <View style={s.field}>
      {label ? <Text style={s.fieldLabel}>{label}</Text> : null}
      <View
        style={[
          s.fieldWrap,
          focus && s.fieldWrapFocus,
          error && s.fieldWrapError,
        ]}
      >
        {iconName ? (
          <Ionicons
            name={iconName}
            size={18}
            color={focus ? colors.plum : colors.inkSoft}
            style={{ marginRight: spacing.sm }}
          />
        ) : null}
        <TextInput
          style={s.input}
          placeholderTextColor={colors.inkSoft}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          autoCapitalize="none"
          autoCorrect={false}
          {...inputProps}
        />
      </View>
      {error ? <Text style={s.fieldError}>{error}</Text> : null}
    </View>
  );
}

export function Btn({ label, onPress, disabled, iconName, variant = 'primary' }) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        s.btn,
        isPrimary ? s.btnPrimary : s.btnGhost,
        disabled && s.btnDisabled,
        pressed && !disabled && { opacity: 0.85 },
      ]}
    >
      {iconName ? (
        <Ionicons
          name={iconName}
          size={18}
          color={isPrimary ? '#fff' : colors.plum}
          style={{ marginRight: spacing.sm }}
        />
      ) : null}
      <Text style={[s.btnText, isPrimary ? s.btnTextPrimary : s.btnTextGhost]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Toggle({ checked, onChange, label, sublabel }) {
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      style={s.toggle}
      accessibilityRole="switch"
      accessibilityState={{ checked }}
    >
      <View style={{ flex: 1 }}>
        <Text style={s.toggleLabel}>{label}</Text>
        {sublabel ? <Text style={s.toggleSub}>{sublabel}</Text> : null}
      </View>
      <Switch
        value={checked}
        onValueChange={onChange}
        trackColor={{ false: colors.empty, true: colors.plum }}
        thumbColor="#fff"
      />
    </Pressable>
  );
}

const s = StyleSheet.create({
  field: { gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.ink },
  fieldWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  fieldWrapFocus: { borderColor: colors.plum },
  fieldWrapError: { borderColor: '#B44B4B' },
  input: { flex: 1, fontSize: 16, color: colors.ink, padding: 0 },
  fieldError: { fontSize: 12, color: '#B44B4B' },

  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
  },
  btnPrimary: { backgroundColor: colors.plum },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.plum },
  btnDisabled: { opacity: 0.45 },
  btnText: { fontSize: 16, fontWeight: '600' },
  btnTextPrimary: { color: '#fff' },
  btnTextGhost: { color: colors.plum },

  toggle: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: 4,
  },
  toggleLabel: { fontSize: 15, fontWeight: '600', color: colors.ink },
  toggleSub: { fontSize: 13, color: colors.inkSoft, marginTop: 2, lineHeight: 18 },
});
