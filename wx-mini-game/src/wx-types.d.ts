// WeChat Mini Game type declarations

interface WxSystemInfo {
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  benchmarkLevel: number;
}

interface WxTouchEvent {
  touches: WxTouch[];
  changedTouches: WxTouch[];
}

interface WxTouch {
  identifier: number;
  clientX: number;
  clientY: number;
}

interface WxShareOptions {
  title?: string;
  imageUrl?: string;
  query?: string;
}

declare const wx: {
  getSystemInfoSync(): WxSystemInfo;
  createCanvas(): any;
  onTouchStart(callback: (e: WxTouchEvent) => void): void;
  onTouchMove(callback: (e: WxTouchEvent) => void): void;
  onTouchEnd(callback: (e: WxTouchEvent) => void): void;
  onTouchCancel(callback: (e: WxTouchEvent) => void): void;
  onWindowResize(callback: (info: { windowWidth: number; windowHeight: number }) => void): void;
  showShareMenu(options: { withShareTicket?: boolean; menus?: string[] }): void;
  onShareAppMessage(callback: () => WxShareOptions): void;
  onShareTimeline(callback: () => WxShareOptions): void;
  shareAppMessage(options: WxShareOptions): void;
};

declare function requestAnimationFrame(callback: (time: number) => void): number;
