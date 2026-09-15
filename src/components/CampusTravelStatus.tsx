import { resolveCampusDisplayName } from '../../convex/campus/registry';
import { worldLocations } from '../../convex/world/locations';
import type { ScenarioRuntimeView } from '../hooks/useScenarioRuntime';

export default function CampusTravelStatus(props: {
  scenarioRuntime: ScenarioRuntimeView;
}) {
  const { lastTravel, universityProfile } = props.scenarioRuntime;
  if (!lastTravel || lastTravel.travelMinutes <= 0) return null;

  const baseName = worldLocations[lastTravel.locationId]?.name ?? lastTravel.locationId;
  const locationName = universityProfile
    ? resolveCampusDisplayName(universityProfile, lastTravel.locationId, baseName)
    : baseName;

  return (
    <div className="mb-3 rounded border border-brown-700 bg-brown-900/30 px-3 py-2 text-xs leading-5 text-brown-300">
      最近一次校园移动：到 {locationName} · 约 {lastTravel.travelMinutes} 分钟，已计入游戏时间。
    </div>
  );
}
