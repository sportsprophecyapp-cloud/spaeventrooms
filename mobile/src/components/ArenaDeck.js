import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Dimensions, ActivityIndicator } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    useAnimatedGestureHandler,
    interpolate,
    runOnJS,
    withTiming,
    Easing
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import ArenaCard from './ArenaCard';
import { COLORS, SPACING } from '../constants/theme';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.3;

const ArenaDeck = ({ games, onComplete, onPredictionSuccess, sponsors }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [cards, setCards] = useState([]);
    const { user, updateUser } = useAuth();
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const generatedCards = [];
        games.forEach(g => {
            const isSoccer = g.sport?.toLowerCase() === 'soccer' || g.league?.toLowerCase().includes('soccer');
            const isNHL = g.sport?.toLowerCase() === 'hockey' || g.league?.toLowerCase() === 'nhl';

            // 1. Winner Card
            generatedCards.push({
                id: `${g.id}_winner`,
                game: g,
                type: 'winner',
                title: isNHL ? '🏒 MATCH WINNER' : '🏟️ MATCH WINNER',
                leftLabel: isNHL ? 'HOME ICE' : 'HOME WIN',
                rightLabel: isNHL ? 'ROAD WIN' : 'AWAY WIN'
            });

            // 2. BTTS (Soccer)
            if (isSoccer) {
                generatedCards.push({
                    id: `${g.id}_btts`,
                    game: g,
                    type: 'btts',
                    title: '⚽ BOTH TEAMS TO SCORE?',
                    leftLabel: 'YES',
                    rightLabel: 'NO'
                });
            }

            // 3. Over/Under
            if (isSoccer || isNHL) {
                generatedCards.push({
                    id: `${g.id}_total`,
                    game: g,
                    type: 'total',
                    title: isNHL ? '🥅 TOTAL GOALS (O/U 5.5)' : '🥅 TOTAL GOALS (O/U 2.5)',
                    leftLabel: 'OVER',
                    rightLabel: 'UNDER'
                });
            }
        });
        setCards(generatedCards);
    }, [games]);

    const currentSponsor = sponsors && sponsors.length > 0 
        ? sponsors[currentIndex % sponsors.length] 
        : null;

    const handleSwipeComplete = useCallback(async (direction) => {
        const card = cards[currentIndex];
        const game = card.game;
        
        let pick = '';
        if (card.type === 'winner') {
            pick = direction === 'right' ? game.homeTeam : game.awayTeam;
        } else {
            pick = direction === 'right' ? card.leftLabel : card.rightLabel;
        }

        // Visual feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Submit prediction logic
        try {
            if (user?.isGuest) {
                // Mock guest submission
                const currentPredictedGames = user.predictedGames || [];
                updateUser({
                    tokens: (user.tokens || 100) - 1,
                    predictedGames: [...currentPredictedGames, card.id]
                });
            } else {
                await apiService.submitPrediction({
                    userId: user.uuid,
                    eventId: game.id,
                    predictedWinner: pick,
                    type: card.type,
                    predictedScores: [0, 0], // Default for quick swipe
                    eventType: 'matchup',
                    confidenceLevel: 'normal',
                });
                
                // Track sponsor if applicable
                if (currentSponsor) {
                    apiService.trackSponsor(currentSponsor.id, 'prediction', 'match_card', game.id);
                }
                
                if (onPredictionSuccess) onPredictionSuccess(game, pick, card.type);
            }
        } catch (error) {
            console.error('Failed to submit prediction:', error);
        }

        // Move to next card
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(prev => prev + 1);
            translateX.value = 0;
            translateY.value = 0;
        } else {
            if (onComplete) onComplete();
        }
    }, [currentIndex, cards, user, currentSponsor, onPredictionSuccess, onComplete]);

    const gestureHandler = useAnimatedGestureHandler({
        onStart: (_, ctx) => {
            ctx.startX = translateX.value;
            ctx.startY = translateY.value;
        },
        onActive: (event, ctx) => {
            translateX.value = ctx.startX + event.translationX;
            translateY.value = ctx.startY + event.translationY;
        },
        onEnd: (event) => {
            if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
                const direction = event.translationX > 0 ? 'right' : 'left';
                translateX.value = withTiming(
                    direction === 'right' ? width * 1.5 : -width * 1.5,
                    { duration: 300, easing: Easing.out(Easing.exp) },
                    () => {
                        runOnJS(handleSwipeComplete)(direction);
                    }
                );
            } else {
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);
            }
        },
    });

    const animatedStyle = useAnimatedStyle(() => {
        const rotate = interpolate(
            translateX.value,
            [-width / 2, 0, width / 2],
            [-10, 0, 10]
        );

        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { rotate: `${rotate}deg` },
            ],
        };
    });

    const nextCardStyle = useAnimatedStyle(() => {
        const scale = interpolate(
            Math.abs(translateX.value),
            [0, SWIPE_THRESHOLD],
            [0.9, 1],
            'clamp'
        );
        const opacity = interpolate(
            Math.abs(translateX.value),
            [0, SWIPE_THRESHOLD],
            [0.6, 1],
            'clamp'
        );

        return {
            transform: [{ scale }],
            opacity,
        };
    });

    if (cards.length === 0) return null;

    return (
        <View style={styles.container}>
            {/* Background Card (Next) */}
            {currentIndex < cards.length - 1 && (
                <Animated.View style={[styles.cardWrapper, nextCardStyle, { zIndex: 0 }]}>
                    <ArenaCard 
                        game={cards[currentIndex + 1].game} 
                        cardType={cards[currentIndex + 1].type}
                        cardTitle={cards[currentIndex + 1].title}
                        leftLabel={cards[currentIndex + 1].leftLabel}
                        rightLabel={cards[currentIndex + 1].rightLabel}
                        dragX={useSharedValue(0)} 
                        sponsor={sponsors && sponsors.length > 0 ? sponsors[(currentIndex + 1) % sponsors.length] : null}
                    />
                </Animated.View>
            )}

            {/* Current Card */}
            <PanGestureHandler onGestureEvent={gestureHandler}>
                <Animated.View style={[styles.cardWrapper, animatedStyle, { zIndex: 1 }]}>
                    <ArenaCard 
                        game={cards[currentIndex].game} 
                        cardType={cards[currentIndex].type}
                        cardTitle={cards[currentIndex].title}
                        leftLabel={cards[currentIndex].leftLabel}
                        rightLabel={cards[currentIndex].rightLabel}
                        dragX={translateX} 
                        sponsor={currentSponsor}
                    />
                </Animated.View>
            </PanGestureHandler>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: SPACING.xxl,
    },
    cardWrapper: {
        position: 'absolute',
    },
});

export default ArenaDeck;
