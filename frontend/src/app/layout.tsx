import "./globals.css";
import "leaflet/dist/leaflet.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ToastProvider, ToastContainer } from "@/components/Toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SWRProvider } from "@/components/SWRProvider";
import Navbar from "@/components/Navbar";
import PublicFooter from "@/components/PublicFooter";
import { LaunchDynamicWidgets } from "@/components/LaunchDynamicWidgets";
import { MotionProvider } from "@/components/MotionProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ErrorBoundary>
          <SWRProvider>
            <MotionProvider>
              <ThemeProvider>
                <ToastProvider>
                  <AuthProvider>
                    <Navbar />
                    {children}
                    <PublicFooter />
                    <LaunchDynamicWidgets />
                    <ToastContainer />
                  </AuthProvider>
                </ToastProvider>
              </ThemeProvider>
            </MotionProvider>
          </SWRProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
