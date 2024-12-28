// import {
//   FileSpreadsheetIcon,
//   LinkIcon,
// } from "@/components/component/qrgen-landing";

// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";

// export default function Home() {
//   return (
//     <div className="w-full min-h-screen bg-background text-foreground">
//       <header className="fixed top-0 z-10 w-full mt-4">
//         <nav className="container mx-auto max-w-4xl px-8 py-4 md:py-6 border rounded-full backdrop-blur-lg bg-background/50 shadow-md hidden md:flex items-center justify-between">
//           <Link
//             href="#"
//             className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-l from-orange-400 to-yellow-400"
//             prefetch={false}
//           >
//             QRGEN
//           </Link>
//           <div className="flex items-center gap-4">
//             <Link
//               href="#"
//               className="text-muted-foreground hover:text-foreground"
//               prefetch={false}
//             >
//               Features
//             </Link>
//             <Link
//               href="#"
//               className="text-muted-foreground hover:text-foreground"
//               prefetch={false}
//             >
//               Pricing
//             </Link>
//             <Link
//               href="#"
//               className="text-muted-foreground hover:text-foreground"
//               prefetch={false}
//             >
//               Contact
//             </Link>
//             <Button
//               variant="outline"
//               className="rounded-full bg-gradient-to-r from-orange-400 to-yellow-400 font-bold uppercase"
//             >
//               Sign In
//             </Button>
//           </div>
//         </nav>{" "}
//         <div className="fixed top-0 left-0 w-full h-full bg-background/50 backdrop-blur-lg z-20 flex flex-col items-center justify-center md:hidden">
//           <div className="fixed top-0 left-0 w-full h-full bg-background/50 backdrop-blur-lg z-20 flex flex-col items-center justify-center md:hidden">
//             <div className="bg-background p-8 rounded-md shadow-md w-full max-w-md space-y-4">
//               <div className="flex items-center justify-between">
//                 <Link href="#" className="text-lg font-bold" prefetch={false}>
//                   Acme QR Codes
//                 </Link>
//                 <Button
//                   variant="outline"
//                   className="rounded-full bg-gradient-to-r from-orange-400 to-yellow-400 font-bold uppercase"
//                 >
//                   Open Menu
//                 </Button>
//               </div>
//               <div className="space-y-2">
//                 <Link
//                   href="#"
//                   className="block text-muted-foreground hover:text-foreground"
//                   prefetch={false}
//                 >
//                   Features
//                 </Link>
//                 <Link
//                   href="#"
//                   className="block text-muted-foreground hover:text-foreground"
//                   prefetch={false}
//                 >
//                   Pricing
//                 </Link>
//                 <Link
//                   href="#"
//                   className="block text-muted-foreground hover:text-foreground"
//                   prefetch={false}
//                 >
//                   Contact
//                 </Link>
//               </div>
//               <Button
//                 variant="outline"
//                 className="rounded-full bg-gradient-to-r from-orange-400 to-yellow-400 font-bold uppercase w-full"
//               >
//                 Sign In
//               </Button>
//             </div>
//           </div>
//         </div>
//       </header>
//       <main>
//         <header className="container mx-auto max-w-4xl px-4 py-12 md:py-16 backdrop-blur-lg bg-background/50 rounded-md shadow-md">
//           <div className="grid gap-8 md:grid-cols-2 md:gap-12">
//             <div className="space-y-4">
//               <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
//                 Generate QR Codes from Excel
//               </h1>
//               <p className="text-muted-foreground md:text-lg">
//                 Upload an Excel file or enter a URL, and we&apos;ll generate QR
//                 codes for you.
//               </p>
//               <form className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="file">Excel File</Label>
//                   <Input id="file" type="file" />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="url">URL or Column Name</Label>
//                   <Input
//                     id="url"
//                     type="text"
//                     placeholder="Enter URL or column name"
//                   />
//                 </div>
//                 <Button type="submit" className="w-full">
//                   Generate QR Codes
//                 </Button>
//               </form>
//             </div>
//             <div className="grid gap-4">
//               <div className="grid grid-cols-3 gap-4">
//                 <div className="bg-muted p-4 rounded-md shadow-sm">
//                   <img
//                     src="/placeholder.svg"
//                     width="100"
//                     height="100"
//                     alt="QR Code"
//                     className="mx-auto"
//                     style={{ aspectRatio: "100/100", objectFit: "cover" }}
//                   />
//                 </div>
//                 <div className="bg-muted p-4 rounded-md shadow-sm">
//                   <img
//                     src="/placeholder.svg"
//                     width="100"
//                     height="100"
//                     alt="QR Code"
//                     className="mx-auto"
//                     style={{ aspectRatio: "100/100", objectFit: "cover" }}
//                   />
//                 </div>
//                 <div className="bg-muted p-4 rounded-md shadow-sm">
//                   <img
//                     src="/placeholder.svg"
//                     width="100"
//                     height="100"
//                     alt="QR Code"
//                     className="mx-auto"
//                     style={{ aspectRatio: "100/100", objectFit: "cover" }}
//                   />
//                 </div>
//               </div>
//               <div className="grid grid-cols-3 gap-4">
//                 <div className="bg-muted p-4 rounded-md shadow-sm">
//                   <img
//                     src="/placeholder.svg"
//                     width="100"
//                     height="100"
//                     alt="QR Code"
//                     className="mx-auto"
//                     style={{ aspectRatio: "100/100", objectFit: "cover" }}
//                   />
//                 </div>
//                 <div className="bg-muted p-4 rounded-md shadow-sm">
//                   <img
//                     src="/placeholder.svg"
//                     width="100"
//                     height="100"
//                     alt="QR Code"
//                     className="mx-auto"
//                     style={{ aspectRatio: "100/100", objectFit: "cover" }}
//                   />
//                 </div>
//                 <div className="bg-muted p-4 rounded-md shadow-sm">
//                   <img
//                     src="/placeholder.svg"
//                     width="100"
//                     height="100"
//                     alt="QR Code"
//                     className="mx-auto"
//                     style={{ aspectRatio: "100/100", objectFit: "cover" }}
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </header>
//         <section className="container mx-auto max-w-4xl px-4 py-12 md:py-24">
//           <div className="grid gap-8 md:grid-cols-2 md:gap-12">
//             <div className="space-y-4">
//               <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">
//                 Batch QR Code Generation
//               </h2>
//               <p className="text-muted-foreground md:text-lg">
//                 Upload an Excel file and we&apos;ll generate QR codes for each
//                 row or column.
//               </p>
//               <div className="flex items-center gap-4">
//                 <FileSpreadsheetIcon className="w-8 h-8" />
//                 <span>Excel File</span>
//               </div>
//             </div>
//             <div className="space-y-4">
//               <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">
//                 Single QR Code Generation
//               </h2>
//               <p className="text-muted-foreground md:text-lg">
//                 Enter a URL or text and we&apos;ll generate a custom QR code for
//                 you.
//               </p>
//               <div className="flex items-center gap-4">
//                 <LinkIcon className="w-8 h-8" />
//                 <span>URL or Text</span>
//               </div>
//             </div>
//           </div>
//         </section>
//       </main>
//       <footer className="bg-muted/50 backdrop-blur-lg py-6 px-4 text-center text-muted-foreground">
//         <p>&copy; 2024 Acme Inc. All rights reserved.</p>
//       </footer>
//     </div>
//   );
// }

