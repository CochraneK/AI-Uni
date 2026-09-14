import { PixiComponent } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { zoneAnchors } from '../../data/genericCampus';
import { getCampusActivities } from '../../convex/life/activities';
import type { CampusLocationId } from '../../convex/campus/config';

export type CampusHotspotDestination = {
  x: number;
  y: number;
};

export type CampusActivityHotspot = {
  locationId: CampusLocationId;
  label: string;
  anchor: CampusHotspotDestination;
  activityCount: number;
};

const shortLabels: Record<CampusLocationId, string> = {
  campus_gate: '校门',
  teaching_building: '教学楼',
  library: '图书馆',
  student_center: '活动中心',
  cafeteria: '食堂',
  campus_green: '绿地',
  sports_field: '运动场',
  dormitory: '宿舍',
};

export const campusActivityHotspots: CampusActivityHotspot[] = Object.entries(zoneAnchors).map(
  ([locationId, anchor]) => ({
    locationId: locationId as CampusLocationId,
    label: shortLabels[locationId as CampusLocationId],
    anchor,
    activityCount: getCampusActivities(locationId).length,
  }),
);

type HotspotProps = {
  tileDim: number;
  recommendedLocationId?: CampusLocationId;
  onNavigate: (locationId: CampusLocationId, destination: CampusHotspotDestination) => void;
};

type HotspotNode = PIXI.Container & {
  aiUniLocationId?: CampusLocationId;
  aiUniMarker?: PIXI.Graphics;
  aiUniText?: PIXI.Text;
  aiUniBaseText?: string;
};

type HotspotContainer = PIXI.Container & {
  aiUniNavigate?: HotspotProps['onNavigate'];
};

const applyRecommendation = (
  root: HotspotContainer,
  recommendedLocationId?: CampusLocationId,
) => {
  for (const child of root.children) {
    const node = child as HotspotNode;
    const recommended = Boolean(
      recommendedLocationId && node.aiUniLocationId === recommendedLocationId,
    );
    node.alpha = recommendedLocationId ? (recommended ? 1 : 0.78) : 1;
    if (node.aiUniMarker) {
      node.aiUniMarker.tint = recommended ? 0xffd76a : 0xffffff;
    }
    if (node.aiUniText && node.aiUniBaseText) {
      node.aiUniText.text = recommended ? `★ ${node.aiUniBaseText}` : node.aiUniBaseText;
    }
  }
};

export const CampusActivityHotspots = PixiComponent<HotspotProps, HotspotContainer>(
  'CampusActivityHotspots',
  {
    create: (props) => {
      const root = new PIXI.Container() as HotspotContainer;
      root.aiUniNavigate = props.onNavigate;

      for (const hotspot of campusActivityHotspots) {
        const node = new PIXI.Container() as HotspotNode;
        node.x = (hotspot.anchor.x + 0.5) * props.tileDim;
        node.y = (hotspot.anchor.y + 0.5) * props.tileDim;
        node.eventMode = 'static';
        node.cursor = 'pointer';
        node.aiUniLocationId = hotspot.locationId;

        const marker = new PIXI.Graphics();
        marker.lineStyle(2, 0xffe4a8, 0.95);
        marker.beginFill(0x3f2d24, 0.88);
        marker.drawRoundedRect(-34, -14, 68, 28, 9);
        marker.endFill();
        node.aiUniMarker = marker;
        node.addChild(marker);

        const baseText = `${hotspot.label} · ${hotspot.activityCount}`;
        const text = new PIXI.Text(baseText, {
          fontFamily: 'sans-serif',
          fontSize: 10,
          fontWeight: '600',
          fill: 0xfff4dc,
          align: 'center',
        });
        text.anchor.set(0.5);
        text.resolution = 2;
        node.aiUniText = text;
        node.aiUniBaseText = baseText;
        node.addChild(text);

        node.on('pointerover', () => {
          node.scale.set(1.08);
          marker.alpha = 1;
        });
        node.on('pointerout', () => {
          node.scale.set(1);
          marker.alpha = 0.92;
        });
        node.on('pointertap', (event) => {
          event.stopPropagation();
          root.aiUniNavigate?.(hotspot.locationId, hotspot.anchor);
        });

        root.addChild(node);
      }

      applyRecommendation(root, props.recommendedLocationId);
      return root;
    },
    applyProps: (instance, _oldProps, newProps) => {
      instance.aiUniNavigate = newProps.onNavigate;
      applyRecommendation(instance, newProps.recommendedLocationId);
    },
  },
);

export default CampusActivityHotspots;
