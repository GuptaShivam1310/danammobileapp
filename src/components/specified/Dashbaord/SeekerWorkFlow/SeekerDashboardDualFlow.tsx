import React, { memo, useMemo } from 'react';
import { Image, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  SEEKER_DUAL_FLOW_CARDS,
} from './seekerDashboardDualFlow.data';
import { createSeekerDashboardDualFlowStyles, createStyles } from './seekerDashboardDualFlow.styles';
import { DashBorderLeftIcon, DashBorderRightIcon } from '../../../../assets/icons';
import { useTheme } from '../../../../theme';

function SeekerDashboardDualFlowComponent() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createSeekerDashboardDualFlowStyles(theme), [theme]);


  return (
    <View style={styles.container}>
      {SEEKER_DUAL_FLOW_CARDS.map((card, index) => {
        const SvgAsset = card.svgAsset;
        const isLastCard = index === SEEKER_DUAL_FLOW_CARDS.length - 1;
        const showRowTitle = card.id !== 'post-browse' && card.id !== 'share-experience';
        const TOP_POSITIONS = [152, 400, 750, 999, 900];
        const svgStyle = createStyles(TOP_POSITIONS[index])
        return (
          <React.Fragment key={card.id}>
            <View style={styles.cardWrap}>
              {SvgAsset ? (
                <SvgAsset width={card.svgWidth} height={card.svgHeight} />
              ) : (
                <Image
                  source={card.imageAsset!}
                  style={[
                    styles.cardGraphic,
                    { width: card.svgWidth, height: card.svgHeight },
                  ]}
                />
              )}

              {showRowTitle ? (
                <View style={styles.rowTitle}>
                  <Text style={styles.rowTitlePrimary}>{t(card.titlePrimaryKey)}</Text>
                  <Text style={styles.rowTitleSecondary}>{t(card.titleSecondaryKey)}</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.titlePrimary}>{t(card.titlePrimaryKey)}</Text>
                  <Text style={styles.titleSecondary}>{t(card.titleSecondaryKey)}</Text>
                </>
              )}

              <Text style={styles.description}>{t(card.descriptionKey)}</Text>
            </View>

            {!isLastCard && (
              <View style={index % 2 === 0 ? svgStyle.rightConnectorWrap : svgStyle.leftConnectorWrap}>
                {index % 2 === 0 ? (
                  <DashBorderRightIcon style={styles.rightConnectorSvg} />
                ) : (
                  <DashBorderLeftIcon style={styles.leftConnectorSvg} />
                )}
              </View>
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

export const SeekerDashboardDualFlow = memo(SeekerDashboardDualFlowComponent);
