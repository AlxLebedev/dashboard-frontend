/* eslint-disable class-methods-use-this */
import API from './Api';
import showDate from './showDate';

export default class InstanceGenerator {
  constructor() {
    this.api = new API('https://dashboard-hw8.herokuapp.com/inst');
    this.url = 'wss://dashboard-hw8.herokuapp.com/ws';
  }

  init() {
    this.instancesField = document.getElementById('instances-field');
    this.worklogList = document.querySelector('#worklog-list');
    this.createWS();
    this.addEventListeners();
    this.drawInstances();

    window.addEventListener('beforeunload', () => {
      this.ws.close(1000, 'work end');
      this.drawInstances();
    });
  }

  addEventListeners() {
    this.instancesField.addEventListener('click', (event) => {
      event.preventDefault();

      const eventTargetClassList = event.target.classList;
      if (eventTargetClassList.contains('create-new-instance')) {
        this.api.add();
      } else if (eventTargetClassList.contains('stop-start')) {
        const currentInstanceID = event.target.closest('.instance-item').querySelector('.instance-id').innerText;
        this.api.patch(currentInstanceID);
      } else if (eventTargetClassList.contains('close')) {
        const currentInstanceID = event.target.closest('.instance-item').querySelector('.instance-id').innerText;
        this.api.remove(currentInstanceID);
      }
    });
  }

  createWS() {
    this.ws = new WebSocket(this.url);

    this.ws.addEventListener('open', () => {
      console.log('connected');
    });

    this.ws.addEventListener('message', (e) => {
      this.drawMessages(e);
    });

    this.ws.addEventListener('close', (e) => {
      console.log('connection closed', e);
    });

    this.ws.addEventListener('error', () => {
      console.log('error');
    });
  }

  async drawInstances() {
    const response = await this.api.load();
    const instances = await response.json();
    const instancesList = document.querySelector('.instances-list');
    instancesList.innerHTML = '';
    for (const item of instances) {
      const newInstance = document.createElement('li');
      newInstance.className = `instance-item ${item.state}`;
      newInstance.innerHTML = `
      <span class="instance-id">${item.id}</span>
      <span class="instance-status">
        Status: 
        <span class="status"></span>
      </span>
      <span class="instance-actions">
        Actions: 
        <div class="stop-start status-icon"></div>
        <div class="close status-icon"></div>
      </span>
      `;
      instancesList.appendChild(newInstance);
    }
  }

  drawMessages(message) {
    const { type } = JSON.parse(message.data);

    if (type === 'message') {
      const {
        name,
        msg,
        dateTime,
      } = JSON.parse(message.data);

      const newMessage = document.createElement('li');
      newMessage.className = 'list-item-msg';

      newMessage.innerHTML = `
      <div class="list-item-head">
        <span>${showDate(dateTime)}</span>
      </div>
      <div class="list-item-msg">
      <span>Server: ${name}</span>
      INFO: ${msg}
      </div>
      `;

      if (msg === 'Created') {
        this.drawInstances();
      }

      if (msg === 'Deleted') {
        this.drawInstances();
      }

      if (msg === 'started' || msg === 'stopped') {
        this.drawInstances();
      }

      this.worklogList.appendChild(newMessage);
      this.worklogList.scrollTo(0, newMessage.offsetTop);
    }
  }
}
