import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { borderRadius, colors, fontSize, spacing } from '@/styles/common';
import { usePromoValidate } from '@/features/promo/hooks/usePromoValidate';
import type { PromoPreview } from '@/features/promo/services/promoApi';

interface PromoCodeInputProps {
  orderTotal: number;
  onApplied?: (preview: PromoPreview) => void;
  onCleared?: () => void;
}

function formatRp(amount: number) {
  return `Rp${Math.round(amount).toLocaleString('id-ID')}`;
}

// Reusable checkout input: text field + "Apply" button. On a successful preview
// it shows the discount inline and bubbles it up via onApplied; on a rejected
// code it shows the reject message inline.
export function PromoCodeInput({ orderTotal, onApplied, onCleared }: PromoCodeInputProps) {
  const { preview, validating, error, validate, clear } = usePromoValidate();
  const [code, setCode] = useState('');

  const applied = preview?.valid === true ? preview : null;
  const rejected = preview?.valid === false ? preview : null;

  const handleApply = async () => {
    const result = await validate(code, orderTotal);
    if (result?.valid) {
      onApplied?.(result);
    }
  };

  const handleClear = () => {
    setCode('');
    clear();
    onCleared?.();
  };

  // ── Applied state: show the locked-in discount with a remove action ──
  if (applied) {
    return (
      <Animated.View entering={FadeInDown.duration(300)} style={s.appliedCard}>
        <View style={s.appliedIcon}>
          <Ionicons name="pricetag" size={18} color={colors.success} />
        </View>
        <View style={s.appliedBody}>
          <Text style={s.appliedCode}>{applied.code}</Text>
          <Text style={s.appliedSavings}>You save {formatRp(applied.discountAmount ?? 0)}</Text>
        </View>
        <View style={s.appliedRight}>
          <Text style={s.appliedTotal}>{formatRp(applied.finalTotal ?? orderTotal)}</Text>
          <TouchableOpacity onPress={handleClear} hitSlop={8} style={s.removeButton}>
            <Text style={s.removeText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  // ── Entry state: input + Apply button ──
  return (
    <View style={s.wrapper}>
      <View style={s.inputRow}>
        <View style={[s.inputBox, rejected || error ? s.inputBoxError : null]}>
          <MaterialIcons
            name="local-offer"
            size={16}
            color={colors.text.placeholder}
            style={s.inputIcon}
          />
          <TextInput
            style={s.input}
            placeholder="Promo code"
            placeholderTextColor={colors.text.placeholder}
            value={code}
            onChangeText={setCode}
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!validating}
            returnKeyType="done"
            onSubmitEditing={handleApply}
          />
        </View>
        <TouchableOpacity
          style={[s.applyButton, (!code.trim() || validating) && s.applyButtonDisabled]}
          onPress={handleApply}
          disabled={!code.trim() || validating}
          activeOpacity={0.85}
        >
          {validating ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={s.applyButtonText}>Apply</Text>
          )}
        </TouchableOpacity>
      </View>

      {(rejected || error) && (
        <Animated.View entering={FadeInDown.duration(250)} style={s.messageRow}>
          <Ionicons name="alert-circle" size={14} color={colors.error} />
          <Text style={s.messageText}>
            {rejected?.message ?? error ?? 'This code cannot be applied'}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  inputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    paddingHorizontal: spacing.md,
    height: 46,
  },
  inputBoxError: {
    borderColor: colors.border.error,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.text.primary,
    letterSpacing: 1,
  },
  applyButton: {
    height: 46,
    minWidth: 84,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonDisabled: {
    backgroundColor: colors.border.focus,
  },
  applyButtonText: {
    fontSize: fontSize.base,
    fontWeight: '700',
    color: colors.white,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  messageText: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.error,
  },
  // Applied state
  appliedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: '#ECFDF5',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: spacing.md,
  },
  appliedIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  appliedBody: {
    flex: 1,
    gap: 2,
  },
  appliedCode: {
    fontSize: fontSize.base,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: 1,
  },
  appliedSavings: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#047857',
  },
  appliedRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  appliedTotal: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text.primary,
  },
  removeButton: {
    paddingVertical: 2,
  },
  removeText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.error,
  },
});
