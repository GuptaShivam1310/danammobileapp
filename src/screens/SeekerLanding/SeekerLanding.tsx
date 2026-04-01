import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useTheme } from '../../theme';
import { createSeekerLandingStyles } from './seekerLanding.styles';
import { SeekerHeader } from '../../components/specified/Dashbaord/SeekerHeader';
import { normalize } from '../../theme/scale';
import { ArrowIcon, ChatIcon, People, FileSearchIcon } from '../../assets/icons';
import { SeekerDashboardDualFlow } from '../../components/specified/Dashbaord/SeekerWorkFlow/SeekerDashboardDualFlow';
import AppImages from '../../assets/images';
import { ROUTES } from '../../constants/routes';
import { RootStackParamList } from '../../models/navigation';

interface ImpactDataItem {
  id: string;
  imageKey: keyof typeof AppImages;
  titleKey: string;
  subtitleKey: string;
}

interface WhyChooseDataItem {
  id: string;
  iconKey: 'search' | 'contributor' | 'chat';
  titleKey: string;
  subtitleKey: string;
}

function clampIndex(value: number, total: number) {
  return Math.max(0, Math.min(value, total - 1));
}

export const SeekerLanding = memo(function SeekerLanding() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { width: deviceWidth } = useWindowDimensions();
  const styles = useMemo(
    () => createSeekerLandingStyles(theme, deviceWidth),
    [theme, deviceWidth],
  );
  const [impactIndex, setImpactIndex] = useState(0);
  const [whyChooseIndex, setWhyChooseIndex] = useState(0);
  const [impactContentWidth, setImpactContentWidth] = useState(0);
  const [impactViewportWidth, setImpactViewportWidth] = useState(0);
  const [whyContentWidth, setWhyContentWidth] = useState(0);
  const [whyViewportWidth, setWhyViewportWidth] = useState(0);
  const [ctaSize, setCtaSize] = useState({ width: 0, height: 0 });

  const impactData = useMemo(() => {
    const items = require('./data/impactCarousel.json') as ImpactDataItem[];
    return items.map(item => ({
      ...item,
      image: AppImages[item.imageKey],
    }));
  }, []);

  const whyChooseData = useMemo(() => {
    const items = require('./data/whyChooseDanam.json') as WhyChooseDataItem[];
    return items;
  }, []);

  const iconMap = {
    search: FileSearchIcon,
    contributor: People,
    chat: ChatIcon,
  } as const;

  const whyCardWidth = normalize(165);
  const whyCardSpacing = normalize(14);
  const whySnapInterval = whyCardWidth + whyCardSpacing;

  const onPressActionButton = useCallback(() => {
    navigation.navigate(ROUTES.LOOKING_FOR_ITEM);
  }, [navigation]);

  const calculateActiveIndex = useCallback((
    scrollX: number,
    viewportWidth: number,
    contentWidth: number,
    total: number,
    itemWidth?: number,
  ) => {
    if (total <= 1) {
      return 0;
    }

    if (contentWidth <= viewportWidth) {
      return 0;
    }

    const divisor = itemWidth ?? viewportWidth;
    const rawIndex = Math.round(scrollX / divisor);
    return clampIndex(rawIndex, total);
  }, []);

  const onImpactScroll = useCallback((scrollX: number) => {
    const viewport = impactViewportWidth || deviceWidth;
    const nextIndex = calculateActiveIndex(
      scrollX,
      viewport,
      impactContentWidth,
      impactData.length,
    );
    setImpactIndex(nextIndex);
  }, [
    calculateActiveIndex,
    deviceWidth,
    impactContentWidth,
    impactData.length,
    impactViewportWidth,
  ]);

  const onWhyChooseScroll = useCallback((scrollX: number) => {
    const viewport = whyViewportWidth || deviceWidth;
    const nextIndex = calculateActiveIndex(
      scrollX,
      viewport,
      whyContentWidth,
      whyChooseData.length,
      whySnapInterval,
    );
    setWhyChooseIndex(nextIndex);
  }, [
    calculateActiveIndex,
    deviceWidth,
    whyChooseData.length,
    whyContentWidth,
    whySnapInterval,
    whyViewportWidth,
  ]);

  const renderDots = useCallback((
    total: number,
    activeIndex: number,
    type: 'impact' | 'why',
  ) => {
    return (
      <View style={styles.carouselDotsWrap}>
        {Array.from({ length: total }).map((_, index) => (
          <View
            key={`dashboard-dot-${type}-${index}`}
            style={[
              styles.carouselDot,
              index === 0 ? styles.carouselDotFirst : null,
              activeIndex === index
                ? (type === 'impact' ? styles.impactDotActive : styles.whyDotActive)
                : null,
            ]}
          />
        ))}
      </View>
    )
  }, [
    styles.carouselDot,
    styles.carouselDotFirst,
    styles.carouselDotsWrap,
    styles.impactDotActive,
    styles.whyDotActive,
  ]);

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.screenContent}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.container}>
        <SeekerHeader
          title={t('seekerDashboard.header.title')}
          subtitle={t('seekerDashboard.header.subtitle')}
        />

        <View style={styles.bodyContainer}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.stepsContainer}
          >
            <Text style={styles.howItWorksTitle}>{t('seekerDashboard.howDanamWorks')}</Text>
            <SeekerDashboardDualFlow />

            <Text style={styles.impactTitle}>{t('seekerDashboard.impactCreatedTitle')}</Text>

            <View
              style={styles.impactCarouselContainer}
              onLayout={event => setImpactViewportWidth(event.nativeEvent.layout.width)}
            >
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onContentSizeChange={width => setImpactContentWidth(width)}
                onScroll={event => onImpactScroll(event.nativeEvent.contentOffset.x)}
                scrollEventThrottle={16}
              >
                {impactData.map(item => (
                  <View key={item.id} style={styles.impactSlide}>
                    <Image source={item.image} style={styles.impactImage} resizeMode="cover" />
                    <View style={styles.impactTextWrap}>
                      <Text style={styles.impactCardTitle}>{t(item.titleKey)}</Text>
                      <Text style={styles.impactCardSubtitle}>{t(item.subtitleKey)}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
              {renderDots(impactData.length, impactIndex, 'impact')}
            </View>

            <View style={styles.sectionHorizontalPadding}>
              <View style={styles.whyChooseTitleWrap}>
                <Text style={styles.whyChooseTitle}>{t('seekerDashboard.whyChooseTitle')}</Text>
              </View>

              <View
                style={styles.whyChooseCarouselWrap}
                onLayout={event => setWhyViewportWidth(event.nativeEvent.layout.width)}
              >
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={whySnapInterval}
                  decelerationRate="fast"
                  onContentSizeChange={width => setWhyContentWidth(width)}
                  onScroll={event => onWhyChooseScroll(event.nativeEvent.contentOffset.x)}
                  scrollEventThrottle={16}
                >
                  {whyChooseData.map(item => {
                    const Icon = iconMap[item.iconKey];
                    return (
                      <View key={item.id} style={styles.whyChooseCard}>
                        <View style={styles.whyChooseIconWrap}>
                          <Icon style={styles.whyChooseIcon} />
                        </View>
                        <Text style={styles.whyChooseCardTitle}>{t(item.titleKey)}</Text>
                        <Text style={styles.whyChooseCardSubtitle}>{t(item.subtitleKey)}</Text>
                      </View>
                    );
                  })}
                </ScrollView>
                {renderDots(Math.floor(whyChooseData.length / 2), whyChooseIndex, 'why')}
              </View>

              <View style={styles.actionWrap}>
                <View
                  style={styles.actionGradientBorder}
                  onLayout={event => {
                    const { width, height } = event.nativeEvent.layout;
                    if (width !== ctaSize.width || height !== ctaSize.height) {
                      setCtaSize({ width, height });
                    }
                  }}
                >
                  {ctaSize.width > 0 && ctaSize.height > 0 ? (
                    <Svg
                      width={ctaSize.width}
                      height={ctaSize.height}
                      style={styles.actionGradientSvg}
                      pointerEvents="none"
                    >
                      <Defs>
                        <LinearGradient id="seekerActionGradient" x1="0" y1="0" x2="1" y2="0">
                          <Stop offset="0%" stopColor={theme.colors.accentYellow} />
                          <Stop offset="100%" stopColor={theme.colors.seekerWhyDotActive} />
                        </LinearGradient>
                      </Defs>
                      <Rect
                        x={1}
                        y={1}
                        width={Math.max(ctaSize.width - 2, 0)}
                        height={Math.max(ctaSize.height - 2, 0)}
                        rx={normalize(10)}
                        fill="transparent"
                        stroke="url(#seekerActionGradient)"
                        strokeWidth={2}
                      />
                    </Svg>
                  ) : null}

                  <Pressable onPress={onPressActionButton} style={styles.actionButton}>
                    <Text style={styles.actionTitle}>{t('seekerDashboard.ctaTitle')}</Text>
                    <ArrowIcon style={styles.actionArrow} />
                  </Pressable>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
});
