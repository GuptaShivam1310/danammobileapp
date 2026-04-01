import { ImageSourcePropType } from 'react-native';
import { SvgProps } from 'react-native-svg';

export interface TranslatableStepCard {
  id: string;
  svgAsset?: React.FC<SvgProps>;
  imageAsset?: ImageSourcePropType;
  svgWidth: number;
  svgHeight: number;
  titlePrimaryKey: string;
  titleSecondaryKey: string;
  descriptionKey: string;
}
