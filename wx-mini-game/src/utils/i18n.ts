const texts = {
  distance: (d: number) => `${Math.floor(d)}米`,
  controls: '左倾 · 右倾 · 刹车 · 蹬车',
  creditLeft: '灵感来自 "Pelican benchmark"',
  creditRight: '由 Claude Code 构建',
  startHint: '点击屏幕开始！',
  gameOver: '游戏结束',
  traveled: (d: number) => `你的鹈鹕骑了 ${Math.floor(d)} 米！`,
  playAgain: '再来一局',
  shareWx: '分享给好友',
  shareText: (d: number) => `🦩 我的鹈鹕骑了 ${Math.floor(d)} 米！你能超过吗？`,
  balance: '平衡',
} as const;

export function t() {
  return texts;
}
