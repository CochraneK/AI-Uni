import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { resolveCampusDisplayName } from '../../convex/campus/registry';
import { worldLocations } from '../../convex/world/locations';
import type { ScenarioRuntimeView } from '../hooks/useScenarioRuntime';

const statusText: Record<string, string> = {
  scheduled: '待处理',
  attended_on_time: '已按时参加',
  attended_late: '迟到后参加',
  missed: '未参加',
  skipped: '已跳过',
};

const temporalText: Record<string, string> = {
  upcoming: '还没到时间',
  arrival_window: '可以到场',
  late_window: '已经迟到，仍可参加',
  expired: '已经错过结束时间',
  resolved: '已处理',
};

export default function ScheduledCommitmentsPanel(props: {
  scenarioRuntime: ScenarioRuntimeView;
}) {
  const { profile, locationId, activeScenario, universityProfile } = props.scenarioRuntime;
  const commitments = useQuery(
    api.life.commitments.listCurrentCommitments,
    profile ? { profileId: profile._id } : 'skip',
  );
  const checkInCommitment = useMutation(api.life.commitments.checkInCommitment);
  const skipCommitment = useMutation(api.life.commitments.skipCommitment);
  const [runningId, setRunningId] = useState<string>();
  const [message, setMessage] = useState<string>();

  if (!profile || !commitments || commitments.length === 0) return null;

  return (
    <div className="mb-3 rounded border-2 border-brown-700 bg-brown-900/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-base text-brown-100">今天的固定安排</h2>
        <span className="text-xs text-brown-400">课程 / 会议 / 约定</span>
      </div>
      <p className="mt-1 text-xs leading-5 text-brown-400">
        这是生活日程，不是心理评分。迟到、缺席或主动跳过只会作为人生经历与剧情状态保存。
      </p>

      <div className="mt-3 grid gap-2">
        {commitments.map((commitment) => {
          const baseName = worldLocations[commitment.locationId]?.name ?? commitment.locationId;
          const commitmentLocationName = universityProfile
            ? resolveCampusDisplayName(universityProfile, commitment.locationId, baseName)
            : baseName;
          const isHere = locationId === commitment.locationId;
          const unresolved = commitment.status === 'scheduled';
          const canArrive =
            unresolved &&
            (commitment.temporalState === 'arrival_window' ||
              commitment.temporalState === 'late_window');
          const checkInDisabled = runningId !== undefined || !canArrive || !isHere;

          return (
            <div
              key={commitment._id}
              className="rounded border border-brown-700 bg-brown-900/25 px-3 py-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-brown-100">{commitment.title}</div>
                  <div className="mt-1 text-xs text-brown-300">
                    {commitment.startTime}–{commitment.endTime} · {commitmentLocationName}
                  </div>
                </div>
                <span className="shrink-0 text-xs text-brown-400">
                  {commitment.attendanceRequired ? '必到' : '可选'}
                </span>
              </div>

              <div className="mt-1 text-xs leading-5 text-brown-400">
                {unresolved
                  ? temporalText[commitment.temporalState]
                  : statusText[commitment.status] ?? commitment.status}
                {unresolved && canArrive && !isHere ? ` · 先到${commitmentLocationName}` : ''}
                {unresolved && canArrive && isHere && activeScenario
                  ? ' · 到场会优先收束当前随机事件'
                  : ''}
              </div>

              {unresolved && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    className="rounded bg-brown-600 px-2.5 py-1.5 text-xs font-semibold text-brown-50 hover:bg-brown-500 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={checkInDisabled}
                    onClick={() => {
                      setMessage(undefined);
                      setRunningId(commitment._id);
                      void checkInCommitment({ commitmentId: commitment._id })
                        .then((result) => {
                          if (result.checkedIn) {
                            setMessage(
                              result.status === 'attended_late'
                                ? `${commitment.title}：你迟到后参加了，结束时游戏时间为 ${result.gameTime}。`
                                : `${commitment.title}：已到场，结束时游戏时间为 ${result.gameTime}。`,
                            );
                            return;
                          }
                          if (result.reason === 'too_early') {
                            setMessage(`${commitment.title} 还没开始，${result.startTime} 前再来。`);
                          } else if (result.reason === 'too_late') {
                            setMessage(`${commitment.title} 已经结束，本次记录为未参加。`);
                          } else if (result.reason === 'wrong_location') {
                            setMessage(`先到 ${commitmentLocationName} 再到场。`);
                          } else {
                            setMessage('这个安排现在无法到场。');
                          }
                        })
                        .catch((error) => {
                          console.error('Failed to check in AI-Uni commitment', error);
                          setMessage('到场状态暂时无法更新，请稍后再试。');
                        })
                        .finally(() => setRunningId(undefined));
                    }}
                  >
                    {commitment.temporalState === 'late_window' ? '迟到后参加' : '到场'}
                  </button>
                  <button
                    className="rounded border border-brown-600 px-2.5 py-1.5 text-xs text-brown-200 hover:bg-brown-700 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={runningId !== undefined}
                    onClick={() => {
                      setMessage(undefined);
                      setRunningId(commitment._id);
                      void skipCommitment({ commitmentId: commitment._id })
                        .then((result) => {
                          setMessage(
                            result.skipped
                              ? `${commitment.title}：已选择不参加。`
                              : `${commitment.title} 已经处理过了。`,
                          );
                        })
                        .catch((error) => {
                          console.error('Failed to skip AI-Uni commitment', error);
                          setMessage('暂时无法更新这个安排。');
                        })
                        .finally(() => setRunningId(undefined));
                    }}
                  >
                    {commitment.attendanceRequired ? '不参加' : '跳过'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {message && (
        <p className="mt-3 rounded bg-brown-800 px-3 py-2 text-xs leading-5 text-brown-200">
          {message}
        </p>
      )}
    </div>
  );
}
