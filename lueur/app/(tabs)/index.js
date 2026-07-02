import { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import SymptomCard from '../../components/SymptomCard';
import { GROUPS } from '../../lib/symptoms';
import { getDay, setIntensity, getNote, setNote } from '../../lib/db';
import { runSync } from '../../lib/sync';
import { useAuth } from '../../context/AuthContext';
import { today, addDays, dateLabel, longDate } from '../../lib/dateUtils';
import { colors, spacing, radius } from '../../lib/theme';

// ── Sélecteur de date ────────────────────────────────────────────────────
function DatePicker({ dayKey, todayKey, onPrev, onNext, onToday }) {
  const canNext = dayKey !== todayKey;
  const label = dateLabel(dayKey, todayKey);
  const sub = label !== longDate(dayKey) ? longDate(dayKey) : null;
  return (
    <View style={s.pickerWrap}>
      <View style={s.picker}>
        <Pressable onPress={onPrev} hitSlop={8} style={s.arrow}>
          <Ionicons name="chevron-back" size={22} color={colors.plum} />
        </Pressable>
        <View style={{ alignItems: 'center' }}>
          <Text style={s.pickerLabel}>{label}</Text>
          {sub ? <Text style={s.pickerSub}>{sub}</Text> : null}
        </View>
        <Pressable onPress={canNext ? onNext : null} hitSlop={8} style={s.arrow}>
          <Ionicons name="chevron-forward" size={22} color={canNext ? colors.plum : colors.empty} />
        </Pressable>
      </View>
      {dayKey !== todayKey && (
        <Pressable onPress={onToday}>
          <Text style={s.backToday}>Revenir à aujourd'hui</Text>
        </Pressable>
      )}
    </View>
  );
}

// ── Écran principal ───────────────────────────────────────────────────────
export default function TodayScreen() {
  const { user } = useAuth();
  const userId = user?.id;
  const todayKey = today();
  const [dayKey, setDayKey] = useState(todayKey);
  const [values, setValues] = useState({});
  const [note, setNoteState] = useState('');

  const loadDay = useCallback(async (key) => {
    if (!userId) return;
    const [lvls, n] = await Promise.all([getDay(userId, key), getNote(userId, key)]);
    setValues(lvls);
    setNoteState(n);
  }, [userId]);

  // Recharge à chaque focus/changement de date/utilisatrice.
  useFocusEffect(useCallback(() => { loadDay(dayKey); }, [dayKey, loadDay]));

  const handleChange = async (symptomKey, intensity) => {
    if (!userId) return;
    setValues(prev => ({ ...prev, [symptomKey]: intensity }));
    await setIntensity(userId, dayKey, symptomKey, intensity);
    runSync(userId);
  };

  const handleNote = async (text) => {
    if (!userId) return;
    setNoteState(text);
    await setNote(userId, dayKey, text);
    // La note bouge à chaque frappe : on la ressaie au prochain focus/foreground
    // via AppShell, pas ici, pour éviter de spammer Supabase.
  };

  const isToday = dayKey === todayKey;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <DatePicker
          dayKey={dayKey} todayKey={todayKey}
          onPrev={() => setDayKey(k => addDays(k, -1))}
          onNext={() => setDayKey(k => k === todayKey ? k : addDays(k, 1))}
          onToday={() => setDayKey(todayKey)}
        />
        <Text style={s.title}>
          {isToday ? "Comment vous sentez-vous aujourd'hui ?" : "Comment vous sentiez-vous ce jour-là ?"}
        </Text>
        <Text style={s.sub}>Notez ce que vous ressentez. Vos données restent privées, associées à votre compte.</Text>

        {GROUPS.map(group => (
          <View key={group.title} style={s.group}>
            <Text style={s.groupTitle}>{group.title}</Text>
            <View style={s.cards}>
              {group.items.map(symptom => (
                <SymptomCard
                  key={symptom.key}
                  symptom={symptom}
                  value={values[symptom.key] || 0}
                  onChange={intensity => handleChange(symptom.key, intensity)}
                />
              ))}
            </View>
          </View>
        ))}

        <Text style={s.groupTitle}>Note du jour</Text>
        <TextInput
          value={note}
          onChangeText={handleNote}
          placeholder="Quelque chose à retenir ? (nuit difficile, début d'un traitement…)"
          placeholderTextColor={colors.empty}
          multiline
          style={s.noteInput}
        />
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.sm },
  // Date picker
  pickerWrap: { gap: spacing.sm },
  picker: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, borderRadius: radius.md, padding: 6, borderWidth: 1, borderColor: colors.line },
  arrow: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  pickerLabel: { fontSize: 15, fontWeight: '700', color: colors.ink },
  pickerSub: { fontSize: 12, color: colors.inkSoft },
  backToday: { fontSize: 13, fontWeight: '600', color: colors.plum },
  // Page
  title: { fontSize: 24, fontWeight: '700', color: colors.ink, marginTop: spacing.md, lineHeight: 30 },
  sub: { fontSize: 15, color: colors.inkSoft, marginBottom: spacing.sm },
  group: { marginBottom: spacing.md },
  groupTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', color: colors.inkSoft, marginBottom: spacing.sm, paddingLeft: 2 },
  cards: { gap: spacing.md },
  noteInput: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, padding: spacing.md, fontSize: 15, color: colors.ink, minHeight: 70, textAlignVertical: 'top' },
});
