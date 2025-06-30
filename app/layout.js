import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MailProvider } from "@/context/mailContext";
import { Toaster } from "react-hot-toast"
import AuthWrapper from "@/components/auth-wrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "MailBoard - Smart Email Management",
  description: "Manage multiple Gmail accounts with AI-powered categorization and todo management",
  generator: 'v0.dev',
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" disableTransitionOnChange>
          <SidebarProvider>
            <MailProvider>
              <AuthWrapper>
                {children}
              </AuthWrapper>
            </MailProvider>
          </SidebarProvider>
        </ThemeProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}