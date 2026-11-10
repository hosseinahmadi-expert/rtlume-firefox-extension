'use strict';

const $ = (id) => document.getElementById(id);

let state = { globalEnabled: true, sites: {} };
let currentHost = null;

async function load() {
  state = await browser.storage.local.get({ globalEnabled: true, sites: {} });
  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (tabs[0] && tabs[0].url && /^https?:/.test(tabs[0].url)) {
      currentHost = new URL(tabs[0].url).hostname.replace(/^www\./, '');
    }
  } catch (e) { /* نادیده گرفته می‌شود */ }
  render();
}

async function save() {
  await browser.storage.local.set({ globalEnabled: state.globalEnabled, sites: state.sites });
}

function siteRow(host) {
  const on = state.sites[host] === true;
  const div = document.createElement('div');
  div.className = 'site';

  const hDiv = document.createElement('div');
  hDiv.className = 'h';
  const span = document.createElement('span');
  span.className = 'host';
  span.textContent = host;
  hDiv.appendChild(span);

  const label = document.createElement('label');
  label.className = 'switch';
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = on;
  input.dataset.host = host;
  const slider = document.createElement('span');
  slider.className = 'slider';
  label.appendChild(input);
  label.appendChild(slider);

  const delBtn = document.createElement('button');
  delBtn.className = 'del';
  delBtn.title = 'حذف';
  delBtn.dataset.del = host;
  delBtn.textContent = '✕';

  div.appendChild(hDiv);
  div.appendChild(label);
  div.appendChild(delBtn);

  return div;
}

function render() {
  $('master').checked = state.globalEnabled !== false;

  if (currentHost) {
    $('currentCard').style.display = '';
    $('curHost').textContent = currentHost;
    const known = Object.prototype.hasOwnProperty.call(state.sites, currentHost);
    $('curToggle').checked = known && state.sites[currentHost] === true && state.globalEnabled !== false;
    $('curHint').textContent = known
      ? 'این سایت در فهرست افزونه است.'
      : 'این سایت هنوز اضافه نشده — با روشن کردن سوییچ اضافه می‌شود.';
    $('curToggle').onchange = async (e) => {
      if (e.target.checked) state.sites[currentHost] = true;
      else if (known) state.sites[currentHost] = false;
      else delete state.sites[currentHost];
      await save(); render();
    };
  } else {
    $('currentCard').style.display = 'none';
  }

  const list = $('siteList');
  list.innerHTML = '';
  const hosts = Object.keys(state.sites).sort();
  if (!hosts.length) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = 'هنوز سایتی اضافه نشده است.';
    list.appendChild(empty);
  } else {
    for (const h of hosts) list.appendChild(siteRow(h));
  }

  list.querySelectorAll('input[data-host]').forEach((inp) => {
    inp.onchange = async () => {
      state.sites[inp.dataset.host] = inp.checked;
      await save(); render();
    };
  });
  list.querySelectorAll('[data-del]').forEach((btn) => {
    btn.onclick = async () => {
      delete state.sites[btn.dataset.del];
      await save(); render();
    };
  });
}

$('master').onchange = async (e) => {
  state.globalEnabled = e.target.checked;
  await save(); render();
};

$('openOpts').onclick = () => browser.runtime.openOptionsPage();

load();