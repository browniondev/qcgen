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
    const response = await fetch("http://localhost:3000/api/qr/generate", {
      method: "POST",
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
