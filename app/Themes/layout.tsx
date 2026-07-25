import ThemeProvider from "@/providers/ThemeProvider";

export default function Layout({ children }: { children: React.ReactNode }) {
    return <ThemeProvider>{children}</ThemeProvider>;
}
