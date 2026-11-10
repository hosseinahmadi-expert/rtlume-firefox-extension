'use strict';

const $ = (id) => document.getElementById(id);

let state = { globalEnabled: true, sites: {} };

async function load() {
  state = await browser.storage.local.get({ globalEnabled: true, sites: {} });
  render();
}
async function save() {
  await browser.storage.local.set({ globalEnabled: state.globalEnabled, sites: state.sites });
}

function normalizeHost(v) {
  v = v.trim().toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .split('?')[0]
    .split('#')[0];
  return v;
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
      await save();
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
  await save();
};

$('addForm').onsubmit = async (e) => {
  e.preventDefault();
  const msg = $('addMsg');
  const h = normalizeHost($('newHost').value);
  if (!h || !h.includes('.') || /\s/.test(h)) {
    msg.textContent = 'نام دامنه معتبر نیست.';
    return;
  }
  state.sites[h] = true;
  await save();
  $('newHost').value = '';
  msg.textContent = `سایت «${h}» اضافه شد.`;
  render();
};

load();