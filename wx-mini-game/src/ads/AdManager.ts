/**
 * WeChat Mini Game Ad Manager
 * Handles rewarded video ads (revival + double score) and interstitial ads.
 *
 * Replace AD_UNIT_IDs with real values from WeChat ad platform.
 */

declare const wx: any;

// TODO: Replace with real ad unit IDs from WeChat ad platform
const REWARDED_AD_ID = 'adunit-xxxxxxxxxx';
const INTERSTITIAL_AD_ID = 'adunit-yyyyyyyyyy';

export class AdManager {
  private rewardedAd: any = null;
  private interstitialAd: any = null;
  private rewardCallback: ((success: boolean) => void) | null = null;

  constructor() {
    this.initRewardedAd();
    this.initInterstitialAd();
  }

  private initRewardedAd() {
    try {
      if (typeof wx === 'undefined' || !wx.createRewardedVideoAd) return;

      this.rewardedAd = wx.createRewardedVideoAd({
        adUnitId: REWARDED_AD_ID,
      });

      this.rewardedAd.onClose((res: { isEnded: boolean }) => {
        const success = res && res.isEnded;
        if (this.rewardCallback) {
          this.rewardCallback(success);
          this.rewardCallback = null;
        }
      });

      this.rewardedAd.onError((_err: any) => {
        if (this.rewardCallback) {
          this.rewardCallback(false);
          this.rewardCallback = null;
        }
      });
    } catch (_e) {
      // Ad API not available
    }
  }

  private initInterstitialAd() {
    try {
      if (typeof wx === 'undefined' || !wx.createInterstitialAd) return;

      this.interstitialAd = wx.createInterstitialAd({
        adUnitId: INTERSTITIAL_AD_ID,
      });
    } catch (_e) {
      // Ad API not available
    }
  }

  /**
   * Show rewarded video ad.
   * Returns a promise that resolves to true if the user watched the full ad.
   */
  showRewardedAd(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.rewardedAd) {
        resolve(false);
        return;
      }

      this.rewardCallback = resolve;

      this.rewardedAd.show().catch(() => {
        // Ad not loaded yet, try loading first
        this.rewardedAd.load().then(() => {
          this.rewardedAd.show().catch(() => {
            this.rewardCallback = null;
            resolve(false);
          });
        }).catch(() => {
          this.rewardCallback = null;
          resolve(false);
        });
      });
    });
  }

  /**
   * Show interstitial ad (every N deaths).
   */
  showInterstitial() {
    if (!this.interstitialAd) return;
    try {
      this.interstitialAd.show().catch(() => {
        // Ignore - ad might not be loaded
      });
    } catch (_e) {}
  }
}
