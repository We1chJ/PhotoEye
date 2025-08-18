import type { Metadata } from "next";
import "./global.css";
import "./cursor.css"
import { ThemeProvider } from "@/components/ui/theme-provider";
import CustomCursor from "@/components/CustomCursor";
import { Toaster } from "@/components/ui/sonner";
import Providers from "./providers";
export const metadata: Metadata = {
  title: "PhotoEye",
  description: "See the world through the lens of your eyes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster position="top-center" />
          <CustomCursor />
          <Providers>
            <main>{children}</main>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
