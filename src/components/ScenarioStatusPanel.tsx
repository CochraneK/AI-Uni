import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { GameId } from '../../convex/aiTown/ids';
import { resolveCampusDisplayName } from '../../convex/campus/registry';
import { worldLocations } from '../../convex/world/locations';
import { campusActivityRules, getCampusActivities } from '../../convex/life/activities';
import {
  canSpendMinutes,
  formatGameMinute,
  getDayClock,
  makeDayClockKey,
  minutesRemainingInDay,
} from '../../convex/life/dayClock';
import type { ScenarioRuntimeView } from '../hooks/useScenarioRuntime';

export default function ScenarioStatusPanel(props: {
  humanPlayerId?: GameId<'players'>;
  scenarioRuntime: ScenarioRuntimeView;
}) {
  const [dayEndMessage, setDayEndMessage] = useState<string>();
  const [activityMessage, setActivityMessage] = useState<string>();
  const [scenarioMessage, setScenarioMessage] = useState<string>();
  const [runningActivityId, setRunningActivityId] = useState<string>();
  const [completingScenario, setCompletingScenario] = useState(false);
  const { runtime, locationId, activeScenario, universityProfile, profile } =
    props.scenarioRuntime;

  const completeActiveScenario = useMutation(api.scenarios.runtime.completeActiveScenario);
  const performCampusActivity = useMutation(api.life.day.performCampusActivity);
  const endFirstWeekDay = useMutation(api.life.day.endFirstWeekDay);
  const firstWeekStatus = useQuery(
    api.life.day.getFirstWeekStatus,
    profile?.chapterId === 'university_first_week' ? { profileId: profile._id } : 'skip',
  );

  const baseLocationName = locationId ? worldLocations[locationId]?.name : undefined;
  const locationName =
    locationId && universityProfile
      ? resolveCampusDisplayName(universityProfile, locationId, baseLocationName ?? locationId)
      : baseLocationName;
  const isFirstWeek = profile?.chapterId === 'university_first_week';
  const isFinalFirstWeekDay = isFirstWeek && profile?.chapterUnit === 7;
  const activities = !activeScenario && locationId ? getCampusActivities(locationId) : [];
  const currentDayKey = profile ? makeDayClockKey(profile) : undefined;
  const dayClock = profile && currentDayKey ? getDayClock(profile.state, currentDayKey) : undefined;
  const activityState =
    profile?.state?.campusActivities?.dayKey === currentDayKey
      ? profile?.state?.campusActivities
      : undefined;
  const completedActivityIds: string[] = Array.isArray(activityState?.completedIds)
    ? activityState.completedIds
    : [];
  const reachedActivityLimit =
    completedActivityIds.length >= campusActivityRules.maxDistinctActivitiesPerDay;
  const activeScenarioFitsToday =
    activeScenario && dayClock
      ? canSpendMinutes(dayClock, activeScenario.estimatedMinutes)
      : true;
  const activeScenarioEndTime =
    activeScenario && dayClock && activeScenarioFitsToday
      ? formatGameMinute(dayClock.minute + activeScenario.estimatedMinutes)
      : undefined;

  if (!props.humanPlayerId) {
    return null;
  }

  return (
    <div className="mb-5 rounded border-2 border-brown-700 bg-brown-900/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg text-brown-100">AI-Uni · 大学生活</h2>
        {profile && (
          <span className="text-xs text-brown-300">
            {isFirstWeek ? `第 ${profile.chapterUnit} / 7 日` : `阶段 ${profile.chapterUnit}`}
            {dayClock ? ` · ${formatGameMinute(dayClock.minute)}` : ''}
          </span>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between gap-3 text-sm text-brown-300">
        <span>
          当前地点：<span className="text-brown-100">{locationName ?? '校园公共区域'}</span>
        </span>
        {dayClock && (
          <span className="text-xs text-brown-400">
            今日剩余 {Math.floor(minutesRemainingInDay(dayClock) / 60)}h {minutesRemainingInDay(dayClock) % 60}m
          </span>
        )}
      </div>

      {firstWeekStatus && (
        <div className="mt-3 rounded bg-brown-800/70 px-3 py-2 text-xs leading-5 text-brown-300">
          <div className="font-semibold text-brown-100">第一周进度</div>
          <div>
            已结束 {firstWeekStatus.completedPlayableDays} / {firstWeekStatus.requiredPlayableDays} 天 ·
            生活事件 {firstWeekStatus.completedCoreEvents} / {firstWeekStatus.minimumCoreEvents} ·
            不同同学 {firstWeekStatus.distinctNpcInteractions} / {firstWeekStatus.minimumDistinctNpcInteractions}
          </div>
          <div>
            纯日常体验：{firstWeekStatus.ordinaryLifeCompleted ? '已完成' : '还没有'}
          </div>
        </div>
      )}

      {activeScenario ? (
        <div className="mt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="text-base font-semibold text-brown-100">{activeScenario.title}</div>
            <div className="shrink-0 text-xs text-brown-400">
              约 {activeScenario.estimatedMinutes} 分钟
              {activeScenarioEndTime ? ` · 至 ${activeScenarioEndTime}` : ''}
            </div>
          </div>
          <p className="mt-2 text-sm leading-6 text-brown-200">{activeScenario.setup}</p>
          <p className="mt-2 text-sm text-brown-300">
            当前目标：{activeScenario.ordinaryGoal}
          </p>
          <p className="mt-2 text-xs leading-5 text-brown-400">
            和事件相关的人自然交谈会推进事件；也可以在你认为事情已经处理完时手动结束。事件完成后才会一次性推进游戏时间。
          </p>
          {!activeScenarioFitsToday && (
            <p className="mt-2 text-xs leading-5 text-brown-300">
              这是旧存档中已开始的事件，当前剩余时间不足以正常结算；可以结束今天来中止事件。
            </p>
          )}
          {runtime && (
            <button
              className="mt-3 rounded bg-brown-600 px-3 py-2 text-sm font-semibold text-brown-50 hover:bg-brown-500 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={completingScenario}
              onClick={() => {
                setScenarioMessage(undefined);
                setCompletingScenario(true);
                void completeActiveScenario({
                  runtimeId: runtime._id,
                  outcome: 'completed_by_player',
                })
                  .then((result) => {
                    if (result.completed) {
                      setScenarioMessage(`这件事处理完了。现在是 ${result.gameTime}。`);
                      return;
                    }
                    if (result.reason === 'not_enough_time') {
                      setScenarioMessage('今天剩余时间不足以完成这件事；可以结束今天，让事件中止。');
                      return;
                    }
                    setScenarioMessage('这件事已经结束或不再是当前事件。');
                  })
                  .catch((error) => {
                    console.error('Failed to complete AI-Uni scenario', error);
                    setScenarioMessage('这件事暂时无法完成，请稍后再试。');
                  })
                  .finally(() => setCompletingScenario(false));
              }}
            >
              {completingScenario
                ? '正在完成…'
                : `完成这件事 · 约 ${activeScenario.estimatedMinutes} 分钟`}
            </button>
          )}
        </div>
      ) : (
        <div className="mt-4">
          <p className="text-sm leading-6 text-brown-300">
            现在没有必须处理的事件。可以找人聊天，也可以在这里做点普通的小事。
          </p>

          {profile && activities.length > 0 && (
            <div className="mt-3 rounded border border-brown-700 bg-brown-900/30 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-brown-100">在这里做点什么</div>
                <div className="text-xs text-brown-400">
                  今日 {completedActivityIds.length} / {campusActivityRules.maxDistinctActivitiesPerDay}
                </div>
              </div>
              <div className="mt-2 grid gap-2">
                {activities.map((activity) => {
                  const completed = completedActivityIds.includes(activity.id);
                  const fitsToday = dayClock
                    ? canSpendMinutes(dayClock, activity.estimatedMinutes)
                    : true;
                  const disabled =
                    completed ||
                    !fitsToday ||
                    reachedActivityLimit ||
                    runningActivityId !== undefined;
                  return (
                    <button
                      key={activity.id}
                      className="rounded border border-brown-700 px-3 py-2 text-left hover:bg-brown-700 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={disabled}
                      onClick={() => {
                        setActivityMessage(undefined);
                        setRunningActivityId(activity.id);
                        void performCampusActivity({
                          profileId: profile._id,
                          activityId: activity.id,
                        })
                          .then((result) => setActivityMessage(result.message))
                          .catch((error) => {
                            console.error('Failed to perform AI-Uni campus activity', error);
                            setActivityMessage('这件事现在做不了，换个位置再试试。');
                          })
                          .finally(() => setRunningActivityId(undefined));
                      }}
                    >
                      <div className="flex items-center justify-between gap-3 text-sm font-semibold text-brown-100">
                        <span>{activity.title}</span>
                        <span className="text-xs font-normal text-brown-400">
                          {completed
                            ? '今天做过'
                            : fitsToday
                              ? `约 ${activity.estimatedMinutes} 分钟`
                              : '今天来不及'}
                        </span>
                      </div>
                      <div className="mt-1 text-xs leading-5 text-brown-400">
                        {activity.description}
                      </div>
                    </button>
                  );
                })}
              </div>
              {reachedActivityLimit && (
                <p className="mt-2 text-xs leading-5 text-brown-400">
                  今天的自由活动已经够丰富了；接下来更适合聊天、处理生活事件或结束今天。
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {scenarioMessage && (
        <p className="mt-4 rounded bg-brown-800 px-3 py-2 text-sm leading-6 text-brown-200">
          {scenarioMessage}
        </p>
      )}

      {activityMessage && (
        <p className="mt-4 rounded bg-brown-800 px-3 py-2 text-sm leading-6 text-brown-200">
          {activityMessage}
        </p>
      )}

      {dayEndMessage && (
        <p className="mt-4 rounded bg-brown-800 px-3 py-2 text-sm leading-6 text-brown-200">
          {dayEndMessage}
        </p>
      )}

      {profile && isFirstWeek && (
        <button
          className="mt-4 w-full rounded border border-brown-600 px-3 py-2 text-sm font-semibold text-brown-100 hover:bg-brown-700"
          onClick={() => {
            setDayEndMessage(undefined);
            void endFirstWeekDay({ profileId: profile._id })
              .then((result) => {
                if (!result.advanced) {
                  const missing = result.readiness.missing.join('；');
                  setDayEndMessage(`${result.closingBeat}${missing ? ` ${missing}。` : ''}`);
                  return;
                }
                setDayEndMessage(
                  result.firstWeekCompleted
                    ? `${result.closingBeat} 第一章完成，接下来进入大一阶段。`
                    : result.closingBeat,
                );
              })
              .catch((error) => {
                console.error('Failed to end AI-Uni day', error);
                setDayEndMessage('今天暂时无法结束，请稍后再试。');
              });
          }}
        >
          {isFinalFirstWeekDay ? '结束第一周' : '结束今天'}
        </button>
      )}

      {runtime && !runtime.behavioralResearchConsent && (
        <p className="mt-3 text-xs leading-5 text-brown-400">
          当前为普通游玩模式：研究行为记录未启用。
        </p>
      )}
    </div>
  );
}