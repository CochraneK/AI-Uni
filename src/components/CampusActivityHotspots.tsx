import { PixiComponent } from '@pixi/react';
import * as PIXI from 'pixi.js';
import {
  genericCampusInteractables,
  type GenericCampusInteractable,
} from '../../data/genericCampusInteractables';
import { getCampusActivity } from '../../convex/life/activities';
import type { CampusLocationId } from '../../convex/campus/config';

export type CampusHotspotDestination = {
  x: number;
  y: number;
};

export type CampusActivityHotspot = GenericCampusInteractable & {
  estimatedMinutes: number;
};

export const campusActivityHotspots: CampusActivityHotspot[] = genericCampusInteractables.map(
  (interactable) => ({
    ...interactable,
    estimatedMinutes: getCampusActivity(interactable.activityId)?.estimatedMinutes ?? 0,
  }),
);

type HotspotProps = {
  tileDim: number;
  currentLocationId?: CampusLocationId;
  recommendedLocationId?: CampusLocationId;
  onNavigate: (
    interactable: CampusActivityHotspot,
    destination: CampusHotspotDestination,
  ) => void;
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

const applyState = (
  root: HotspotContainer,
  currentLocationId?: CampusLocationId,
  recommendedLocationId?: CampusLocationId,
) => {
  for (const child of root.children) {
    const node = child as HotspotNode;
    const current = Boolean(currentLocationId && node.aiUniLocationId === currentLocationId);
    const recommended = Boolean(
      recommendedLocationId && node.aiUniLocationId === recommendedLocationId,
    );

    node.alpha = current ? 1 : recommended ? 0.96 : 0.7;
    if (node.aiUniMarker) {
      node.aiUniMarker.tint = recommended ? 0xffd76a : current ? 0xbfe7ff : 0xffffff;
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
        marker.beginFill(0x3f2d24, 0.9);
        marker.drawRoundedRect(-38, -13, 76, 26, 8);
        marker.endFill();
        node.aiUniMarker = marker;
        node.addChild(marker);

        const baseText = `${hotspot.label} · ${hotspot.estimatedMinutes}m`;
        const text = new PIXI.Text(baseText, {
          fontFamily: 'sans-serif',
          fontSize: 9,
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
          node.scale.set(1.09);
          marker.alpha = 1;
        });
        node.on('pointerout', () => {
          node.scale.set(1);
          marker.alpha = 0.92;
        });
        node.on('pointertap', (event) => {
          event.stopPropagation();
          root.aiUniNavigate?.(hotspot, hotspot.anchor);
        });

        root.addChild(node);
      }

      applyState(root, props.currentLocationId, props.recommendedLocationId);
      return root;
    },
    applyProps: (instance, _oldProps, newProps) => {
      instance.aiUniNavigate = newProps.onNavigate;
      applyState(instance, newProps.currentLocationId, newProps.recommendedLocationId);
    },
  },
);

export default CampusActivityHotspots;
