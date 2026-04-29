import QRCode from 'qrcode';

export async function createQrSvg(value: string): Promise<string> {
  return QRCode.toString(value, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 360,
    color: {
      dark: '#0f4c6a',
      light: '#ffffff',
    },
  });
}
