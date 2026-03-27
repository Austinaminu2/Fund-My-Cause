import { test as base, BrowserContext } from "@playwright/test";

/**
 * Injects a mock `window.freighterApi` into every page before navigation,
 * simulating the Freighter extension without needing it installed.
 */
async function injectFreighterMock(context: BrowserContext) {
  await context.addInitScript(() => {
    (window as any).freighterApi = {
      isConnected: () => Promise.resolve(true),
      getPublicKey: () => Promise.resolve("GMOCK000000000000000000000000000000000000000000000000000"),
      getNetwork: () => Promise.resolve("TESTNET"),
      getNetworkDetails: () =>
        Promise.resolve({
          network: "TESTNET",
          networkUrl: "https://horizon-testnet.stellar.org",
          networkPassphrase: "Test SDF Network ; September 2015",
        }),
      signTransaction: (xdr: string) => Promise.resolve(xdr),
    };
  });
}

export const test = base.extend<{ walletContext: BrowserContext }>({
  walletContext: async ({ browser }, use) => {
    const context = await browser.newContext();
    await injectFreighterMock(context);
    await use(context);
    await context.close();
  },
  // Override the default context to always include the mock
  context: async ({ browser }, use) => {
    const context = await browser.newContext();
    await injectFreighterMock(context);
    await use(context);
    await context.close();
  },
});

export { expect } from "@playwright/test";
