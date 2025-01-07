export async function generateQR(formData: FormData) {
  const excelFile = formData.get("file") as File;
  const urlTag = formData.get("urlTag") as string;
  const nameTag = formData.get("nameTag") as string;
  const logo = formData.get("logo") as File;

  if (!excelFile || excelFile.size === 0) {
    return { error: "Excel file is required" };
  }

  const data = new FormData();
  data.append("file", excelFile);
  if (urlTag) data.append("urlTag", urlTag);
  if (nameTag) data.append("nameTag", nameTag);
  if (logo && logo.size > 0) data.append("logo", logo);

  try {
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzdhNTRiNDE3MTc2NjE3MzQxMWUzZDAiLCJpYXQiOjE3MzYwNzAzMjUsImV4cCI6MTczNjE1NjcyNX0.OgbLIS3Dt9GnaBJb8HTg-Ojs9-UyPKmJFJauqCRF46g";
    const response = await fetch("http://localhost:3000/api/qr/generate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: data,
    });
    console.log("request sent");
    if (!response.ok) {
      throw new Error("Failed to generate QR codes");
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error("Error generating QR codes:", error);
    return { error: "Failed to generate QR codes. Please try again." };
  }
}

// export async function generateSingleQR(data: string) {
//   try {
//     const response = await fetch(
//       "http://localhost:3000/api/qr/generate-single",
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ content: data, type: "text" }),
//       }
//     );
//     if (!response.ok) throw new Error("Failed to generate QR code");
//     return { success: true, data: await response.json() };
//   } catch (error) {
//     console.error("Error generating QR code:", error);
//     return { success: false, error: "Failed to generate QR code" };
//   }
// }

interface QRCodeResponse {
  success: boolean;
  data?: string;
  message?: string;
}

export async function generateSingleQR(data: string): Promise<QRCodeResponse> {
  try {
    const response = await fetch(
      "http://localhost:3000/api/qr/generate-single",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: data, type: "text" }),
      }
    );
    const result: QRCodeResponse = await response.json();
    return result;
  } catch (error) {
    console.error("Failed to generate QR code:", error);
    return { success: false, message: "Failed to generate QR code" };
  }
}
