import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../lib/theme';

// ── Bouton principal ──────────────────────────────────────────────────────
export function Btn({ label, onPress, secondary, disabled, iconName }) {
  return (
    <Pressable
      onPress={disabled ? null : onPress}
      style={[
        s.btn,
        secondary ? s.btnSecondary : { backgroundColor: disabled ? colors.empty : colors.plum },
      ]}
    >
      {iconName && (
        <Ionicons name={iconName} size={18} color={secondary ? colors.ink : '#fff'} />
      )}
      <Text style={[s.btnText, secondary && s.btnTextSecondary, disabled && s.btnTextDisabled]}>
        {label}
      </Text>
    </Pressable>
  );
}

// ── Champ de saisie ───────────────────────────────────────────────────────
export function Field({ label, value, onChangeText, iconName, placeholder, secureTextEntry, keyboardType }) {
  const [showPwd, setShowPwd] = useState(false);
  const secure = secureTextEntry && !showPwd;
  return (
    <View style={s.fieldWrap}>
      {label ? <Text style={s.fieldLabel}>{label}</Text> : null}
      <View style={s.fieldRow}>
        {iconName && (
          <Ionicons name={iconName} size={16} color={colors.inkSoft} style={s.fieldIcon} />
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.empty}
          secureTextEntry={secure}
          keyboardType={keyboardType || 'default'}
          autoCapitalize="none"
          style={[s.input, iconName && s.inputWithIcon, secureTextEntry && s.inputWithEye]}
        />
        {secureTextEntry && (
          <Pressable onPress={() => setShowPwd(v => !v)} style={s.eyeBtn}>
            <Ionicons name={showPwd ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.inkSoft} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

// ── Toggle ────────────────────────────────────────────────────────────────
export function Toggle({ checked, onChange, label, sublabel }) {
  return (
    <Pressable style={s.toggleRow} onPress={() => onChange(!checked)}>
      <View style={[s.track, checked && s.trackOn]}>
        <View style={[s.thumb, checked && s.thumbOn]} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.toggleLabel}>{label}</Text>
        {sublabel ? <Text style={s.toggleSub}>{sublabel}</Text> : null}
      </View>
    </Pressable>
  );
}

// ── Titre de section (paramètres) ─────────────────────────────────────────
export function SectionTitle({ children }) {
  return <Text style={s.sectionTitle}>{children}</Text>;
}

// ── Ligne de paramètre ────────────────────────────────────────────────────
export function SettingsRow({ iconName, label, sub, onPress, danger, right }) {
  return (
    <Pressable onPress={onPress} style={s.row}>
      <View style={[s.rowIcon, danger && s.rowIconDanger]}>
        <Ionicons name={iconName} size={18} color={danger ? '#B04040' : colors.plum} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[s.rowLabel, danger && s.rowLabelDanger]}>{label}</Text>
        {sub ? <Text style={s.rowSub}>{sub}</Text> : null}
      </View>
      {right || <Ionicons name="chevron-forward" size={16} color={colors.empty} />}
    </Pressable>
  );
}

const s = StyleSheet.create({
  // Bouton
  btn: { borderRadius: radius.md, padding: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnSecondary: { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.line },
  btnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  btnTextSecondary: { color: colors.ink },
  btnTextDisabled: { color: colors.inkSoft },
  // Field
  fieldWrap: { gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.inkSoft },
  fieldRow: { position: 'relative', justifyContent: 'center' },
  fieldIcon: { position: 'absolute', left: 14, zIndex: 1 },
  input: { borderWidth: 1.5, borderColor: colors.line, borderRadius: 12, paddingVertical: 13, paddingHorizontal: 14, fontSize: 15, color: colors.ink, backgroundColor: colors.surface },
  inputWithIcon: { paddingLeft: 42 },
  inputWithEye: { paddingRight: 44 },
  eyeBtn: { position: 'absolute', right: 14, padding: 4 },
  // Toggle
  toggleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  track: { width: 48, height: 28, borderRadius: 14, backgroundColor: colors.empty, justifyContent: 'center', paddingHorizontal: 3, marginTop: 2, flexShrink: 0 },
  trackOn: { backgroundColor: colors.plum },
  thumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  thumbOn: { alignSelf: 'flex-end' },
  toggleLabel: { fontSize: 15, fontWeight: '600', color: colors.ink },
  toggleSub: { fontSize: 13, color: colors.inkSoft, marginTop: 2, lineHeight: 18 },
  // SectionTitle
  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', color: colors.inkSoft, marginTop: spacing.lg, marginBottom: 6, paddingLeft: 2 },
  // SettingsRow
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.line },
  rowIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.plum + '18', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rowIconDanger: { backgroundColor: '#FAE8E8' },
  rowLabel: { fontSize: 15, fontWeight: '600', color: colors.ink },
  rowLabelDanger: { color: '#B04040' },
  rowSub: { fontSize: 13, color: colors.inkSoft, marginTop: 1 },
});