"use client";
import {
  FileSpreadsheetIcon,
  LinkIcon,
} from "@/components/component/qrgen-landing";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { generateQR } from "@/lib/generate-qr";
// import { useFormStatus } from "react-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Home() {
  const [result, setResult] = useState<{
    success?: boolean;
    error?: string;
    data?: any;
  } | null>(null);

  async function handleSubmit(formData: FormData, e: any) {
    e.preventDefault();
    const response = await generateQR(formData);
    setResult(response);
  }
  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      <header className="fixed top-0 z-10 w-full mt-4">
        <nav className="container mx-auto max-w-4xl px-8 py-4 md:py-6 border rounded-full backdrop-blur-lg bg-background/50 shadow-md hidden md:flex items-center justify-between">
          <Link
            href="#"
            className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-l from-orange-400 to-yellow-400"
            prefetch={false}
          >
            QRGEN
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground"
              prefetch={false}
            >
              Features
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground"
              prefetch={false}
            >
              Pricing
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground"
              prefetch={false}
            >
              Contact
            </Link>
            <Button
              variant="outline"
              className="rounded-full bg-gradient-to-r from-orange-400 to-yellow-400 font-bold uppercase"
            >
              Sign In
            </Button>
          </div>
        </nav>{" "}
        <div className="fixed top-0 left-0 w-full h-full bg-background/50 backdrop-blur-lg z-20 flex flex-col items-center justify-center md:hidden">
          <div className="fixed top-0 left-0 w-full h-full bg-background/50 backdrop-blur-lg z-20 flex flex-col items-center justify-center md:hidden">
            <div className="bg-background p-8 rounded-md shadow-md w-full max-w-md space-y-4">
              <div className="flex items-center justify-between">
                <Link href="#" className="text-lg font-bold" prefetch={false}>
                  Acme QR Codes
                </Link>
                <Button
                  variant="outline"
                  className="rounded-full bg-gradient-to-r from-orange-400 to-yellow-400 font-bold uppercase"
                >
                  Open Menu
                </Button>
              </div>
              <div className="space-y-2">
                <Link
                  href="#"
                  className="block text-muted-foreground hover:text-foreground"
                  prefetch={false}
                >
                  Features
                </Link>
                <Link
                  href="#"
                  className="block text-muted-foreground hover:text-foreground"
                  prefetch={false}
                >
                  Pricing
                </Link>
                <Link
                  href="#"
                  className="block text-muted-foreground hover:text-foreground"
                  prefetch={false}
                >
                  Contact
                </Link>
              </div>
              <Button
                variant="outline"
                className="rounded-full bg-gradient-to-r from-orange-400 to-yellow-400 font-bold uppercase w-full"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main>
        <header className="container mx-auto max-w-4xl px-4 py-12 md:py-16 backdrop-blur-lg bg-background/50 rounded-md shadow-md">
          <div className="grid gap-8 md:grid-cols-2 md:gap-12">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Generate QR Codes from Excel
              </h1>
              <p className="text-muted-foreground md:text-lg">
                Upload an Excel file or enter a URL, and we&apos;ll generate QR
                codes for you.
              </p>
              <form
                className="space-y-4"
                onSubmit={(e) =>
                  handleSubmit(new FormData(e.target as HTMLFormElement), e)
                }
              >
                <div className="space-y-2">
                  <Label htmlFor="file">Excel File (Required)</Label>
                  <Input
                    id="file"
                    type="file"
                    name="file"
                    accept=".xlsx,.xls"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo</Label>
                  <Input
                    id="logo"
                    name="logo"
                    type="file"
                    accept=".png,.jpg,.jpeg,.svg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="urlTag">URLTag</Label>
                  <Input
                    id="urlTag"
                    name="urlTag"
                    type="text"
                    placeholder="Enter URL column"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nameTag">NameTag</Label>
                  <Input
                    id="nameTag"
                    name="nameTag"
                    type="text"
                    placeholder="Enter name column"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Generate QR Codes
                </Button>
                {/* <SubmitButton /> */}
              </form>
              {result && (
                <Alert variant={result.success ? "default" : "destructive"}>
                  <AlertTitle>
                    {result.success ? "Success" : "Error"}
                  </AlertTitle>
                  <AlertDescription>
                    {result.success
                      ? (result.data.message as string)
                    : result.error}
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <div className="grid gap-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted p-4 rounded-md shadow-sm">
                  <img
                    src="/placeholder.svg"
                    width="100"
                    height="100"
                    alt="QR Code"
                    className="mx-auto"
                    style={{ aspectRatio: "100/100", objectFit: "cover" }}
                  />
                </div>
                <div className="bg-muted p-4 rounded-md shadow-sm">
                  <img
                    src="/placeholder.svg"
                    width="100"
                    height="100"
                    alt="QR Code"
                    className="mx-auto"
                    style={{ aspectRatio: "100/100", objectFit: "cover" }}
                  />
                </div>
                <div className="bg-muted p-4 rounded-md shadow-sm">
                  <img
                    src="/placeholder.svg"
                    width="100"
                    height="100"
                    alt="QR Code"
                    className="mx-auto"
                    style={{ aspectRatio: "100/100", objectFit: "cover" }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted p-4 rounded-md shadow-sm">
                  <img
                    src="/placeholder.svg"
                    width="100"
                    height="100"
                    alt="QR Code"
                    className="mx-auto"
                    style={{ aspectRatio: "100/100", objectFit: "cover" }}
                  />
                </div>
                <div className="bg-muted p-4 rounded-md shadow-sm">
                  <img
                    src="/placeholder.svg"
                    width="100"
                    height="100"
                    alt="QR Code"
                    className="mx-auto"
                    style={{ aspectRatio: "100/100", objectFit: "cover" }}
                  />
                </div>
                <div className="bg-muted p-4 rounded-md shadow-sm">
                  <img
                    src="/placeholder.svg"
                    width="100"
                    height="100"
                    alt="QR Code"
                    className="mx-auto"
                    style={{ aspectRatio: "100/100", objectFit: "cover" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </header>
        <section className="container mx-auto max-w-4xl px-4 py-12 md:py-24">
          <div className="grid gap-8 md:grid-cols-2 md:gap-12">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">
                Batch QR Code Generation
              </h2>
              <p className="text-muted-foreground md:text-lg">
                Upload an Excel file and we&apos;ll generate QR codes for each
                row or column.
              </p>
              <div className="flex items-center gap-4">
                <FileSpreadsheetIcon className="w-8 h-8" />
                <span>Excel File</span>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">
                Single QR Code Generation
              </h2>
              <p className="text-muted-foreground md:text-lg">
                Enter a URL or text and we&apos;ll generate a custom QR code for
                you.
              </p>
              <div className="flex items-center gap-4">
                <LinkIcon className="w-8 h-8" />
                <span>URL or Text</span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-muted/50 backdrop-blur-lg py-6 px-4 text-center text-muted-foreground">
        <p>&copy; 2024 Acme Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}

// function SubmitButton() {
//   const { pending } = useFormStatus();

//   return (
//     <Button type="submit" className="w-full" disabled={pending}>
//       {pending ? "Generating..." : "Generate QR Codes"}
//     </Button>
//   );
// }
