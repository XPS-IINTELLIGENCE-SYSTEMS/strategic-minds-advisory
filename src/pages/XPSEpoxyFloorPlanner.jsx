import React, { useState } from 'react';
import XPSEpoxyPlannerHero from '@/components/xps-contractor-success/epoxy/XPSEpoxyPlannerHero';
import XPSEpoxyPhoneBoard from '@/components/xps-contractor-success/epoxy/XPSEpoxyPhoneBoard';
import XPSEpoxyFloorVisualizer from '@/components/xps-contractor-success/epoxy/XPSEpoxyFloorVisualizer';
import XPSEpoxySystemSelector from '@/components/xps-contractor-success/epoxy/XPSEpoxySystemSelector';
import XPSEpoxyColorSelector from '@/components/xps-contractor-success/epoxy/XPSEpoxyColorSelector';
import XPSEpoxyCustomerWorksheet from '@/components/xps-contractor-success/epoxy/XPSEpoxyCustomerWorksheet';
import XPSEpoxyTroubleshootingIntake from '@/components/xps-contractor-success/epoxy/XPSEpoxyTroubleshootingIntake';
import XPSEpoxyAssistantChat from '@/components/xps-contractor-success/epoxy/XPSEpoxyAssistantChat';
import XPSEpoxyLeadCapture from '@/components/xps-contractor-success/epoxy/XPSEpoxyLeadCapture';
import XPSEpoxySafetyNotice from '@/components/xps-contractor-success/epoxy/XPSEpoxySafetyNotice';
import XPSEpoxyEcosystemLinks from '@/components/xps-contractor-success/epoxy/XPSEpoxyEcosystemLinks';
import XPSEpoxyVisualQA from '@/components/xps-contractor-success/epoxy/XPSEpoxyVisualQA';

export default function XPSEpoxyFloorPlanner() {
  const [visualizerSelection, setVisualizerSelection] = useState(null);
  const [favoriteSystem, setFavoriteSystem] = useState('Flake Epoxy');
  const [favoriteColors, setFavoriteColors] = useState('');
  const [troubleshooting, setTroubleshooting] = useState({});

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#222]">
      <XPSEpoxyPlannerHero />
      <XPSEpoxyPhoneBoard />
      <XPSEpoxyFloorVisualizer onSave={setVisualizerSelection} />
      <XPSEpoxySystemSelector onSelect={setFavoriteSystem} />
      <XPSEpoxyColorSelector onSelect={setFavoriteColors} />
      <XPSEpoxyCustomerWorksheet visualizerSelection={visualizerSelection} favoriteSystem={favoriteSystem} favoriteColors={favoriteColors} />
      <XPSEpoxyTroubleshootingIntake onChange={setTroubleshooting} />
      <XPSEpoxyAssistantChat visualizerSelection={visualizerSelection} troubleshooting={troubleshooting} />
      <XPSEpoxyLeadCapture />
      <XPSEpoxyEcosystemLinks />
      <XPSEpoxySafetyNotice />
      <XPSEpoxyVisualQA />
    </main>
  );
}
