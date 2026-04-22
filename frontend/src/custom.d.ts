declare module 'qrcode' {
  export function toDataURL(
    text: string,
    options?: any
  ): Promise<string>;

  export function toCanvas(
    canvas: HTMLCanvasElement,
    text: string,
    options?: any
  ): Promise<void>;

  export function toString(
    text: string,
    options?: any
  ): Promise<string>;
}

declare module 'html5-qrcode' {
  export class Html5Qrcode {
    constructor(elementId: string);
    start(
      cameraIdOrConfig: any,
      configuration: any,
      qrCodeSuccessCallback: (decodedText: string) => void,
      qrCodeErrorCallback?: (errorMessage: string) => void
    ): Promise<void>;
    stop(): Promise<void>;
    clear(): void;
    scanFile(file: File, showImage: boolean): Promise<string>;
  }
}

declare module 'qrcode-parser' {
  export default function parse(imageData: string | Buffer): Promise<string>;
}
