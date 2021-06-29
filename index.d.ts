declare module 'websandbox' {
  export interface API {
    [k: string]: (...args: any[]) => Promise<any>;
  }

  interface Connection {
    remote: API;
    localApi: API;
    setLocalApi: (api: API) => void;
    remoteMethodsWaitPromise: Promise<void>;
  }

  export interface Options {
    frameContainer: Element,
    frameClassName?: string,
    frameSrc?: string | null,
    frameContent?: string,
    codeToRunBeforeInit?: string,
    initialStyles?: string,
    baseUrl?: string,
    allowPointerLock?: boolean,
    allowFullScreen?: boolean,
    sandboxAdditionalAttributes?: string
  }

  export interface PluginInstance {
    promise: Promise<PluginInstance>;
    connection: Connection;
    destroy: () => void;
    run: (code: string) => Promise<unknown>;
    importScript: (path: string) => Promise<unknown>;
    injectStyle: (path: string) => Promise<void>;
  }


  export interface Websandbox {
    create: (
      hostApi: API,
      options: Options
    ) => PluginInstance
  }

  const websandbox: Websandbox;
  export default websandbox;
}
