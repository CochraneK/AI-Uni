import Game from './components/Game.tsx';

import { ToastContainer } from 'react-toastify';
import a16zImg from '../assets/a16z.png';
import convexImg from '../assets/convex.svg';
import starImg from '../assets/star.svg';
import helpImg from '../assets/help.svg';
// import { UserButton } from '@clerk/clerk-react';
// import { Authenticated, Unauthenticated } from 'convex/react';
// import LoginButton from './components/buttons/LoginButton.tsx';
import { useState } from 'react';
import ReactModal from 'react-modal';
import MusicButton from './components/buttons/MusicButton.tsx';
import Button from './components/buttons/Button.tsx';
import InteractButton from './components/buttons/InteractButton.tsx';
import FreezeButton from './components/FreezeButton.tsx';
import { MAX_HUMAN_PLAYERS } from '../convex/constants.ts';
import PoweredByConvex from './components/PoweredByConvex.tsx';

export default function Home() {
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-between font-body game-background">
      <PoweredByConvex />

      <ReactModal
        isOpen={helpModalOpen}
        onRequestClose={() => setHelpModalOpen(false)}
        style={modalStyles}
        contentLabel="帮助"
        ariaHideApp={false}
      >
        <div className="font-body">
          <h1 className="text-center text-6xl font-bold font-display game-title">校园生活实验</h1>
          <p>
            欢迎来到 AI-Uni Campus。这是一个以北京高校日常生活为背景、正在逐步改造成北交大校园风格的 AI Town
            研究原型。你可以观察 NPC，也可以进入世界与他们聊天、上课、做小组作业和参加校园活动。
          </p>
          <h2 className="text-4xl mt-4">怎么玩</h2>
          <p>
            点击地图移动，拖动画面浏览校园，滚轮缩放。点击角色可以查看对话；进入互动模式后，可以接近角色并发起谈话。
          </p>
          <h2 className="text-4xl mt-4">研究说明</h2>
          <p>
            研究版本可能在取得知情同意后记录移动、选择、互动、对话以及反应时间，用于研究校园情境中的行为模式。
            游戏内行为不会被直接解释为 PCL-5、CAPE-P15 或人格量表的正式分数，也不会用于自动诊断。
          </p>
          <p className="mt-4">
            敏感情境应允许跳过。正式研究部署前还需要独立完成伦理审批、量表版本核对、数据治理和风险处置流程。
          </p>
          <p className="text-2xl mt-4">操作</p>
          <p className="mt-4">点击地图：移动角色。</p>
          <p className="mt-4">
            与 NPC 对话：点击角色后发起 conversation。双方接近后开始聊天；关闭对话框或走开可以结束交流。
          </p>
          <p className="mt-4">
            当前世界最多支持 {MAX_HUMAN_PLAYERS} 名真人玩家同时加入；长时间无操作会自动离开模拟世界。
          </p>
        </div>
      </ReactModal>

      <div className="w-full lg:h-screen min-h-screen relative isolate overflow-hidden lg:p-8 shadow-2xl flex flex-col justify-start">
        <h1 className="mx-auto text-4xl p-3 sm:text-8xl lg:text-9xl font-bold font-display leading-none tracking-wide game-title w-full text-left sm:text-center sm:w-auto">
          AI-Uni Campus
        </h1>

        <div className="max-w-xs md:max-w-xl lg:max-w-none mx-auto my-4 text-center text-base sm:text-xl md:text-2xl text-white leading-tight shadow-solid">
          北交大校园生活 × LLM NPC × 情境行为研究原型
        </div>

        <Game />

        <footer className="justify-end bottom-0 left-0 w-full flex items-center mt-4 gap-3 p-6 flex-wrap pointer-events-none">
          <div className="flex gap-4 flex-grow pointer-events-none">
            <FreezeButton />
            <MusicButton />
            <Button href="https://github.com/CochraneK/ai-town" imgUrl={starImg}>
              GitHub
            </Button>
            <InteractButton />
            <Button imgUrl={helpImg} onClick={() => setHelpModalOpen(true)}>
              说明
            </Button>
          </div>
          <a href="https://github.com/a16z-infra/ai-town" aria-label="AI Town upstream">
            <img className="w-8 h-8 pointer-events-auto" src={a16zImg} alt="AI Town upstream" />
          </a>
          <a href="https://convex.dev/c/ai-town">
            <img className="w-20 h-8 pointer-events-auto" src={convexImg} alt="Convex" />
          </a>
        </footer>
        <ToastContainer position="bottom-right" autoClose={2000} closeOnClick theme="dark" />
      </div>
    </main>
  );
}

const modalStyles = {
  overlay: {
    backgroundColor: 'rgb(0, 0, 0, 75%)',
    zIndex: 12,
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '50%',

    border: '10px solid rgb(23, 20, 33)',
    borderRadius: '0',
    background: 'rgb(35, 38, 58)',
    color: 'white',
    fontFamily: '"Upheaval Pro", "sans-serif"',
  },
};
