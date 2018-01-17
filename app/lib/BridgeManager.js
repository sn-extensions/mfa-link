import ComponentManager from 'sn-components-api';

export default class BridgeManager {

  /* Singleton */
  static instance = null;
  static get() {
    if (this.instance == null) { this.instance = new BridgeManager(); }
    return this.instance;
  }

  constructor(onReceieveItems) {
    this.updateObservers = [];
    this.items = [];
  }

  initiateBridge() {
    // var permissions = [
    //   {
    //     // name: "stream-context-item"
    //     name: "stream-items",
    //     content_types: ["SF|MFA"]
    //   }
    // ]

    this.componentManager = new ComponentManager([], () => {

    });

    this.componentManager.streamItems(["SF|MFA"], (items) => {
      for(var item of items) {
        if(item.deleted) {
          this.removeItemFromItems(item);
          continue;
        }
        if(item.isMetadataUpdate) {
          continue;
        }

        var index = this.indexOfItem(item);
        if(index >= 0) {
          this.items[index] = item;
        } else {
          this.items.push(item);
        }
      }

      this.notifyObserversOfUpdate();

      if(this.getInstalledMfa()) {
        this.componentManager.setSize("container", 725, 425);
      } else {
        this.componentManager.setSize("container", 725, 625);
      }
    });
  }

  removeItemFromItems(item) {
    this.items = this.items.filter((candidate) => {return candidate.uuid !== item.uuid});
  }

  notifyObserversOfUpdate() {
    for(var observer of this.updateObservers) {
      observer.callback();
    }
  }

  indexOfItem(item) {
    for(var index in this.items) {
      if(this.items[index].uuid == item.uuid) {
        return index;
      }
    }
    return -1;
  }

  getInstalledMfa() {
    return this.items[0];
  }

  itemForId(uuid) {
    return this.items.filter((item) => {return item.uuid == uuid})[0];
  }

  installMfa(secret) {
    this.componentManager.createItem({
      content_type: "SF|MFA",
      content: {
        name: "Google Authenticator",
        secret: secret
      }
    }, (item) => {
    });
  }

  uninstallMfa(mfa) {
    this.componentManager.deleteItem(mfa);
  }

  addUpdateObserver(callback) {
    let observer = {id: Math.random, callback: callback};
    this.updateObservers.push(observer);
    return observer;
  }

  removeUpdateObserver(observer) {
    this.updateObservers.splice(this.updateObservers.indexOf(observer), 1);
  }


}
