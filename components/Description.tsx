interface DescriptionProps {
  children: React.ReactNode;
}

export function Description({ children }: DescriptionProps) {
  return (
    <section className="mb-13" aria-label="Description">
      <p className="text-text-primary">{children}</p>
    </section>
  );
}
