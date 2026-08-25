import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import { AuthModal } from "./components/auth/AuthModal";
import { AuthProvider } from "./components/auth/auth-context";
import { Header } from "./components/Header";
import { TopLoadingBar } from "./components/TopLoadingBar";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex",
  display: "swap",
});

export const metadata: Metadata = {
  title: "reddit-clone",
  description: "A learning community chat clone",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${ibmPlexSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          <TopLoadingBar />
          <Header />
          {children}
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}
