'use strict';

const DEFAULT_SITES = [
  'chatgpt.com', 'claude.ai', 'gemini.google.com', 'aistudio.google.com',
  'perplexity.ai', 'copilot.microsoft.com', 'grok.com', 'grok.x.ai',
  'chat.deepseek.com', 'deepseek.com', 'meta.ai', 'mistral.ai', 'chat.mistral.ai', 'poe.com',
  'character.ai', 'you.com', 'phind.com', 'duck.ai', 'huggingface.co',
  'qwen.ai', 'chat.qwen.ai', 'kimi.com', 'chat.moonshot.cn', 'dify.ai'
];

browser.runtime.onInstalled.addListener(async () => {
  const res = await browser.storage.local.get(['globalEnabled', 'sites']);
  if (res.sites === undefined) {
    const sites = {};
    for (const h of DEFAULT_SITES) sites[h] = true;
    await browser.storage.local.set({ globalEnabled: true, sites });
  }
});