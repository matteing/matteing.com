import { Header } from "@/components/layout/Header";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="page-container">
      <section className="mb-12" aria-label="Profile">
        <Header />
      </section>

      <section className="mb-7" aria-label="Navigation">
        <Navigation />
      </section>

      <div className="animate-[fade-in_0.3s_ease-out]">{children}</div>

      <Footer />
    </main>
  );
}
