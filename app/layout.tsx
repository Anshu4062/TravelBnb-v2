import "./globals.css";
import Footer from "@/app/components/Footer";
import { LanguageProvider } from "@/app/components/LanguageProvider";
import { RTLProvider } from "@/app/components/RTLProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={"antialiased"}>
        <LanguageProvider>
          <RTLProvider>
            {children}
            <Footer />
          </RTLProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
