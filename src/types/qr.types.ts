export interface QRCodeOptions {
  width: number;
  margin: number;
  color: {
    dark: string;
    light: string;
  };
}

export interface QRCodeResponse {
  success: boolean;
  data?: string;
  message?: string;
}

export interface GenerateQRRequest {
  content: string;
  type: "url" | "text";
}
