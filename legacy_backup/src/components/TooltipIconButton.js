import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

/**
 * A wrapper around a standard icon button that adds a tooltip on long press.
 * 
 * @param {string} iconName - The Ionicons name.
 * @param {function} onPress - Function to call on tap.
 * @param {string} tooltip - The text to display on long press.
 * @param {number} size - Icon size (default 24).
 * @param {string} color - Icon color (default primary text).
 * @param {object} style - Additional styles for the button container.
 */
const TooltipIconButton = ({
    iconName,
    onPress,
    tooltip,
    size = 24,
    color = COLORS.text.primary,
    style,
    children
}) => {
    const [visible, setVisible] = useState(false);

    const handleLongPress = () => {
        if (tooltip) {
            setVisible(true);
            // Auto hide after 2 seconds if user doesn't tap out
            setTimeout(() => setVisible(false), 2500);
        }
    };

    return (
        <View>
            <TouchableOpacity
                onPress={onPress}
                onLongPress={handleLongPress}
                delayLongPress={500} // Half second hold
                style={[styles.button, style]}
                activeOpacity={0.7}
            >
                {children || <Ionicons name={iconName} size={size} color={color} />}
            </TouchableOpacity>

            <Modal
                transparent={true}
                visible={visible}
                animationType="fade"
                onRequestClose={() => setVisible(false)}
            >
                <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
                    <View style={styles.tooltipContainer}>
                        <View style={styles.tooltipContent}>
                            <Ionicons name="information-circle" size={20} color={COLORS.accent.cyan} />
                            <Text style={styles.tooltipText}>{tooltip}</Text>
                        </View>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    button: {
        padding: SPACING.xs,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)', // Slight dim
        justifyContent: 'center',
        alignItems: 'center',
    },
    tooltipContainer: {
        position: 'absolute',
        // Center of screen usually best for visibility, or we could try to position relative if we measured
        top: '40%',
        padding: SPACING.lg,
    },
    tooltipContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        backgroundColor: COLORS.background.card,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.accent.cyan,
        ...SHADOWS.lg,
    },
    tooltipText: {
        color: COLORS.text.primary,
        fontSize: TYPOGRAPHY.sizes.md,
        fontWeight: TYPOGRAPHY.weights.bold,
    }
});

export default TooltipIconButton;
