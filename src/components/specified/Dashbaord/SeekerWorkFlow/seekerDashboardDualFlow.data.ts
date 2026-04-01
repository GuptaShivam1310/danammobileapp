import {
  SEEKER_DASHBOARD_ACKNOWLEDGEMENT_ASSET,
  SeekerDashboardConnectIcon,
  SeekerDashboardExpressIcon,
  SeekerDashboardIdentifierIcon,
  SeekerDashboardPostIcon,
} from '../../../../assets/icons';
import { TranslatableStepCard } from './types';

export const SEEKER_DUAL_FLOW_CARDS: TranslatableStepCard[] = [
  {
    id: 'post-browse',
    svgAsset: SeekerDashboardPostIcon,
    svgWidth: 168,
    svgHeight: 190,
    titlePrimaryKey: 'seekerDashboard.dualFlow.postBrowse.titlePrimary',
    titleSecondaryKey: 'seekerDashboard.dualFlow.postBrowse.titleSecondary',
    descriptionKey: 'seekerDashboard.dualFlow.postBrowse.description',
  },
  {
    id: 'express-interest',
    svgAsset: SeekerDashboardExpressIcon,
    svgWidth: 150,
    svgHeight: 170,
    titlePrimaryKey: 'seekerDashboard.dualFlow.expressInterest.titlePrimary',
    titleSecondaryKey: 'seekerDashboard.dualFlow.expressInterest.titleSecondary',
    descriptionKey: 'seekerDashboard.dualFlow.expressInterest.description',
  },
  {
    id: 'get-connected',
    svgAsset: SeekerDashboardConnectIcon,
    svgWidth: 168,
    svgHeight: 190,
    titlePrimaryKey: 'seekerDashboard.dualFlow.getConnected.titlePrimary',
    titleSecondaryKey: 'seekerDashboard.dualFlow.getConnected.titleSecondary',
    descriptionKey: 'seekerDashboard.dualFlow.getConnected.description',
  },
  {
    id: 'identify-right-seeker',
    svgAsset: SeekerDashboardIdentifierIcon,
    svgWidth: 150,
    svgHeight: 170,
    titlePrimaryKey: 'seekerDashboard.dualFlow.identifyRightSeeker.titlePrimary',
    titleSecondaryKey: 'seekerDashboard.dualFlow.identifyRightSeeker.titleSecondary',
    descriptionKey: 'seekerDashboard.dualFlow.identifyRightSeeker.description',
  },
  {
    id: 'share-experience',
    svgAsset: SEEKER_DASHBOARD_ACKNOWLEDGEMENT_ASSET,
    svgWidth: 150,
    svgHeight: 170,
    titlePrimaryKey: 'seekerDashboard.dualFlow.shareExperience.titlePrimary',
    titleSecondaryKey: 'seekerDashboard.dualFlow.shareExperience.titleSecondary',
    descriptionKey: 'seekerDashboard.dualFlow.shareExperience.description',
  },
];
