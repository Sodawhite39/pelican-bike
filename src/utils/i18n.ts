export type Lang = 'zh' | 'en';

const texts = {
  zh: {
    distance: (d: number) => `${Math.floor(d)}米`,
    controls: '↑ 蹬车  |  ↓ 减速  |  ←/→ 平衡  |  Z 掉头',
    creditLeft: '灵感来自 "Pelican benchmark"',
    creditRight: '由 Claude Code 构建',
    startHint: '按 ↑ 或 空格键 开始！',
    gameOver: '游戏结束',
    traveled: (d: number) => `你的鹈鹕骑了 ${Math.floor(d)} 米！`,
    playAgain: '再来一局 (空格)',
    shareX: '分享到 X',
    shareText: (d: number) => `🦩 我的鹈鹕骑了 ${Math.floor(d)} 米！你能超过吗？ #鹈鹕骑车`,
    balance: '平衡',
    langSwitch: 'EN',
  },
  en: {
    distance: (d: number) => `${Math.floor(d)}m`,
    controls: '↑ Pedal  |  ↓ Slow  |  ←/→ Balance  |  Z Turn Around',
    creditLeft: 'Inspired by "Pelican benchmark"',
    creditRight: 'Built with Claude Code',
    startHint: 'Press ↑ or Space to start!',
    gameOver: 'GAME OVER',
    traveled: (d: number) => `Your pelican traveled ${Math.floor(d)}m!`,
    playAgain: 'Play Again (Space)',
    shareX: 'Share on X',
    shareText: (d: number) => `🦩 My pelican traveled ${Math.floor(d)}m! Can you beat that? #PelicanBike`,
    balance: 'Balance',
    langSwitch: '中文',
  },
} as const;

let currentLang: Lang = 'zh';

export function getLang(): Lang {
  return currentLang;
}

export function setLang(lang: Lang) {
  currentLang = lang;
}

export function toggleLang(): Lang {
  currentLang = currentLang === 'zh' ? 'en' : 'zh';
  return currentLang;
}

export function t() {
  return texts[currentLang];
}
