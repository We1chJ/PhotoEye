import type { Metadata } from "next";
import "./global.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
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
        {children}
      </ThemeProvider>
      </body>
    </html>
  );
}
