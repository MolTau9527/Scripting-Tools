import { fetch, RequestInit } from "scripting";

class Surge {
  url = "http://127.0.0.1:6171";
  key = "MuTukey";
  moduleName = "应用安装";

  async setModule(status: boolean) {
    await this.module({
      [this.moduleName]: status,
    });
  }

  // --- util --- //

  private async fetch(path: string, init?: RequestInit) {
    await fetch(this.url + path, {
      ...init,
      headers: { "X-Key": this.key },
    }).then((r) => r.json());
  }

  private async module(msg: object) {
    await this.fetch("/v1/modules", {
      method: "POST",
      body: JSON.stringify(msg),
    });
  }
}

export const surge = new Surge();
