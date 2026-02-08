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

interface WxRewardedVideoAd {
  show(): Promise<void>;
  load(): Promise<void>;
  onClose(callback: (res: { isEnded: boolean }) => void): void;
  onError(callback: (err: any) => void): void;
}

interface WxInterstitialAd {
  show(): Promise<void>;
  onClose(callback: () => void): void;
  onError(callback: (err: any) => void): void;
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

  // Storage
  setStorageSync(key: string, value: any): void;
  getStorageSync(key: string): any;

  // Ads
  createRewardedVideoAd(options: { adUnitId: string }): WxRewardedVideoAd;
  createInterstitialAd(options: { adUnitId: string }): WxInterstitialAd;

  // Audio
  createWebAudioContext(): AudioContext;
};

declare function requestAnimationFrame(callback: (time: number) => void): number;
