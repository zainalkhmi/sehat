import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';

export type PilloMood = 'calm' | 'countdown' | 'annoyed' | 'furious' | 'celebrate';

interface PilloAvatarProps {
  mood?: PilloMood;
  size?: number; // default 170
  showFireAura?: boolean;
}

export const PilloAvatar: React.FC<PilloAvatarProps> = ({
  mood = 'calm',
  size = 170,
  showFireAura = false,
}) => {
  // Animations: breathing scale & fire flicker
  const breathAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Gentle breathing loop
    const breath = Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, {
          toValue: mood === 'furious' ? 1.05 : 1.02,
          duration: mood === 'furious' ? 400 : 1200,
          useNativeDriver: true,
        }),
        Animated.timing(breathAnim, {
          toValue: mood === 'furious' ? 0.96 : 0.98,
          duration: mood === 'furious' ? 400 : 1200,
          useNativeDriver: true,
        }),
      ])
    );
    breath.start();

    return () => breath.stop();
  }, [mood]);

  // Furious shake effect
  useEffect(() => {
    if (mood === 'furious') {
      const shake = Animated.loop(
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: -3, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 3, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -2, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 2, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ])
      );
      shake.start();
      return () => shake.stop();
    } else {
      shakeAnim.setValue(0);
    }
  }, [mood]);

  // Periodic Blink
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 0.1, duration: 80, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
      ]).start();
    }, mood === 'furious' ? 2200 : 3500);

    return () => clearInterval(blinkInterval);
  }, [mood]);

  const scaleRatio = size / 170;

  // Colors based on mood
  const isFurious = mood === 'furious';
  const isAnnoyed = mood === 'annoyed';
  const isCelebrate = mood === 'celebrate';

  const bodyBgColor = isFurious
    ? '#D9435E' // Angry fiery red-coral
    : isAnnoyed
    ? '#3B6BE8'
    : isCelebrate
    ? '#2E7DFF'
    : '#2E6BFF'; // Iconic Pillo electric blue

  const cheekBgColor = isFurious ? '#FF7A8E50' : '#73A4FF60';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          transform: [
            { scale: breathAnim },
            { translateX: shakeAnim },
          ],
        },
      ]}
    >
      {/* 1. Fire Aura Flames in Furious Mode */}
      {(isFurious || showFireAura) && (
        <View style={[styles.fireAuraWrap, { width: size * 1.35, height: size * 1.35 }]}>
          {/* Flame spikes behind */}
          <View style={[styles.flameParticle, styles.flame1, { transform: [{ scale: scaleRatio }] }]} />
          <View style={[styles.flameParticle, styles.flame2, { transform: [{ scale: scaleRatio }] }]} />
          <View style={[styles.flameParticle, styles.flame3, { transform: [{ scale: scaleRatio }] }]} />
          <View style={[styles.flameParticle, styles.flame4, { transform: [{ scale: scaleRatio }] }]} />
          <View style={[styles.flameParticle, styles.flame5, { transform: [{ scale: scaleRatio }] }]} />
        </View>
      )}

      {/* 2. Main Pillo Body */}
      <View
        style={[
          styles.pilloBody,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: bodyBgColor,
          },
        ]}
      >
        {/* Right hair spikes (Pillo's signature hair tufts) */}
        <View
          style={[
            styles.hairTuftTop,
            {
              backgroundColor: bodyBgColor,
              right: -12 * scaleRatio,
              top: 24 * scaleRatio,
              width: 32 * scaleRatio,
              height: 24 * scaleRatio,
            },
          ]}
        />
        <View
          style={[
            styles.hairTuftMid,
            {
              backgroundColor: bodyBgColor,
              right: -18 * scaleRatio,
              top: 50 * scaleRatio,
              width: 38 * scaleRatio,
              height: 26 * scaleRatio,
            },
          ]}
        />
        <View
          style={[
            styles.hairTuftBottom,
            {
              backgroundColor: bodyBgColor,
              right: -10 * scaleRatio,
              top: 78 * scaleRatio,
              width: 28 * scaleRatio,
              height: 22 * scaleRatio,
            },
          ]}
        />

        {/* 3. Eyebrows (Dynamic for Furious or Annoyed) */}
        {isFurious && (
          <View style={[styles.eyebrowsRow, { top: 28 * scaleRatio }]}>
            <View
              style={[
                styles.furiousBrowLeft,
                { width: 34 * scaleRatio, height: 8 * scaleRatio },
              ]}
            />
            <View
              style={[
                styles.furiousBrowRight,
                { width: 34 * scaleRatio, height: 8 * scaleRatio },
              ]}
            />
          </View>
        )}

        {isAnnoyed && (
          <View style={[styles.eyebrowsRow, { top: 32 * scaleRatio }]}>
            <View
              style={[
                styles.annoyedBrowLeft,
                { width: 28 * scaleRatio, height: 6 * scaleRatio },
              ]}
            />
            <View
              style={[
                styles.annoyedBrowRight,
                { width: 28 * scaleRatio, height: 6 * scaleRatio },
              ]}
            />
          </View>
        )}

        {/* 4. Eyes Container */}
        <Animated.View
          style={[
            styles.eyesContainer,
            {
              top: (isFurious ? 38 : 34) * scaleRatio,
              transform: [{ scaleY: blinkAnim }],
            },
          ]}
        >
          {/* Left Eye */}
          <View
            style={[
              styles.eyeSclera,
              isFurious && styles.eyeScleraFuriousLeft,
              {
                width: 48 * scaleRatio,
                height: 58 * scaleRatio,
                borderRadius: 24 * scaleRatio,
              },
            ]}
          >
            <View
              style={[
                styles.pupil,
                isFurious ? styles.pupilFurious : styles.pupilNormal,
                {
                  width: 32 * scaleRatio,
                  height: 38 * scaleRatio,
                  borderRadius: 16 * scaleRatio,
                },
              ]}
            >
              {/* Catchlight reflection */}
              <View
                style={[
                  styles.catchlight,
                  {
                    width: 10 * scaleRatio,
                    height: 10 * scaleRatio,
                    borderRadius: 5 * scaleRatio,
                    top: 4 * scaleRatio,
                    left: 5 * scaleRatio,
                  },
                ]}
              />
            </View>
          </View>

          {/* Right Eye */}
          <View
            style={[
              styles.eyeSclera,
              isFurious && styles.eyeScleraFuriousRight,
              {
                width: 48 * scaleRatio,
                height: 58 * scaleRatio,
                borderRadius: 24 * scaleRatio,
              },
            ]}
          >
            <View
              style={[
                styles.pupil,
                isFurious ? styles.pupilFurious : styles.pupilNormal,
                {
                  width: 32 * scaleRatio,
                  height: 38 * scaleRatio,
                  borderRadius: 16 * scaleRatio,
                },
              ]}
            >
              {/* Catchlight reflection */}
              <View
                style={[
                  styles.catchlight,
                  {
                    width: 10 * scaleRatio,
                    height: 10 * scaleRatio,
                    borderRadius: 5 * scaleRatio,
                    top: 4 * scaleRatio,
                    left: 5 * scaleRatio,
                  },
                ]}
              />
            </View>
          </View>
        </Animated.View>

        {/* 5. Cute Cheeks (Blush) */}
        <View style={[styles.cheeksRow, { top: 78 * scaleRatio }]}>
          <View
            style={[
              styles.cheek,
              {
                backgroundColor: cheekBgColor,
                width: 34 * scaleRatio,
                height: 22 * scaleRatio,
                borderRadius: 12 * scaleRatio,
              },
            ]}
          />
          <View
            style={[
              styles.cheek,
              {
                backgroundColor: cheekBgColor,
                width: 34 * scaleRatio,
                height: 22 * scaleRatio,
                borderRadius: 12 * scaleRatio,
              },
            ]}
          />
        </View>

        {/* 6. Nose Dot */}
        <View
          style={[
            styles.noseDot,
            {
              top: 76 * scaleRatio,
              width: 5 * scaleRatio,
              height: 5 * scaleRatio,
              borderRadius: 2.5 * scaleRatio,
              backgroundColor: isFurious ? '#FFC4CB' : '#B0D0FF',
            },
          ]}
        />

        {/* 7. Mouth Expression */}
        {isFurious ? (
          // Furious screaming mouth or gritted teeth
          <View
            style={[
              styles.furiousMouth,
              {
                top: 96 * scaleRatio,
                width: 42 * scaleRatio,
                height: 28 * scaleRatio,
                borderRadius: 14 * scaleRatio,
              },
            ]}
          >
            {/* Teeth arc */}
            <View
              style={[
                styles.teethRow,
                {
                  height: 9 * scaleRatio,
                },
              ]}
            />
            {/* Dark inner mouth */}
            <View style={styles.furiousTongueWrap}>
              <View
                style={[
                  styles.furiousTongue,
                  {
                    width: 22 * scaleRatio,
                    height: 12 * scaleRatio,
                    borderRadius: 6 * scaleRatio,
                  },
                ]}
              />
            </View>
          </View>
        ) : isAnnoyed ? (
          // Annoyed wavy mouth
          <View
            style={[
              styles.annoyedMouth,
              {
                top: 100 * scaleRatio,
                width: 26 * scaleRatio,
                height: 10 * scaleRatio,
                borderRadius: 5 * scaleRatio,
              },
            ]}
          />
        ) : (
          // Calm & Happy Open Smile with pink tongue
          <View
            style={[
              styles.happyMouth,
              {
                top: 92 * scaleRatio,
                width: 38 * scaleRatio,
                height: 30 * scaleRatio,
                borderBottomLeftRadius: 19 * scaleRatio,
                borderBottomRightRadius: 19 * scaleRatio,
              },
            ]}
          >
            {/* Cute pink tongue */}
            <View
              style={[
                styles.happyTongue,
                {
                  width: 28 * scaleRatio,
                  height: 16 * scaleRatio,
                  borderTopLeftRadius: 14 * scaleRatio,
                  borderTopRightRadius: 14 * scaleRatio,
                  bottom: 0,
                },
              ]}
            />
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pilloBody: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'visible',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  // Hair tufts on right side
  hairTuftTop: {
    position: 'absolute',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 8,
    transform: [{ rotate: '-15deg' }],
  },
  hairTuftMid: {
    position: 'absolute',
    borderTopRightRadius: 25,
    borderBottomRightRadius: 10,
    transform: [{ rotate: '5deg' }],
  },
  hairTuftBottom: {
    position: 'absolute',
    borderTopRightRadius: 18,
    borderBottomRightRadius: 12,
    transform: [{ rotate: '25deg' }],
  },
  // Fire Aura
  fireAuraWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1,
  },
  flameParticle: {
    position: 'absolute',
    backgroundColor: '#FF3B30',
    opacity: 0.75,
  },
  flame1: {
    width: 60,
    height: 100,
    borderRadius: 30,
    top: -25,
    backgroundColor: '#FF453A',
    transform: [{ rotate: '-10deg' }],
  },
  flame2: {
    width: 50,
    height: 90,
    borderRadius: 25,
    top: -15,
    right: 20,
    backgroundColor: '#FF9F0A',
    transform: [{ rotate: '20deg' }],
  },
  flame3: {
    width: 50,
    height: 90,
    borderRadius: 25,
    top: -15,
    left: 20,
    backgroundColor: '#FF375F',
    transform: [{ rotate: '-25deg' }],
  },
  flame4: {
    width: 35,
    height: 70,
    borderRadius: 18,
    top: -30,
    left: 55,
    backgroundColor: '#FFD60A',
  },
  flame5: {
    width: 35,
    height: 70,
    borderRadius: 18,
    top: -30,
    right: 55,
    backgroundColor: '#FF9F0A',
  },
  // Eyebrows
  eyebrowsRow: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '68%',
    zIndex: 10,
  },
  furiousBrowLeft: {
    backgroundColor: '#520B16',
    borderTopLeftRadius: 4,
    borderBottomRightRadius: 4,
    transform: [{ rotate: '25deg' }],
  },
  furiousBrowRight: {
    backgroundColor: '#520B16',
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 4,
    transform: [{ rotate: '-25deg' }],
  },
  annoyedBrowLeft: {
    backgroundColor: '#1E3A8A',
    borderRadius: 3,
    transform: [{ rotate: '12deg' }],
  },
  annoyedBrowRight: {
    backgroundColor: '#1E3A8A',
    borderRadius: 3,
    transform: [{ rotate: '-12deg' }],
  },
  // Eyes
  eyesContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '78%',
    gap: 12,
  },
  eyeSclera: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  eyeScleraFuriousLeft: {
    transform: [{ rotate: '-10deg' }],
  },
  eyeScleraFuriousRight: {
    transform: [{ rotate: '10deg' }],
  },
  pupil: {
    backgroundColor: '#141416',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pupilNormal: {
    alignSelf: 'center',
  },
  pupilFurious: {
    backgroundColor: '#2A060C',
  },
  catchlight: {
    backgroundColor: '#FFFFFF',
    position: 'absolute',
  },
  // Cheeks
  cheeksRow: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '85%',
  },
  cheek: {},
  // Nose
  noseDot: {
    position: 'absolute',
  },
  // Mouth
  happyMouth: {
    position: 'absolute',
    backgroundColor: '#1A1A1A',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  happyTongue: {
    backgroundColor: '#FF6B8B',
    position: 'absolute',
  },
  annoyedMouth: {
    position: 'absolute',
    backgroundColor: '#1A1A1A',
  },
  furiousMouth: {
    position: 'absolute',
    backgroundColor: '#2B040B',
    borderWidth: 1.5,
    borderColor: '#78101E',
    overflow: 'hidden',
    alignItems: 'center',
  },
  teethRow: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  furiousTongueWrap: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  furiousTongue: {
    backgroundColor: '#FF4D6D',
  },
});
